import { parseAST, hasHookCall, hasHookCallWithDeps, hasJSXAttribute, findNode, hasStableKeyInMap } from './ast.js';

const clean = (str) => {
  if (typeof str !== 'string') return '';
  // strip comments but protect string literals
  let cleaned = str.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g, (match, stringLiteral) => {
    return stringLiteral !== undefined ? stringLiteral : '';
  });
  // remove all whitespace
  return cleaned.replace(/\s+/g, '');
};

// --- Position-aware AST helpers -------------------------------------------------
// Some rules need to know *where* a node sits (in the render body vs inside an
// Effect), not merely that it exists. findNode short-circuits on presence, so a
// visitor that always returns false turns it into a plain collector instead.
const collect = (ast, visitors) => {
  const out = [];
  const wrapped = {};
  for (const [type, pick] of Object.entries(visitors)) {
    wrapped[type] = (node) => {
      const picked = pick(node);
      if (picked) out.push(picked === true ? node : picked);
      return false;
    };
  }
  findNode(ast, wrapped);
  return out;
};

// Source ranges of every useEffect/useLayoutEffect callback body in the file.
const effectRanges = (ast) => collect(ast, {
  CallExpression(node) {
    if (node.callee.type !== 'Identifier' || !/^use(Layout)?Effect$/.test(node.callee.name)) return null;
    const cb = node.arguments[0];
    if (!cb || (cb.type !== 'ArrowFunctionExpression' && cb.type !== 'FunctionExpression')) return null;
    return [cb.start, cb.end];
  },
});

const withinAny = (node, ranges) => ranges.some(([start, end]) => node.start >= start && node.end <= end);

export const validators = {
  'jsx-intro': [
    { message: 'Must use className for CSS classes', test: code => { const ast=parseAST(code); return hasJSXAttribute(ast,null,'className') && !hasJSXAttribute(ast,null,'class'); } },
    { message: 'Must explicitly close the img JSX element', test: code => /<img[\s\S]*\/>/.test(code) }
  ],
  'components': [
    { message: 'Must create a UserProfile component', test: (code) => /(functionUserProfile|constUserProfile=(?:\([^)]*\)|[^=]+)=>)/.test(clean(code)) },
    { message: 'Must use <UserProfile /> at least twice', test: (code) => clean(code).split(/<UserProfile/).length >= 3 }
  ],
  'props': [
    { message: 'UserProfile must accept props', test: (code) => /(functionUserProfile\(\{?(name|role)|constUserProfile=\(\{?(name|role))/.test(clean(code)) },
    { message: 'Must render the dynamic name prop', test: (code) => /\{name\}/.test(clean(code)) },
    { message: 'Must render the dynamic role prop', test: (code) => /\{role\}/.test(clean(code)) },
    { message: 'Must pass name and role to UserProfile instances', test: (code) => /<UserProfile[^>]*name=[^>]*role=|<UserProfile[^>]*role=[^>]*name=/.test(clean(code)) }
  ],
  'state': [
    { message: 'Must call useState hook', test: (code) => hasHookCall(parseAST(code) || {}, 'useState') || /useState/.test(clean(code)) },
    { message: 'Must attach onClick to the button', test: (code) => /onClick=\{/.test(clean(code)) }
  ],
  'events': [
    { message: 'Must create handleSubmit function', test: (code) => /functionhandleSubmit/.test(clean(code)) || /consthandleSubmit=/.test(clean(code)) },
    { message: 'Must call e.preventDefault()', test: (code) => /preventDefault\(\)/.test(clean(code)) },
    { message: 'Must attach onSubmit to form', test: (code) => /<form[^>]*onSubmit=\{handleSubmit\}/.test(clean(code)) },
    { message: 'Must log or alert the value', test: (code) => /(console\.log|alert)\(/.test(clean(code)) }
  ],
  'conditional': [
    // Bounded and excludes optional chaining (?.) so an unrelated `foo?.bar` earlier in the
    // file can't combine with an unrelated `:` later (e.g. in a style object) to false-positive.
    { message: 'Must use ternary operator or logical AND for conditional rendering', test: (code) => /\?(?!\.)[^?:;{}]{0,120}:/.test(clean(code)) || /&&</.test(clean(code)) }
  ],
  'use-effect': [
    { message: 'Must call useEffect', test: (code) => hasHookCall(parseAST(code) || {}, 'useEffect') || /useEffect/.test(clean(code)) },
    { message: 'Must pass empty dependency array to run once', test: (code) => {
        const ast = parseAST(code);
        if (ast) {
          return findNode(ast, {
            CallExpression(node) {
              return node.callee.name === 'useEffect' &&
                     node.arguments.length === 2 &&
                     node.arguments[1].type === 'ArrayExpression' &&
                     node.arguments[1].elements.length === 0;
            }
          });
        }
        return /,\[\]\)/.test(clean(code));
    }},
    { message: 'Must return a cleanup function that clears the interval', test: (code) => /return\(\)=>\{?clearInterval\(/.test(clean(code)) }
  ],
  'use-effect-deps': [
    { message: 'Must include userId in the dependency array', test: (code) => /,\[userId\]\)/.test(clean(code)) }
  ],
  'use-ref': [
    { message: 'Must call useRef', test: (code) => hasHookCall(parseAST(code) || {}, 'useRef') || /useRef/.test(clean(code)) },
    { message: 'Must attach ref to the input element', test: (code) => hasJSXAttribute(parseAST(code) || {}, 'input', 'ref') || /ref=\{.*?\}/.test(clean(code)) },
    { message: 'Must call focus() on the ref', test: (code) => /current\.focus\(\)/.test(clean(code)) }
  ],
  'use-memo': [
    { message: 'Must import and call useMemo', test: (code) => hasHookCall(parseAST(code) || {}, 'useMemo') || /useMemo/.test(clean(code)) },
    { message: 'Must use useMemo for the derived calculation', test: code => hasHookCall(parseAST(code) || {}, 'useMemo') },
    { message: 'Must include limit in the dependency array', test: (code) => hasHookCallWithDeps(parseAST(code) || {}, 'useMemo', ['limit']) || /useMemo\([\s\S]*?,\[limit\]\)/.test(clean(code)) }
  ],
  'use-context': [
    { message: 'Must import useContext', test: (code) => /useContext/.test(clean(code)) },
    { message: 'Must call useContext(ThemeContext)', test: (code) => {
      const ast = parseAST(code);
      if (ast) {
        return findNode(ast, {
          CallExpression(node) {
            return node.callee.name === 'useContext' && node.arguments.length > 0 && (node.arguments[0].name === 'ThemeContext' || node.arguments[0].type === 'Identifier');
          }
        });
      }
      return /useContext\(ThemeContext\)/.test(clean(code));
    }}
  ],
  'composition': [
    { message: 'Dialog must accept children prop', test: (code) => /(functionDialog\(\{.*children.*\}\)|constDialog=\(\{.*children.*\}\)=>)/.test(clean(code)) },
    { message: 'Must render {children} inside Dialog', test: (code) => /\{children\}/.test(clean(code)) }
  ],
  'render-props': [
    { message: 'MouseTracker must accept render prop', test: (code) => /(functionMouseTracker\(\{.*render.*\}\)|constMouseTracker=\(\{.*render.*\}\)=>)/.test(clean(code)) },
    { message: 'Must call the render prop with position', test: (code) => /render\(position\)/.test(clean(code)) }
  ],
  'error-boundaries': {
    ignoreRuntimeErrors: true,
    rules: [
      { message: 'Must import ErrorBoundary from react-error-boundary', test: (code) => /ErrorBoundary\}from['"]react-error-boundary['"]/.test(clean(code)) },
      { message: 'Must wrap BuggyComponent in ErrorBoundary with a fallback', test: (code) => /<ErrorBoundary[^>]*fallback=\{.*?\}[^>]*>[\s\S]*?<BuggyComponent\/?>[\s\S]*?<\/ErrorBoundary>/.test(clean(code)) }
    ]
  },
  'portals': [
    { message: 'Must call createPortal', test: (code) => /createPortal\(/.test(clean(code)) },
    { message: 'Must target document.body', test: (code) => /document\.body\)/.test(clean(code)) }
  ],

  'compound-components': [
    { message: 'Must use useContext to get TabsContext', test: (code) => /useContext\(TabsContext\)/.test(clean(code)) },
    { message: 'Must call setActiveTab on click', test: (code) => /onClick=\{.*?setActiveTab/.test(clean(code)) },
    { message: 'Must determine if tab is active', test: (code) => /activeTab===index/.test(clean(code)) }
  ],
  'forward-ref': [
    { message: 'Must accept ref as a prop', test: (code) => /functionCustomInput\([^)]*ref[^)]*\)/.test(clean(code)) || /constCustomInput=\([^)]*ref[^)]*\)/.test(clean(code)) },
    { message: 'Must attach ref to the native input element', test: (code) => /<input[^>]*ref=\{ref\}/.test(clean(code)) }
  ],
  'reconciliation': {
    requiresObservation: true,
    rules: [
      { message: 'Must keep both render logs so the parent/child re-render is actually observable', test: (code) => /console\.log\("App rendered!"\)/.test(code) && /console\.log\("Child rendered!"\)/.test(code) }
    ]
  },
  'react-memo': [
    { message: 'Must wrap ExpensiveChild in memo', test: (code) => /memo\(functionExpensiveChild/.test(clean(code)) || /memo\(\(\{onDelete\}\)/.test(clean(code)) },
    { message: 'Must wrap handleDelete in useCallback', test: (code) => /useCallback\(\(\)=>\{/.test(clean(code)) },
    { message: 'Must provide an empty dependency array to useCallback', test: (code) => /useCallback\([\s\S]*?,\[\]\)/.test(clean(code)) }
  ],
  'code-splitting': [
    { message: 'Must wrap HeavyChart in Suspense', test: (code) => /<Suspense/.test(clean(code)) },
    { message: 'Must provide a fallback UI to Suspense', test: (code) => /fallback=\{.*?\}/.test(clean(code)) }
  ],
  'react-router': [
    { message: 'Must render <Routes>', test: (code) => /<Routes>/.test(clean(code)) },
    { message: 'Must render <Route> for Home and About', test: (code) => /<Route[^>]*path="\/"/.test(clean(code)) && /<Route[^>]*path="\/about"/.test(clean(code)) }
  ],
  'nested-routes': [
    { message: 'Must import Outlet in Dashboard', test: (code, files) => {
      const dashboardCode = files?.['/pages/Dashboard.jsx']?.code || '';
      return /Outlet/.test(clean(dashboardCode));
    }},
    { message: 'Must render <Outlet /> in Dashboard', test: (code, files) => {
      const dashboardCode = files?.['/pages/Dashboard.jsx']?.code || '';
      return /<Outlet\/?>/.test(clean(dashboardCode));
    }}
  ],
  'data-fetching': [
    { message: 'Must call useEffect', test: (code) => /useEffect\(/.test(clean(code)) },
    { message: 'Must provide empty dependency array to useEffect', test: (code) => /useEffect\([\s\S]*?,\[\]\)/.test(clean(code)) },
    { message: 'Must fetch from the API', test: (code) => /fetch\('https:\/\/jsonplaceholder\.typicode\.com\/users/.test(clean(code)) },
    { message: 'Must call setUsers with the fetched data', test: (code) => /setUsers\([a-zA-Z0-9_]+\)/.test(clean(code)) },
    { message: 'Must call setLoading(false) once data arrives', test: (code) => /setLoading\(false\)/.test(clean(code)) },
    { message: 'Must return a cleanup function that aborts the request', test: (code) => /newAbortController\(\)/.test(clean(code)) && /\.abort\(\)/.test(clean(code)) }
  ],
  'zustand': [
    { message: 'Must add fishes state and addFish action', test: (code, files) => {
      const storeCode = files?.['/src/store/useZooStore.js']?.code || files?.['/src/store/useStore.js']?.code || code;
      return /fishes:0/.test(clean(storeCode)) && /addFish:\(\)=>/.test(clean(storeCode));
    } },
    { message: 'Must strictly select state.fishes in FishCounter', test: (code, files) => {
      const displayCode = files?.['/src/components/ZooDisplay.jsx']?.code || code;
      return /(?:useZooStore|useStore)\(\(?state\)?=>state\.fishes\)/.test(clean(displayCode));
    } },
    { message: 'Must render the selected fishes state', test: (code, files) => {
      const displayCode = files?.['/src/components/ZooDisplay.jsx']?.code || code;
      return /\{fishes\}/.test(clean(displayCode));
    } },
    { message: 'Must extract addFish action in Controls', test: (code, files) => {
      const appCode = files?.['/App.jsx']?.code || code;
      return /(?:useZooStore|useStore)\(\(?state\)?=>state\.addFish\)/.test(clean(appCode));
    } },
    { message: 'Must attach addFish to the onClick of the button', test: (code, files) => {
      const appCode = files?.['/App.jsx']?.code || code;
      return /<button[^>]*onClick=\{.*?addFish.*?\}[^>]*>addfish/i.test(clean(appCode));
    } }
  ],
  'react-query': [
    { message: 'Must remove hardcoded variables and call useQuery', test: (code) => /useQuery\(/.test(clean(code)) && !/constisLoading=true/.test(clean(code)) },
    { message: 'Must provide queryKey: [\'users\']', test: (code) => /queryKey:\['users'\]/.test(clean(code)) },
    { message: 'Must provide queryFn with fetch', test: (code) => /queryFn:[\s\S]*?fetch\('https:\/\/jsonplaceholder\.typicode\.com\/users'\)/.test(clean(code)) },
    { message: 'Must parse the response as JSON inside queryFn', test: (code) => /\.json\(\)/.test(clean(code)) },
    { message: 'Must create a mutation with useMutation', test: (code) => /useMutation\(\{/.test(clean(code)) },
    { message: 'Must invalidate the users query on mutation success', test: (code) => /onSuccess:[\s\S]*?invalidateQueries\(\{queryKey:\['users'\]\}\)/.test(clean(code)) },
    { message: 'Must trigger the mutation from the Add User button', test: (code) => /addUser\.mutate\(/.test(clean(code)) }
  ],
  'suspense': [
    { message: 'Must call useSuspenseQuery instead of useQuery', test: (code) => /useSuspenseQuery\(/.test(clean(code)) },
    { message: 'Must wrap UserList in a Suspense boundary', test: (code) => /<Suspense[^>]*>[\s\S]*?<UserList\/?>[\s\S]*?<\/Suspense>/.test(clean(code)) },
    { message: 'Must provide a fallback prop to Suspense', test: (code) => /<Suspense[^>]*fallback=\{.*?\}[^>]*>/.test(clean(code)) }
  ],
  'transitions': [
    { message: 'Must call useTransition()', test: (code) => /useTransition\(\)/.test(clean(code)) },
    { message: 'Must wrap setFilter inside startTransition', test: (code) => /startTransition\(\(\)=>\{?setFilter\(/.test(clean(code)) },
    { message: 'Must conditionally render using isPending', test: (code) => /isPending&&</.test(clean(code)) }
  ],
  'server-components': [
    { message: 'Must add \'use client\' directive at the very top of the file', test: (code) => /^['"]useclient['"];?/.test(clean(code)) }
  ],
  'use-local-storage': [
    { message: 'Must define useLocalStorage function', test: (code) => /functionuseLocalStorage\(/.test(clean(code)) || /constuseLocalStorage=\(/.test(clean(code)) },
    { message: 'Must use useLocalStorage in ThemeToggle', test: (code) => /functionThemeToggle[\s\S]*?useLocalStorage\(['"]theme['"]/.test(clean(code)) },
    { message: 'Must use useLocalStorage in UsernameField', test: (code) => /functionUsernameField[\s\S]*?useLocalStorage\(['"]username['"]/.test(clean(code)) }
  ],
  'use-sync-external-store': [
    { message: 'Must call useSyncExternalStore with subscribe and getSnapshot', test: (code) => /useSyncExternalStore\(subscribe,getSnapshot\)/.test(clean(code)) },
    { message: 'subscribe must register and later remove both online and offline listeners', test: (code) => /addEventListener\('online'/.test(clean(code)) && /addEventListener\('offline'/.test(clean(code)) && /removeEventListener\('online'/.test(clean(code)) && /removeEventListener\('offline'/.test(clean(code)) },
    { message: 'getSnapshot must return navigator.onLine', test: (code) => /functiongetSnapshot\(\)\{returnnavigator\.onLine/.test(clean(code)) }
  ],
  'use-debounce': [
    { message: 'Must define useDebounce function', test: (code) => /functionuseDebounce/.test(clean(code)) || /constuseDebounce=/.test(clean(code)) },
    { message: 'Must use setTimeout and clearTimeout inside the hook', test: (code) => /setTimeout/.test(clean(code)) && /clearTimeout/.test(clean(code)) },
    { message: 'Must call useDebounce hook in App', test: (code) => /const[a-zA-Z0-9_]+=useDebounce\(filter/.test(clean(code)) }
  ],
  'lists-and-keys': [
    { message: 'Must use a stable, data-derived key rather than index/randomness', test: code => hasStableKeyInMap(parseAST(code)) }
  ],
  'controlled-inputs': [
    { message: 'Must bind value prop to state variables', test: (code) => /value=\{name\}/.test(clean(code)) && /value=\{email\}/.test(clean(code)) },
    { message: 'Must update state in onChange handler', test: (code) => /setName\(/.test(clean(code)) && /setEmail\(/.test(clean(code)) }
  ],
  'actions-api': [
    { message: 'Must call useActionState', test: (code) => /useActionState\(.*submitAction/.test(clean(code)) },
    { message: 'Must use formAction in the action prop', test: (code) => /<form[^>]*action=\{formAction\}/.test(clean(code)) }
  ],
  'form-validation': [
    { message: 'Must conditionally render the error span', test: (code) => /[a-zA-Z0-9_]*[Ee]rror[s]?(&&|\?)/.test(clean(code)) },
    { message: 'Must disable the submit button', test: (code) => /disabled=\{/.test(clean(code)) }
  ],
  'use-reducer': [
    { message: 'Must call useReducer with reducer and initial state', test: (code) => /useReducer\(reducer,/.test(clean(code)) },
    { message: 'Must dispatch INCREMENT action on button click', test: (code) => /dispatch\(\{type:['"]INCREMENT['"]\}\)/.test(clean(code)) }
  ],
  'use-id': [
    { message: 'Must call useId()', test: (code) => /useId\(\)/.test(clean(code)) },
    { message: 'Must assign the generated id to the input element', test: (code) => /<input[^>]*id=\{/.test(clean(code)) },
    { message: 'Label htmlFor must reference the same id as the input', test: (code) => {
      const cleaned = clean(code);
      const match = cleaned.match(/htmlFor=\{(\w+)\}/);
      return !!match && new RegExp(`id=\\{${match[1]}\\}`).test(cleaned);
    }}
  ],
  'use-navigate': [
    { message: 'Must import useNavigate', test: (code, files) => {
      const loginCode = files?.['/Login.jsx']?.code || '';
      return /useNavigate/.test(clean(loginCode));
    }},
    { message: 'Must call useNavigate()', test: (code, files) => {
      const loginCode = files?.['/Login.jsx']?.code || '';
      return /useNavigate\(\)/.test(clean(loginCode));
    }},
    { message: 'Must navigate to /dashboard', test: (code, files) => {
      const loginCode = files?.['/Login.jsx']?.code || '';
      return /navigate\(['"]\/dashboard['"]\)/.test(clean(loginCode));
    }}
  ],
  'router-loaders': [
    { message: 'Must define an async profileLoader that fetches the user', test: (code, files) => {
      const appCode = files?.['/App.jsx']?.code || code;
      const cleaned = clean(appCode);
      return /asyncfunctionprofileLoader\(\)/.test(cleaned) && /fetch\('https:\/\/jsonplaceholder\.typicode\.com\/users\/1'\)/.test(cleaned);
    }},
    { message: 'Must attach the loader to the route', test: (code, files) => {
      const appCode = files?.['/App.jsx']?.code || code;
      return /loader:profileLoader/.test(clean(appCode));
    }},
    { message: 'Profile must read data with useLoaderData instead of useEffect', test: (code, files) => {
      const profileCode = files?.['/Profile.jsx']?.code || code;
      const cleaned = clean(profileCode);
      return /useLoaderData\(\)/.test(cleaned) && !/useEffect/.test(cleaned);
    }}
  ],
  'reconciliation-rules': [
    { message: 'Must use a key prop to force reset', test: (code) => /key=\{selectedUser\}/.test(clean(code)) }
  ],
  'ts-props-hooks': [
    { message: 'Must define a Props type or interface', test: (code) => /typeUserProps=|interfaceUserProps/.test(clean(code)) },
    { message: 'Must type useState with a generic', test: (code) => /useState<boolean>/.test(clean(code)) }
  ],
  'ts-context-reducers': [
    { message: 'Must define a discriminated union action type', test: (code) => /typeAction=/.test(clean(code)) },
    { message: 'Must add type annotations to the reducer', test: (code) => /function reducer\(state:State,action:Action\)/.test(clean(code)) || /functionreducer\(state:State,action:Action\)/.test(clean(code)) }
  ],
  'rtl-basics': [
    { message: 'Must fix the onClick handler', test: (code) => /onClick=\{\(\)=>setCount/.test(clean(code)) || /onClick=\{\(\)=>setCount\(c=>c\+1\)/.test(clean(code)) }
  ],
  'testing-error-boundaries': [
    { message: 'Must import ErrorBoundary from react-error-boundary', test: (code, files) => {
      const appCode = files?.['/App.jsx']?.code || code;
      return /ErrorBoundary\}from['"]react-error-boundary['"]/.test(clean(appCode));
    }},
    { message: 'Must wrap BuggyComponent in ErrorBoundary with a fallback', test: (code, files) => {
      const appCode = files?.['/App.jsx']?.code || code;
      return /<ErrorBoundary[^>]*fallback=\{.*?\}[^>]*>[\s\S]*?<BuggyComponent\/?>[\s\S]*?<\/ErrorBoundary>/.test(clean(appCode));
    }},
    { message: 'SafeWidget text must stay outside the ErrorBoundary', test: (code, files) => {
      const appCode = files?.['/App.jsx']?.code || code;
      const cleaned = clean(appCode);
      const closeIdx = cleaned.indexOf('</ErrorBoundary>');
      return closeIdx !== -1 && cleaned.indexOf('SafeWidgetstillhere') > closeIdx;
    }}
  ],
  'testing-async': [
    { message: 'Must use findByText instead of getByText', test: (code, files) => {
      const testCode = files?.['/App.test.jsx']?.code || code;
      return /findByText/.test(clean(testCode)) && !/getByText/.test(clean(testCode));
    } }
  ],
  'js-variables': [
    { message: 'Use let for the reassigned username', test: (code) => /letusername=/.test(clean(code)) },
    { message: 'Replace var with block-scoped declarations', test: (code) => !/\bvar\b/.test(clean(code)) }
  ],
  'js-arrow-functions': [
    { message: 'Define formatName as an arrow function', test: (code) => /constformatName=.*=>/.test(clean(code)) },
    { message: 'Use an arrow function for the click handler', test: (code) => /onClick=\{\(\)=>/.test(clean(code)) }
  ],
  'js-template-literals': [
    { message: 'Build the message with a template literal', test: (code) => {
      const ast = parseAST(code);
      if (ast) {
        return findNode(ast, {
          TemplateLiteral(node) { return node.expressions.length > 0; }
        });
      }
      return /`[^`]*\$\{[^}]+\}[^`]*`/.test(code);
    }}
  ],
  'js-destructuring': [
    { message: 'Destructure title and author from book', test: (code) => {
        const ast = parseAST(code);
        if (ast) {
          return findNode(ast, {
            ObjectPattern(node) {
              const names = node.properties.map(p => p.key?.name);
              return names.includes('title') && names.includes('author');
            }
          });
        }
        return /const\{title,author\}=book/.test(clean(code));
    }},
    { message: 'Destructure the first two tags from book.tags', test: (code) => {
        const ast = parseAST(code);
        if (ast) {
          return findNode(ast, {
            ArrayPattern(node) {
              return node.elements.length >= 2;
            }
          });
        }
        return /const\[tag1,tag2\]=book\.tags/.test(clean(code));
    }}
  ],
  'js-spread-rest': [
    { message: 'Use array spread to create allColors', test: (code) => /\[\.\.\.baseColors/.test(clean(code)) },
    { message: 'Use object spread to create updatedProfile', test: (code) => /\{\.\.\.profile,theme:/.test(clean(code)) }
  ],
  'js-array-methods': [
    { message: 'Filter to active users before rendering', test: (code) => /\.filter\([^)]*=>[^)]*\.active\)/.test(clean(code)) },
    { message: 'Map users to list items', test: (code) => /\.map\([^)]*=>/.test(clean(code)) }
  ],
  'js-ternary': [
    { message: 'Render the status with a ternary expression', test: (code) => /isOnline\?[^:]+:/.test(clean(code)) }
  ],
  'use-optimistic': [
    { message: 'Import and call useOptimistic', test: (code) => /useOptimistic/.test(clean(code)) && /useOptimistic\(todos\)/.test(clean(code)) },
    { message: 'Render the optimistic todo list', test: (code) => /optimisticTodos\.map/.test(clean(code)) }
  ],
  'use-layout-effect': [
    { message: 'Use useLayoutEffect for the measurement', test: (code) => /useLayoutEffect\(/.test(clean(code)) && !/useEffect\(/.test(clean(code)) }
  ],
  'diagnostic-stale-closure': [
    { message: 'Use a functional state update inside the interval', test: (code) => /setCount\([^)]*=>[^)]*\+1\)/.test(clean(code)) }
  ],
  'diagnostic-missing-cleanup': [
    { message: 'Prevent updates after cleanup with an ignore flag or AbortController', test: (code) => /AbortController|letignore=false[\s\S]*return\(\)=>\{?ignore=true/.test(clean(code)) }
  ],
  'diagnostic-object-identity': [
    { message: 'Memoize config with useMemo', test: (code) => /constconfig=useMemo\(\(\)=>\(\{/.test(clean(code)) }
  ],
  'typescript-patterns': [
    { message: 'Define a generic List<T> component', test: (code) => /functionList<T>/.test(clean(code)) },
    { message: 'Type items as T[] and renderItem with T', test: (code) => /items:T\[\]/.test(clean(code)) && /renderItem:\(item:T\)=>/.test(clean(code)) }
  ],
  'js-promises': [
    { message: 'Must use async/await', test: (code) => (/asyncfunction/.test(clean(code)) || /=async\(/.test(clean(code))) && /await/.test(clean(code)) }
  ],
  'polymorphic-components': [
    { message: 'Must make ButtonProps generic with E extends React.ElementType', test: (code) => /typeButtonProps<[a-zA-Z]+extendsReact\.ElementType>/.test(clean(code)) },
    { message: 'Must intersect with React.ComponentProps<E>', test: (code) => /&React\.ComponentProps<[a-zA-Z]+>/.test(clean(code)) },
    { message: 'Must make Button component generic', test: (code) => /functionButton<[a-zA-Z]+extendsReact\.ElementType=?'button'?>/.test(clean(code)) },
    { message: 'Must pass as="a" to the Link Button', test: (code) => /<Button[^>]*as=['"]a['"][^>]*>LinkButton/.test(clean(code)) }
  ],
  'form-controls': [
    { message: 'Must bind select value to role state and handle onChange', test: (code) => (/<select[^>]*value=\{role\}/.test(clean(code)) && /<select[^>]*onChange=\{/.test(clean(code))) || (/value=\{role\}/.test(clean(code)) && /setRole\(e\.target\.value\)/.test(clean(code))) },
    { message: 'Must bind checkbox checked prop to agree state using e.target.checked', test: (code) => /checked=\{agree\}/.test(clean(code)) && /e\.target\.checked/.test(clean(code)) },
    { message: 'Must disable submit button when not agreed', test: (code) => /disabled=\{!agree\}/.test(clean(code)) || /disabled=\{agree===false\}/.test(clean(code)) }
  ],
  'per-field-validation': [
    { message: 'Must track touched state for inputs onBlur', test: (code) => (/onBlur=\{.*setTouched/.test(clean(code)) || /onBlur=\{handleBlur\}/.test(clean(code)) || /onBlur=\{\(\)=>handleBlur\(/.test(clean(code))) && /handleBlur\(['"]password['"]\)/.test(clean(code)) },
    { message: 'Must compute validation error messages', test: (code) => /errors\.email/.test(clean(code)) && /errors\.password/.test(clean(code)) },
    { message: 'Must conditionally display field error messages when touched', test: (code) => (/(touched\.email&&errors\.email|errors\.email&&touched\.email)/.test(clean(code)) && /(touched\.password&&errors\.password|errors\.password&&touched\.password)/.test(clean(code))) || (/touched\.email\?.*errors\.email/.test(clean(code)) && /touched\.password\?.*errors\.password/.test(clean(code))) }
  ],
  'ts-diagnostics': [
    { message: 'Must specify <User[]> generic for users state', test: (code) => /useState<User\[\]>\(\[\]\)/.test(clean(code)) },
    { message: 'Must type currentUser state as <User | null>', test: (code) => /useState<User\|null>\(null\)/.test(clean(code)) },
    { message: 'Must type handleInputChange with React.ChangeEvent<HTMLInputElement>', test: (code) => /e:React\.ChangeEvent<HTMLInputElement>/.test(clean(code)) }
  ],
  'testing-custom-hooks': [
    { message: 'Must call renderHook with useCounter', test: (code, files) => {
      const testCode = files?.['/useCounter.test.js']?.code || code;
      return /renderHook\(\(\)=>useCounter\(/.test(clean(testCode));
    }},
    { message: 'Must wrap state updater in act()', test: (code, files) => {
      const testCode = files?.['/useCounter.test.js']?.code || code;
      return /act\(\(\)=>\{?result\.current\./.test(clean(testCode));
    }},
    { message: 'Must assert on result.current.count', test: (code, files) => {
      const testCode = files?.['/useCounter.test.js']?.code || code;
      return /expect\(result\.current\.count\)/.test(clean(testCode));
    }}
  ],
  'mocking-modules': [
    { message: 'Must mock newsletterService using vi.mock', test: (code, files) => {
      const testCode = files?.['/SubscribeBox.test.jsx']?.code || code;
      return /vi\.mock\(['"]\.\/newsletterService['"]/.test(clean(testCode));
    }},
    { message: 'Must mock subscribe function with vi.fn()', test: (code, files) => {
      const testCode = files?.['/SubscribeBox.test.jsx']?.code || code;
      return /subscribe:vi\.fn\(/.test(clean(testCode));
    }},
    { message: 'Must assert subscribe was called with email', test: (code, files) => {
      const testCode = files?.['/SubscribeBox.test.jsx']?.code || code;
      return /expect\(subscribe\)\.toHaveBeenCalledWith\(/.test(clean(testCode));
    }}
  ],
  'msw-api-mocking': [
    { message: 'Must define http.get handler for cart API in setupServer', test: (code, files) => {
      const testCode = files?.['/CartSummary.test.jsx']?.code || code;
      return /http\.get\(['"]https:\/\/api\.store\.com\/cart['"]/.test(clean(testCode)) && /setupServer\(/.test(clean(testCode));
    }},
    { message: 'Must return HttpResponse.json with cart total and count', test: (code, files) => {
      const testCode = files?.['/CartSummary.test.jsx']?.code || code;
      const cleaned = clean(testCode);
      return /HttpResponse\.json\(/.test(cleaned) && /total:49\.99/.test(cleaned) && /count:2/.test(cleaned);
    }}
  ],
  'rendering-model': [
    { message: 'Use functional state updaters for the three dependent increments', test: code => (code.match(/setCount\s*\(\s*\w+\s*=>/g) || []).length >= 3 }
  ],
  'state-or-derived': [
    { message: 'Derive visibleCount instead of storing redundant state', test: code => /const\s+visibleCount\s*=/.test(code) && !/useState\s*\(\s*1\s*\)/.test(code) }
  ],
  'state-ownership': [
    { message: 'SearchBox must receive query and onQueryChange', test: code => /SearchBox[^>]*query=[\s\S]*onQueryChange=/.test(code) },
    { message: 'Results must receive query', test: code => /Results[^>]*query=/.test(code) }
  ],
  'identity-and-keys': [
    { message: 'Editor must receive a key derived from selectedUser identity', test: code => /<Editor[^>]*key=\{selectedUser\.id\}/.test(code) }
  ],
  'pure-rendering': [
    { message: 'Render must not mutate module-level renders', test: code => !/renders\s*\+=/.test(code) },
    { message: 'Count must update from a functional state updater', test: code => /onClick=\{/.test(code) && /setCount\(\s*\w+\s*=>\s*\w+\s*\+\s*1/.test(code) }
  ],
  'event-vs-effect': [
    { message: 'Handle the click directly', test: code => /onClick=\{\(\)\s*=>\s*console\.log/.test(code) },
    { message: 'Do not use an Effect as an event relay', test: code => !/useEffect/.test(code) }
  ],
  'debug-render-loop': [
    { message: 'Do not update state during render', test: code => !/setCount\(count\s*\+\s*1\)/.test(code) },
    { message: 'Update state from the click handler', test: code => /onClick=\{\(\)\s*=>\s*setCount/.test(code) }
  ],
  'debug-effect-loop': [
    { message: 'Derive double during render', test: code => /const\s+double\s*=\s*count\s*\*\s*2/.test(code) },
    { message: 'Remove redundant setDouble state', test: code => !/setDouble/.test(code) }
  ],
  'debug-identity': [
    { message: 'Use roomId as the synchronization dependency', test: code => /\[roomId\]/.test(code) },
    { message: 'Create options inside the Effect', test: code => /useEffect[\s\S]*const options\s*=/.test(code) }
  ],
  'debug-strict-mode': [
    { message: 'Clean up the timer', test: code => /clearTimeout\(timer\)/.test(code) },
    { message: 'Return a cleanup function from the Effect', test: code => /return\s*\(\)\s*=>\s*clearTimeout/.test(code) }
  ],
  'accessibility-and-testing': [
    { message: 'Input must have a programmatic label', test: code => /htmlFor=/.test(code) && /id=\{/.test(code) },
    { message: 'Error must be associated with aria-describedby', test: code => /aria-describedby=/.test(code) }
  ],
  'effect-events': [
    { message: 'Use useEffectEvent for event-like Effect logic', test: code => hasHookCall(parseAST(code) || {}, 'useEffectEvent') },
    { message: 'Room ID remains the Effect dependency', test: code => hasHookCallWithDeps(parseAST(code) || {}, 'useEffect', ['roomId']) }
  ],
  'activity': [
    { message: 'Use Activity with visible/hidden mode', test: code => /<Activity\s+mode=/.test(code) }
  ],
  // The Compiler only memoizes components that follow the Rules of React, so this
  // lesson is graded on render purity rather than on deleting a useMemo call.
  'react-compiler': [
    {
      message: 'Render must not mutate the shared PRODUCTS array (sort/reverse/push all mutate in place)',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        const MUTATORS = ['sort', 'reverse', 'splice', 'push', 'pop', 'shift', 'unshift'];
        const mutatesShared = findNode(ast, {
          CallExpression(node) {
            const callee = node.callee;
            return callee.type === 'MemberExpression' && !callee.computed &&
              callee.object.type === 'Identifier' && callee.object.name === 'PRODUCTS' &&
              callee.property.type === 'Identifier' && MUTATORS.includes(callee.property.name);
          },
        });
        return !mutatesShared;
      },
    },
    {
      message: 'Must still order products by price, using a copy (spread, slice, or toSorted)',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        const isProducts = (n) => n.type === 'Identifier' && n.name === 'PRODUCTS';
        return findNode(ast, {
          CallExpression(node) {
            const callee = node.callee;
            if (callee.type !== 'MemberExpression' || callee.computed || callee.property.type !== 'Identifier') return false;
            // PRODUCTS.toSorted(...)
            if (callee.property.name === 'toSorted') return isProducts(callee.object);
            if (callee.property.name !== 'sort') return false;
            // [...PRODUCTS].sort(...)
            if (callee.object.type === 'ArrayExpression') {
              return callee.object.elements.some((el) => el && el.type === 'SpreadElement' && isProducts(el.argument));
            }
            // PRODUCTS.slice().sort(...) and friends - all return a fresh array first
            if (callee.object.type === 'CallExpression') {
              const inner = callee.object.callee;
              return inner.type === 'MemberExpression' && !inner.computed && isProducts(inner.object) &&
                inner.property.type === 'Identifier' &&
                ['slice', 'concat', 'filter', 'map'].includes(inner.property.name);
            }
            return false;
          },
        });
      },
    },
    {
      message: 'renderCount may only be updated inside an Effect, never in the render body',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        const ranges = effectRanges(ast);
        const writes = collect(ast, {
          AssignmentExpression: (n) => (n.left.type === 'Identifier' && n.left.name === 'renderCount') || null,
          UpdateExpression: (n) => (n.argument.type === 'Identifier' && n.argument.name === 'renderCount') || null,
        });
        // Removing the counter altogether is also a pure result, so an empty set passes.
        return writes.every((write) => withinAny(write, ranges));
      },
    },
  ],
  // Graded on classification: derived data belongs in render, a click belongs in a
  // handler, and only genuine external synchronization stays in an Effect.
  'modern-react-architecture': [
    {
      message: 'visible and openCount are derived values - compute them during render instead of storing them in useState',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        const DERIVED = ['visible', 'openCount', 'pendingClear'];
        const storesDerived = findNode(ast, {
          VariableDeclarator(node) {
            if (node.init?.type !== 'CallExpression') return false;
            if (node.init.callee.type !== 'Identifier' || node.init.callee.name !== 'useState') return false;
            if (node.id.type === 'ArrayPattern') {
              const first = node.id.elements[0];
              return !!first && first.type === 'Identifier' && DERIVED.includes(first.name);
            }
            return node.id.type === 'Identifier' && DERIVED.includes(node.id.name);
          },
        });
        return !storesDerived;
      },
    },
    {
      message: 'Exactly one Effect should remain - the three misclassified ones must go',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        return collect(ast, {
          CallExpression: (n) => (n.callee.type === 'Identifier' && n.callee.name === 'useEffect') || null,
        }).length === 1;
      },
    },
    {
      message: 'The surviving Effect must be the real external synchronization (document.title)',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        return findNode(ast, {
          CallExpression(node) {
            if (node.callee.type !== 'Identifier' || node.callee.name !== 'useEffect') return false;
            const cb = node.arguments[0];
            return !!cb && /document\s*\.\s*title/.test(code.slice(cb.start, cb.end));
          },
        });
      },
    },
    {
      message: 'No Effect may call a state setter - that is an event or a derived value, not synchronization',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        const ranges = effectRanges(ast);
        if (ranges.length === 0) return true;
        const setterCalls = collect(ast, {
          CallExpression: (n) => (n.callee.type === 'Identifier' && /^set[A-Z]/.test(n.callee.name)) || null,
        });
        return !setterCalls.some((call) => withinAny(call, ranges));
      },
    },
    {
      message: 'Clearing the filter must reset query to an empty string in the click handler',
      test: (code) => {
        const ast = parseAST(code);
        if (!ast) return false;
        // Paired with the rule above (no setters inside Effects), this pins the reset to a handler.
        return findNode(ast, {
          CallExpression(node) {
            if (node.callee.type !== 'Identifier' || node.callee.name !== 'setQuery') return false;
            const arg = node.arguments[0];
            return !!arg && arg.type === 'Literal' && arg.value === '';
          },
        });
      },
    },
  ],

};

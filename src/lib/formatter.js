import * as prettier from 'prettier/standalone';
import * as parserBabel from 'prettier/plugins/babel.js';
import * as parserEstree from 'prettier/plugins/estree.js';
import * as parserPostcss from 'prettier/plugins/postcss.js';

/**
 * Formats JavaScript, JSX, TypeScript, or CSS code using Prettier Standalone in the browser.
 * If there is a syntax error, it returns the original code safely without throwing.
 *
 * @param {string} code - The source code to format
 * @param {string} filepath - Optional file path to determine the parser
 * @returns {Promise<string>} - The formatted code
 */
export async function formatCode(code, filepath = '/App.jsx') {
  if (!code || typeof code !== 'string') return code;

  try {
    const isTS = filepath.endsWith('.ts') || filepath.endsWith('.tsx');
    const isCSS = filepath.endsWith('.css');
    
    // Choose appropriate parser
    const parser = isCSS ? 'css' : (isTS ? 'babel-ts' : 'babel');

    const formatted = await prettier.format(code, {
      parser,
      plugins: [
        parserBabel.default || parserBabel,
        parserEstree.default || parserEstree,
        parserPostcss.default || parserPostcss,
      ],
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      bracketSpacing: true,
      jsxSingleQuote: false,
    });

    return formatted;
  } catch (err) {
    // Syntax error while user is typing - return code as-is
    console.debug('Prettier formatting skipped due to incomplete syntax:', err.message);
    return code;
  }
}

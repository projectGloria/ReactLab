/**
 * Lightweight in-browser assertion runner for flexible Sandpack testing.
 * Runs runtime element checks and state assertions to support creative, valid solutions.
 */

export async function runRuntimeAssertion(iframeWindow, testType, options = {}) {
  if (!iframeWindow || !iframeWindow.document) {
    return { ok: false, message: 'Iframe not ready' };
  }

  const doc = iframeWindow.document;

  try {
    switch (testType) {
      case 'focus-element': {
        const { selector } = options;
        const el = doc.querySelector(selector);
        if (!el) return { ok: false, message: `Element matching "${selector}" not found.` };
        el.focus();
        return { ok: doc.activeElement === el, message: `Expected ${selector} to receive focus.` };
      }

      case 'element-exists': {
        const { selector, textContent } = options;
        const el = doc.querySelector(selector);
        if (!el) return { ok: false, message: `Expected element matching "${selector}" to be rendered.` };
        if (textContent && !el.textContent.includes(textContent)) {
          return { ok: false, message: `Expected "${selector}" to contain text "${textContent}".` };
        }
        return { ok: true };
      }

      case 'button-click-effect': {
        const { buttonText, targetSelector, expectedNewText } = options;
        const buttons = [...doc.querySelectorAll('button')];
        const btn = buttons.find(b => b.textContent.toLowerCase().includes(buttonText.toLowerCase()));
        if (!btn) return { ok: false, message: `Button containing "${buttonText}" not found.` };

        btn.click();
        await new Promise(r => setTimeout(r, 50));

        if (targetSelector && expectedNewText) {
          const target = doc.querySelector(targetSelector);
          if (!target || !target.textContent.includes(expectedNewText)) {
            return { ok: false, message: `Clicking "${buttonText}" did not update "${targetSelector}" to "${expectedNewText}".` };
          }
        }
        return { ok: true };
      }

      case 'input-typing-effect': {
        const { inputSelector, inputValue, resultSelector, expectedResult } = options;
        const input = doc.querySelector(inputSelector || 'input');
        if (!input) return { ok: false, message: `Input element not found.` };

        // React installs its own `value` setter on the input prototype and uses
        // it to detect changes. Assigning `input.value = x` directly bypasses
        // that tracker, so React sees no change and onChange never fires --
        // which would make this assertion fail against perfectly correct
        // controlled-input code. Go through the native setter instead, which is
        // what React Testing Library and the browser devtools do.
        const proto = iframeWindow.HTMLTextAreaElement && input instanceof iframeWindow.HTMLTextAreaElement
          ? iframeWindow.HTMLTextAreaElement.prototype
          : iframeWindow.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (nativeSetter) nativeSetter.call(input, inputValue);
        else input.value = inputValue;

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 50));

        if (resultSelector && expectedResult) {
          const result = doc.querySelector(resultSelector);
          if (!result || !result.textContent.includes(expectedResult)) {
            return { ok: false, message: `Typing "${inputValue}" did not produce expected output.` };
          }
        }
        return { ok: true };
      }

      default:
        return { ok: true };
    }
  } catch (err) {
    return { ok: false, message: err.message || 'Assertion error' };
  }
}

'use strict';
/**
 * MODULE: diagnostics/devtools.js
 * Description: Thin bootstrap for the Touchlog maintenance surface.
 */
(function initDevTools(global) {
  const initTouchlog = () => {
    global.AppModules?.touchlog?.init?.();
  };

  if (global.document?.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', initTouchlog, { once: true });
  } else {
    initTouchlog();
  }
})(typeof window !== 'undefined' ? window : globalThis);

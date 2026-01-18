'use strict';
/**
 * MODULE: assets/js/ui-core.js
 * Description: Bietet zentrale UI-Helfer wie Hilfe-Panel, Debounce, Fokusfalle und Underlay-Inert-Logik zur Modalisierung.
 * Submodules:
 *  - helpPanel (UI-Hilfe-Overlay mit Fokussteuerung)
 *  - debounce (zeitverzögerte UI-Aktionen)
 *  - setUnderlayInert (Inaktivschaltung des Hintergrunds)
 *  - focusTrap (Fokusbegrenzung in Modalfenstern)
 * Notes:
 *  - Verhalten beibehalten; verbessert durch Coderabbit-Fixes für Fokus, Cache, Beobachter und Attribute.
 *  - Hybrid-kompatibel (Monolith + window.AppModules, read-only Legacy-Shims).
 */

// SUBMODULE: init @internal - initialisiert AppModules.uiCore und globale Shims
(function (global) {
  const MODULE_NAME = 'uiCore';
  const appModules = (global.AppModules = global.AppModules || {});
  const DEBUG_LOGS_ENABLED = (() => {
    try {
      return !!appModules?.config?.DEV_ALLOW_DEFAULTS;
    } catch {
      return false;
    }
  })();
  const getDiagLogger = () =>
    global.AppModules?.diagnostics?.diag || global.diag || null;
  const logUiWarn = (msg) => {
    const text = `[ui-core] ${msg}`;
    getDiagLogger()?.add?.(text);
    if (DEBUG_LOGS_ENABLED) {
      global.console?.warn?.(text);
    }
  };

  const waitForInitUi = (fn) => {
    const bootFlow = global.AppModules?.bootFlow;
    if (bootFlow?.whenStage) {
      bootFlow.whenStage('INIT_UI', fn);
    } else {
      fn();
    }
  };

  // SUBMODULE: helpPanel @public - steuert das Inline-Hilfe-Overlay mit Open/Close-Logik
  const helpPanel = {
    el: null,
    open: false,

    init() {
      const el = global.document.getElementById('help');
      if (!el) {
        logUiWarn('Missing element with id="help" - panel init skipped.');
        return;
      }
      this.el = el;
      this.open = false;

      const t1 = global.document.getElementById('helpToggle');
      const t2 = global.document.getElementById('helpToggleFab');
      const close = global.document.getElementById('helpClose');

      const toggle = () => {
        this.open = !this.open;
        if (this.open) this.show();
        else this.hide();
      };

      const bindHelpAfterBoot = () => {
        if (t1 && typeof t1.addEventListener === 'function') {
          t1.addEventListener('click', toggle);
        }
        if (t2 && typeof t2.addEventListener === 'function') {
          t2.addEventListener('click', toggle);
        }
        if (close && typeof close.addEventListener === 'function') {
          close.addEventListener('click', () => this.hide());
        }
      };
      waitForInitUi(bindHelpAfterBoot);
    },

    show() {
      if (!this.el) return;
      this.el.style.display = 'block';
      focusTrap.activate(this.el);
      this.open = true;
    },

    hide() {
      if (!this.el) return;
      this.el.style.display = 'none';
      focusTrap.deactivate();
      this.open = false;
    }
  };

  /* ===== Utils ===== */
  // SUBMODULE: debounce @public - begrenzt häufige Funktionsaufrufe (UI-Optimierung)
  function debounce(fn, ms = 150) {
    let timer = null;
    return (...args) => {
      if (timer) global.clearTimeout(timer);
      timer = global.setTimeout(() => {
        timer = null;
        fn(...args);
      }, ms);
    };
  }

// SUBMODULE: setUnderlayInert @public - deaktiviert Hintergrundelemente während Modals aktiv sind
  function setUnderlayInert(active, exceptEl = null) {
    try {
      const d = global.document;
      const targets = [
        d.querySelector('header'),
        d.querySelector('nav.tabs'),
        d.getElementById('appMain'),
        d.querySelector('.fab-wrap')
      ].filter(Boolean);

      targets.forEach((el) => {
        if (!el) return;
        if (active) {
          if (
            exceptEl &&
            (el === exceptEl || el.contains(exceptEl) || exceptEl.contains(el))
          ) {
            return;
          }
          if (!el.hasAttribute('data-prev-aria-hidden')) {
            const prev = el.getAttribute('aria-hidden');
            el.setAttribute('data-prev-aria-hidden', prev == null ? '' : prev);
          }
          el.setAttribute('aria-hidden', 'true');
          if (!el.hasAttribute('data-inert-applied')) {
            el.setAttribute('data-inert-applied', '1');
          }
          el.setAttribute('inert', '');
        } else {
          if (el.hasAttribute('data-prev-aria-hidden')) {
            const prev = el.getAttribute('data-prev-aria-hidden');
            if (prev === '') el.removeAttribute('aria-hidden');
            else el.setAttribute('aria-hidden', prev);
            el.removeAttribute('data-prev-aria-hidden');
          } else {
            el.removeAttribute('aria-hidden');
          }
          if (el.hasAttribute('data-inert-applied')) {
            el.removeAttribute('inert');
            el.removeAttribute('data-inert-applied');
          }
        }
      });
    } catch (_) {
      /* noop */
    }
  }

  // SUBMODULE: focusTrap @public - schränkt Tab-Fokus auf aktives Modal ein, inkl. MutationObserver-Caching
  const focusTrap = (() => {
    const cache = new WeakMap();     // root -> focusable elements[]
    const observers = new WeakMap(); // root -> MutationObserver

    const self = {
      stack: [],

      globalHandler(e) {
        if (e.key !== 'Tab') return;
        const top = self.stack[self.stack.length - 1];
        if (!top) return;

        const root = top.root;
        const items = self.getFocusable(root);

        if (!items.length) {
          e.preventDefault();
          if (typeof root.focus === 'function') root.focus();
          return;
        }

        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey && global.document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && global.document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      },

      getFocusable(root, refresh = false) {
        if (!refresh && cache.has(root)) return cache.get(root);

        const selector =
          'a[href], button:not([disabled]), input:not([disabled]), ' +
          'select:not([disabled]), textarea:not([disabled]), ' +
          '[tabindex]:not([tabindex="-1"])';

        const items = Array.from(root.querySelectorAll(selector)).filter(
          (el) => el.offsetParent !== null
        );

        cache.set(root, items);
        return items;
      },

      observeRoot(root) {
        if (observers.has(root)) return;
        const mo = new global.MutationObserver(() => {
          // direct invalidation: cache holds only roots → delete by root
          cache.delete(root);
        });
        mo.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          // Attribute-Änderungen, die die Fokusfähigkeit typischerweise beeinflussen:
          attributeFilter: ['disabled', 'tabindex']
        });
        observers.set(root, mo);
      },

      unobserveRoot(root) {
        const mo = observers.get(root);
        if (mo) {
          try { mo.disconnect(); } catch (_) {}
          observers.delete(root);
        }
      },

      activate(root) {
        if (!root) return;
        const top = self.stack[self.stack.length - 1];
        if (top && top.root === root) return;

        const existing = self.stack.findIndex((e) => e.root === root);
        if (existing !== -1) self.stack.splice(existing, 1);

        const d = global.document;
        const lastFocus = d.activeElement || null;
        const prevTabIndex = root.hasAttribute('tabindex')
          ? root.getAttribute('tabindex')
          : null;

        if (prevTabIndex === null) root.setAttribute('tabindex', '-1');
        root.setAttribute('aria-modal', 'true');

        self.stack.push({ root, lastFocus, prevTabIndex });

        if (self.stack.length === 1) {
          d.addEventListener('keydown', self.globalHandler, true);
        }

        const items = self.getFocusable(root);
        const target = items[0] || root;
        if (target && typeof target.focus === 'function') {
          try { target.focus(); } catch (_) {}
        }

        self.observeRoot(root);
        setUnderlayInert(true, root);
      },

      deactivate() {
        if (!self.stack.length) return;
        const top = self.stack.pop();
        const { root, lastFocus, prevTabIndex } = top;

        try { root.setAttribute('aria-modal', 'false'); } catch (_) {}

        if (prevTabIndex === null) root.removeAttribute('tabindex');
        else root.setAttribute('tabindex', prevTabIndex);

        if (lastFocus && typeof lastFocus.focus === 'function') {
          try { lastFocus.focus(); } catch (_) {}
        }

        self.unobserveRoot(root);

        const d = global.document;
        if (self.stack.length === 0) {
          d.removeEventListener('keydown', self.globalHandler, true);
          setUnderlayInert(false);
          return;
        }

        const newTop = self.stack[self.stack.length - 1];
        try { newTop.root.setAttribute('aria-modal', 'true'); } catch (_) {}
        setUnderlayInert(true, newTop.root);
      }
    };

    return self;
  })();

  // SUBMODULE: exports @internal - registriert API im globalen AppModules-Namespace
  const uiCoreApi = { helpPanel, debounce, setUnderlayInert, focusTrap };
  appModules[MODULE_NAME] = uiCoreApi;

  // SUBMODULE: legacy globals @internal - definiert globale read-only Zugriffe für Abwärtskompatibilität
  ['helpPanel', 'debounce', 'setUnderlayInert', 'focusTrap'].forEach((k) => {
    if (!Object.prototype.hasOwnProperty.call(global, k)) {
      Object.defineProperty(global, k, {
        value: uiCoreApi[k],
        writable: false,
        configurable: true,
        enumerable: false
      });
    }
  });
})(window);

// SUBMODULE: saveFeedback @public - zentraler Save-Feedback-Helper (Button/Panel/Status)
(function (global) {
  const appModules = (global.AppModules = global.AppModules || {});
  const timers = new WeakMap();

  const DEFAULTS = Object.freeze({
    busyText: 'Speichere ...',
    successText: 'OK gespeichert',
    errorText: 'Speichern fehlgeschlagen.',
    successMs: 1200,
    errorMs: 5000,
    flashMs: 480
  });

  const resolveEl = (value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      return global.document?.querySelector?.(value) || null;
    }
    return value;
  };

  const setStatus = (el, text, clearMs) => {
    if (!el) return;
    el.textContent = text || '';
    if (clearMs && clearMs > 0) {
      const prev = timers.get(el);
      if (prev) global.clearTimeout(prev);
      const t = global.setTimeout(() => {
        el.textContent = '';
        timers.delete(el);
      }, clearMs);
      timers.set(el, t);
    }
  };

  const rememberLabel = (btn) => {
    if (!btn) return;
    if (!btn.dataset.saveLabel) {
      btn.dataset.saveLabel = btn.innerHTML || btn.textContent || '';
    }
  };

  const restoreLabel = (btn) => {
    if (!btn) return;
    const base = btn.dataset.saveLabel;
    if (typeof base === 'string') {
      btn.innerHTML = base;
    }
    btn.disabled = false;
  };

  const flashPanel = (panel) => {
    if (!panel) return;
    panel.classList.remove('save-flash');
    void panel.offsetWidth;
    panel.classList.add('save-flash');
    global.setTimeout(() => panel.classList.remove('save-flash'), DEFAULTS.flashMs);
  };

  const saveFeedback = {
    start(opts = {}) {
      const btn = resolveEl(opts.button);
      const panel = resolveEl(opts.panel);
      const status = resolveEl(opts.statusEl);
      const text = opts.label || opts.busyText || DEFAULTS.busyText;

      if (btn) {
        rememberLabel(btn);
        btn.disabled = true;
        btn.innerHTML = text;
      }
      if (status && opts.showStatusOnStart) {
        setStatus(status, text, 0);
      }
      if (panel) {
        panel.classList.remove('save-flash');
      }
    },

    ok(opts = {}) {
      const btn = resolveEl(opts.button);
      const panel = resolveEl(opts.panel);
      const status = resolveEl(opts.statusEl);
      const text = opts.successText || DEFAULTS.successText;
      const resetMs = opts.successMs || DEFAULTS.successMs;

      if (btn) {
        rememberLabel(btn);
        btn.disabled = true;
        btn.innerHTML = text;
      }
      if (status && opts.showStatusOnOk) {
        setStatus(status, text, opts.statusClearMs || DEFAULTS.errorMs);
      }
      if (panel) {
        flashPanel(panel);
      }
      if (btn) {
        global.setTimeout(() => restoreLabel(btn), resetMs);
      }
    },

    error(opts = {}) {
      const btn = resolveEl(opts.button);
      const status = resolveEl(opts.statusEl);
      const message = opts.message || DEFAULTS.errorText;
      const clearMs = opts.statusClearMs || DEFAULTS.errorMs;

      if (status) {
        setStatus(status, message, clearMs);
      } else {
        global.uiError?.(message);
      }
      if (btn) {
        restoreLabel(btn);
      }
    }
  };

  appModules.saveFeedback = saveFeedback;
  if (typeof global.saveFeedback === 'undefined') {
    global.saveFeedback = saveFeedback;
  }
})(window);

'use strict';

(function initActivityV2CoachingExportShell(root) {
  const MESSAGES = Object.freeze({
    AUTH_REQUIRED: 'Bitte erneut anmelden und den Export wiederholen.',
    INVALID_EXPORT_REQUEST: 'Der gewählte Zeitraum ist ungültig.',
    EXPORT_LIMIT_EXCEEDED: 'Der Export ist für einen einzelnen Download zu groß.',
    EXPORT_SNAPSHOT_DRIFT: 'Die Daten konnten nicht konsistent gelesen werden.',
    EXPORT_CONTRACT_INVALID: 'Die Exportantwort entspricht nicht dem erwarteten Format.',
    REQUEST_FAILED: 'Der Export konnte nicht geladen werden.'
  });
  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function mount(rootElement, controller) {
    if (!(rootElement instanceof root.HTMLElement) || !isRecord(controller)) {
      throw new TypeError('shell dependencies are invalid');
    }
    const byRole = (role) => {
      const node = rootElement.querySelector(`[data-role="${role}"]`);
      if (!node) throw new Error(`missing shell role: ${role}`);
      return node;
    };
    const form = byRole('form');
    const customFields = byRole('custom-fields');
    const fromInput = byRole('from');
    const toInput = byRole('to');
    const submit = byRole('submit');
    const status = byRole('status');
    const retry = byRole('retry');
    const download = byRole('download');
    let lastStatus = null;

    function render(state) {
      const isCustom = state.preset === 'custom';
      const preserveInvalidCustomRange =
        isCustom &&
        state.status === 'error' &&
        state.errorCode === 'INVALID_EXPORT_REQUEST';
      customFields.hidden = !isCustom;
      fromInput.required = isCustom;
      toInput.required = isCustom;
      if (!preserveInvalidCustomRange) {
        fromInput.value = state.range.from;
        toInput.value = state.range.to;
      }
      rootElement.querySelectorAll('[name="range-preset"]').forEach((input) => {
        input.checked = String(state.preset) === input.value;
        input.disabled = state.status === 'loading';
      });
      fromInput.disabled = state.status === 'loading';
      toInput.disabled = state.status === 'loading';
      submit.disabled = state.status === 'loading';
      submit.textContent = state.status === 'loading' ? 'Export wird geladen …' : 'Export laden';
      retry.hidden = !(state.status === 'error' && state.canRetry);
      download.hidden = !state.download;
      if (state.download) {
        download.href = state.download.url;
        download.download = state.download.filename;
        download.textContent = `JSON herunterladen (${state.download.bytes} Bytes)`;
      } else {
        download.removeAttribute('href');
        download.removeAttribute('download');
      }
      status.setAttribute('role', state.status === 'error' ? 'alert' : 'status');
      if (state.status === 'idle') status.textContent = 'Zeitraum auswählen und Export laden.';
      if (state.status === 'loading') status.textContent = 'Aktivitätsdaten werden gelesen.';
      if (state.status === 'ready') {
        status.textContent = `${state.counts.sessions} Sessions, ${state.counts.items} Einträge und ${state.counts.sets} Sätze bereit.`;
      }
      if (state.status === 'empty') status.textContent = 'Keine Sessions im gewählten Zeitraum. Der vollständige leere Export ist bereit.';
      if (state.status === 'error') {
        status.textContent = MESSAGES[state.errorCode] || MESSAGES.REQUEST_FAILED;
      }
      if (lastStatus === 'loading' && state.status === 'error') {
        (state.canRetry ? retry : status).focus();
      }
      if (lastStatus === 'loading' && (state.status === 'ready' || state.status === 'empty')) {
        download.focus();
      }
      lastStatus = state.status;
    }

    form.addEventListener('change', (event) => {
      if (event.target.name !== 'range-preset') return;
      if (event.target.value === 'custom') {
        customFields.hidden = false;
        fromInput.disabled = false;
        toInput.disabled = false;
        fromInput.focus();
        return;
      }
      controller.setPreset(Number(event.target.value));
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const custom = form.elements['range-preset'].value === 'custom';
      if (custom) {
        const next = controller.setCustomRange({
          from: fromInput.value,
          to: toInput.value
        });
        if (next.status === 'error') return;
      }
      void controller.load();
    });
    retry.addEventListener('click', () => void controller.retry());
    download.addEventListener('click', () => {
      root.setTimeout(() => controller.releaseDownload(), 0);
    });
    const unsubscribe = controller.subscribe(render);
    return Object.freeze({
      destroy() {
        unsubscribe();
        controller.destroy();
      }
    });
  }

  if (root.AppModules === undefined) root.AppModules = {};
  if (!isRecord(root.AppModules)) throw new TypeError('AppModules must be an object');
  if (root.AppModules.activityV2 === undefined) root.AppModules.activityV2 = {};
  if (!isRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('coachingExportShell' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.coachingExportShell is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }
  Object.defineProperty(root.AppModules.activityV2, 'coachingExportShell', {
    value: Object.freeze({ mount }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);

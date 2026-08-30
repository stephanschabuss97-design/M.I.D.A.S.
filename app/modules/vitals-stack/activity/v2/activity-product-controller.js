'use strict';

(function initActivityV2ProductController(root) {
  const OPTION_KEYS = Object.freeze([
    'host',
    'sessionHost',
    'historyHost',
    'exportHost',
    'semantics',
    'resolveSemantics',
    'sessionDraft',
    'sessionRecovery',
    'sessionCommit',
    'sessionShell',
    'dataAccess',
    'sessionCorrection',
    'sessionHistory',
    'sessionHistoryShell',
    'coachingExport',
    'coachingExportController',
    'coachingExportShell',
    'now',
    'createRequestId',
    'createLeaseToken',
    'confirmDiscard',
    'refreshActivityConsumers'
  ]);
  const CONTROLLER_KEYS = Object.freeze([
    'getState',
    'subscribe',
    'startSession',
    'continueSession',
    'discardRecoveredSession',
    'openHistory',
    'openExport',
    'requestClose',
    'setAuthenticated',
    'destroy'
  ]);
  const STATE_KEYS = Object.freeze([
    'state',
    'reason',
    'busy',
    'recovery_state',
    'commit_state',
    'active_surface'
  ]);
  const API_METHODS = Object.freeze({
    semantics: ['getCatalog', 'getEntryByKey', 'normalizeSearchText', 'search'],
    sessionDraft: ['create', 'restore'],
    sessionRecovery: ['createIndexedDbStore', 'open'],
    sessionCommit: ['create'],
    sessionShell: ['mount'],
    dataAccess: [
      'commitSession',
      'loadLastPerformance',
      'listSessions',
      'loadSessionDetail',
      'loadCoachingExport',
      'replaceSession',
      'deleteSession'
    ],
    sessionCorrection: ['create'],
    sessionHistory: ['create', 'createMutationGuard'],
    sessionHistoryShell: ['mount'],
    coachingExport: [
      'validateExport',
      'validateRange',
      'createPresetRange',
      'buildDownloadName'
    ],
    coachingExportController: ['create'],
    coachingExportShell: ['mount']
  });
  const FUNCTION_KEYS = Object.freeze([
    'resolveSemantics',
    'now',
    'createRequestId',
    'createLeaseToken',
    'confirmDiscard',
    'refreshActivityConsumers'
  ]);
  const RECOVERY_METHODS = Object.freeze([
    'getState',
    'getDraft',
    'startNew',
    'continueSession',
    'flush',
    'discard',
    'subscribe',
    'destroy',
    'getCommitIntent',
    'prepareCommit',
    'beginCommitAttempt',
    'releaseCommit',
    'completeCommit'
  ]);
  const COMMIT_METHODS = Object.freeze([
    'getState',
    'finish',
    'retry',
    'subscribe',
    'destroy'
  ]);
  const RECOVERY_STATES = Object.freeze([
    'empty',
    'recoverable',
    'active',
    'saving',
    'saved',
    'degraded',
    'conflict',
    'blocked',
    'discarding',
    'destroyed'
  ]);
  const COMMIT_STATES = Object.freeze([
    'editing',
    'preparing',
    'committing',
    'not_committed',
    'release_pending',
    'unknown',
    'cleanup_pending',
    'committed',
    'blocked',
    'destroyed'
  ]);
  const COPY = Object.freeze({
    idle: 'Bereit für ein neues Training.',
    recoverable: 'Ein nicht abgeschlossenes Training ist auf diesem Gerät gespeichert.',
    editing: 'Training wird bearbeitet.',
    saving: 'Training wird gespeichert. Bitte dieses Fenster geöffnet lassen.',
    unknown: 'Die Speicherantwort ist noch nicht eindeutig. Derselbe Auftrag bleibt für den Wiederholungsversuch erhalten.',
    committed: 'Training wurde gespeichert.',
    history: 'Trainingsverlauf.',
    export: 'Aktivitätsdaten exportieren.',
    blocked: 'Activity V2 ist derzeit nicht verfügbar.',
    destroyed: 'Activity V2 wurde beendet.'
  });
  const mountedHosts = new WeakSet();
  const mountedDocuments = new WeakSet();

  class ActivityV2ProductControllerError extends Error {
    constructor(code) {
      super('The Activity V2 product controller operation could not be completed.');
      this.name = 'ActivityV2ProductControllerError';
      this.code = code;
    }
  }

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
  const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

  function fail(code) {
    throw new ActivityV2ProductControllerError(code);
  }

  function deepFreeze(value) {
    if (!isRecord(value) || Object.isFrozen(value)) return value;
    Reflect.ownKeys(value).forEach((key) => deepFreeze(value[key]));
    return Object.freeze(value);
  }

  function hasExactDataKeys(value, keys) {
    if (!isRecord(value)) return false;
    const ownKeys = Reflect.ownKeys(value);
    if (
      ownKeys.length !== keys.length ||
      ownKeys.some((key) => typeof key !== 'string' || !keys.includes(key))
    ) {
      return false;
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    return keys.every(
      (key) =>
        hasOwn(descriptors, key) &&
        hasOwn(descriptors[key], 'value') &&
        !hasOwn(descriptors[key], 'get') &&
        !hasOwn(descriptors[key], 'set')
    );
  }

  function assertMethodSurface(value, methods) {
    if (!isRecord(value)) fail('INVALID_OPTIONS');
    methods.forEach((method) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, method);
      if (
        !descriptor ||
        !hasOwn(descriptor, 'value') ||
        typeof descriptor.value !== 'function'
      ) {
        fail('INVALID_OPTIONS');
      }
    });
  }

  function assertHost(value, document) {
    if (
      !value ||
      value.nodeType !== 1 ||
      value.ownerDocument !== document ||
      typeof value.appendChild !== 'function'
    ) {
      fail('INVALID_OPTIONS');
    }
  }

  function readOptions(value) {
    if (!hasExactDataKeys(value, OPTION_KEYS)) fail('INVALID_OPTIONS');
    const document = value.host?.ownerDocument;
    if (!document || typeof document.createElement !== 'function') {
      fail('INVALID_OPTIONS');
    }
    ['host', 'sessionHost', 'historyHost', 'exportHost'].forEach((key) => {
      assertHost(value[key], document);
    });
    if (new Set([value.host, value.sessionHost, value.historyHost, value.exportHost]).size !== 4) {
      fail('INVALID_OPTIONS');
    }
    Object.entries(API_METHODS).forEach(([key, methods]) => {
      assertMethodSurface(value[key], methods);
    });
    FUNCTION_KEYS.forEach((key) => {
      if (typeof value[key] !== 'function') fail('INVALID_OPTIONS');
    });
    try {
      if (value.semantics.getCatalog().catalog_version !== 2) {
        fail('INVALID_OPTIONS');
      }
    } catch (error) {
      if (error instanceof ActivityV2ProductControllerError) throw error;
      fail('INVALID_OPTIONS');
    }
    return { options: value, document };
  }

  function createElement(document, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function createButton(document, action, text) {
    const button = createElement(document, 'button', 'activity-v2-product-action', text);
    button.type = 'button';
    button.dataset.action = action;
    return button;
  }

  function createUi(document) {
    const rootElement = createElement(document, 'section', 'activity-v2-product');
    rootElement.dataset.activityV2R14Surface = 'capture-entry';
    rootElement.setAttribute('aria-labelledby', 'activity-v2-product-title');

    const heading = createElement(
      document,
      'h2',
      'activity-v2-product-title',
      'Training'
    );
    heading.id = 'activity-v2-product-title';
    const status = createElement(document, 'p', 'activity-v2-product-status');
    status.dataset.role = 'status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const primaryActions = createElement(
      document,
      'div',
      'activity-v2-product-actions activity-v2-product-actions-primary'
    );
    const start = createButton(document, 'start-session', 'Training starten');
    const resume = createButton(document, 'continue-session', 'Training fortsetzen');
    const discard = createButton(document, 'discard-recovery', 'Entwurf verwerfen');
    primaryActions.appendChild(start);
    primaryActions.appendChild(resume);
    primaryActions.appendChild(discard);

    const secondaryActions = createElement(
      document,
      'div',
      'activity-v2-product-actions activity-v2-product-actions-secondary'
    );
    const history = createButton(document, 'open-history', 'Verlauf');
    const exportButton = createButton(document, 'open-export', 'Export');
    secondaryActions.appendChild(history);
    secondaryActions.appendChild(exportButton);

    rootElement.appendChild(heading);
    rootElement.appendChild(status);
    rootElement.appendChild(primaryActions);
    rootElement.appendChild(secondaryActions);
    return { rootElement, status, start, resume, discard, history, exportButton };
  }

  function appendLabeledRadio(document, fieldset, value, text, checked = false) {
    const label = createElement(document, 'label', 'activity-v2-product-radio');
    const input = createElement(document, 'input');
    input.type = 'radio';
    input.name = 'range-preset';
    input.value = String(value);
    input.checked = checked;
    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${text}`));
    fieldset.appendChild(label);
  }

  function createDateField(document, role, text) {
    const label = createElement(document, 'label', 'activity-v2-product-date');
    const caption = createElement(document, 'span', '', text);
    const input = createElement(document, 'input');
    input.type = 'date';
    input.dataset.role = role;
    label.appendChild(caption);
    label.appendChild(input);
    return label;
  }

  function createExportUi(document) {
    const rootElement = createElement(document, 'section', 'activity-v2-product-export');
    rootElement.setAttribute('aria-labelledby', 'activity-v2-product-export-title');
    const heading = createElement(
      document,
      'h3',
      'activity-v2-product-surface-title',
      'Aktivitätsdaten exportieren'
    );
    heading.id = 'activity-v2-product-export-title';
    heading.tabIndex = -1;
    const form = createElement(document, 'form', 'activity-v2-product-export-form');
    form.dataset.role = 'form';
    const fieldset = createElement(document, 'fieldset');
    const legend = createElement(document, 'legend', '', 'Zeitraum');
    fieldset.appendChild(legend);
    appendLabeledRadio(document, fieldset, 3, '3 Monate');
    appendLabeledRadio(document, fieldset, 6, '6 Monate', true);
    appendLabeledRadio(document, fieldset, 12, '12 Monate');
    appendLabeledRadio(document, fieldset, 'custom', 'Eigener Zeitraum');
    const customFields = createElement(
      document,
      'div',
      'activity-v2-product-export-custom'
    );
    customFields.dataset.role = 'custom-fields';
    customFields.hidden = true;
    customFields.appendChild(createDateField(document, 'from', 'Von'));
    customFields.appendChild(createDateField(document, 'to', 'Bis'));
    const submit = createButton(document, 'load-export', 'Export laden');
    submit.type = 'submit';
    submit.dataset.role = 'submit';
    const status = createElement(document, 'p', 'activity-v2-product-export-status');
    status.dataset.role = 'status';
    status.tabIndex = -1;
    const retry = createButton(document, 'retry-export', 'Erneut versuchen');
    retry.dataset.role = 'retry';
    retry.hidden = true;
    const download = createElement(
      document,
      'a',
      'activity-v2-product-download',
      'JSON herunterladen'
    );
    download.dataset.role = 'download';
    download.hidden = true;
    form.appendChild(fieldset);
    form.appendChild(customFields);
    form.appendChild(submit);
    rootElement.appendChild(heading);
    rootElement.appendChild(form);
    rootElement.appendChild(status);
    rootElement.appendChild(retry);
    rootElement.appendChild(download);
    return { rootElement, heading };
  }

  function createState(state, reason, busy, recoveryState, commitState, activeSurface) {
    const value = {
      state,
      reason,
      busy,
      recovery_state: recoveryState,
      commit_state: commitState,
      active_surface: activeSurface
    };
    if (!hasExactDataKeys(value, STATE_KEYS)) fail('INVALID_STATE');
    return deepFreeze(value);
  }

  function mount(optionsValue) {
    const { options, document } = readOptions(optionsValue);
    if (mountedHosts.has(options.host) || mountedDocuments.has(document)) {
      fail('ALREADY_MOUNTED');
    }

    const ui = createUi(document);
    const subscribers = new Set();
    let destroyed = false;
    let destroyRequested = false;
    let authenticated = false;
    let recoveryController = null;
    let unsubscribeRecovery = null;
    let recoveryOpenPromise = null;
    let sessionDraftController = null;
    let sessionSemantics = null;
    let sessionCommitController = null;
    let unsubscribeCommit = null;
    let sessionShellController = null;
    let commitNotificationSent = false;
    let historyController = null;
    let historyShellController = null;
    let historyBackButton = null;
    let exportController = null;
    let exportShellController = null;
    let exportRootElement = null;
    let exportBackButton = null;
    let lifecycleTail = Promise.resolve();
    let surfaceReconcileTimer = null;
    let stateSnapshot = createState(
      'blocked',
      'auth_required',
      false,
      'unopened',
      'not_created',
      'entry'
    );

    function assertUsable() {
      if (destroyed) fail('CONTROLLER_DESTROYED');
    }

    function getState() {
      return stateSnapshot;
    }

    function currentRecoveryState() {
      if (!recoveryController) return null;
      try {
        const state = recoveryController.getState();
        if (
          !hasExactDataKeys(state, [
            'state',
            'started_at',
            'saved_at',
            'item_count',
            'reason'
          ]) ||
          !RECOVERY_STATES.includes(state.state) ||
          !Number.isSafeInteger(state.item_count) ||
          state.item_count < 0
        ) {
          return null;
        }
        return state;
      } catch {
        return null;
      }
    }

    function currentCommitState() {
      if (!sessionCommitController) return null;
      try {
        const state = sessionCommitController.getState();
        if (
          !hasExactDataKeys(state, [
            'state',
            'reason',
            'focus_target',
            'intent_present'
          ]) ||
          !COMMIT_STATES.includes(state.state) ||
          typeof state.intent_present !== 'boolean'
        ) {
          return null;
        }
        return state;
      } catch {
        return null;
      }
    }

    function notify() {
      [...subscribers].forEach((listener) => {
        try {
          listener(stateSnapshot);
        } catch {
          subscribers.delete(listener);
        }
      });
    }

    function render() {
      const state = stateSnapshot.state;
      ui.status.textContent = COPY[state] || COPY.blocked;
      ui.status.setAttribute('role', state === 'blocked' || state === 'unknown' ? 'alert' : 'status');
      const hasSession = sessionShellController !== null;
      const canResume =
        authenticated &&
        hasSession &&
        ['recoverable', 'unknown', 'blocked'].includes(state);
      const hardBlocked =
        !authenticated || state === 'destroyed' || (state === 'blocked' && !canResume);
      ui.start.hidden = state !== 'idle';
      ui.resume.hidden = !(state === 'recoverable' || canResume);
      ui.discard.hidden = state !== 'recoverable';
      ui.resume.textContent =
        state === 'unknown' ? 'Speichern erneut öffnen' : 'Training fortsetzen';
      ui.start.disabled = hardBlocked || stateSnapshot.busy;
      ui.resume.disabled = hardBlocked || stateSnapshot.busy;
      ui.discard.disabled = hardBlocked || stateSnapshot.busy;
      ui.history.disabled = !authenticated || stateSnapshot.busy || state === 'destroyed';
      ui.exportButton.disabled = !authenticated || stateSnapshot.busy || state === 'destroyed';
      options.historyHost.hidden = stateSnapshot.active_surface !== 'history';
      options.exportHost.hidden = stateSnapshot.active_surface !== 'export';
    }

    function publish(state, reason, busy, recoveryState, commitState, activeSurface) {
      stateSnapshot = createState(
        state,
        reason,
        busy,
        recoveryState,
        commitState,
        activeSurface
      );
      render();
      notify();
      return stateSnapshot;
    }

    function publishBlocked(reason, busy = false) {
      return publish(
        'blocked',
        reason,
        busy,
        currentRecoveryState()?.state || 'unopened',
        currentCommitState()?.state || 'not_created',
        'entry'
      );
    }

    function reconcileProductState(activeSurface = stateSnapshot.active_surface) {
      if (destroyed) return stateSnapshot;
      if (!authenticated) return publishBlocked('auth_required');

      const recovery = currentRecoveryState();
      const commit = currentCommitState();
      if (recoveryController && recovery === null) {
        return publishBlocked('invalid_recovery_state');
      }
      if (sessionCommitController && commit === null) {
        return publishBlocked('invalid_commit_state');
      }
      const recoveryState = recovery?.state || 'unopened';
      const commitState = commit?.state || 'not_created';

      if (activeSurface === 'history') {
        return publish('history', null, false, recoveryState, commitState, 'history');
      }
      if (activeSurface === 'export') {
        return publish('export', null, false, recoveryState, commitState, 'export');
      }
      if (commit) {
        if (['preparing', 'committing'].includes(commit.state)) {
          return publish('saving', null, true, recoveryState, commitState, activeSurface);
        }
        if (['unknown', 'cleanup_pending', 'release_pending'].includes(commit.state)) {
          return publish('unknown', commit.reason, false, recoveryState, commitState, activeSurface);
        }
        if (commit.state === 'committed') {
          return publish('committed', null, false, recoveryState, commitState, activeSurface);
        }
        if (commit.state === 'blocked') {
          return publish('blocked', commit.reason, false, recoveryState, commitState, activeSurface);
        }
      }
      if (activeSurface === 'session' && sessionShellController?.isOpen()) {
        return publish('editing', null, false, recoveryState, commitState, 'session');
      }
      if (!recovery) return publishBlocked('recovery_unopened');
      if (recovery.state === 'empty') {
        return publish('idle', null, false, recoveryState, commitState, 'entry');
      }
      if (['recoverable', 'active', 'saved', 'saving'].includes(recovery.state)) {
        const busy = recovery.state === 'saving';
        return publish('recoverable', recovery.reason, busy, recoveryState, commitState, 'entry');
      }
      if (recovery.state === 'discarding') {
        return publish('recoverable', null, true, recoveryState, commitState, 'entry');
      }
      if (recovery.state === 'destroyed' && commit?.state === 'committed') {
        return publish('committed', null, false, recoveryState, commitState, activeSurface);
      }
      return publish('blocked', recovery.reason || recovery.state, false, recoveryState, commitState, 'entry');
    }

    function runLifecycle(operation) {
      const next = lifecycleTail.catch(() => {}).then(operation);
      lifecycleTail = next.catch(() => {});
      return next;
    }

    function subscribe(listener) {
      assertUsable();
      if (typeof listener !== 'function') fail('INVALID_LISTENER');
      subscribers.add(listener);
      listener(stateSnapshot);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        subscribers.delete(listener);
      };
    }

    function requireAuthenticated() {
      assertUsable();
      if (!authenticated) fail('AUTH_REQUIRED');
    }

    function assertSemantics(value, catalogVersion) {
      assertMethodSurface(value, [
        'getCatalog',
        'getEntryByKey',
        'normalizeSearchText',
        'search'
      ]);
      let catalog;
      try {
        catalog = value.getCatalog();
      } catch {
        fail('SEMANTICS_UNAVAILABLE');
      }
      if (!isRecord(catalog) || catalog.catalog_version !== catalogVersion) {
        fail('SEMANTICS_UNAVAILABLE');
      }
      return value;
    }

    function resolveDraftSemantics(draft) {
      let version;
      try {
        version = draft.getSnapshot().catalog_version;
      } catch {
        fail('INVALID_DRAFT');
      }
      let selected;
      try {
        selected = options.resolveSemantics(version);
      } catch {
        selected = null;
      }
      return assertSemantics(selected, version);
    }

    async function ensureRecovery() {
      requireAuthenticated();
      if (recoveryController) return recoveryController;
      if (recoveryOpenPromise) return await recoveryOpenPromise;
      publish('blocked', 'recovery_initializing', true, 'opening', 'not_created', 'entry');
      let storage = null;
      let opened = null;
      const operation = Promise.resolve().then(async () => {
        try {
          storage = options.sessionRecovery.createIndexedDbStore();
          opened = await options.sessionRecovery.open({
            storage,
            semantics: options.semantics,
            resolveSemantics: options.resolveSemantics,
            now: options.now,
            createRequestId: options.createRequestId,
            createLeaseToken: options.createLeaseToken
          });
          assertMethodSurface(opened, RECOVERY_METHODS);
          if (destroyed || !authenticated) {
            opened.destroy();
            return null;
          }
          recoveryController = opened;
          unsubscribeRecovery = recoveryController.subscribe(handleRecoveryState);
          if (typeof unsubscribeRecovery !== 'function') fail('INVALID_RECOVERY_API');
          reconcileProductState('entry');
          return recoveryController;
        } catch (error) {
          try {
            unsubscribeRecovery?.();
            opened?.destroy?.();
          } catch {
            // Failed-open cleanup cannot replace the safe product error.
          }
          unsubscribeRecovery = null;
          if (recoveryController === opened) recoveryController = null;
          try {
            storage?.close?.();
          } catch {
            // A failed local open leaves no product-owned storage handle behind.
          }
          if (!destroyed && authenticated) publishBlocked('recovery_open_failed');
          if (error instanceof ActivityV2ProductControllerError) throw error;
          fail('RECOVERY_OPEN_FAILED');
        } finally {
          if (recoveryOpenPromise === operation) recoveryOpenPromise = null;
        }
      });
      recoveryOpenPromise = operation;
      return await operation;
    }

    function refreshHistoryAdmission() {
      try {
        historyController?.refreshAdmission();
      } catch {
        // History remains read-only when the mutation guard cannot be refreshed.
      }
    }

    function handleRecoveryState() {
      if (destroyed) return;
      refreshHistoryAdmission();
      reconcileProductState();
      if (currentRecoveryState()?.state === 'destroyed') scheduleSurfaceReconcile();
    }

    function notifyCommittedConsumers() {
      if (commitNotificationSent) return;
      commitNotificationSent = true;
      Promise.resolve()
        .then(() => options.refreshActivityConsumers())
        .catch(() => {});
    }

    function handleCommitState(state) {
      if (destroyed) return;
      if (state?.state === 'committed') notifyCommittedConsumers();
      refreshHistoryAdmission();
      reconcileProductState();
    }

    function createSessionGraph(draft) {
      if (sessionShellController) {
        if (sessionDraftController !== draft) fail('SESSION_ALREADY_ACTIVE');
        return sessionShellController;
      }
      const selectedSemantics = resolveDraftSemantics(draft);
      let commit = null;
      let unsubscribe = null;
      let shell = null;
      try {
        commit = options.sessionCommit.create({
          draft,
          recovery: recoveryController,
          semantics: selectedSemantics,
          commitSession: options.dataAccess.commitSession,
          now: options.now
        });
        assertMethodSurface(commit, COMMIT_METHODS);
        unsubscribe = commit.subscribe(handleCommitState);
        if (typeof unsubscribe !== 'function') fail('INVALID_COMMIT_API');
        shell = options.sessionShell.mount({
          confirmDiscard: options.confirmDiscard,
          draft,
          host: options.sessionHost,
          loadLastPerformance: (itemKey) =>
            options.dataAccess.loadLastPerformance(itemKey, {
              semantics: selectedSemantics
            }),
          recovery: recoveryController,
          sessionCommit: commit,
          semantics: selectedSemantics
        });
        assertMethodSurface(shell, [
          'open',
          'render',
          'requestClose',
          'isOpen',
          'refreshLastPerformance',
          'destroy'
        ]);
      } catch (error) {
        try {
          unsubscribe?.();
        } catch {
          // Failed graph construction has no surviving product subscription.
        }
        try {
          shell?.destroy?.();
        } catch {
          // Failed shell mount cleanup is best effort.
        }
        try {
          commit?.destroy?.();
        } catch {
          // No commit operation has started during graph construction.
        }
        if (error instanceof ActivityV2ProductControllerError) throw error;
        fail('SESSION_COMPOSITION_FAILED');
      }
      sessionDraftController = draft;
      sessionSemantics = selectedSemantics;
      sessionCommitController = commit;
      unsubscribeCommit = unsubscribe;
      sessionShellController = shell;
      commitNotificationSent = false;
      refreshHistoryAdmission();
      return sessionShellController;
    }

    function openSession(opener) {
      const shell = createSessionGraph(sessionDraftController);
      shell.open({ opener });
      reconcileProductState('session');
      return stateSnapshot;
    }

    function startSession() {
      requireAuthenticated();
      return runLifecycle(async () => {
        requireAuthenticated();
        await ensureRecovery();
        const recovery = currentRecoveryState();
        if (!recovery || recovery.state !== 'empty') fail('INVALID_STATE');
        sessionDraftController = recoveryController.startNew();
        sessionSemantics = options.semantics;
        createSessionGraph(sessionDraftController);
        return openSession(ui.start);
      });
    }

    function continueSession() {
      requireAuthenticated();
      return runLifecycle(async () => {
        requireAuthenticated();
        await ensureRecovery();
        if (!sessionDraftController) {
          sessionDraftController = recoveryController.getDraft();
          if (!sessionDraftController) {
            sessionDraftController = recoveryController.continueSession();
          }
        }
        createSessionGraph(sessionDraftController);
        return openSession(ui.resume);
      });
    }

    function resetRecovery() {
      try {
        unsubscribeRecovery?.();
      } catch {
        // Subscription cleanup cannot alter persistent recovery truth.
      }
      unsubscribeRecovery = null;
      try {
        recoveryController?.destroy();
      } catch {
        // Recovery destroy is idempotent and never a physical discard.
      }
      recoveryController = null;
      recoveryOpenPromise = null;
    }

    function teardownSessionGraph() {
      try {
        unsubscribeCommit?.();
      } catch {
        // Subscription cleanup has no commit side effect.
      }
      unsubscribeCommit = null;
      try {
        sessionShellController?.destroy();
      } catch {
        // Technical shell teardown never requests a persistent discard.
      }
      sessionShellController = null;
      try {
        sessionCommitController?.destroy();
      } catch {
        // Callers wait for active commit settlement before teardown.
      }
      sessionCommitController = null;
      sessionDraftController = null;
      sessionSemantics = null;
      commitNotificationSent = false;
    }

    async function replaceFinishedRecovery() {
      teardownSessionGraph();
      resetRecovery();
      if (authenticated && !destroyed && !destroyRequested) {
        await ensureRecovery();
        reconcileProductState('entry');
      }
    }

    function discardRecoveredSession() {
      requireAuthenticated();
      return runLifecycle(async () => {
        requireAuthenticated();
        await ensureRecovery();
        if (sessionCommitController || currentRecoveryState()?.state !== 'recoverable') {
          fail('INVALID_STATE');
        }
        const confirmed = await options.confirmDiscard(
          deepFreeze({
            message: 'Gespeicherten Trainingsentwurf wirklich verwerfen?',
            source: 'recovery_entry'
          })
        );
        if (confirmed !== true) {
          ui.resume.focus();
          return false;
        }
        await recoveryController.discard();
        await replaceFinishedRecovery();
        ui.start.focus();
        return true;
      });
    }

    function historyAdapter() {
      return deepFreeze({
        listSessions: options.dataAccess.listSessions,
        loadSessionDetail: options.dataAccess.loadSessionDetail,
        replaceSession: options.dataAccess.replaceSession,
        deleteSession: options.dataAccess.deleteSession
      });
    }

    function refreshLastPerformance(itemKeys) {
      if (sessionShellController) {
        return sessionShellController.refreshLastPerformance(itemKeys);
      }
      return Promise.resolve(
        deepFreeze({
          status: 'success',
          items: itemKeys.map((itemKey) => ({
            item_key: itemKey,
            status: 'invalidated'
          }))
        })
      );
    }

    function ensureHistory() {
      if (historyController) return;
      const mutationGuard = options.sessionHistory.createMutationGuard({
        getRecovery: () => recoveryController,
        getSessionCommit: () => sessionCommitController
      });
      let controller = null;
      let shell = null;
      let backButton = null;
      try {
        controller = options.sessionHistory.create({
          adapter: historyAdapter(),
          createCorrection: (detail) => {
            const semantics = options.resolveSemantics(detail.catalog_version);
            return options.sessionCorrection.create(detail, { semantics });
          },
          mutationGuard,
          refreshLastPerformance
        });
        shell = options.sessionHistoryShell.mount({
          host: options.historyHost,
          controller
        });
        shell.getElement().tabIndex = -1;
        backButton = createButton(document, 'close-history', 'Zurück zum Training');
        backButton.addEventListener('click', closeHistory);
        options.historyHost.appendChild(backButton);
      } catch {
        try {
          backButton?.removeEventListener('click', closeHistory);
          backButton?.remove();
          shell?.destroy?.();
        } catch {
          // Failed history-shell cleanup is best effort.
        }
        try {
          controller?.destroy?.();
        } catch {
          // Failed history-controller cleanup owns no recovery state.
        }
        clearHost(options.historyHost);
        fail('HISTORY_COMPOSITION_FAILED');
      }
      historyController = controller;
      historyShellController = shell;
      historyBackButton = backButton;
    }

    function openHistory() {
      requireAuthenticated();
      return runLifecycle(async () => {
        requireAuthenticated();
        await ensureRecovery();
        ensureHistory();
        historyController.refreshAdmission();
        reconcileProductState('history');
        historyShellController.getElement().focus?.();
        return stateSnapshot;
      });
    }

    function closeHistory() {
      if (destroyed || stateSnapshot.active_surface !== 'history') return false;
      reconcileProductState('entry');
      ui.history.focus();
      return true;
    }

    function ensureExport() {
      if (exportController) return;
      const exportUi = createExportUi(document);
      let controller = null;
      let shell = null;
      let backButton = null;
      try {
        controller = options.coachingExportController.create({
          adapter: options.dataAccess,
          contract: options.coachingExport,
          now: options.now
        });
        shell = options.coachingExportShell.mount(
          exportUi.rootElement,
          controller
        );
        backButton = createButton(document, 'close-export', 'Zurück zum Training');
        backButton.addEventListener('click', closeExport);
        options.exportHost.appendChild(exportUi.rootElement);
        options.exportHost.appendChild(backButton);
      } catch {
        try {
          backButton?.removeEventListener('click', closeExport);
          backButton?.remove();
          shell?.destroy?.();
        } catch {
          // Failed export-shell cleanup is best effort.
        }
        if (!shell) {
          try {
            controller?.destroy?.();
          } catch {
            // Export controller owns only a temporary object URL.
          }
        }
        clearHost(options.exportHost);
        fail('EXPORT_COMPOSITION_FAILED');
      }
      exportRootElement = exportUi.rootElement;
      exportController = controller;
      exportShellController = shell;
      exportBackButton = backButton;
    }

    function openExport() {
      requireAuthenticated();
      return runLifecycle(async () => {
        requireAuthenticated();
        await ensureRecovery();
        ensureExport();
        reconcileProductState('export');
        exportRootElement.querySelector?.('[name="range-preset"]')?.focus?.();
        return stateSnapshot;
      });
    }

    function closeExport() {
      if (destroyed || stateSnapshot.active_surface !== 'export') return false;
      reconcileProductState('entry');
      ui.exportButton.focus();
      return true;
    }

    async function settleClosedSession() {
      const commit = currentCommitState();
      const recovery = currentRecoveryState();
      if (commit?.state === 'committed' || recovery?.state === 'destroyed') {
        await replaceFinishedRecovery();
        ui.start.focus();
        return;
      }
      reconcileProductState('entry');
      if (!ui.resume.hidden) ui.resume.focus();
    }

    function requestClose(source = 'api') {
      requireAuthenticated();
      return runLifecycle(async () => {
        requireAuthenticated();
        if (stateSnapshot.active_surface === 'history') return closeHistory();
        if (stateSnapshot.active_surface === 'export') return closeExport();
        if (!sessionShellController) return true;
        const closed = await sessionShellController.requestClose(source);
        if (closed !== true) return false;
        await settleClosedSession();
        return true;
      });
    }

    function scheduleSurfaceReconcile() {
      if (destroyed || surfaceReconcileTimer !== null) return;
      const schedule = typeof root.setTimeout === 'function'
        ? root.setTimeout.bind(root)
        : (callback) => Promise.resolve().then(callback);
      surfaceReconcileTimer = schedule(() => {
        surfaceReconcileTimer = null;
        if (
          destroyed ||
          !sessionShellController ||
          sessionShellController.isOpen() ||
          stateSnapshot.active_surface !== 'session'
        ) {
          return;
        }
        runLifecycle(settleClosedSession).catch(() => {
          if (!destroyed) publishBlocked('session_close_failed');
        });
      }, 0);
    }

    function handleSurfaceInteraction(event) {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      scheduleSurfaceReconcile();
    }

    function waitForCommitSettlement() {
      const commit = currentCommitState();
      if (!commit || !['preparing', 'committing'].includes(commit.state)) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        let unsubscribe = null;
        let settled = false;
        const listener = (state) => {
          if (['preparing', 'committing'].includes(state.state)) return;
          settled = true;
          try {
            unsubscribe?.();
          } catch {
            // Settlement observation is already complete.
          }
          resolve();
        };
        unsubscribe = sessionCommitController.subscribe(listener);
        if (settled) unsubscribe?.();
      });
    }

    function clearHost(host) {
      if (typeof host.replaceChildren === 'function') {
        host.replaceChildren();
        return;
      }
      while (host.firstChild) host.removeChild(host.firstChild);
    }

    function teardownSecondarySurfaces() {
      try {
        historyBackButton?.removeEventListener('click', closeHistory);
        historyShellController?.destroy();
      } catch {
        // Secondary read surfaces own no recovery data.
      }
      try {
        historyController?.destroy();
      } catch {
        // History controller owns no recovery data.
      }
      historyBackButton = null;
      historyShellController = null;
      historyController = null;
      clearHost(options.historyHost);
      try {
        exportBackButton?.removeEventListener('click', closeExport);
        exportShellController?.destroy();
      } catch {
        // Export teardown revokes only its temporary object URL.
      }
      try {
        exportController?.destroy?.();
      } catch {
        // Export controller owns only a temporary object URL.
      }
      exportBackButton = null;
      exportShellController = null;
      exportController = null;
      exportRootElement = null;
      clearHost(options.exportHost);
    }

    async function flushRecoveryBeforeTeardown() {
      if (!recoveryController) return true;
      const recovery = currentRecoveryState();
      if (recovery?.state === 'destroyed') return true;
      try {
        await recoveryController.flush();
        return true;
      } catch {
        return false;
      }
    }

    async function shutdownComposition() {
      await waitForCommitSettlement();
      if (!(await flushRecoveryBeforeTeardown())) {
        publishBlocked('recovery_flush_failed');
        return false;
      }
      teardownSecondarySurfaces();
      teardownSessionGraph();
      resetRecovery();
      return true;
    }

    function setAuthenticated(nextAuthenticated) {
      assertUsable();
      if (typeof nextAuthenticated !== 'boolean') fail('INVALID_AUTH_STATE');
      authenticated = nextAuthenticated;
      return runLifecycle(async () => {
        if (destroyed) fail('CONTROLLER_DESTROYED');
        if (!authenticated) {
          const closed = await shutdownComposition();
          if (closed) publishBlocked('auth_required');
          return stateSnapshot;
        }
        if (destroyRequested) fail('CONTROLLER_DESTROYED');
        await ensureRecovery();
        reconcileProductState('entry');
        if (stateSnapshot.state === 'idle') ui.start.focus();
        else if (stateSnapshot.state === 'recoverable') ui.resume.focus();
        return stateSnapshot;
      });
    }

    function handleClick(event) {
      const button = event.target?.closest?.('[data-action]');
      if (!button || !ui.rootElement.contains(button) || button.disabled) return;
      const actions = {
        'start-session': startSession,
        'continue-session': continueSession,
        'discard-recovery': discardRecoveredSession,
        'open-history': openHistory,
        'open-export': openExport
      };
      Promise.resolve()
        .then(() => actions[button.dataset.action]?.())
        .catch(() => {
          if (!destroyed && authenticated) publishBlocked('operation_failed');
        });
    }

    function destroy() {
      if (destroyed) return Promise.resolve(true);
      if (destroyRequested) return lifecycleTail.then(() => destroyed);
      destroyRequested = true;
      authenticated = false;
      return runLifecycle(async () => {
        const closed = await shutdownComposition();
        if (!closed) {
          destroyRequested = false;
          return false;
        }
        destroyed = true;
        ui.rootElement.removeEventListener('click', handleClick);
        options.sessionHost.removeEventListener('click', handleSurfaceInteraction, true);
        document.removeEventListener('keydown', handleSurfaceInteraction, true);
        if (surfaceReconcileTimer !== null && typeof root.clearTimeout === 'function') {
          root.clearTimeout(surfaceReconcileTimer);
        }
        surfaceReconcileTimer = null;
        ui.rootElement.remove();
        options.historyHost.hidden = true;
        options.exportHost.hidden = true;
        mountedHosts.delete(options.host);
        mountedDocuments.delete(document);
        stateSnapshot = createState(
          'destroyed',
          null,
          false,
          'destroyed',
          'destroyed',
          null
        );
        subscribers.clear();
        return true;
      });
    }

    const controller = deepFreeze({
      getState,
      subscribe,
      startSession,
      continueSession,
      discardRecoveredSession,
      openHistory,
      openExport,
      requestClose,
      setAuthenticated,
      destroy
    });
    if (!hasExactDataKeys(controller, CONTROLLER_KEYS)) fail('INVALID_STATE');

    mountedHosts.add(options.host);
    mountedDocuments.add(document);
    try {
      ui.rootElement.addEventListener('click', handleClick);
      options.sessionHost.addEventListener('click', handleSurfaceInteraction, true);
      document.addEventListener('keydown', handleSurfaceInteraction, true);
      options.host.appendChild(ui.rootElement);
      render();
    } catch {
      try {
        ui.rootElement.removeEventListener('click', handleClick);
        options.sessionHost.removeEventListener('click', handleSurfaceInteraction, true);
        document.removeEventListener('keydown', handleSurfaceInteraction, true);
      } catch {
        // Failed mount leaves no product listener behind.
      }
      mountedHosts.delete(options.host);
      mountedDocuments.delete(document);
      try {
        ui.rootElement.remove();
      } catch {
        // No product listener or host reservation survives a failed mount.
      }
      fail('INVALID_HOST');
    }
    return controller;
  }

  if (root.AppModules === undefined) root.AppModules = {};
  if (!isRecord(root.AppModules)) throw new TypeError('AppModules must be an object');
  if (root.AppModules.activityV2 === undefined) root.AppModules.activityV2 = {};
  if (!isRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('productController' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.productController is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }
  Object.defineProperty(root.AppModules.activityV2, 'productController', {
    value: deepFreeze({ mount }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);

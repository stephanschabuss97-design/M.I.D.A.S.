'use strict';

(function initActivityV2SessionShell(root) {
  const DRAFT_SCHEMA_VERSION = 'midas.activity-session-draft.v1';
  const NOTE_LIMIT = 500;
  const ITEM_LIMIT = 50;
  const ITEM_KEY_RE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const MOUNT_OPTION_KEYS = Object.freeze([
    'clearIntervalFn',
    'confirmDiscard',
    'draft',
    'host',
    'semantics',
    'setIntervalFn'
  ]);
  const OPEN_OPTION_KEYS = Object.freeze(['opener']);
  const DRAFT_METHODS = Object.freeze([
    'getSnapshot',
    'getTimerSnapshot',
    'addItem',
    'removeItem',
    'moveItem',
    'setNote',
    'discard'
  ]);
  const SNAPSHOT_KEYS = Object.freeze([
    'catalog_version',
    'draft_schema_version',
    'items',
    'note',
    'request_id',
    'revision',
    'started_at'
  ]);
  const TIMER_KEYS = Object.freeze(['elapsed_ms', 'label', 'running']);
  const CLOSE_SOURCES = Object.freeze(['api', 'close_button', 'escape']);
  const DISCARD_MESSAGE =
    'Session verwerfen? Deine bisherigen Änderungen gehen verloren.';
  const SAFE_MESSAGE = 'The activity session shell operation could not be completed.';
  const mountedHosts = new WeakMap();
  const activeDocuments = new WeakMap();
  let shellSequence = 0;

  class ActivityV2SessionShellError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionShellError';
      this.code = code;
    }
  }

  const hasOwn = (value, key) =>
    Object.prototype.hasOwnProperty.call(value, key);

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function fail(code) {
    throw new ActivityV2SessionShellError(code);
  }

  function deepFreeze(value, seen = new WeakSet()) {
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function') ||
      seen.has(value)
    ) {
      return value;
    }
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => deepFreeze(value[key], seen));
    return Object.freeze(value);
  }

  function hasExactKeys(value, expected) {
    if (!isRecord(value)) return false;
    const keys = Reflect.ownKeys(value);
    return (
      keys.length === expected.length &&
      keys.every((key) => typeof key === 'string' && expected.includes(key))
    );
  }

  function assertMountOptions(value) {
    if (!isRecord(value)) fail('INVALID_OPTIONS');
    if (Reflect.ownKeys(value).some((key) => !MOUNT_OPTION_KEYS.includes(key))) {
      fail('INVALID_OPTIONS');
    }
    if (!hasOwn(value, 'host') || !hasOwn(value, 'draft')) {
      fail('INVALID_OPTIONS');
    }
    return value;
  }

  function assertOpenOptions(value) {
    if (value === undefined) return {};
    if (!isRecord(value)) fail('INVALID_OPTIONS');
    if (Reflect.ownKeys(value).some((key) => !OPEN_OPTION_KEYS.includes(key))) {
      fail('INVALID_OPTIONS');
    }
    if (
      hasOwn(value, 'opener') &&
      value.opener !== null &&
      (typeof value.opener !== 'object' || typeof value.opener.focus !== 'function')
    ) {
      fail('INVALID_OPTIONS');
    }
    return value;
  }

  function assertHost(host) {
    const document = host?.ownerDocument;
    if (
      !host ||
      host.nodeType !== 1 ||
      typeof host.appendChild !== 'function' ||
      !document ||
      typeof document.createElement !== 'function' ||
      typeof document.createDocumentFragment !== 'function' ||
      typeof document.addEventListener !== 'function' ||
      typeof document.removeEventListener !== 'function'
    ) {
      fail('INVALID_HOST');
    }
    return document;
  }

  function assertDraft(draft) {
    if (
      !isRecord(draft) ||
      DRAFT_METHODS.some((method) => typeof draft[method] !== 'function')
    ) {
      fail('INVALID_DRAFT_API');
    }
    return draft;
  }

  function resolveSemantics(options) {
    const fallback = root.AppModules?.activityV2?.semantics;
    const semantics =
      !hasOwn(options, 'semantics') || options.semantics === undefined
        ? fallback
        : options.semantics;
    if (
      !isRecord(semantics) ||
      typeof semantics.getCatalog !== 'function' ||
      typeof semantics.getEntryByKey !== 'function'
    ) {
      fail('SEMANTICS_MISSING');
    }
    return semantics;
  }

  function resolveConfirmation(options) {
    const usesDefault =
      !hasOwn(options, 'confirmDiscard') || options.confirmDiscard === undefined;
    const confirmation = usesDefault ? root.confirm : options.confirmDiscard;
    if (typeof confirmation !== 'function') fail('INVALID_CONFIRMATION');
    return usesDefault
      ? (context) => confirmation.call(root, context.message)
      : confirmation;
  }

  function resolveScheduler(options) {
    const hasSet = hasOwn(options, 'setIntervalFn') && options.setIntervalFn !== undefined;
    const hasClear =
      hasOwn(options, 'clearIntervalFn') && options.clearIntervalFn !== undefined;
    if (hasSet !== hasClear) fail('INVALID_SCHEDULER');
    const rawSetInterval = hasSet ? options.setIntervalFn : root.setInterval;
    const rawClearInterval = hasClear ? options.clearIntervalFn : root.clearInterval;
    if (
      typeof rawSetInterval !== 'function' ||
      typeof rawClearInterval !== 'function'
    ) {
      fail('INVALID_SCHEDULER');
    }
    const setIntervalFn = hasSet
      ? rawSetInterval
      : (callback, delay) => rawSetInterval.call(root, callback, delay);
    const clearIntervalFn = hasClear
      ? rawClearInterval
      : (id) => rawClearInterval.call(root, id);
    return Object.freeze({ setIntervalFn, clearIntervalFn });
  }

  function captureCatalog(semantics) {
    let catalog;
    try {
      catalog = semantics.getCatalog();
    } catch {
      fail('INVALID_DRAFT_STATE');
    }
    if (
      !isRecord(catalog) ||
      !Number.isSafeInteger(catalog.catalog_version) ||
      catalog.catalog_version < 1 ||
      !Array.isArray(catalog.entries)
    ) {
      fail('INVALID_DRAFT_STATE');
    }

    const entries = [];
    const byKey = new Map();
    for (const entry of catalog.entries) {
      if (
        !isRecord(entry) ||
        typeof entry.key !== 'string' ||
        !ITEM_KEY_RE.test(entry.key) ||
        typeof entry.label !== 'string' ||
        entry.label.trim() === '' ||
        (entry.status !== 'active' && entry.status !== 'deprecated') ||
        byKey.has(entry.key)
      ) {
        fail('INVALID_DRAFT_STATE');
      }
      byKey.set(entry.key, entry);
      if (entry.status === 'active') entries.push(entry);
    }
    return {
      catalogVersion: catalog.catalog_version,
      entries,
      byKey
    };
  }

  function assertFrozenTree(value, seen = new WeakSet()) {
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function') ||
      seen.has(value)
    ) {
      return;
    }
    if (!Object.isFrozen(value)) fail('INVALID_DRAFT_STATE');
    seen.add(value);
    Reflect.ownKeys(value).forEach((key) => assertFrozenTree(value[key], seen));
  }

  function isCanonicalTimestamp(value) {
    if (typeof value !== 'string') return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString() === value;
  }

  function formatElapsed(elapsedMs) {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    const twoDigits = (value) => String(value).padStart(2, '0');
    return hours > 0
      ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`
      : `${twoDigits(totalMinutes)}:${twoDigits(seconds)}`;
  }

  function validateSnapshot(snapshot, catalogState) {
    if (!hasExactKeys(snapshot, SNAPSHOT_KEYS)) fail('INVALID_DRAFT_STATE');
    assertFrozenTree(snapshot);
    if (
      snapshot.draft_schema_version !== DRAFT_SCHEMA_VERSION ||
      typeof snapshot.request_id !== 'string' ||
      !UUID_RE.test(snapshot.request_id) ||
      !Number.isSafeInteger(snapshot.catalog_version) ||
      snapshot.catalog_version < 1 ||
      !Number.isSafeInteger(snapshot.revision) ||
      snapshot.revision < 0 ||
      (snapshot.started_at !== null && !isCanonicalTimestamp(snapshot.started_at)) ||
      (snapshot.note !== null &&
        (typeof snapshot.note !== 'string' ||
          snapshot.note.trim() !== snapshot.note ||
          Array.from(snapshot.note).length > NOTE_LIMIT)) ||
      !Array.isArray(snapshot.items) ||
      snapshot.items.length > ITEM_LIMIT
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    if (snapshot.catalog_version !== catalogState.catalogVersion) {
      fail('CATALOG_VERSION_MISMATCH');
    }
    if (
      snapshot.revision === 0 &&
      (snapshot.started_at !== null || snapshot.note !== null || snapshot.items.length > 0)
    ) {
      fail('INVALID_DRAFT_STATE');
    }

    const seenKeys = new Set();
    snapshot.items.forEach((item, index) => {
      if (
        !hasExactKeys(item, ['item_key', 'item_order']) ||
        !Object.isFrozen(item) ||
        typeof item.item_key !== 'string' ||
        !ITEM_KEY_RE.test(item.item_key) ||
        item.item_order !== index + 1 ||
        seenKeys.has(item.item_key)
      ) {
        fail('INVALID_DRAFT_STATE');
      }
      const catalogEntry = catalogState.byKey.get(item.item_key);
      if (!catalogEntry || catalogEntry.status !== 'active') {
        fail('INVALID_DRAFT_STATE');
      }
      seenKeys.add(item.item_key);
    });
    return snapshot;
  }

  function validateTimer(timer, snapshot) {
    if (!hasExactKeys(timer, TIMER_KEYS)) fail('INVALID_DRAFT_STATE');
    assertFrozenTree(timer);
    if (
      typeof timer.running !== 'boolean' ||
      !Number.isFinite(timer.elapsed_ms) ||
      !Number.isSafeInteger(timer.elapsed_ms) ||
      timer.elapsed_ms < 0 ||
      typeof timer.label !== 'string' ||
      timer.label !== formatElapsed(timer.elapsed_ms) ||
      timer.running !== (snapshot.started_at !== null)
    ) {
      fail('INVALID_DRAFT_STATE');
    }
    if (!timer.running && (timer.elapsed_ms !== 0 || timer.label !== '00:00')) {
      fail('INVALID_DRAFT_STATE');
    }
    return timer;
  }

  function readState(draft, semantics) {
    const catalogState = captureCatalog(semantics);
    let snapshot;
    let timer;
    try {
      snapshot = draft.getSnapshot();
      timer = draft.getTimerSnapshot();
    } catch {
      fail('INVALID_DRAFT_STATE');
    }
    validateSnapshot(snapshot, catalogState);
    validateTimer(timer, snapshot);
    return { catalogState, snapshot, timer };
  }

  function makeElement(document, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setButton(button, action, label, accessibleName) {
    button.type = 'button';
    button.dataset.action = action;
    button.textContent = label;
    button.setAttribute('aria-label', accessibleName);
    return button;
  }

  function createStructure(document) {
    shellSequence += 1;
    const titleId = `activity-v2-session-title-${shellSequence}`;
    const pickerId = `activity-v2-session-picker-${shellSequence}`;
    const noteId = `activity-v2-session-note-${shellSequence}`;

    const panel = makeElement(document, 'section', 'activity-v2-session-shell');
    panel.hidden = true;
    panel.setAttribute('inert', '');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', titleId);

    const header = makeElement(document, 'header', 'activity-v2-session-header');
    const headingGroup = makeElement(
      document,
      'div',
      'activity-v2-session-heading-group'
    );
    const eyebrow = makeElement(
      document,
      'span',
      'activity-v2-session-eyebrow',
      'ACTIVITY V2'
    );
    const title = makeElement(
      document,
      'h1',
      'activity-v2-session-title',
      'Training erfassen'
    );
    title.id = titleId;
    headingGroup.append(eyebrow, title);

    const headerActions = makeElement(
      document,
      'div',
      'activity-v2-session-header-actions'
    );
    const timer = makeElement(
      document,
      'output',
      'activity-v2-session-timer',
      '00:00'
    );
    timer.setAttribute('aria-label', 'Sessiondauer');
    const close = setButton(
      makeElement(document, 'button', 'activity-v2-session-close'),
      'close',
      'Schließen',
      'Session schließen'
    );
    headerActions.append(timer, close);
    header.append(headingGroup, headerActions);

    const content = makeElement(document, 'div', 'activity-v2-session-content');
    const intro = makeElement(document, 'div', 'activity-v2-session-intro');
    intro.append(
      makeElement(
        document,
        'p',
        'activity-v2-session-kicker',
        'DEINE SESSION'
      ),
      makeElement(
        document,
        'p',
        'activity-v2-session-lead',
        'Baue dein Training Schritt für Schritt auf. Gespeichert wird hier noch nichts.'
      )
    );

    const pickerCard = makeElement(
      document,
      'section',
      'activity-v2-session-card activity-v2-session-picker-card'
    );
    const pickerHeading = makeElement(
      document,
      'h2',
      'activity-v2-session-section-title',
      'Übung oder Aktivität'
    );
    const pickerControls = makeElement(
      document,
      'div',
      'activity-v2-session-picker-controls'
    );
    const pickerField = makeElement(
      document,
      'div',
      'activity-v2-session-field'
    );
    const pickerLabel = makeElement(document, 'label', '', 'Aus Katalog auswählen');
    pickerLabel.htmlFor = pickerId;
    const picker = makeElement(document, 'select', 'activity-v2-session-select');
    picker.id = pickerId;
    pickerField.append(pickerLabel, picker);
    const add = setButton(
      makeElement(document, 'button', 'activity-v2-session-primary'),
      'add',
      'Hinzufügen',
      'Ausgewählte Übung oder Aktivität hinzufügen'
    );
    pickerControls.append(pickerField, add);
    pickerCard.append(pickerHeading, pickerControls);

    const itemsSection = makeElement(
      document,
      'section',
      'activity-v2-session-items-section'
    );
    const itemsHeading = makeElement(
      document,
      'div',
      'activity-v2-session-section-heading'
    );
    itemsHeading.append(
      makeElement(
        document,
        'h2',
        'activity-v2-session-section-title',
        'Sessionablauf'
      )
    );
    const itemCount = makeElement(
      document,
      'span',
      'activity-v2-session-count',
      '0 Einträge'
    );
    itemsHeading.append(itemCount);
    const empty = makeElement(
      document,
      'p',
      'activity-v2-session-empty',
      'Noch keine Übung oder Aktivität hinzugefügt.'
    );
    const itemList = makeElement(document, 'ol', 'activity-v2-session-items');
    itemsSection.append(itemsHeading, empty, itemList);

    const noteCard = makeElement(
      document,
      'section',
      'activity-v2-session-card activity-v2-session-note-card'
    );
    const noteLabel = makeElement(
      document,
      'label',
      'activity-v2-session-section-title',
      'Sessionnotiz (optional)'
    );
    noteLabel.htmlFor = noteId;
    const noteHint = makeElement(
      document,
      'p',
      'activity-v2-session-hint',
      'Was möchtest du dir für diese Session merken?'
    );
    const note = makeElement(document, 'textarea', 'activity-v2-session-note');
    note.id = noteId;
    note.rows = 4;
    note.maxLength = NOTE_LIMIT;
    note.placeholder = 'Zum Beispiel: Fokus, Energie oder Technik …';
    noteCard.append(noteLabel, noteHint, note);

    const status = makeElement(document, 'div', 'activity-v2-session-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    content.append(intro, pickerCard, itemsSection, noteCard, status);
    panel.append(header, content);
    return {
      panel,
      timer,
      close,
      picker,
      add,
      empty,
      itemList,
      itemCount,
      note,
      status
    };
  }

  function mount(optionsValue) {
    const options = assertMountOptions(optionsValue);
    const document = assertHost(options.host);
    const draft = assertDraft(options.draft);
    const semantics = resolveSemantics(options);
    const confirmDiscard = resolveConfirmation(options);
    const scheduler = resolveScheduler(options);
    if (mountedHosts.has(options.host)) fail('SHELL_ALREADY_MOUNTED');

    const ui = createStructure(document);
    let openState = false;
    let destroyed = false;
    let listenersBound = false;
    let opener = null;
    let inertRecords = [];
    let previousBodyOverflow = null;
    let currentState = null;
    let itemActionRefs = new Map();
    let intervalActive = false;
    let intervalId;
    let closeGuardPromise = null;
    let closeGuardGeneration = 0;
    let controller;

    function setStatus(message, tone = '') {
      ui.status.textContent = message;
      if (tone) ui.status.dataset.tone = tone;
      else delete ui.status.dataset.tone;
    }

    function assertUsable() {
      if (destroyed) fail('SHELL_DESTROYED');
    }

    function render() {
      assertUsable();
      const nextState = readState(draft, semantics);
      const included = new Set(
        nextState.snapshot.items.map((item) => item.item_key)
      );
      const optionFragment = document.createDocumentFragment();
      let firstAvailable = null;
      nextState.catalogState.entries.forEach((entry) => {
        const option = makeElement(document, 'option', '', entry.label);
        option.value = entry.key;
        option.disabled = included.has(entry.key);
        if (!option.disabled && firstAvailable === null) firstAvailable = entry.key;
        optionFragment.appendChild(option);
      });

      const listFragment = document.createDocumentFragment();
      const nextActionRefs = new Map();
      nextState.snapshot.items.forEach((item, index) => {
        const entry = nextState.catalogState.byKey.get(item.item_key);
        const row = makeElement(document, 'li', 'activity-v2-session-item');
        row.dataset.itemKey = item.item_key;
        const identity = makeElement(
          document,
          'div',
          'activity-v2-session-item-identity'
        );
        identity.append(
          makeElement(
            document,
            'span',
            'activity-v2-session-item-order',
            String(item.item_order).padStart(2, '0')
          ),
          makeElement(
            document,
            'span',
            'activity-v2-session-item-label',
            entry.label
          )
        );
        const actions = makeElement(
          document,
          'div',
          'activity-v2-session-item-actions'
        );
        const up = setButton(
          makeElement(document, 'button', 'activity-v2-session-secondary'),
          'move-up',
          'Nach oben',
          `${entry.label} nach oben verschieben`
        );
        const down = setButton(
          makeElement(document, 'button', 'activity-v2-session-secondary'),
          'move-down',
          'Nach unten',
          `${entry.label} nach unten verschieben`
        );
        const remove = setButton(
          makeElement(document, 'button', 'activity-v2-session-danger'),
          'remove',
          'Entfernen',
          `${entry.label} entfernen`
        );
        up.disabled = index === 0;
        down.disabled = index === nextState.snapshot.items.length - 1;
        up.dataset.itemKey = item.item_key;
        down.dataset.itemKey = item.item_key;
        remove.dataset.itemKey = item.item_key;
        actions.append(up, down, remove);
        row.append(identity, actions);
        listFragment.appendChild(row);
        nextActionRefs.set(item.item_key, { row, up, down, remove });
      });

      ui.picker.replaceChildren(optionFragment);
      if (firstAvailable === null) {
        ui.picker.selectedIndex = -1;
        ui.picker.value = '';
      } else {
        ui.picker.value = firstAvailable;
      }
      ui.picker.disabled = firstAvailable === null;
      ui.add.disabled = firstAvailable === null;
      ui.itemList.replaceChildren(listFragment);
      ui.empty.hidden = nextState.snapshot.items.length > 0;
      ui.itemList.hidden = nextState.snapshot.items.length === 0;
      ui.itemCount.textContent = `${nextState.snapshot.items.length} ${
        nextState.snapshot.items.length === 1 ? 'Eintrag' : 'Einträge'
      }`;
      ui.note.value = nextState.snapshot.note || '';
      ui.timer.textContent = nextState.timer.label;
      currentState = nextState;
      itemActionRefs = nextActionRefs;
      syncTimerScheduler();
      setStatus('');
      return nextState.snapshot;
    }

    function refreshTimer() {
      const nextState = readState(draft, semantics);
      ui.timer.textContent = nextState.timer.label;
      currentState = nextState;
      return nextState.timer;
    }

    function refreshTimerSafely() {
      try {
        refreshTimer();
      } catch {
        setStatus('Die Sessiondauer konnte nicht aktualisiert werden.', 'error');
      }
    }

    function stopTimerScheduler() {
      if (!intervalActive) return;
      const id = intervalId;
      intervalActive = false;
      intervalId = undefined;
      try {
        scheduler.clearIntervalFn(id);
      } catch {
        // Cleanup remains idempotent even if an injected scheduler misbehaves.
      }
    }

    function startTimerScheduler() {
      if (intervalActive) return;
      try {
        intervalId = scheduler.setIntervalFn(refreshTimerSafely, 1000);
        intervalActive = true;
      } catch {
        fail('INVALID_SCHEDULER');
      }
    }

    function syncTimerScheduler() {
      if (openState && currentState?.timer.running) startTimerScheduler();
      else stopTimerScheduler();
    }

    function focusElement(element) {
      if (!element || element.disabled || typeof element.focus !== 'function') {
        return false;
      }
      element.focus();
      return true;
    }

    function focusPicker() {
      return focusElement(ui.picker) || focusElement(ui.close);
    }

    function focusItemAction(itemKey, preferredAction) {
      const refs = itemActionRefs.get(itemKey);
      if (!refs) return focusPicker();
      const preferred =
        preferredAction === 'move-up'
          ? refs.up
          : preferredAction === 'move-down'
            ? refs.down
            : refs.remove;
      if (focusElement(preferred)) return true;
      return [refs.up, refs.down, refs.remove].some(focusElement) || focusPicker();
    }

    function getFocusableElements() {
      return Array.from(ui.panel.querySelectorAll('button, select, textarea')).filter(
        (element) => !element.disabled && !element.hidden
      );
    }

    function restoreOpener(target = opener) {
      if (
        target &&
        target.isConnected !== false &&
        typeof target.focus === 'function'
      ) {
        try {
          target.focus();
        } catch {
          // A detached or disabled opener is intentionally ignored.
        }
      }
    }

    function lockBackground() {
      inertRecords = Array.from(options.host.children)
        .filter((child) => child !== ui.panel)
        .map((child) => ({ child, wasInert: child.hasAttribute('inert') }));
      inertRecords.forEach(({ child }) => child.setAttribute('inert', ''));
      if (document.body?.style) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
    }

    function unlockBackground() {
      inertRecords.forEach(({ child, wasInert }) => {
        if (!wasInert) child.removeAttribute('inert');
      });
      inertRecords = [];
      if (previousBodyOverflow !== null && document.body?.style) {
        document.body.style.overflow = previousBodyOverflow;
        previousBodyOverflow = null;
      }
    }

    function handleKeydown(event) {
      if (!openState) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        controller.requestClose('escape');
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !ui.panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !ui.panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleVisibilityChange() {
      if (openState && document.visibilityState === 'visible') {
        refreshTimerSafely();
      }
    }

    function runDraftAction(action, successMessage, focusAfter, focusOnFailure) {
      const previousFocus = document.activeElement;
      try {
        action();
        render();
        setStatus(successMessage, 'success');
        focusAfter();
      } catch {
        setStatus('Die Aktion konnte nicht ausgeführt werden.', 'error');
        restoreOpener(focusOnFailure || previousFocus);
      }
    }

    function handleClick(event) {
      const target = event.target;
      const action = target?.dataset?.action;
      if (!action || target.disabled) return;
      if (action === 'close') {
        controller.requestClose('close_button');
        return;
      }
      if (action === 'add') {
        const itemKey = ui.picker.value;
        runDraftAction(
          () => draft.addItem(itemKey),
          'Eintrag hinzugefügt.',
          focusPicker,
          ui.picker
        );
        return;
      }
      const itemKey = target.dataset.itemKey;
      if (action === 'move-up' || action === 'move-down') {
        const item = currentState?.snapshot.items.find(
          (candidate) => candidate.item_key === itemKey
        );
        if (!item) return;
        const delta = action === 'move-up' ? -1 : 1;
        runDraftAction(
          () => draft.moveItem(itemKey, item.item_order + delta),
          'Reihenfolge aktualisiert.',
          () => focusItemAction(itemKey, action),
          target
        );
        return;
      }
      if (action === 'remove') {
        const items = currentState?.snapshot.items || [];
        const index = items.findIndex((item) => item.item_key === itemKey);
        const nextKey =
          index === -1
            ? null
            : items[index + 1]?.item_key || items[index - 1]?.item_key || null;
        runDraftAction(
          () => draft.removeItem(itemKey),
          'Eintrag entfernt.',
          () => (nextKey ? focusItemAction(nextKey, 'remove') : focusPicker()),
          target
        );
      }
    }

    function handleInput(event) {
      if (event.target !== ui.note) return;
      try {
        draft.setNote(ui.note.value);
        const nextState = readState(draft, semantics);
        currentState = nextState;
        setStatus('');
      } catch {
        setStatus('Die Sessionnotiz konnte nicht aktualisiert werden.', 'error');
      }
    }

    function bindListeners() {
      if (listenersBound) return;
      ui.panel.addEventListener('click', handleClick);
      ui.panel.addEventListener('input', handleInput);
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      listenersBound = true;
    }

    function unbindListeners() {
      if (!listenersBound) return;
      ui.panel.removeEventListener('click', handleClick);
      ui.panel.removeEventListener('input', handleInput);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      listenersBound = false;
    }

    function closeTechnical() {
      if (!openState) return true;
      stopTimerScheduler();
      unbindListeners();
      unlockBackground();
      ui.panel.hidden = true;
      ui.panel.setAttribute('aria-hidden', 'true');
      ui.panel.setAttribute('inert', '');
      openState = false;
      if (activeDocuments.get(document) === controller) {
        activeDocuments.delete(document);
      }
      restoreOpener();
      return true;
    }

    function open(optionsValue) {
      assertUsable();
      const openOptions = assertOpenOptions(optionsValue);
      if (openState) return controller;
      const activeShell = activeDocuments.get(document);
      if (activeShell && activeShell !== controller) fail('SHELL_ALREADY_OPEN');

      const nextOpener = hasOwn(openOptions, 'opener')
        ? openOptions.opener
        : document.activeElement;
      render();
      opener = nextOpener;
      try {
        lockBackground();
        ui.panel.hidden = false;
        ui.panel.removeAttribute('inert');
        ui.panel.setAttribute('aria-hidden', 'false');
        bindListeners();
        openState = true;
        activeDocuments.set(document, controller);
        syncTimerScheduler();
        focusPicker();
      } catch (error) {
        stopTimerScheduler();
        unbindListeners();
        unlockBackground();
        ui.panel.hidden = true;
        ui.panel.setAttribute('aria-hidden', 'true');
        ui.panel.setAttribute('inert', '');
        openState = false;
        if (activeDocuments.get(document) === controller) {
          activeDocuments.delete(document);
        }
        if (error instanceof ActivityV2SessionShellError) throw error;
        fail('INVALID_HOST');
      }
      return controller;
    }

    function requestClose(source = 'api') {
      assertUsable();
      if (!CLOSE_SOURCES.includes(source)) fail('INVALID_OPTIONS');
      if (!openState) return Promise.resolve(true);
      if (closeGuardPromise) return closeGuardPromise;
      const state = readState(draft, semantics);
      if (state.snapshot.revision === 0) {
        return Promise.resolve(closeTechnical());
      }

      const previousFocus = document.activeElement;
      const generation = closeGuardGeneration;
      const context = deepFreeze({
        message: DISCARD_MESSAGE,
        source,
        snapshot: state.snapshot
      });
      const guard = Promise.resolve()
        .then(() => confirmDiscard(context))
        .then((confirmed) => {
          if (
            destroyed ||
            generation !== closeGuardGeneration ||
            !openState
          ) {
            return false;
          }
          if (confirmed !== true) {
            setStatus('Session wurde nicht verworfen.', 'notice');
            restoreOpener(previousFocus);
            return false;
          }
          try {
            draft.discard();
          } catch {
            setStatus('Die Session konnte nicht verworfen werden.', 'error');
            restoreOpener(previousFocus);
            return false;
          }
          return closeTechnical();
        })
        .catch(() => {
          if (
            !destroyed &&
            generation === closeGuardGeneration &&
            openState
          ) {
            setStatus('Die Session konnte nicht verworfen werden.', 'error');
            restoreOpener(previousFocus);
          }
          return false;
        })
        .finally(() => {
          if (closeGuardPromise === guard) closeGuardPromise = null;
        });
      closeGuardPromise = guard;
      return guard;
    }

    function isOpen() {
      return openState;
    }

    function destroy() {
      if (destroyed) return;
      closeGuardGeneration += 1;
      closeTechnical();
      stopTimerScheduler();
      unbindListeners();
      unlockBackground();
      if (typeof ui.panel.remove === 'function') ui.panel.remove();
      else ui.panel.parentNode?.removeChild(ui.panel);
      mountedHosts.delete(options.host);
      destroyed = true;
      currentState = null;
      itemActionRefs = new Map();
    }

    controller = deepFreeze({
      open,
      render,
      requestClose,
      isOpen,
      destroy
    });

    try {
      render();
      options.host.appendChild(ui.panel);
      mountedHosts.set(options.host, controller);
    } catch (error) {
      if (ui.panel.parentNode) ui.panel.remove();
      if (error instanceof ActivityV2SessionShellError) throw error;
      fail('INVALID_HOST');
    }

    return controller;
  }

  if (root.AppModules === undefined) {
    root.AppModules = {};
  } else if (!isRecord(root.AppModules)) {
    throw new TypeError('AppModules must be an object');
  }
  if (root.AppModules.activityV2 === undefined) {
    root.AppModules.activityV2 = {};
  } else if (!isRecord(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be an object');
  }
  if ('sessionShell' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionShell is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  const sessionShellApi = deepFreeze({ mount });
  Object.defineProperty(root.AppModules.activityV2, 'sessionShell', {
    value: sessionShellApi,
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);

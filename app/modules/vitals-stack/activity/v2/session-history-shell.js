'use strict';

(function initActivityV2SessionHistoryShell(root) {
  const SAFE_MESSAGE =
    'The activity session history shell could not be completed.';
  const FIELD_LABELS = Object.freeze({
    duration_min: 'Dauer (Min.)',
    distance_km: 'Distanz (km)',
    note: 'Notiz',
    reps: 'Wiederholungen',
    duration_sec: 'Dauer (Sek.)',
    distance_m: 'Distanz (m)',
    weight_kg: 'Gewicht (kg)',
    assistance_kg: 'Unterstützung (kg)'
  });
  const CONTROLLER_METHODS = Object.freeze([
    'getState',
    'subscribe',
    'refreshHistory',
    'loadMore',
    'openDetail',
    'closeDetail',
    'openCorrection',
    'setCorrectionDurationMin',
    'setCorrectionNote',
    'addCorrectionItem',
    'removeCorrectionItem',
    'moveCorrectionItem',
    'setCorrectionItemField',
    'addCorrectionSet',
    'removeCorrectionSet',
    'setCorrectionSetField',
    'requestCloseCorrection',
    'cancelCloseCorrection',
    'confirmCloseCorrection',
    'saveCorrection',
    'retryCorrection',
    'openDelete',
    'closeDelete',
    'confirmDelete',
    'retryDelete',
    'refreshAdmission',
    'destroy'
  ]);

  class ActivityV2SessionHistoryShellError extends Error {
    constructor(code) {
      super(SAFE_MESSAGE);
      this.name = 'ActivityV2SessionHistoryShellError';
      this.code = code;
    }
  }

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function fail(code) {
    throw new ActivityV2SessionHistoryShellError(code);
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

  function hasExactDataKeys(value, expected) {
    if (!isRecord(value)) return false;
    const keys = Reflect.ownKeys(value);
    if (
      keys.length !== expected.length ||
      keys.some((key) => typeof key !== 'string' || !expected.includes(key))
    ) {
      return false;
    }
    const descriptors = Object.getOwnPropertyDescriptors(value);
    return expected.every(
      (key) =>
        descriptors[key] &&
        Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
    );
  }

  function readOptions(value) {
    if (!hasExactDataKeys(value, ['host', 'controller'])) {
      fail('INVALID_OPTIONS');
    }
    const { host, controller } = value;
    const document = host?.ownerDocument;
    if (
      !host ||
      host.nodeType !== 1 ||
      typeof host.appendChild !== 'function' ||
      !document ||
      typeof document.createElement !== 'function' ||
      !isRecord(controller) ||
      !hasExactDataKeys(controller, CONTROLLER_METHODS) ||
      CONTROLLER_METHODS.some((method) => typeof controller[method] !== 'function')
    ) {
      fail('INVALID_OPTIONS');
    }
    return { host, controller, document };
  }

  function text(document, tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    return element;
  }

  function button(document, label, action, options = {}) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = options.className || 'activity-v2-history-button';
    element.textContent = label;
    element.dataset.action = action;
    if (options.sessionId) element.dataset.sessionId = options.sessionId;
    if (options.focusKey) element.dataset.focusKey = options.focusKey;
    if (options.disabled) element.disabled = true;
    return element;
  }

  function formatDay(day) {
    const [year, month, date] = day.split('-');
    return `${date}.${month}.${year}`;
  }

  function formatValue(value, suffix = '') {
    return value === null ? '—' : `${String(value).replace('.', ',')}${suffix}`;
  }

  function errorCopy(code) {
    const messages = {
      AUTH_REQUIRED: 'Bitte erneut anmelden, um die Historie zu laden.',
      INVALID_HISTORY_PAGE: 'Die Historienantwort war nicht verwendbar.',
      INVALID_CORRECTION: 'Die Korrektur ist noch nicht vollständig gültig.',
      SESSION_CONFLICT:
        'Diese Einheit wurde zwischenzeitlich geändert. Die Eingaben bleiben erhalten.',
      SESSION_NOT_FOUND: 'Diese Einheit ist nicht mehr verfügbar.',
      REVISION_EXHAUSTED: 'Diese Einheit kann nicht weiter korrigiert werden.',
      MUTATION_NOT_APPLIED:
        'Die Korrektur wurde nicht angewandt. Derselbe Auftrag kann erneut gesendet werden.',
      RECONCILIATION_FAILED:
        'Der Ausgang konnte noch nicht sicher festgestellt werden.',
      POST_MUTATION_REFRESH_FAILED:
        'Die Änderung ist bestätigt, aber Historie, Detail oder letzte Ausführung konnten noch nicht gemeinsam aktualisiert werden.',
      MUTATION_BLOCKED:
        'Korrekturen und Löschen sind während eines aktiven Entwurfs oder ungeklärten Speichervorgangs gesperrt.',
      REQUEST_FAILED: 'Die Trainingshistorie konnte nicht geladen werden.'
    };
    return messages[code] || 'Die Trainingsdaten konnten nicht geladen werden.';
  }

  function deleteErrorCopy(code) {
    return code === 'MUTATION_NOT_APPLIED'
      ? 'Das Löschen wurde nicht angewandt. Derselbe Auftrag kann erneut gesendet werden.'
      : errorCopy(code);
  }

  function numberValue(value) {
    if (value === '') return null;
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : value;
  }

  function originalCatalogEntries(catalogVersion) {
    const source =
      catalogVersion === 1
        ? root.AppModules?.activityV2?.semantics
        : catalogVersion === 2
          ? root.AppModules?.activityV2?.semanticsV2
          : null;
    try {
      const catalog = source?.getCatalog?.();
      return catalog?.catalog_version === catalogVersion && Array.isArray(catalog.entries)
        ? catalog.entries
        : [];
    } catch {
      return [];
    }
  }

  function mount(optionsValue) {
    const { host, controller, document } = readOptions(optionsValue);
    const rootElement = document.createElement('section');
    rootElement.className = 'activity-v2-history-shell';
    rootElement.dataset.activityV2R9Surface = 'history-detail';
    rootElement.setAttribute('aria-labelledby', 'activity-v2-history-title');
    let destroyed = false;
    let state = controller.getState();
    let unsubscribe = null;
    let suppressNextRender = false;

    function assertUsable() {
      if (destroyed) fail('SHELL_DESTROYED');
    }

    function focusByKey(key) {
      if (!key) return;
      try {
        const target = rootElement.querySelector(`[data-focus-key="${key}"]`);
        target?.focus();
      } catch {
        // Focus restoration is best effort after a full isolated rerender.
      }
    }

    function rememberFocus() {
      const active = document.activeElement;
      return rootElement.contains(active) ? active?.dataset?.focusKey || null : null;
    }

    function renderHeader(fragment) {
      const header = document.createElement('header');
      header.className = 'activity-v2-history-header';
      const copy = document.createElement('div');
      copy.append(
        text(document, 'p', 'activity-v2-history-eyebrow', 'ACTIVITY V2 · VERLAUF'),
        text(document, 'h1', 'activity-v2-history-title', 'Trainingshistorie'),
        text(
          document,
          'p',
          'activity-v2-history-lead',
          'Abgeschlossene Einheiten mit ihren gespeicherten Momentaufnahmen.'
        )
      );
      copy.querySelector('h1').id = 'activity-v2-history-title';
      header.append(copy);
      if (state.history.status !== 'loading') {
        header.append(
          button(document, 'Aktualisieren', 'refresh-history', {
            className: 'activity-v2-history-button activity-v2-history-button--quiet',
            focusKey: 'refresh-history',
            disabled: state.mutation_busy
          })
        );
      }
      fragment.append(header);
    }

    function renderHistoryList(column) {
      const history = state.history;
      const heading = text(document, 'h2', 'activity-v2-history-section-title', 'Einheiten');
      column.append(heading);
      if (history.status === 'loading' && history.items.length === 0) {
        const loading = text(
          document,
          'p',
          'activity-v2-history-state activity-v2-history-state--loading',
          'Trainingshistorie wird geladen …'
        );
        loading.setAttribute('role', 'status');
        column.append(loading);
        return;
      }
      if (history.status === 'empty') {
        column.append(
          text(
            document,
            'p',
            'activity-v2-history-state',
            'Noch keine abgeschlossenen Trainings vorhanden.'
          )
        );
        return;
      }
      if (history.status === 'error' && history.items.length === 0) {
        const error = text(
          document,
          'div',
          'activity-v2-history-state activity-v2-history-state--error',
          errorCopy(history.error)
        );
        error.setAttribute('role', 'alert');
        error.append(
          button(document, 'Erneut versuchen', 'refresh-history', {
            focusKey: 'history-retry',
            disabled: state.mutation_busy
          })
        );
        column.append(error);
        return;
      }

      const list = document.createElement('ol');
      list.className = 'activity-v2-history-list';
      history.items.forEach((item) => {
        const row = document.createElement('li');
        row.className = 'activity-v2-history-row';
        const opener = button(
          document,
          '',
          'open-detail',
          {
            className: 'activity-v2-history-entry',
            sessionId: item.session_id,
            focusKey: `history-${item.session_id}`,
            disabled: state.mutation_busy
          }
        );
        const primary = document.createElement('span');
        primary.className = 'activity-v2-history-entry-primary';
        primary.append(
          text(document, 'strong', '', item.title || 'Training'),
          text(document, 'span', '', formatDay(item.day))
        );
        const metrics = document.createElement('span');
        metrics.className = 'activity-v2-history-entry-metrics';
        metrics.append(
          text(document, 'span', '', `${item.duration_min} Min.`),
          text(
            document,
            'span',
            '',
            `${item.item_count} ${item.item_count === 1 ? 'Eintrag' : 'Einträge'}`
          ),
          text(document, 'span', '', `Rev. ${item.revision}`)
        );
        opener.append(primary, metrics);
        row.append(opener);
        list.append(row);
      });
      column.append(list);
      if (history.error) {
        const appendError = text(
          document,
          'p',
          'activity-v2-history-inline-error',
          'Weitere Einheiten konnten nicht geladen werden. Bereits geladene Einträge bleiben erhalten.'
        );
        appendError.setAttribute('role', 'alert');
        column.append(appendError);
      }
      if (history.has_more) {
        column.append(
          button(
            document,
            history.loading_more ? 'Weitere werden geladen …' : 'Mehr laden',
            'load-more',
            {
              className: 'activity-v2-history-button activity-v2-history-button--wide',
              focusKey: 'load-more',
              disabled: history.loading_more || state.mutation_busy
            }
          )
        );
      }
    }

    function renderSnapshotItem(item) {
      const article = document.createElement('article');
      article.className = 'activity-v2-history-snapshot';
      article.dataset.itemKey = item.item_key;
      const header = document.createElement('header');
      header.append(
        text(document, 'h4', '', item.item_label_snapshot),
        text(
          document,
          'span',
          'activity-v2-history-badge',
          item.tracking_mode_snapshot === 'strength_sets'
            ? 'Sätze'
            : item.tracking_mode_snapshot === 'duration_distance'
              ? 'Dauer + Distanz'
              : 'Dauer'
        )
      );
      article.append(header);
      const facts = document.createElement('dl');
      facts.className = 'activity-v2-history-facts';
      const pairs = [];
      if (item.duration_min !== null) {
        pairs.push(['Dauer', formatValue(item.duration_min, ' Min.')]);
      }
      if (item.distance_km !== null) {
        pairs.push(['Distanz', formatValue(item.distance_km, ' km')]);
      }
      if (item.note !== null) pairs.push(['Notiz', item.note]);
      pairs.forEach(([label, value]) => {
        facts.append(text(document, 'dt', '', label), text(document, 'dd', '', value));
      });
      if (pairs.length > 0) article.append(facts);
      if (item.sets.length > 0) {
        const table = document.createElement('div');
        table.className = 'activity-v2-history-sets';
        item.sets.forEach((set) => {
          const row = document.createElement('p');
          row.append(text(document, 'strong', '', `Satz ${set.set_order}`));
          const values = [
            set.reps === null ? null : `${set.reps} Wdh.`,
            set.duration_sec === null ? null : `${set.duration_sec} Sek.`,
            set.distance_m === null ? null : `${formatValue(set.distance_m)} m`,
            set.weight_kg === null ? null : `${formatValue(set.weight_kg)} kg`,
            set.assistance_kg === null
              ? null
              : `${formatValue(set.assistance_kg)} kg Hilfe`
          ].filter(Boolean);
          row.append(text(document, 'span', '', values.join(' · ')));
          table.append(row);
        });
        article.append(table);
      }
      const policy = text(
        document,
        'details',
        'activity-v2-history-policy',
        ''
      );
      const summary = text(document, 'summary', '', 'Gespeicherte Feldregeln');
      const body = text(
        document,
        'p',
        '',
        Object.entries(item.field_policy_snapshot)
          .filter(([, value]) => value !== 'forbidden')
          .map(([key, value]) => `${key}: ${value}`)
          .join(' · ')
      );
      policy.append(summary, body);
      article.append(policy);
      return article;
    }

    function inputField(label, value, options = {}) {
      const wrapper = document.createElement('label');
      wrapper.className = 'activity-v2-history-field';
      wrapper.append(text(document, 'span', '', label));
      const element = document.createElement(options.multiline ? 'textarea' : 'input');
      if (!options.multiline) {
        element.type = options.type || 'text';
        if (options.min !== undefined) element.min = String(options.min);
        if (options.max !== undefined) element.max = String(options.max);
        if (options.step !== undefined) element.step = String(options.step);
      } else {
        element.rows = options.rows || 3;
      }
      element.value = value === null ? '' : String(value);
      element.dataset.correctionField = options.field;
      if (options.itemKey) element.dataset.itemKey = options.itemKey;
      if (options.setOrder) element.dataset.setOrder = String(options.setOrder);
      if (options.disabled) element.disabled = true;
      wrapper.append(element);
      return wrapper;
    }

    function fieldOptions(fieldKey) {
      if (fieldKey === 'note') return { multiline: true, rows: 2 };
      if (fieldKey === 'reps') return { type: 'number', min: 1, max: 1000, step: 1 };
      if (fieldKey === 'duration_sec') {
        return { type: 'number', min: 1, max: 3600, step: 1 };
      }
      if (fieldKey === 'duration_min') {
        return { type: 'number', min: 1, max: 1440, step: 1 };
      }
      if (fieldKey === 'distance_m') {
        return { type: 'number', min: 0.1, max: 10000, step: 0.1 };
      }
      return { type: 'number', min: 0.01, max: 1000, step: 0.01 };
    }

    function renderCorrectionSet(item, set, disabled) {
      const section = document.createElement('section');
      section.className = 'activity-v2-history-correction-set';
      const header = document.createElement('header');
      header.append(text(document, 'h5', '', `Satz ${set.set_order}`));
      if (item.sets.length > 1) {
        header.append(
          button(document, 'Satz entfernen', 'correction-remove-set', {
            className: 'activity-v2-history-button activity-v2-history-button--quiet',
            disabled
          })
        );
        header.lastElementChild.dataset.itemKey = item.item_key;
        header.lastElementChild.dataset.setOrder = String(set.set_order);
      }
      section.append(header);
      const fields = document.createElement('div');
      fields.className = 'activity-v2-history-field-grid';
      ['reps', 'duration_sec', 'distance_m', 'weight_kg', 'assistance_kg']
        .filter((key) => item.field_policy_snapshot[key] !== 'forbidden')
        .forEach((key) => {
          fields.append(
            inputField(FIELD_LABELS[key], set[key], {
              ...fieldOptions(key),
              field: key,
              itemKey: item.item_key,
              setOrder: set.set_order,
              disabled
            })
          );
        });
      section.append(fields);
      return section;
    }

    function renderCorrectionItem(item, itemCount, disabled) {
      const section = document.createElement('article');
      section.className = 'activity-v2-history-correction-item';
      section.dataset.itemKey = item.item_key;
      const header = document.createElement('header');
      const copy = document.createElement('div');
      copy.append(
        text(document, 'p', 'activity-v2-history-eyebrow', `POSITION ${item.item_order}`),
        text(document, 'h4', '', item.item_label_snapshot)
      );
      const controls = document.createElement('div');
      controls.className = 'activity-v2-history-compact-actions';
      if (item.item_order > 1) {
        const moveUp = button(document, 'Nach oben', 'correction-move-item', {
          className: 'activity-v2-history-button activity-v2-history-button--quiet',
          disabled
        });
        moveUp.dataset.itemKey = item.item_key;
        moveUp.dataset.targetOrder = String(item.item_order - 1);
        controls.append(moveUp);
      }
      if (item.item_order < itemCount) {
        const moveDown = button(document, 'Nach unten', 'correction-move-item', {
          className: 'activity-v2-history-button activity-v2-history-button--quiet',
          disabled
        });
        moveDown.dataset.itemKey = item.item_key;
        moveDown.dataset.targetOrder = String(item.item_order + 1);
        controls.append(moveDown);
      }
      const remove = button(document, 'Eintrag entfernen', 'correction-remove-item', {
        className: 'activity-v2-history-button activity-v2-history-button--danger',
        disabled
      });
      remove.dataset.itemKey = item.item_key;
      controls.append(remove);
      header.append(copy, controls);
      section.append(header);

      const itemFields = document.createElement('div');
      itemFields.className = 'activity-v2-history-field-grid';
      ['duration_min', 'distance_km', 'note']
        .filter((key) => item.field_policy_snapshot[key] !== 'forbidden')
        .forEach((key) => {
          itemFields.append(
            inputField(FIELD_LABELS[key], item[key], {
              ...fieldOptions(key),
              field: key,
              itemKey: item.item_key,
              disabled
            })
          );
        });
      if (itemFields.childElementCount > 0) section.append(itemFields);

      if (item.tracking_mode_snapshot === 'strength_sets') {
        const sets = document.createElement('div');
        sets.className = 'activity-v2-history-correction-sets';
        item.sets.forEach((set) => sets.append(renderCorrectionSet(item, set, disabled)));
        const addSet = button(document, 'Satz hinzufügen', 'correction-add-set', {
          className: 'activity-v2-history-button activity-v2-history-button--quiet',
          disabled: disabled || item.sets.length >= 50
        });
        addSet.dataset.itemKey = item.item_key;
        sets.append(addSet);
        section.append(sets);
      }
      return section;
    }

    function renderCorrection(column) {
      const current = state.correction;
      const working = current.working_copy;
      const busy =
        state.mutation_busy ||
        ['saving', 'reconciling', 'refreshing'].includes(current.status);
      const disabled =
        busy ||
        ['confirmed', 'conflict'].includes(current.status) ||
        current.retry_mode !== null;
      const header = document.createElement('header');
      header.className = 'activity-v2-history-detail-header';
      const copy = document.createElement('div');
      const correctionTitle = text(
        document,
        'h2',
        'activity-v2-history-detail-title',
        'Einheit korrigieren'
      );
      correctionTitle.tabIndex = -1;
      correctionTitle.dataset.focusKey = 'correction-title';
      copy.append(
        text(document, 'p', 'activity-v2-history-eyebrow', 'KORREKTUR'),
        correctionTitle
      );
      header.append(
        copy,
        button(document, 'Korrektur schließen', 'correction-close', {
          className: 'activity-v2-history-button activity-v2-history-button--quiet',
          focusKey: 'correction-close',
          disabled: busy
        })
      );
      column.append(header);

      if (current.status === 'confirmed') {
        const confirmed = text(
          document,
          'p',
          'activity-v2-history-confirmation',
          current.confirmation === 'reconciled'
            ? 'Korrektur nach erneutem Lesen bestätigt.'
            : current.confirmation === 'replayed'
              ? 'Identische Korrektur bestätigt.'
              : 'Korrektur gespeichert.'
        );
        confirmed.setAttribute('role', 'status');
        column.append(confirmed);
      }
      if (current.error) {
        const error = text(
          document,
          'div',
          'activity-v2-history-inline-error',
          errorCopy(current.error)
        );
        error.setAttribute('role', 'alert');
        if (current.retry_mode) {
          error.append(
            button(
              document,
              current.retry_mode === 'redispatch'
                ? 'Identisch erneut senden'
                : current.retry_mode === 'refresh'
                  ? 'Ansicht neu laden'
                  : 'Status erneut prüfen',
              'correction-retry',
              { disabled: busy }
            )
          );
        }
        column.append(error);
      }
      if (['saving', 'reconciling', 'refreshing'].includes(current.status)) {
        const progress = text(
          document,
          'p',
          'activity-v2-history-state activity-v2-history-state--loading',
          current.status === 'saving'
            ? 'Korrektur wird gespeichert …'
            : current.status === 'reconciling'
              ? 'Speicherstatus wird sicher geprüft …'
              : 'Historie und letzte Ausführung werden aktualisiert …'
        );
        progress.setAttribute('role', 'status');
        column.append(progress);
      }

      const form = document.createElement('div');
      form.className = 'activity-v2-history-correction-form';
      const sessionFields = document.createElement('div');
      sessionFields.className = 'activity-v2-history-field-grid';
      sessionFields.append(
        inputField(FIELD_LABELS.duration_min, working.duration_min, {
          ...fieldOptions('duration_min'),
          field: 'session-duration',
          disabled
        }),
        inputField('Sessionnotiz', working.note, {
          multiline: true,
          rows: 3,
          field: 'session-note',
          disabled
        })
      );
      form.append(sessionFields);
      const heading = text(document, 'h3', 'activity-v2-history-section-title', 'Einträge');
      form.append(heading);
      working.items.forEach((item) =>
        form.append(renderCorrectionItem(item, working.items.length, disabled))
      );

      const currentKeys = new Set(working.items.map((item) => item.item_key));
      const available = originalCatalogEntries(working.catalog_version).filter(
        (entry) => entry.status === 'active' && !currentKeys.has(entry.key)
      );
      if (available.length > 0 && working.items.length < 50) {
        const add = document.createElement('div');
        add.className = 'activity-v2-history-add-item';
        const select = document.createElement('select');
        select.dataset.correctionAddItem = 'true';
        select.setAttribute('aria-label', 'Eintrag aus ursprünglichem Katalog');
        available.forEach((entry) => {
          const option = document.createElement('option');
          option.value = entry.key;
          option.textContent = entry.label;
          select.append(option);
        });
        select.disabled = disabled;
        add.append(
          select,
          button(document, 'Eintrag hinzufügen', 'correction-add-item', { disabled })
        );
        form.append(add);
      }
      column.append(form);

      if (!current.valid) {
        const invalid = text(
          document,
          'p',
          'activity-v2-history-inline-error',
          'Bitte alle Pflichtwerte gültig ausfüllen.'
        );
        invalid.setAttribute('role', 'alert');
        column.append(invalid);
      }
      const actions = document.createElement('div');
      actions.className = 'activity-v2-history-actions';
      actions.append(
        button(document, 'Korrektur speichern', 'correction-save', {
          focusKey: 'correction-save',
          disabled: disabled || !current.valid || !current.dirty
        })
      );
      column.append(actions);

      if (current.close_confirmation) {
        const dialog = document.createElement('section');
        dialog.className = 'activity-v2-history-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-labelledby', 'activity-v2-correction-close-title');
        const dialogTitle = text(
          document,
          'h3',
          '',
          'Ungespeicherte Korrektur verwerfen?'
        );
        dialogTitle.id = 'activity-v2-correction-close-title';
        dialog.append(
          dialogTitle,
          text(document, 'p', '', 'Die Änderungen existieren nur in diesem Fenster.'),
          button(document, 'Weiter bearbeiten', 'correction-cancel-close', {
            focusKey: 'correction-cancel-close'
          }),
          button(document, 'Änderungen verwerfen', 'correction-confirm-close', {
            className: 'activity-v2-history-button activity-v2-history-button--danger'
          })
        );
        column.append(dialog);
      }
    }

    function renderDelete(column) {
      const current = state.deletion;
      const busy =
        state.mutation_busy ||
        ['deleting', 'reconciling', 'refreshing'].includes(current.status);
      const header = document.createElement('header');
      header.className = 'activity-v2-history-detail-header';
      const copy = document.createElement('div');
      const deleteTitle = text(
        document,
        'h2',
        'activity-v2-history-detail-title',
        'Training löschen'
      );
      deleteTitle.tabIndex = -1;
      deleteTitle.dataset.focusKey = 'delete-title';
      copy.append(
        text(document, 'p', 'activity-v2-history-eyebrow', 'HARD DELETE'),
        deleteTitle
      );
      header.append(
        copy,
        button(document, 'Löschen schließen', 'delete-close', {
          className: 'activity-v2-history-button activity-v2-history-button--quiet',
          disabled: busy
        })
      );
      column.append(header);

      if (current.status === 'confirming') {
        const warning = document.createElement('section');
        warning.className = 'activity-v2-history-delete-warning';
        warning.setAttribute('role', 'dialog');
        warning.setAttribute('aria-labelledby', 'activity-v2-delete-title');
        const title = text(
          document,
          'h3',
          '',
          `Training vom ${formatDay(current.context.day)} endgültig löschen?`
        );
        title.id = 'activity-v2-delete-title';
        const itemCount = current.context.item_count;
        warning.append(
          title,
          text(
            document,
            'p',
            '',
            `${itemCount} ${itemCount === 1 ? 'Eintrag wird' : 'Einträge werden'} dauerhaft entfernt. Es gibt kein Undo.`
          ),
          button(document, 'Abbrechen', 'delete-close', {
            className: 'activity-v2-history-button activity-v2-history-button--quiet'
          }),
          button(document, 'Dieses Training endgültig löschen', 'delete-confirm', {
            className: 'activity-v2-history-button activity-v2-history-button--danger'
          })
        );
        column.append(warning);
      }

      if (['deleting', 'reconciling', 'refreshing'].includes(current.status)) {
        const progress = text(
          document,
          'p',
          'activity-v2-history-state activity-v2-history-state--loading',
          current.status === 'deleting'
            ? 'Training wird gelöscht …'
            : current.status === 'reconciling'
              ? 'Löschstatus wird sicher geprüft …'
              : 'Historie und letzte Ausführung werden aktualisiert …'
        );
        progress.setAttribute('role', 'status');
        column.append(progress);
      }

      if (current.status === 'confirmed') {
        const confirmed = text(
          document,
          'p',
          'activity-v2-history-confirmation',
          current.confirmation === 'reconciled_absent'
            ? 'Das Training ist nach erneutem Lesen nicht mehr vorhanden.'
            : current.confirmation === 'already_absent'
              ? 'Das Training ist nicht mehr vorhanden.'
              : 'Training endgültig gelöscht.'
        );
        confirmed.setAttribute('role', 'status');
        confirmed.tabIndex = -1;
        confirmed.dataset.focusKey = 'delete-confirmation';
        column.append(confirmed);
      }

      if (current.error) {
        const error = text(
          document,
          'div',
          'activity-v2-history-inline-error',
          deleteErrorCopy(current.error)
        );
        error.setAttribute('role', 'alert');
        if (current.retry_mode) {
          error.append(
            button(
              document,
              current.retry_mode === 'redispatch'
                ? 'Identisches Löschen erneut senden'
                : current.retry_mode === 'refresh'
                  ? 'Ansicht neu laden'
                  : 'Löschstatus erneut prüfen',
              'delete-retry',
              { disabled: busy }
            )
          );
        }
        column.append(error);
      }
    }

    function renderDetail(column) {
      const current = state.detail;
      if (state.deletion.context !== null) {
        renderDelete(column);
        return;
      }
      if (current.status === 'closed') {
        column.append(
          text(
            document,
            'p',
            'activity-v2-history-state activity-v2-history-state--detail',
            'Eine Einheit auswählen, um ihre gespeicherte Momentaufnahme zu sehen.'
          )
        );
        return;
      }
      if (current.status === 'loading') {
        const loading = text(
          document,
          'p',
          'activity-v2-history-state activity-v2-history-state--loading',
          'Detail wird geladen …'
        );
        loading.setAttribute('role', 'status');
        column.append(loading);
        return;
      }
      if (current.status === 'not_found') {
        const notFound = text(
          document,
          'div',
          'activity-v2-history-state',
          'Diese Einheit ist nicht mehr verfügbar.'
        );
        notFound.append(
          button(document, 'Detail schließen', 'close-detail', {
            focusKey: 'close-detail'
          })
        );
        column.append(notFound);
        return;
      }
      if (current.status === 'error') {
        const error = text(
          document,
          'div',
          'activity-v2-history-state activity-v2-history-state--error',
          errorCopy(current.error)
        );
        error.setAttribute('role', 'alert');
        error.append(
          button(document, 'Detail erneut laden', 'retry-detail', {
            sessionId: current.session_id,
            focusKey: 'retry-detail'
          })
        );
        column.append(error);
        return;
      }

      const value = current.value;
      if (state.correction.working_copy !== null) {
        renderCorrection(column);
        return;
      }
      const header = document.createElement('header');
      header.className = 'activity-v2-history-detail-header';
      const title = document.createElement('div');
      title.append(
        text(document, 'p', 'activity-v2-history-eyebrow', formatDay(value.day)),
        text(document, 'h2', 'activity-v2-history-detail-title', value.title || 'Training')
      );
      title.querySelector('h2').tabIndex = -1;
      title.querySelector('h2').dataset.focusKey = 'detail-title';
      header.append(
        title,
        button(document, 'Schließen', 'close-detail', {
          className: 'activity-v2-history-button activity-v2-history-button--quiet',
          focusKey: 'close-detail',
          disabled: state.mutation_busy
        })
      );
      column.append(header);
      const meta = document.createElement('dl');
      meta.className = 'activity-v2-history-meta';
      [
        ['Dauer', `${value.duration_min} Minuten`],
        ['Einträge', String(value.items.length)],
        ['Katalog', `Version ${value.catalog_version}`],
        ['Revision', value.revision]
      ].forEach(([label, valueText]) => {
        meta.append(text(document, 'dt', '', label), text(document, 'dd', '', valueText));
      });
      column.append(meta);
      if (value.note !== null) {
        const note = document.createElement('section');
        note.className = 'activity-v2-history-session-note';
        note.append(text(document, 'h3', '', 'Sessionnotiz'), text(document, 'p', '', value.note));
        column.append(note);
      }
      const snapshotHeading = text(
        document,
        'h3',
        'activity-v2-history-section-title',
        'Gespeicherte Einträge'
      );
      column.append(snapshotHeading);
      value.items.forEach((item) => column.append(renderSnapshotItem(item)));
      if (state.correction.error === 'MUTATION_BLOCKED') {
        const blocked = text(
          document,
          'p',
          'activity-v2-history-inline-error',
          errorCopy(state.correction.error)
        );
        blocked.setAttribute('role', 'alert');
        column.append(blocked);
      }
      if (state.deletion.error === 'MUTATION_BLOCKED') {
        const blocked = text(
          document,
          'p',
          'activity-v2-history-inline-error',
          errorCopy(state.deletion.error)
        );
        blocked.setAttribute('role', 'alert');
        column.append(blocked);
      }
      const actions = document.createElement('div');
      actions.className = 'activity-v2-history-actions';
      actions.append(
        button(document, 'Korrigieren', 'open-correction', {
          className: 'activity-v2-history-button',
          focusKey: 'open-correction',
          disabled: state.mutation_busy
        }),
        button(document, 'Training löschen', 'open-delete', {
          className: 'activity-v2-history-button activity-v2-history-button--danger',
          focusKey: 'open-delete',
          disabled: state.mutation_busy
        })
      );
      column.append(actions);
    }

    function render() {
      if (destroyed) return;
      rootElement.dataset.busy = state.mutation_busy ? 'true' : 'false';
      const focusKey = rememberFocus();
      const fragment = document.createDocumentFragment();
      renderHeader(fragment);
      const layout = document.createElement('div');
      layout.className = 'activity-v2-history-layout';
      const listColumn = document.createElement('section');
      listColumn.className = 'activity-v2-history-column activity-v2-history-column--list';
      listColumn.setAttribute('aria-label', 'Trainingsliste');
      const detailColumn = document.createElement('section');
      detailColumn.className = 'activity-v2-history-column activity-v2-history-column--detail';
      detailColumn.setAttribute('aria-label', 'Trainingsdetail');
      renderHistoryList(listColumn);
      renderDetail(detailColumn);
      layout.append(listColumn, detailColumn);
      fragment.append(layout);
      rootElement.replaceChildren(fragment);
      focusByKey(focusKey);
    }

    async function invoke(action, target) {
      if (action === 'refresh-history') await controller.refreshHistory();
      else if (action === 'load-more') await controller.loadMore();
      else if (action === 'open-detail' || action === 'retry-detail') {
        await controller.openDetail(target.dataset.sessionId);
        focusByKey('detail-title');
      } else if (action === 'close-detail') {
        const sessionId = state.detail.session_id;
        controller.closeDetail();
        focusByKey(`history-${sessionId}`);
      } else if (action === 'open-correction') {
        const opened = controller.openCorrection();
        focusByKey(opened ? 'correction-title' : 'open-correction');
      } else if (action === 'correction-close') {
        const closed = controller.requestCloseCorrection();
        focusByKey(closed ? 'open-correction' : 'correction-cancel-close');
      } else if (action === 'correction-cancel-close') {
        controller.cancelCloseCorrection();
        focusByKey('correction-close');
      } else if (action === 'correction-confirm-close') {
        controller.confirmCloseCorrection();
        focusByKey('open-correction');
      } else if (action === 'correction-save') {
        await controller.saveCorrection();
        focusByKey('correction-close');
      } else if (action === 'correction-retry') {
        await controller.retryCorrection();
        focusByKey('correction-close');
      } else if (action === 'correction-add-item') {
        const select = rootElement.querySelector('[data-correction-add-item]');
        if (select?.value) controller.addCorrectionItem(select.value);
      } else if (action === 'correction-remove-item') {
        controller.removeCorrectionItem(target.dataset.itemKey);
      } else if (action === 'correction-move-item') {
        controller.moveCorrectionItem(
          target.dataset.itemKey,
          Number(target.dataset.targetOrder)
        );
      } else if (action === 'correction-add-set') {
        controller.addCorrectionSet(target.dataset.itemKey);
      } else if (action === 'correction-remove-set') {
        controller.removeCorrectionSet(
          target.dataset.itemKey,
          Number(target.dataset.setOrder)
        );
      } else if (action === 'open-delete') {
        const opened = controller.openDelete();
        focusByKey(opened ? 'delete-title' : 'open-delete');
      } else if (action === 'delete-close') {
        controller.closeDelete();
        focusByKey('open-delete');
      } else if (action === 'delete-confirm') {
        await controller.confirmDelete();
        focusByKey(
          state.deletion.status === 'confirmed'
            ? 'delete-confirmation'
            : 'delete-title'
        );
      } else if (action === 'delete-retry') {
        await controller.retryDelete();
        focusByKey(
          state.deletion.status === 'confirmed'
            ? 'delete-confirmation'
            : 'delete-title'
        );
      }
    }

    function onInput(event) {
      const target = event.target;
      const field = target?.dataset?.correctionField;
      if (!field || !rootElement.contains(target) || target.disabled) return;
      const value = target.tagName === 'TEXTAREA' ? target.value : numberValue(target.value);
      suppressNextRender = true;
      try {
        if (field === 'session-duration') controller.setCorrectionDurationMin(value);
        else if (field === 'session-note') controller.setCorrectionNote(target.value);
        else if (target.dataset.setOrder) {
          controller.setCorrectionSetField(
            target.dataset.itemKey,
            Number(target.dataset.setOrder),
            field,
            value
          );
        } else {
          controller.setCorrectionItemField(
            target.dataset.itemKey,
            field,
            field === 'note' ? target.value : value
          );
        }
      } catch {
        render();
        return;
      } finally {
        suppressNextRender = false;
      }
      if (state.correction.status === 'error') {
        render();
        return;
      }
      const save = rootElement.querySelector('[data-action="correction-save"]');
      if (save) {
        save.disabled =
          state.mutation_busy || !state.correction.valid || !state.correction.dirty;
      }
    }

    function onChange(event) {
      if (event.target?.dataset?.correctionField && rootElement.contains(event.target)) {
        render();
      }
    }

    function onClick(event) {
      const target = event.target?.closest?.('[data-action]');
      if (!target || !rootElement.contains(target) || target.disabled) return;
      event.preventDefault();
      invoke(target.dataset.action, target).catch(() => {});
    }

    rootElement.addEventListener('click', onClick);
    rootElement.addEventListener('input', onInput);
    rootElement.addEventListener('change', onChange);
    host.appendChild(rootElement);
    try {
      unsubscribe = controller.subscribe((nextState) => {
        state = nextState;
        if (suppressNextRender) {
          suppressNextRender = false;
          return;
        }
        render();
      });
      if (typeof unsubscribe !== 'function') fail('INVALID_CONTROLLER');
      render();
      controller.refreshHistory().catch(() => {});
    } catch (error) {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch {
          // The injected controller remains externally owned.
        }
      }
      unsubscribe = null;
      rootElement.removeEventListener('click', onClick);
      rootElement.removeEventListener('input', onInput);
      rootElement.removeEventListener('change', onChange);
      rootElement.remove();
      if (error instanceof ActivityV2SessionHistoryShellError) throw error;
      fail('INVALID_CONTROLLER');
    }

    function getElement() {
      assertUsable();
      return rootElement;
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      try {
        unsubscribe?.();
      } catch {
        // The injected controller remains externally owned.
      }
      unsubscribe = null;
      rootElement.removeEventListener('click', onClick);
      rootElement.removeEventListener('input', onInput);
      rootElement.removeEventListener('change', onChange);
      rootElement.remove();
    }

    return deepFreeze({ getElement, destroy });
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
  if ('sessionHistoryShell' in root.AppModules.activityV2) {
    throw new Error('AppModules.activityV2.sessionHistoryShell is already registered');
  }
  if (!Object.isExtensible(root.AppModules.activityV2)) {
    throw new TypeError('AppModules.activityV2 must be extensible');
  }

  Object.defineProperty(root.AppModules.activityV2, 'sessionHistoryShell', {
    value: deepFreeze({ mount }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);

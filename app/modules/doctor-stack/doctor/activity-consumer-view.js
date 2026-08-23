'use strict';

(function initDoctorActivityConsumerView(root) {
  const DAY_MS = 86400000;
  const SAFE_ERROR_CODES = Object.freeze([
    'INVALID_RANGE',
    'CONFIG_UNAVAILABLE',
    'API_UNAVAILABLE',
    'AUTH_REQUIRED',
    'RANGE_TOO_LARGE',
    'LIMIT_EXCEEDED',
    'CONTRACT_INVALID',
    'REQUEST_ABORTED',
    'REQUEST_FAILED',
    'DELETE_UNAVAILABLE',
    'DELETE_FAILED'
  ]);

  const isRecord = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

  function readOwnDataField(value, key) {
    try {
      if (!isRecord(value)) return undefined;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value')
        ? descriptor.value
        : undefined;
    } catch (_) {
      return undefined;
    }
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

  function readRange(value, contract) {
    if (!isRecord(value)) throw new TypeError('invalid range');
    const keys = Reflect.ownKeys(value);
    const descriptors = Object.getOwnPropertyDescriptors(value);
    if (
      keys.length !== 2 ||
      keys.some(
        (key) =>
          typeof key !== 'string' ||
          !['from', 'to'].includes(key) ||
          !descriptors[key]?.enumerable ||
          !Object.prototype.hasOwnProperty.call(descriptors[key], 'value')
      )
    ) {
      throw new TypeError('invalid range');
    }
    const from = descriptors.from.value;
    const to = descriptors.to.value;
    const inclusiveDays =
      Math.trunc(
        (Date.parse(`${to}T00:00:00.000Z`) -
          Date.parse(`${from}T00:00:00.000Z`)) /
          DAY_MS
      ) + 1;
    return contract.validateRange({ from, to, inclusive_days: inclusiveDays });
  }

  function formatDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return '-';
    }
    return `${value.slice(8, 10)}.${value.slice(5, 7)}.${value.slice(0, 4)}`;
  }

  function appendText(doc, parent, tag, className, text) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  }

  function render(host, state, actions = {}) {
    if (!host || typeof host.replaceChildren !== 'function') {
      throw new TypeError('render host is required');
    }
    const doc = host.ownerDocument;
    const fragment = doc.createDocumentFragment();

    if (!state.unlocked) {
      appendText(doc, fragment, 'p', 'activity-consumer-message', 'Arztdetails sind gesperrt.');
      host.replaceChildren(fragment);
      return;
    }
    if (!state.opened) {
      appendText(doc, fragment, 'p', 'activity-consumer-message', 'Einzelwerte sind geschlossen.');
      host.replaceChildren(fragment);
      return;
    }
    if (state.status === 'loading') {
      const message = appendText(
        doc,
        fragment,
        'p',
        'activity-consumer-message',
        'Trainingseinträge werden geladen ...'
      );
      message.setAttribute('role', 'status');
      host.replaceChildren(fragment);
      return;
    }
    if (state.status === 'error') {
      const message = appendText(
        doc,
        fragment,
        'p',
        'activity-consumer-message is-error',
        'Training konnte nicht geladen werden.'
      );
      message.setAttribute('role', 'alert');
      host.replaceChildren(fragment);
      return;
    }
    if (state.status === 'empty') {
      appendText(
        doc,
        fragment,
        'p',
        'activity-consumer-message',
        'Keine Trainingseinträge im Zeitraum.'
      );
      host.replaceChildren(fragment);
      return;
    }
    if (state.status !== 'ready' || !state.snapshot) {
      host.replaceChildren(fragment);
      return;
    }

    const list = doc.createElement('div');
    list.className = 'activity-consumer-list';
    list.setAttribute('role', 'list');
    [...state.snapshot.units].reverse().forEach((unit) => {
      const row = doc.createElement('article');
      row.className = `activity-consumer-row is-${unit.source}`;
      row.dataset.source = unit.source;
      row.dataset.id = unit.id;
      row.setAttribute('role', 'listitem');

      const heading = doc.createElement('div');
      heading.className = 'activity-consumer-row-heading';
      appendText(doc, heading, 'time', 'activity-consumer-date', formatDay(unit.day))
        .setAttribute('datetime', unit.day);
      appendText(doc, heading, 'strong', 'activity-consumer-label', unit.label);
      row.append(heading);

      const metrics = doc.createElement('div');
      metrics.className = 'activity-consumer-metrics';
      appendText(doc, metrics, 'span', '', `${unit.duration_min} Min`);
      if (unit.source === 'activity_v2') {
        appendText(
          doc,
          metrics,
          'span',
          'activity-consumer-items',
          `${unit.item_count} ${unit.item_count === 1 ? 'Übung' : 'Übungen'}`
        );
      }
      row.append(metrics);

      if (unit.note) {
        appendText(doc, row, 'p', 'activity-consumer-note', unit.note);
      }
      if (unit.source === 'activity_v1' && typeof actions.deleteUnit === 'function') {
        const button = appendText(doc, row, 'button', 'activity-consumer-delete', 'Löschen');
        button.type = 'button';
        button.dataset.action = 'delete-v1';
        button.addEventListener('click', () => actions.deleteUnit(unit));
      }
      list.append(row);
    });
    fragment.append(list);
    host.replaceChildren(fragment);
  }

  function create(options = {}) {
    const adapter = options.adapter || root.AppModules?.activityV2?.consumerDataAccess;
    const contract = options.contract || root.AppModules?.activityV2?.consumer;
    const renderer = options.renderer || render;
    const host = options.host;
    const deleteV1 = options.deleteV1;
    const diagnose = options.diagnose;
    if (
      typeof adapter?.loadSnapshot !== 'function' ||
      typeof contract?.validateRange !== 'function' ||
      typeof contract?.validateSnapshot !== 'function' ||
      typeof renderer !== 'function' ||
      !host
    ) {
      throw new TypeError('invalid activity consumer view dependency');
    }

    let generation = 0;
    let destroyed = false;
    let state = deepFreeze({
      status: options.unlocked === true ? 'idle' : 'locked',
      range: null,
      snapshot: null,
      errorCode: null,
      opened: false,
      unlocked: options.unlocked === true
    });

    const safeDiagnose = (code, status) => {
      if (typeof diagnose !== 'function') return;
      try {
        diagnose({
          operation: 'loadDoctorActivity',
          code,
          status: Number.isInteger(status) ? status : null
        });
      } catch (_) {}
    };

    const publish = (next) => {
      state = deepFreeze(next);
      renderer(host, state, { deleteUnit });
      return state;
    };

    const safeError = (error) => {
      const rawCode = readOwnDataField(error, 'code');
      const status = readOwnDataField(error, 'status');
      const code = SAFE_ERROR_CODES.includes(rawCode)
        ? rawCode
        : 'REQUEST_FAILED';
      safeDiagnose(code, status);
      return code;
    };

    async function load() {
      if (destroyed || !state.unlocked || !state.opened || !state.range) return state;
      const requestGeneration = ++generation;
      const requestRange = state.range;
      publish({ ...state, status: 'loading', snapshot: null, errorCode: null });
      try {
        const snapshot = contract.validateSnapshot(
          await adapter.loadSnapshot({ from: requestRange.from, to: requestRange.to })
        );
        if (destroyed || requestGeneration !== generation) return state;
        if (
          snapshot.range.from !== requestRange.from ||
          snapshot.range.to !== requestRange.to
        ) {
          throw Object.assign(new Error('range mismatch'), {
            code: 'CONTRACT_INVALID'
          });
        }
        return publish({
          ...state,
          status: snapshot.units.length ? 'ready' : 'empty',
          snapshot,
          errorCode: null
        });
      } catch (error) {
        if (destroyed || requestGeneration !== generation) return state;
        return publish({
          ...state,
          status: 'error',
          snapshot: null,
          errorCode: safeError(error)
        });
      }
    }

    async function setRange(value) {
      if (destroyed) throw new Error('activity consumer view is destroyed');
      generation += 1;
      let range;
      try {
        range = readRange(value, contract);
      } catch (_) {
        return publish({
          ...state,
          status: 'error',
          range: null,
          snapshot: null,
          errorCode: 'INVALID_RANGE'
        });
      }
      publish({
        ...state,
        status: state.unlocked ? 'idle' : 'locked',
        range,
        snapshot: null,
        errorCode: null
      });
      return state.opened && state.unlocked ? await load() : state;
    }

    async function open() {
      if (destroyed) throw new Error('activity consumer view is destroyed');
      if (!state.unlocked) {
        return publish({ ...state, status: 'locked', opened: false });
      }
      publish({ ...state, opened: true });
      return state.range ? await load() : state;
    }

    function close() {
      if (destroyed) return state;
      generation += 1;
      return publish({
        ...state,
        status: state.unlocked ? 'idle' : 'locked',
        snapshot: null,
        errorCode: null,
        opened: false
      });
    }

    function unlock() {
      if (destroyed) throw new Error('activity consumer view is destroyed');
      generation += 1;
      return publish({
        ...state,
        status: 'idle',
        snapshot: null,
        errorCode: null,
        unlocked: true
      });
    }

    function lock() {
      if (destroyed) return state;
      generation += 1;
      return publish({
        status: 'locked',
        range: null,
        snapshot: null,
        errorCode: null,
        opened: false,
        unlocked: false
      });
    }

    async function deleteUnit(unit) {
      if (
        destroyed ||
        !state.unlocked ||
        !state.opened ||
        unit?.source !== 'activity_v1' ||
        !state.snapshot?.units.some(
          (candidate) => candidate.source === 'activity_v1' && candidate.id === unit.id
        )
      ) {
        return state;
      }
      if (typeof deleteV1 !== 'function') {
        safeDiagnose('DELETE_UNAVAILABLE');
        return publish({
          ...state,
          status: 'error',
          snapshot: null,
          errorCode: 'DELETE_UNAVAILABLE'
        });
      }
      const requestGeneration = ++generation;
      publish({ ...state, status: 'loading', snapshot: null, errorCode: null });
      try {
        await deleteV1(unit);
      } catch (error) {
        if (destroyed || requestGeneration !== generation) return state;
        safeDiagnose('DELETE_FAILED', readOwnDataField(error, 'status'));
        return publish({
          ...state,
          status: 'error',
          snapshot: null,
          errorCode: 'DELETE_FAILED'
        });
      }
      if (destroyed || requestGeneration !== generation) return state;
      return await load();
    }

    function destroy() {
      if (destroyed) return;
      generation += 1;
      destroyed = true;
      state = deepFreeze({
        status: 'locked',
        range: null,
        snapshot: null,
        errorCode: null,
        opened: false,
        unlocked: false
      });
      host.replaceChildren?.();
    }

    renderer(host, state, { deleteUnit });
    return deepFreeze({
      getState: () => state,
      setRange,
      open,
      close,
      unlock,
      lock,
      logout: lock,
      reload: load,
      deleteUnit,
      destroy
    });
  }

  if (root.AppModules === undefined) root.AppModules = {};
  if (!isRecord(root.AppModules)) throw new TypeError('AppModules must be an object');
  if (root.AppModules.doctor === undefined) root.AppModules.doctor = {};
  if (!isRecord(root.AppModules.doctor)) {
    throw new TypeError('AppModules.doctor must be an object');
  }
  if ('activityConsumerView' in root.AppModules.doctor) {
    throw new Error('AppModules.doctor.activityConsumerView is already registered');
  }
  Object.defineProperty(root.AppModules.doctor, 'activityConsumerView', {
    value: deepFreeze({ create, render }),
    enumerable: true,
    writable: false,
    configurable: false
  });
})(typeof window !== 'undefined' ? window : globalThis);

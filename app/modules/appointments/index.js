'use strict';
/**
 * MODULE: appointments/index.js
 * Description: Termin-Panel mit Supabase-Anbindung (CRUD + Übersicht + Assistant-Snapshot)
 * Notes:
 *  - Nutzt appointments_v2 (Phase 4.2). Fällt bei fehlender Config auf lokale Anzeige zurück.
 *  - Exponiert getUpcoming() für Assistant-Header.
 */
(function initAppointmentsModule(global) {
  global.AppModules = global.AppModules || {};
  const appModules = global.AppModules;
  const doc = global.document;
  const diag = appModules.diag || global.diag || null;
  const feedbackApi = appModules.feedback || global.AppModules?.feedback || null;
  const log = (msg) => diag?.add?.(`[appointments] ${msg}`);

  const getSupabaseApi = () => appModules.supabase || {};

  const ensureLocalDb = async (reason) => {
    const init = global?.initDB;
    if (typeof init !== 'function') return;
    try {
      await init();
    } catch (err) {
      diag?.add?.(`[appointments] initDB failed (${reason || 'unknown'}) ${err?.message || err}`);
    }
  };

  const selectors = {
    panel: '#hubAppointmentsPanel',
    form: '#appointmentsForm',
    title: '#apptTitle',
    date: '#apptDate',
    time: '#apptTime',
    location: '#apptLocation',
    notes: '#apptNotes',
    repeat: '#apptRepeatRule',
    overview: '#appointmentsOverview',
    overviewSubtitle: '#appointmentsOverviewSubtitle',
    doneSubtitle: '#appointmentsDoneSubtitle',
    columns: '#appointmentsColumns',
    doneColumns: '#appointmentsDoneColumns',
  };

  const state = {
    items: [],
    syncing: false,
    loaded: false,
    syncPromise: null,
  };

  let refs = null;
  let initialized = false;
  const notifyChange = (reason = 'update') => {
    if (!doc) return;
    try {
      const evt = new CustomEvent('appointments:changed', { detail: { reason } });
      doc.dispatchEvent(evt);
    } catch (_) {
      // ignore
    }
  };

  const ensureRefs = () => {
    if (refs) return refs;
    const panel = doc?.querySelector(selectors.panel);
    if (!panel) return null;
        refs = {
      panel,
      form: panel.querySelector(selectors.form),
      title: panel.querySelector(selectors.title),
      date: panel.querySelector(selectors.date),
      time: panel.querySelector(selectors.time),
      location: panel.querySelector(selectors.location),
      notes: panel.querySelector(selectors.notes),
      repeat: panel.querySelector(selectors.repeat),
      overview: panel.querySelector(selectors.overview),
      overviewSubtitle: panel.querySelector(selectors.overviewSubtitle),
      doneSubtitle: panel.querySelector(selectors.doneSubtitle),
      columns: panel.querySelector(selectors.columns),
      doneColumns: panel.querySelector(selectors.doneColumns),
    };
    return refs;
  };

  const sanitize = (value = '') => String(value ?? '').trim();
  const pad2 = (num) => String(num).padStart(2, '0');
  const escapeHtml = (value = '') => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
  const repeatLabels = {
    monthly: 'Monatlich',
    annual: 'J\u00e4hrlich',
  };

  const toDate = (dateStr, timeStr) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    if (timeStr) {
      const [h = 0, m = 0] = timeStr.split(':').map((val) => Number(val) || 0);
      date.setHours(h, m, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  const toIsoUtc = (dateStr, timeStr) => toDate(dateStr, timeStr).toISOString();

  const normalizeAppointment = (row) => {
    if (!row) return null;
    const start = row.start_at ? new Date(row.start_at) : null;
    const localDate = start
      ? new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      : (row.date || '');
    const localTime = start ? `${pad2(start.getHours())}:${pad2(start.getMinutes())}` : (row.time || '');
    return {
      id: row.id,
      title: row.title || 'Unbenannter Termin',
      start_at: row.start_at || null,
      date: localDate,
      time: localTime,
      location: row.location || '',
      notes: row.notes || '',
      status: row.status || 'scheduled',
      repeatRule: row.repeat_rule || row.repeatRule || 'none',
      meta: row.meta || null,
    };
  };

  const formatWeekday = (date) => {
    try {
      const label = new Intl.DateTimeFormat('de-AT', { weekday: 'short' })
        .format(date)
        .replace(/\s+/g, '');
      return label.endsWith('.') ? label : `${label}.`;
    } catch (_) {
      return '';
    }
  };

  const formatDateDisplay = (iso, { includeWeekday = true } = {}) => {
    if (!iso) return '--';
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) {
      return iso;
    }
    const datePart = `${pad2(dt.getDate())}.${pad2(dt.getMonth() + 1)}.${dt.getFullYear()}`;
    if (!includeWeekday) return datePart;
    const weekday = formatWeekday(dt);
    return weekday ? `${weekday}, ${datePart}` : datePart;
  };

  const renderOverview = () => {
    if (!refs?.columns || !refs?.doneColumns) return;
    refs.columns.innerHTML = '';
    refs.doneColumns.innerHTML = '';
    const openItems = state.items.filter((item) => item.status !== 'done');
    const doneItems = state.items.filter((item) => item.status === 'done');
    const buildCard = (appt, { isNext = false } = {}) => {
      const isDone = appt.status === 'done';
      const metaParts = [`${formatDateDisplay(appt.start_at)} - ${appt.time || '--:--'}`];
      const repeatLabel = repeatLabels[appt.repeatRule] || '';
      if (repeatLabel) {
        metaParts.push(`Wiederholung: ${repeatLabel}`);
      }
      const detailLines = [
        appt.location ? `<p class="appointments-detail muted small">${escapeHtml(appt.location)}</p>` : '',
        appt.notes ? `<p class="appointments-detail muted small">${escapeHtml(appt.notes)}</p>` : '',
      ].filter(Boolean).join('');
      const card = doc.createElement('article');
      card.className = `appointments-card${isDone ? ' is-done' : ''}${isNext ? ' is-next' : ''}`;
      card.dataset.id = appt.id;
      card.innerHTML = `
        <header class="appointments-card-header">
          <strong class="appointments-title">${escapeHtml(appt.title)}</strong>
        </header>
        <div class="appointments-meta appointments-time">${escapeHtml(metaParts.join(' - '))}</div>
        ${detailLines}
        <div class="appointments-actions" role="group" aria-label="Terminaktionen">
          <button class="btn primary small appointments-action-primary" data-action="toggle" type="button">
            ${isDone ? 'Zur&uuml;cksetzen' : 'Erledigt'}
          </button>
          <button class="btn ghost small appointments-action-secondary" data-action="delete" type="button">Löschen</button>
        </div>
      `;
      return card;
    };

    openItems.forEach((appt, index) => {
      refs.columns.appendChild(buildCard(appt, { isNext: index === 0 }));
    });

    doneItems.forEach((appt) => {
      refs.doneColumns.appendChild(buildCard(appt));
    });

    updateSubtitle();
  };

  const updateSubtitle = () => {
    if (!refs?.overviewSubtitle || !refs?.doneSubtitle) return;
    if (state.syncing && !state.loaded) {
      refs.overviewSubtitle.textContent = 'Termine werden geladen';
      refs.doneSubtitle.textContent = 'Termine werden geladen';
      return;
    }
    const openItems = state.items.filter((item) => item.status !== 'done');
    const doneCount = state.items.filter((item) => item.status === 'done').length;
    const nextItem = computeUpcomingFromState(1)[0] || null;
    const countText = `${openItems.length} offen - ${state.items.length} gesamt`;
    const nextText = nextItem
      ? `Nächster: ${formatDateDisplay(nextItem.start_at)} - ${nextItem.time || '--:--'}`
      : '';
    refs.overviewSubtitle.textContent = openItems.length
      ? [countText, nextText].filter(Boolean).join(' | ')
      : (state.items.length ? 'Keine offenen Termine' : 'Noch keine Termine');
    refs.doneSubtitle.textContent = doneCount
      ? `${doneCount} erledigte Termine`
      : 'Noch keine erledigten Termine.';
  };

  const setFormDisabled = (flag) => {
    if (!refs?.form) return;
    refs.form.querySelectorAll('input, textarea, select, button').forEach((node) => {
      node.disabled = !!flag;
    });
    refs.panel?.classList.toggle('is-loading', !!flag);
  };

  const requireSupabaseClient = async () => {
    const api = getSupabaseApi();
    const ensure = api?.ensureSupabaseClient;
    if (typeof ensure !== 'function') throw new Error('Supabase-Konfiguration fehlt');
    const client = await ensure();
    if (!client) throw new Error('Supabase Client nicht verfügbar');
    return client;
  };

  const syncAppointments = async ({ reason = 'manual' } = {}) => {
    if (state.syncing) return state.syncPromise;
    state.syncing = true;
    setFormDisabled(true);
    updateSubtitle();
    const promise = (async () => {
      await ensureLocalDb(reason);
      try {
        const client = await requireSupabaseClient();
        const { data, error } = await client
          .from('appointments_v2')
          .select('id,title,start_at,location,notes,status,repeat_rule,meta')
          .order('start_at', { ascending: true });
        if (error) throw error;
        state.items = Array.isArray(data) ? data.map(normalizeAppointment).filter(Boolean) : [];
        state.loaded = true;
        renderOverview();
        log?.(`sync ok reason=${reason} items=${state.items.length}`);
        notifyChange('sync');
      } catch (err) {
        diag?.add?.(`[appointments] sync failed (${reason}) ${err.message || err}`);
        if (refs?.overviewSubtitle) refs.overviewSubtitle.textContent = 'Termine konnten nicht geladen werden.';
        if (refs?.doneSubtitle) refs.doneSubtitle.textContent = 'Termine konnten nicht geladen werden.';
      } finally {
        state.syncing = false;
        state.syncPromise = null;
        setFormDisabled(false);
      }
    })();
    state.syncPromise = promise;
    return promise;
  };

  const requireUserId = async () => {
    const api = getSupabaseApi();
    const fn = api?.getUserId;
    if (typeof fn !== 'function') throw new Error('Supabase userId fehlt');
    const uid = await fn();
    if (!uid) throw new Error('Kein Supabase-User angemeldet');
    return uid;
  };

  const insertAppointmentRemote = async (payload) => {
    const client = await requireSupabaseClient();
    const userId = await requireUserId();
    const { data, error } = await client
      .from('appointments_v2')
      .insert({ ...payload, user_id: userId })
      .select('id,title,start_at,location,notes,status,repeat_rule,meta')
      .single();
    if (error) throw error;
    return normalizeAppointment(data);
  };

  const updateAppointmentRemote = async (id, patch) => {
    const client = await requireSupabaseClient();
    const { data, error } = await client
      .from('appointments_v2')
      .update(patch)
      .eq('id', id)
      .select('id,title,start_at,location,notes,status,repeat_rule,meta')
      .single();
    if (error) throw error;
    return normalizeAppointment(data);
  };

  const deleteAppointmentRemote = async (id) => {
    const client = await requireSupabaseClient();
    const { error } = await client.from('appointments_v2').delete().eq('id', id);
    if (error) throw error;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!refs) return;
    const title = sanitize(refs.title?.value);
    const date = refs.date?.value;
    if (refs?.form && !refs.form.reportValidity()) {
      return;
    }
    const iso = toIsoUtc(date, refs.time?.value);
    const payload = {
      title,
      start_at: iso,
      location: sanitize(refs.location?.value),
      notes: sanitize(refs.notes?.value),
      repeat_rule: refs.repeat?.value || 'none',
    };
    try {
      const panel = refs?.panel || null;
      const saveBtn = refs?.form?.querySelector('button[type="submit"]') || null;
      saveFeedback?.start({ button: saveBtn, panel });
      setFormDisabled(true);
      const inserted = await insertAppointmentRemote(payload);
      if (inserted) {
        state.items.push(inserted);
        state.items.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
        renderOverview();
        refs.form?.reset();
        if (refs.repeat) refs.repeat.value = 'none';
        log?.(`saved ${inserted.title}`);
        notifyChange('insert');
        feedbackApi?.feedback?.('appointments:save', { intent: true, source: 'user' });
        saveFeedback?.ok({ button: saveBtn, panel, successText: '&#x2705; Termin gespeichert' });
      }
    } catch (err) {
      diag?.add?.(`[appointments] save failed ${err.message || err}`);
      saveFeedback?.error({
        button: refs?.form?.querySelector('button[type="submit"]') || null,
        message: 'Termin konnte nicht gespeichert werden.'
      });
    } finally {
      setFormDisabled(false);
    }
  };

  const handleCardAction = async (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action !== 'delete' && action !== 'toggle') return;
    const card = btn.closest('.appointments-card');
    if (!card) return;
    const id = card.dataset.id;
    const idx = state.items.findIndex((item) => item.id === id);
    if (idx === -1) return;
    const panel = refs?.panel || null;
    btn.disabled = true;
    try {
      if (action === 'delete') {
        await deleteAppointmentRemote(id);
        state.items.splice(idx, 1);
        notifyChange('delete');
        feedbackApi?.feedback?.('appointments:delete', { intent: true, source: 'user' });
        saveFeedback?.ok({ button: btn, panel, successText: '&#x2705; Termin gel&ouml;scht' });
      } else if (action === 'toggle') {
        const nextStatus = state.items[idx].status === 'done' ? 'scheduled' : 'done';
        const updated = await updateAppointmentRemote(id, { status: nextStatus });
        if (updated) {
          state.items[idx] = updated;
          notifyChange('toggle');
          feedbackApi?.feedback?.('appointments:toggle', { intent: true, source: 'user' });
          saveFeedback?.ok({
            button: btn,
            panel,
            successText: nextStatus === 'done' ? '&#x2705; Termin erledigt' : '&#x2705; Termin reaktiviert'
          });
        }
      }
      renderOverview();
    } catch (err) {
      diag?.add?.(`[appointments] action ${action} failed ${err.message || err}`);
      saveFeedback?.error({
        button: btn,
        message: action === 'delete'
          ? 'Termin konnte nicht gelöscht werden.'
          : 'Termin konnte nicht aktualisiert werden.'
      });
    } finally {
      btn.disabled = false;
    }
  };

  const computeUpcomingFromState = (limit = 2) => {
    const now = Date.now();
    return state.items
      .filter((item) => item.status !== 'done')
      .map((item) => ({
        ...item,
        timestamp: item.start_at ? new Date(item.start_at).getTime() : toDate(item.date, item.time).getTime(),
      }))
      .filter((item) => !Number.isNaN(item.timestamp) && item.timestamp >= now)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        title: item.title,
        start_at: item.start_at || null,
        date: item.date,
        time: item.time,
        location: item.location,
        repeatRule: item.repeatRule,
        status: item.status,
      }));
  };

  const getUpcoming = async (limit = 2, { reason = 'assistant' } = {}) => {
    if (!state.loaded && !state.syncing) {
      await syncAppointments({ reason });
    }
    return computeUpcomingFromState(limit);
  };

  const init = () => {
    if (initialized) return;
    const panelRefs = ensureRefs();
    if (!panelRefs) return;
    const tabHost = panelRefs.panel.querySelector('.hub-appointments-tabs');
    const tabButtons = panelRefs.panel.querySelectorAll('[data-appointments-tab]');
    const tabPanels = panelRefs.panel.querySelectorAll('[data-appointments-panel]');
    let activeTab = 'overview';
    const setActiveTab = (tab) => {
      activeTab = tab;
      tabButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-appointments-tab') === tab;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      tabPanels.forEach((panel) => {
        const isActive = panel.getAttribute('data-appointments-panel') === tab;
        panel.classList.toggle('is-active', isActive);
        if (isActive) {
          panel.hidden = false;
          panel.removeAttribute('aria-hidden');
        } else {
          panel.hidden = true;
          panel.setAttribute('aria-hidden', 'true');
        }
      });
    };
    if (tabHost && tabButtons.length && tabPanels.length) {
      tabHost.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-appointments-tab]');
        if (!btn) return;
        const next = btn.getAttribute('data-appointments-tab');
        if (!next || next === activeTab) return;
        setActiveTab(next);
      });
      setActiveTab(activeTab);
    }
    panelRefs.form?.addEventListener('submit', handleSubmit);
    panelRefs.columns?.addEventListener('click', handleCardAction);
    panelRefs.doneColumns?.addEventListener('click', handleCardAction);
    initialized = true;
    log?.('module initialised');
    syncAppointments({ reason: 'init' });
    doc.addEventListener(
      'supabase:ready',
      () => {
        syncAppointments({ reason: 'supabase-ready' });
      },
      { once: true }
    );
  };

  appModules.appointments = {
    init,
    refresh: renderOverview,
    getUpcoming,
    sync: syncAppointments,
    getAll: () => state.items.slice(),
  };

  if (doc?.readyState === 'complete' || doc?.readyState === 'interactive') {
    init();
  } else {
    doc?.addEventListener('DOMContentLoaded', init, { once: true });
  }
})(window);








'use strict';

(function(global){
  global.AppModules = global.AppModules || {};

  const getSupabaseApi = () => global.AppModules?.supabase || {};

  const escapeAttr = (value = '') =>
    String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch] || ch));

  const formatMonthLabel = (value) => {
    if (!value) return 'Monat unbekannt';
    const parseDate = (iso) => {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    let candidate = parseDate(value);
    if (!candidate && value.length <= 7) {
      candidate = parseDate(`${value}-01T00:00:00Z`);
    }
    if (!candidate) return value;
    try {
      return candidate.toLocaleDateString('de-AT', { month: 'long', year: 'numeric' });
    } catch (_) {
      return value;
    }
  };

  const formatReportDateTime = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '-';
      return d.toLocaleString('de-AT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return '-';
    }
  };

  const markdownToHtml = (text = '') => {
    let html = escapeAttr(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return html;
  };

  const formatReportNarrative = (text) => {
    const raw = (text || '').trim();
    if (!raw) return '<p class="report-empty">Kein Berichtstext vorhanden.</p>';
    const lines = raw.split(/\r?\n/);
    const blocks = [];
    let bulletBuffer = [];

    const flushBullets = () => {
      if (!bulletBuffer.length) return;
      const items = bulletBuffer.map((entry) => `<li>${markdownToHtml(entry)}</li>`).join('');
      blocks.push(`<ul>${items}</ul>`);
      bulletBuffer = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushBullets();
        return;
      }
      if (trimmed.startsWith('- ')) {
        bulletBuffer.push(trimmed.slice(2));
      } else {
        flushBullets();
        blocks.push(`<p>${markdownToHtml(trimmed)}</p>`);
      }
    });
    flushBullets();
    return blocks.join('');
  };

  const reportFlags = (report) => {
    const flags = report?.payload?.meta?.flags;
    if (!Array.isArray(flags)) return [];
    return flags.filter((flag) => typeof flag === 'string' && flag.trim());
  };

  const renderMonthlyReportCard = (report, fmtDateDE) => {
    const subtype = report.subtype || report.reportType || 'monthly_report';
    const isRangeReport = subtype === 'range_report';
    const periodFrom = report.period?.from || report.day || '';
    const periodTo = report.period?.to || report.day || '';
    const monthLabel = formatMonthLabel(report.reportMonth || report.day || '');
    const createdLabel = formatReportDateTime(report.reportCreatedAt || report.ts);
    const summaryRaw = (report.summary || '').trim();
    const summaryText = isRangeReport ? '' : (summaryRaw || 'Kein Summary verfügbar.');
    const flags = reportFlags(report);
    const badgeHtml = flags
      .map((flag) => `<span class="report-flag">${escapeAttr(flag)}</span>`)
      .join('');
    const summaryHtml = summaryText
      ? `<div class="doctor-report-summary">${escapeAttr(summaryText)}${badgeHtml}</div>`
      : badgeHtml
        ? `<div class="doctor-report-summary">${badgeHtml}</div>`
        : '';
    const textHtml = formatReportNarrative(report.text);
    const monthTag = isRangeReport ? '' : report.reportMonth || '';
    const title = isRangeReport
      ? 'Arzt-Bericht - Zeitraum'
      : `Monatsbericht - ${monthLabel || 'Unbekannter Monat'}`;
    const subtitle = `Zeitraum: ${periodFrom || '-'} bis ${periodTo || '-'}`;
    return `
<article class="doctor-report-card" data-report-id="${escapeAttr(report.id || '')}" data-report-month="${escapeAttr(monthTag)}" data-report-type="${escapeAttr(subtype)}" data-report-from="${escapeAttr(periodFrom)}" data-report-to="${escapeAttr(periodTo)}">
  <div class="doctor-report-head">
    <div class="doctor-report-period">
      <strong>${escapeAttr(title)}</strong>
      <span>${escapeAttr(subtitle)}</span>
    </div>
    <div class="doctor-report-meta">Erstellt ${escapeAttr(createdLabel)}</div>
  </div>
  ${summaryHtml}
  <div class="doctor-report-body">${textHtml}</div>
  <div class="doctor-report-actions">
    <button class="btn ghost" type="button" data-report-action="regenerate">Neu erstellen</button>
    <button class="btn ghost" type="button" data-report-action="delete">Löschen</button>
  </div>
</article>`;
  };

  const renderMonthlyReportsSection = (panel, reports, fmtDateDE, { error, emptyLabel } = {}) => {
    if (!panel) return;
    if (error) {
      panel.innerHTML = '<div class="small u-doctor-placeholder">Monatsberichte konnten nicht geladen werden.</div>';
      return;
    }
    if (!reports?.length) {
      panel.innerHTML = `<div class="small u-doctor-placeholder">${emptyLabel || 'Noch keine Berichte vorhanden.'}</div>`;
      return;
    }
    const monthlyReports = reports.filter((report) => (report.subtype || report.payload?.subtype) !== 'range_report');
    const rangeReports = reports.filter((report) => (report.subtype || report.payload?.subtype) === 'range_report');
    const sections = [];

    if (monthlyReports.length) {
      const grouped = new Map();
      monthlyReports.forEach((report) => {
        const key = report.reportMonth || report.day?.slice(0, 7) || 'unknown';
        const entry = grouped.get(key) || [];
        entry.push(report);
        grouped.set(key, entry);
      });
      const sortedKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));
      const groupsHtml = sortedKeys
        .map((key, index) => {
          const groupReports = grouped.get(key) || [];
          const monthLabel = formatMonthLabel(key);
          const countText = `${groupReports.length} Bericht${groupReports.length === 1 ? '' : 'e'}`;
          const cards = groupReports.map((report) => renderMonthlyReportCard(report, fmtDateDE)).join('');
          const openAttr = '';
          return `
<details class="doctor-report-group"${openAttr}>
  <summary class="doctor-report-group-head">
    <span>${escapeAttr(monthLabel)}</span>
    <span class="small">${countText}</span>
  </summary>
  <div class="doctor-report-group-body">
    ${cards}
  </div>
</details>`;
        })
        .join('');
      sections.push(`<div class="doctor-report-group-list">${groupsHtml}</div>`);
    }

    if (rangeReports.length) {
      const cards = rangeReports.map((report) => renderMonthlyReportCard(report, fmtDateDE)).join('');
      const countText = `${rangeReports.length} Bericht${rangeReports.length === 1 ? '' : 'e'}`;
      const label = monthlyReports.length ? '<div class="doctor-report-group-label">Arzt-Berichte</div>' : '';
      const rangeGroup = `
<details class="doctor-report-group" open>
  <summary class="doctor-report-group-head">
    <span>Arzt-Berichte</span>
    <span class="small">${countText}</span>
  </summary>
  <div class="doctor-report-group-body">
    ${cards}
  </div>
</details>`;
      sections.push(`${label}${rangeGroup}`);
    }

    panel.innerHTML = sections.join('');
  };

  const filterReportsByType = (reports, filter) => {
    if (!Array.isArray(reports)) return [];
    if (!filter || filter === 'all') return reports;
    return reports.filter((report) => (report.subtype || report.payload?.subtype) === filter);
  };

  const getFilterEmptyLabel = (filter) => {
    if (filter === 'monthly_report') return 'Keine Monatsberichte vorhanden.';
    if (filter === 'range_report') return 'Keine Arzt-Berichte vorhanden.';
    return 'Noch keine Berichte vorhanden.';
  };

  const resolveMonthlyReportFetcher = () => {
    const api = getSupabaseApi();
    return typeof api.fetchSystemCommentsBySubtype === 'function'
      ? api.fetchSystemCommentsBySubtype
      : null;
  };

  const resolveMonthlyReportGenerator = () => {
    const api = getSupabaseApi();
    if (typeof api.generateMonthlyReportRemote === 'function') {
      return api.generateMonthlyReportRemote;
    }
    return null;
  };

  const resolveMonthlyReportDeleter = () => {
    const api = getSupabaseApi();
    return typeof api.deleteSystemComment === 'function'
      ? api.deleteSystemComment
      : null;
  };

  const resolveReportInboxClearer = () => {
    const api = getSupabaseApi();
    return typeof api.deleteSystemCommentsBySubtypes === 'function'
      ? api.deleteSystemCommentsBySubtypes
      : null;
  };

  const loadMonthlyReports = async (from, to) => {
    const fetcher = resolveMonthlyReportFetcher();
    if (typeof fetcher !== 'function') return [];
    const [monthly, rangeReports] = await Promise.all([
      fetcher({
        from,
        to,
        subtype: 'monthly_report',
        order: 'day.desc'
      }),
      fetcher({
        from,
        to,
        subtype: 'range_report',
        order: 'day.desc'
      })
    ]);
    const merged = [
      ...(Array.isArray(monthly) ? monthly : []),
      ...(Array.isArray(rangeReports) ? rangeReports : [])
    ];
    merged.sort((a, b) => {
      const dayCmp = (b.day || '').localeCompare(a.day || '');
      if (dayCmp !== 0) return dayCmp;
      return (b.ts || '').localeCompare(a.ts || '');
    });
    return merged;
  };

  const generateMonthlyReport = async (options = {}, deps = {}) => {
    const {
      toast,
      logError,
      refreshAfter
    } = deps;
    const doc = global.document;
    const defaultFrom = doc?.getElementById('from')?.value || '';
    const defaultTo = doc?.getElementById('to')?.value || '';
    const month = options.month || null;
    const reportType = options.report_type || 'monthly_report';
    const from = reportType === 'range_report' ? (options.from || defaultFrom) : null;
    const to = reportType === 'range_report' ? (options.to || defaultTo) : null;
    if (reportType === 'range_report' && (!from || !to)) {
      const err = new Error('Bitte Zeitraum wählen.');
      if (typeof logError === 'function') {
        logError('range report missing range', err);
      }
      throw err;
    }
    const generator = resolveMonthlyReportGenerator();
    if (typeof generator !== 'function') {
      const err = new Error('monthly report generator missing');
      if (typeof logError === 'function') {
        logError('monthly report generator unavailable', err);
      }
      throw err;
    }
    let result;
    try {
      result = await generator({ from, to, month, report_type: reportType });
    } catch (err) {
      if (typeof logError === 'function') {
        logError('monthly report edge call failed', err);
      }
      throw err;
    }
    const reportLabel = reportType === 'range_report' ? 'Arzt-Bericht' : 'Monatsbericht';
    if (typeof toast === 'function') {
      toast(`${reportLabel} ausgelöst - Inbox aktualisiert.`);
    }
    if (typeof refreshAfter === 'function') {
      await refreshAfter({ from: from || '', to: to || '' });
    }
    return result;
  };

  const handleReportCardAction = async (event, deps = {}) => {
    const {
      toast,
      uiError,
      logError,
      confirmFn,
      refreshAfter
    } = deps;
    const btn = event.target.closest('[data-report-action]');
    if (!btn) return;
    const card = btn.closest('.doctor-report-card');
    if (!card) return;
    const reportId = card.getAttribute('data-report-id');
    if (!reportId) return;
    const action = btn.getAttribute('data-report-action');
    const reportType = card.getAttribute('data-report-type') || 'monthly_report';
    const reportLabel = reportType === 'range_report' ? 'Arzt-Bericht' : 'Monatsbericht';
    const confirmSafe = typeof confirmFn === 'function' ? confirmFn : global.confirm;
    if (action === 'delete') {
      const deleter = resolveMonthlyReportDeleter();
      if (typeof deleter !== 'function') {
        if (typeof toast === 'function') {
          toast('Löschen momentan nicht möglich.');
        }
        return;
      }
      if (!confirmSafe?.(`Diesen ${reportLabel} endgültig löschen?`)) return;
      btn.disabled = true;
      try {
        await deleter({ id: reportId });
        if (typeof toast === 'function') {
          toast(`${reportLabel} gelöscht.`);
        }
        if (typeof refreshAfter === 'function') {
          await refreshAfter();
        }
      } catch (err) {
        if (typeof logError === 'function') {
          logError('delete monthly report failed', err);
        }
        if (typeof uiError === 'function') {
          uiError?.('Löschen fehlgeschlagen.');
        }
      } finally {
        btn.disabled = false;
      }
    } else if (action === 'regenerate') {
      const monthTag = card.getAttribute('data-report-month') || null;
      const periodFrom = card.getAttribute('data-report-from') || '';
      const periodTo = card.getAttribute('data-report-to') || '';
      btn.disabled = true;
      try {
        if (reportType === 'range_report') {
          await generateMonthlyReport({
            report_type: 'range_report',
            from: periodFrom,
            to: periodTo
          }, { toast, logError, refreshAfter });
        } else {
          await generateMonthlyReport(monthTag ? { month: monthTag } : {}, { toast, logError, refreshAfter });
        }
      } catch (err) {
        if (typeof logError === 'function') {
          logError('regenerate monthly report failed', err);
        }
        if (typeof uiError === 'function') {
          uiError?.(reportType === 'range_report'
            ? 'Neuer Arzt-Bericht fehlgeschlagen.'
            : 'Neuer Monatsbericht fehlgeschlagen.');
        }
      } finally {
        btn.disabled = false;
      }
    }
  };

  const clearReportInbox = async (deps = {}) => {
    const {
      subtypes = ['monthly_report', 'range_report'],
      toast,
      uiError,
      logError,
      confirmFn,
      refreshAfter
    } = deps;
    const confirmSafe = typeof confirmFn === 'function' ? confirmFn : global.confirm;
    const clearer = resolveReportInboxClearer();
    if (typeof clearer !== 'function') {
      if (typeof toast === 'function') {
        toast('Inbox kann derzeit nicht gelöscht werden.');
      }
      return;
    }
    if (!confirmSafe?.('Inbox wirklich komplett löschen?')) return;
    try {
      await clearer({ subtypes });
      if (typeof toast === 'function') {
        toast('Inbox geleert.');
      }
      if (typeof refreshAfter === 'function') {
        await refreshAfter();
      }
    } catch (err) {
      if (typeof logError === 'function') {
        logError('inbox clear failed', err);
      }
      if (typeof uiError === 'function') {
        uiError?.('Inbox konnte nicht gelöscht werden.');
      }
    }
  };

  global.AppModules.reports = {
    renderMonthlyReportsSection,
    filterReportsByType,
    getFilterEmptyLabel,
    renderMonthlyReportCard,
    formatReportDateTime,
    formatMonthLabel,
    formatReportNarrative,
    reportFlags,
    markdownToHtml,
    loadMonthlyReports,
    generateMonthlyReport,
    handleReportCardAction,
    clearReportInbox
  };
})(window);

'use strict';

(function(global){
  global.AppModules = global.AppModules || {};

  const REPORT_PAGE_SIZE = 20;
  const MAX_REPORT_PAGES = 50;
  const MAX_RANGE_DAYS = 400;
  const ISO_DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const getSupabaseApi = () => global.AppModules?.supabase || {};

  const escapeAttr = (value = '') =>
    String(value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch] || ch));

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

  const pickReportGeneratedAtRaw = (report) => report?.reportGeneratedAt
    || report?.payload?.generated_at
    || report?.reportCreatedAt
    || report?.payload?.created_at
    || report?.ts
    || '';

  const renderPrimaryRangeReport = (panel, report) => {
    if (!panel) return;
    if (!report) {
      panel.innerHTML = '';
      return;
    }
    const periodFrom = report.period?.from || report.payload?.period?.from || '';
    const periodTo = report.period?.to || report.payload?.period?.to || '';
    const createdLabel = formatReportDateTime(pickReportGeneratedAtRaw(report));
    const summaryText = (report.summary || '').trim();
    const flags = reportFlags(report);
    const flagHtml = flags
      .map((flag) => `<span class="report-flag">${escapeAttr(flag)}</span>`)
      .join('');
    const summaryHtml = summaryText || flagHtml
      ? `<div class="doctor-report-summary">${escapeAttr(summaryText)}${flagHtml}</div>`
      : '';

    panel.innerHTML = `
<article class="doctor-primary-report-document" data-report-id="${escapeAttr(report.id || '')}">
  <div class="doctor-report-head">
    <div class="doctor-report-period">
      <strong>Arzt-Bericht</strong>
      <span>Zeitraum: ${escapeAttr(periodFrom || '-')} bis ${escapeAttr(periodTo || '-')}</span>
    </div>
    <div class="doctor-report-meta">Erstellt ${escapeAttr(createdLabel)}</div>
  </div>
  ${summaryHtml}
  <div class="doctor-report-body">${formatReportNarrative(report.text)}</div>
</article>`;
  };

  const isValidIsoDay = (value) => {
    if (!ISO_DAY_RE.test(value || '')) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day;
  };

  const getViennaToday = (now = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Vienna',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value])
    );
    return `${values.year}-${values.month}-${values.day}`;
  };

  const validateRangeReportInput = ({
    from,
    to,
    today = getViennaToday()
  } = {}) => {
    const errors = [];
    if (!isValidIsoDay(from)) errors.push('from_invalid');
    if (!isValidIsoDay(to)) errors.push('to_invalid');
    if (isValidIsoDay(from) && isValidIsoDay(to) && from > to) {
      errors.push('range_reversed');
    }
    if (isValidIsoDay(to) && isValidIsoDay(today) && to > today) {
      errors.push('future_to');
    }
    if (isValidIsoDay(from) && isValidIsoDay(to) && from <= to) {
      const spanDays =
        (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`))
          / 86_400_000 + 1;
      if (spanDays > MAX_RANGE_DAYS) errors.push('range_too_long');
    }
    return {
      valid: errors.length === 0,
      errors,
      from: from || '',
      to: to || '',
      today
    };
  };

  const parseReportGeneratedAt = (report) => {
    const value = pickReportGeneratedAtRaw(report);
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
  };

  const validatePrimaryRangeReport = (report, today = getViennaToday()) => {
    const subtype = report?.subtype || report?.reportType || report?.payload?.subtype;
    const period = report?.period || report?.payload?.period;
    const from = period?.from || '';
    const to = period?.to || '';
    const text = typeof report?.text === 'string'
      ? report.text.trim()
      : typeof report?.payload?.text === 'string'
        ? report.payload.text.trim()
        : '';
    const reasons = [];

    if (subtype !== 'range_report') reasons.push('wrong_subtype');
    if (!isValidIsoDay(from) || !isValidIsoDay(to) || from > to) {
      reasons.push('invalid_period');
    }
    if (isValidIsoDay(to) && isValidIsoDay(today) && to > today) {
      reasons.push('future_period');
    }
    if (!isValidIsoDay(to) || report?.day !== to) reasons.push('anchor_mismatch');
    if (!text) reasons.push('empty_text');

    return {
      valid: reasons.length === 0,
      reasons
    };
  };

  const compareStringsDesc = (left, right) =>
    left === right ? 0 : left > right ? -1 : 1;

  const comparePrimaryRangeReports = (left, right) => {
    const leftTo = left?.period?.to || left?.payload?.period?.to || '';
    const rightTo = right?.period?.to || right?.payload?.period?.to || '';
    const periodOrder = compareStringsDesc(leftTo, rightTo);
    if (periodOrder !== 0) return periodOrder;

    const leftGeneratedAt = parseReportGeneratedAt(left);
    const rightGeneratedAt = parseReportGeneratedAt(right);
    if (leftGeneratedAt !== rightGeneratedAt) {
      if (leftGeneratedAt === null) return 1;
      if (rightGeneratedAt === null) return -1;
      return rightGeneratedAt - leftGeneratedAt;
    }
    return compareStringsDesc(String(left?.id || ''), String(right?.id || ''));
  };

  const resolveRangeReportFetcher = () => {
    const api = getSupabaseApi();
    return typeof api.fetchSystemCommentsBySubtype === 'function'
      ? api.fetchSystemCommentsBySubtype
      : null;
  };

  const resolveDoctorReportGenerator = () => {
    const api = getSupabaseApi();
    if (typeof api.generateDoctorReportRemote === 'function') {
      return api.generateDoctorReportRemote;
    }
    return null;
  };

  const loadLatestRangeReport = async ({ now = new Date(), pageSize = REPORT_PAGE_SIZE } = {}) => {
    const fetcher = resolveRangeReportFetcher();
    if (typeof fetcher !== 'function') {
      throw new Error('range report fetcher missing');
    }
    const safePageSize = Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : REPORT_PAGE_SIZE;
    const today = getViennaToday(now);
    const candidates = [];
    let offset = 0;
    let discardedCount = 0;
    let rowsRead = 0;
    let pagesRead = 0;
    let previousPageSignature = null;

    while (pagesRead < MAX_REPORT_PAGES) {
      const page = await fetcher({
        subtype: 'range_report',
        order: 'day.desc,ts.desc,id.desc',
        limit: safePageSize,
        offset
      });
      if (!Array.isArray(page)) {
        throw new Error('range report fetch returned invalid data');
      }
      const pageSignature = page
        .map((report) => String(report?.id || ''))
        .join('|');
      if (pagesRead > 0 && pageSignature === previousPageSignature) {
        throw new Error('range report pagination made no progress');
      }
      previousPageSignature = pageSignature;
      pagesRead += 1;
      rowsRead += page.length;

      page.forEach((report) => {
        const validation = validatePrimaryRangeReport(report, today);
        if (validation.valid) {
          candidates.push(report);
        } else {
          discardedCount += 1;
        }
      });

      candidates.sort(comparePrimaryRangeReports);
      const latest = candidates[0] || null;
      const sourceExhausted = page.length < safePageSize;
      const lastDay = page.at(-1)?.day || '';
      const latestDay = latest?.period?.to || latest?.payload?.period?.to || '';
      const latestIsFixed = Boolean(latestDay && lastDay && lastDay < latestDay);

      if (sourceExhausted || latestIsFixed) {
        return {
          status: latest ? 'success' : rowsRead ? 'invalid' : 'empty',
          report: latest,
          discardedCount,
          rowsRead,
          pagesRead,
          sourceExhausted
        };
      }
      offset += safePageSize;
    }
    throw new Error('range report pagination limit exceeded');
  };

  const generateDoctorReport = async (options = {}, deps = {}) => {
    const {
      toast,
      logError,
      refreshAfter
    } = deps;
    const from = options.from || '';
    const to = options.to || '';
    const validation = validateRangeReportInput({
      from,
      to,
      today: options.today || getViennaToday()
    });
    if (!validation.valid) {
      const err = new Error('Ungültiger Berichtszeitraum.');
      err.validation = validation;
      if (typeof logError === 'function') {
        logError('range report invalid range', err);
      }
      throw err;
    }
    const generator = resolveDoctorReportGenerator();
    if (typeof generator !== 'function') {
      const err = new Error('doctor report generator missing');
      if (typeof logError === 'function') {
        logError('doctor report generator unavailable', err);
      }
      throw err;
    }
    let result;
    try {
      result = await generator({ from, to });
    } catch (err) {
      if (typeof logError === 'function') {
        logError('doctor report edge call failed', err);
      }
      throw err;
    }
    if (typeof toast === 'function') {
      toast('Arzt-Bericht erstellt.');
    }
    if (typeof refreshAfter === 'function') {
      try {
        await refreshAfter({ from, to });
      } catch (err) {
        if (typeof logError === 'function') {
          logError('doctor report refresh failed', err);
        }
      }
    }
    return result;
  };

  global.AppModules.reports = {
    renderPrimaryRangeReport,
    formatReportDateTime,
    formatReportNarrative,
    reportFlags,
    markdownToHtml,
    loadLatestRangeReport,
    validatePrimaryRangeReport,
    validateRangeReportInput,
    comparePrimaryRangeReports,
    getViennaToday,
    generateDoctorReport
  };
})(window);

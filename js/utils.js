function getDays(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function getDOW(y, m, d) {
  return new Date(y, m, d).getDay();
}

function isApplicable(h, y, m, d) {
  if (!h.freq || h.freq === 'daily') return true;
  const dow = getDOW(y, m, d);
  if (h.freq === 'weekdays') return dow >= 1 && dow <= 5;
  if (h.freq === 'weekends') return dow === 0 || dow === 6;
  if (h.freq === 'custom')   return h.customDays && h.customDays.includes(dow);
  return true;
}

function isChecked(hid, d) {
  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return !!checks[`${hid}__${dateStr}`];
}

function getCat(id) {
  return categories.find(c => c.id === id) || null;
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type === 'error' ? ' error-toast' : '') + ' show';
  setTimeout(() => t.classList.remove('show'), 2500);
}

function showLoading(v) {
  document.getElementById('loadingOverlay').classList.toggle('hidden', !v);
}

function setSyncState(state) {
  const dot = document.getElementById('syncDot');
  const txt = document.getElementById('syncText');
  const ind = document.getElementById('syncIndicator');
  dot.className = 'sync-dot ' + state;
  txt.textContent = state === 'saving' ? 'Saving…'
                  : state === 'saved'  ? 'Saved'
                  : state === 'error'  ? 'Error saving' : '';
  ind.classList.add('show');
  if (state === 'saved' || state === 'error') {
    setTimeout(() => ind.classList.remove('show'), 2000);
  }
}

function showTab(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const idx = { dashboard: 0, journal: 1, settings: 2, heatmap: 3, about: 4 }[name];
  if (idx !== undefined) document.querySelectorAll('.tab')[idx].classList.add('active');
  if (name === 'journal')  renderJournal();
  if (name === 'settings') renderSettings();
  if (name === 'heatmap') { renderHeatmap(); renderBestDay(); renderAchievements(); }
}

function nextQuote() {
  quoteIdx = (quoteIdx + 1) % QUOTES.length;
  document.getElementById('quoteText').textContent = QUOTES[quoteIdx];
  const btn = document.querySelector('.quote-refresh');
  btn.style.transform = 'rotate(180deg)';
  setTimeout(() => btn.style.transform = '', 400);
}

function exportCSV() {
  const days = getDays(viewYear, viewMonth);
  let csv = `Habit,Category,Frequency,`;
  for (let d = 1; d <= days; d++) csv += `Day ${d},`;
  csv += `Total,Completion%\n`;
  habits.forEach(h => {
    const cat = getCat(h.category_id);
    csv += `"${h.name}","${cat ? cat.name : ''}","${h.freq || 'daily'}",`;
    let done = 0, app = 0;
    for (let d = 1; d <= days; d++) {
      if (isApplicable(h, viewYear, viewMonth, d)) {
        app++;
        const c = isChecked(h.id, d) ? 1 : 0;
        csv += `${c},`;
        if (c) done++;
      } else {
        csv += `N/A,`;
      }
    }
    csv += `${done},${app > 0 ? Math.round((done / app) * 100) : 0}%\n`;
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `habits-${MONTHS[viewMonth]}-${viewYear}.csv`;
  a.click();
  showToast('CSV exported!');
}

const THEME_ICONS  = { light: '☀️', dark: '🌙', pink: '🌸' };
const THEME_TITLES = { light: 'Switch to Dark mode', dark: 'Switch to Pink mode', pink: 'Switch to Light mode' };

function applyTheme() {
  const mobBtn = document.getElementById('mobThemeBtn');
  const icons = { light: '☀️', dark: '🌙', pink: '🌸' };
  if (mobBtn) mobBtn.textContent = icons[settings.theme||'light'] || '🌙';
  const theme = settings.theme || 'light';

  
  document.body.classList.remove('dark', 'pink');
  if (theme === 'dark') document.body.classList.add('dark');
  if (theme === 'pink') document.body.classList.add('pink');

  
  const btn = document.getElementById('themeBtn') || document.getElementById('darkToggleBtn');
  if (btn) {
    btn.textContent = THEME_ICONS[theme] || '🌙';
    btn.title = THEME_TITLES[theme] || 'Toggle theme';
  }

  
  ['light','dark','pink'].forEach(t => {
    const b = document.getElementById('themeOpt_' + t);
    if (b) b.classList.toggle('active', theme === t);
  });

  
  try { localStorage.setItem('ht_theme', theme); } catch(e) {}
}

function cycleTheme() {
  const order = ['light', 'dark', 'pink'];
  const idx = order.indexOf(settings.theme || 'light');
  settings.theme = order[(idx + 1) % order.length];
  settings.dark = (settings.theme === 'dark');
  applyTheme();
  if (typeof saveSettingsDB === 'function') saveSettingsDB();
}

function toggleDark() {
  cycleTheme();
}

function applyDarkMode() { applyTheme(); }

function setTheme(theme) {
  settings.theme = theme;
  settings.dark = (theme === 'dark');
  applyTheme();
  if (typeof saveSettingsDB === 'function') saveSettingsDB();
}

function toggleCompletionFields() {
  const type = document.getElementById('habitCompletionType')?.value;
  const row  = document.getElementById('completionTargetRow');
  if (row) row.style.display = (type === 'count' || type === 'duration') ? 'block' : 'none';
}

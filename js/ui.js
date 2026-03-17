function toggleDark() {
  settings.dark = !settings.dark;
  applyDarkMode();
  dbSaveSettings();
}

function applyDarkMode() {
  document.body.classList.toggle('dark', !!settings.dark);

  const btn = document.getElementById('darkToggleBtn');
  if (btn) btn.textContent = settings.dark ? '☀️' : '🌙';

  const toggle = document.getElementById('darkToggle');
  if (toggle) toggle.classList.toggle('on', !!settings.dark);
}

function showTab(name) {
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');

  
  const tabIndex = { dashboard: 0, journal: 1, settings: 2 }[name];
  const tabs     = document.querySelectorAll('.tab');
  if (tabs[tabIndex]) tabs[tabIndex].classList.add('active');

  
  if (name === 'journal')  renderJournal();
  if (name === 'settings') renderSettings();
}

let _syncHideTimer = null;

function setSyncState(state) {
  const dot       = document.getElementById('syncDot');
  const txt       = document.getElementById('syncText');
  const indicator = document.getElementById('syncIndicator');
  if (!dot || !txt || !indicator) return;

  dot.className = 'sync-dot ' + state;
  txt.textContent =
    state === 'saving' ? 'Saving…'  :
    state === 'saved'  ? 'Saved'    :
    state === 'error'  ? 'Error saving' : '';

  indicator.classList.add('show');

  clearTimeout(_syncHideTimer);
  if (state === 'saved' || state === 'error') {
    _syncHideTimer = setTimeout(() => indicator.classList.remove('show'), 2000);
  }
}

let _toastTimer = null;

function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;

  clearTimeout(_toastTimer);
  t.textContent = msg;
  t.className   = 'toast' + (type === 'error' ? ' error-toast' : '') + ' show';
  _toastTimer   = setTimeout(() => t.classList.remove('show'), 2500);
}

function showLoading(visible) {
  const el = document.getElementById('loadingOverlay');
  if (el) el.classList.toggle('hidden', !visible);
}

function nextQuote() {
  quoteIdx = (quoteIdx + 1) % QUOTES.length;
  const el = document.getElementById('quoteText');
  if (el) el.textContent = QUOTES[quoteIdx];

  
  const btn = document.querySelector('.quote-refresh');
  if (btn) {
    btn.style.transform = 'rotate(180deg)';
    setTimeout(() => (btn.style.transform = ''), 400);
  }
}

function initQuote() {
  const el = document.getElementById('quoteText');
  if (el) el.textContent = QUOTES[quoteIdx];
}

function initMonthNav() {
  document.getElementById('prevMonth').onclick = () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderAll();
  };
  document.getElementById('nextMonth').onclick = () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderAll();
  };
}

function initModalBackdrops() {
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.getElementById('noteModal').addEventListener('click', e => {
    if (e.target === document.getElementById('noteModal')) closeNoteModal();
  });
}

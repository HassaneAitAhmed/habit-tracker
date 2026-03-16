(function() {
  const saved = localStorage.getItem('ht_theme');
  if (saved === 'dark') document.body.classList.add('dark');
  if (saved === 'pink') document.body.classList.add('pink');
  const icons = { light: '☀️', dark: '🌙', pink: '🌸' };
  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeBtn') || document.getElementById('darkToggleBtn');
    if (btn && saved) btn.textContent = icons[saved] || '☀️';
  });
})();


document.getElementById('prevMonth').addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderAll();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderAll();
});

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.getElementById('noteModal').addEventListener('click', e => {
  if (e.target === document.getElementById('noteModal')) closeNoteModal();
});

let appInitialized = false;

function showApp(user) {
  if (appInitialized) return;
  appInitialized = true;
  clearTimeout(window._loadingTimeout);
  currentUser = user;

  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appScreen').style.display  = 'block';
  document.getElementById('userEmail').textContent    = user.email;
  document.getElementById('userAvatar').textContent   = user.email[0].toUpperCase();
  document.getElementById('quoteText').textContent    = QUOTES[quoteIdx];

  const obGrid = document.getElementById('obHabitGrid');
  if (obGrid && typeof STARTER_HABITS !== 'undefined') {
    obGrid.innerHTML = STARTER_HABITS.map((h, i) =>
      `<div class="ob-habit" onclick="toggleStarterHabit(this,${i})">
        <span style="font-size:18px">${h.emoji}</span>
        <span>${h.name}</span>
       </div>`
    ).join('');
  }

  if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    const banner = document.getElementById('configBanner');
    if (banner) banner.style.display = 'none';
  }

  if (typeof checkViewMode === 'function') checkViewMode();
  loadAll().catch(err => {
    console.error('[loadAll] Uncaught error:', err);
    showLoading(false);
    showToast('Error loading data. Try refreshing.', 'error');
  });
}

function showAuth() {
  clearTimeout(window._loadingTimeout);
  showLoading(false);
  currentUser    = null;
  appInitialized = false;
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('appScreen').style.display  = 'none';
}

window._loadingTimeout = setTimeout(() => {
  const ol = document.getElementById('loadingOverlay');
  if (!ol.classList.contains('hidden')) {
    ol.innerHTML = `
      <div style="text-align:center;padding:32px;max-width:420px;">
        <div style="font-family:var(--font-head);font-size:32px;color:var(--fire);margin-bottom:12px;letter-spacing:.06em">TIMEOUT</div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--ink3);margin-bottom:20px;line-height:2;letter-spacing:.06em">
          Could not connect to Supabase.<br>
          1. Check SUPABASE_URL + SUPABASE_ANON_KEY in js/supabase.js<br>
          2. Make sure your project is not paused<br>
          3. Open DevTools console for details
        </div>
        <button onclick="location.reload()"
          style="background:var(--accent);border:none;color:#000;font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:10px 24px;border-radius:4px;cursor:pointer;">
          Retry
        </button>
      </div>`;
  }
}, 10000);

sb.auth.onAuthStateChange((event, session) => {
  console.log('[Auth] event:', event, '| user:', session?.user?.email || 'none');

  if (event === 'SIGNED_OUT') { showAuth(); return; }

  if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'PASSWORD_RECOVERY') {
    if (session?.user) showApp(session.user); else showAuth();
    return;
  }

  if (event === 'SIGNED_IN' && session?.user) {
    setTimeout(() => { if (!appInitialized) showApp(session.user); }, 300);
  }
});

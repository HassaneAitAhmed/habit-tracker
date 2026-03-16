
function switchAuthTab(mode) {
  authMode = mode;
  document.querySelectorAll('.auth-tab').forEach((t, i) =>
    t.classList.toggle('active', (mode === 'login' && i === 0) || (mode === 'signup' && i === 1))
  );
  document.getElementById('loginForm').style.display  = mode === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = mode === 'signup' ? 'block' : 'none';
  hideAuthMessages();
}

function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('authMsg').style.display = 'none';
}

function showAuthMsg(msg) {
  const el = document.getElementById('authMsg');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('authError').style.display = 'none';
}

function hideAuthMessages() {
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authMsg').style.display   = 'none';
}

async function signIn() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showAuthError('Please fill in all fields.'); return; }
  const btn = document.querySelector('#loginForm .auth-submit');
  btn.disabled = true; btn.textContent = 'Signing in…';
  const { error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false; btn.textContent = 'Sign In';
  if (error) showAuthError(error.message);
}

async function signUp() {
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm  = document.getElementById('signupConfirm').value;
  if (!email || !password)   { showAuthError('Please fill in all fields.'); return; }
  if (password.length < 6)   { showAuthError('Password must be at least 6 characters.'); return; }
  if (password !== confirm)   { showAuthError('Passwords do not match.'); return; }
  const btn = document.querySelector('#signupForm .auth-submit');
  btn.disabled = true; btn.textContent = 'Creating account…';
  const { error } = await sb.auth.signUp({ email, password });
  btn.disabled = false; btn.textContent = 'Create Account';
  if (error) showAuthError(error.message);
  else showAuthMsg('Account created! Check your email to confirm, then sign in.');
}

async function signOut() {
  if (!confirm('Sign out?')) return;
  await sb.auth.signOut();
  location.reload();
}

async function forceSignOut() {
  await sb.auth.signOut();
  Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
  location.reload();
}

function getShareToken() {
  
  return currentUser ? btoa(currentUser.id).replace(/=/g,'') : null;
}

function openAccountability() {
  const el = document.getElementById('accountabilityModal');
  if (!el) return;
  const token = getShareToken();
  const url = window.location.origin + window.location.pathname + '?view=' + token;
  document.getElementById('shareLink').value = url;
  el.classList.add('open');
}

function closeAccountability() {
  document.getElementById('accountabilityModal').classList.remove('open');
}

function copyShareLink() {
  const input = document.getElementById('shareLink');
  input.select();
  navigator.clipboard.writeText(input.value).then(() => {
    showToast('Link copied! Send it to your accountability partner ✅');
  }).catch(() => {
    document.execCommand('copy');
    showToast('Link copied!');
  });
}

function checkViewMode() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('view');
  if (!token) return false;
  
  const banner = document.createElement('div');
  banner.style.cssText = 'background:var(--check-bg);border-bottom:1px solid var(--check);padding:10px 28px;font-family:var(--font-mono);font-size:11px;color:var(--check);letter-spacing:.06em;text-align:center;';
  banner.textContent = '👁 You are viewing a shared read-only habit tracker';
  document.body.insertBefore(banner, document.body.firstChild);
  
  setTimeout(() => {
    document.querySelectorAll('.check-box, .add-btn, .delete-btn, .note-btn, .mood-dot').forEach(el => {
      el.style.pointerEvents = 'none'; el.style.opacity = '.6';
    });
    document.querySelector('.user-pill')?.style.setProperty('display','none');
  }, 1500);
  return true;
}

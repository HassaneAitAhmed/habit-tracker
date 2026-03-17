function showConfirm(message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = true) {
  return new Promise(resolve => {
    const overlay = document.getElementById('dialogOverlay');
    const msgEl   = document.getElementById('dialogMessage');
    const okBtn   = document.getElementById('dialogOk');
    const cancelBtn = document.getElementById('dialogCancel');
    if (!overlay) { resolve(window.confirm(message)); return; }

    msgEl.textContent      = message;
    okBtn.textContent      = confirmLabel;
    cancelBtn.textContent  = cancelLabel;
    okBtn.className        = 'dialog-btn ' + (danger ? 'danger' : 'primary');
    overlay.classList.add('open');

    const cleanup = () => overlay.classList.remove('open');

    okBtn.onclick = () => { cleanup(); resolve(true); };
    cancelBtn.onclick = () => { cleanup(); resolve(false); };
  });
}

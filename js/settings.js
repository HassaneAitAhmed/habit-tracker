
function renderSettings() {
  let ch = '';
  categories.forEach(c => {
    ch += `<div class="cat-row">
      <input type="color" value="${c.color}" onchange="updateCatColor('${c.id}',this.value)"
        style="width:26px;height:26px;border:none;border-radius:50%;cursor:pointer;padding:0;background:none;">
      <input class="cat-name-input" value="${c.name}" onblur="updateCatName('${c.id}',this.value)" maxlength="20">
      <button class="cat-del-btn" onclick="deleteCategory('${c.id}')">✕</button>
    </div>`;
  });
  const catMgr = document.getElementById('catManager');
  if (catMgr) catMgr.innerHTML = ch;

  let hList = '';
  habits.forEach(h => {
    const cat = getCat(h.category_id);
    hList += `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:15px">${h.emoji}</span>
      <div style="flex:1">
        <div style="font-size:12px">${h.name}</div>
        ${cat ? `<div style="font-size:10px;color:var(--ink3)">📂 ${cat.name}</div>` : ''}
      </div>
      <button class="export-btn" onclick="openModal('${h.id}')" style="font-size:10px;padding:3px 9px;">Edit</button>
    </div>`;
  });
  const hsl = document.getElementById('habitSettingsList');
  if (hsl) hsl.innerHTML = hList || '<div style="color:var(--ink3);font-size:12px;padding:8px 0;">No habits yet.</div>';

  const rt = document.getElementById('reminderToggle');
  const rtr = document.getElementById('reminderTimeRow');
  const rti = document.getElementById('reminderTime');
  if (rt) rt.classList.toggle('on', !!settings.reminder);
  if (rtr) rtr.style.display = settings.reminder ? 'flex' : 'none';
  if (rti) rti.value = settings.reminderTime || '20:00';
  if (currentUser) {
    const se = document.getElementById('settingsEmail');
    if (se) se.textContent = currentUser.email;
  }
  ['light','dark','pink'].forEach(t => {
    const b = document.getElementById('themeOpt_' + t);
    if (b) b.classList.toggle('active', (settings.theme || 'light') === t);
  });
}

function toggleReminder() {
  if (!settings.reminder) {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          settings.reminder = true;
          saveSettingsDB();
          scheduleReminder();
          renderSettings();
          showToast('Reminder enabled!');
        } else {
          showToast('Notification permission denied.');
        }
      });
    } else {
      showToast('Notifications not supported.');
    }
  } else {
    settings.reminder = false;
    saveSettingsDB();
    renderSettings();
    showToast('Reminder disabled.');
  }
}

async function saveReminderSettings() {
  settings.reminderTime = document.getElementById('reminderTime').value;
  await saveSettingsDB();
  scheduleReminder();
  showToast('Reminder time saved!');
}

function scheduleReminder() {
  if (!settings.reminder) return;
  const [h, m] = (settings.reminderTime || '20:00').split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= new Date()) target.setDate(target.getDate() + 1);
  clearTimeout(window._rt);
  window._rt = setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('🌟 Habit Tracker', { body: 'Time to check your habits for today!' });
    }
    scheduleReminder();
  }, target - new Date());
}

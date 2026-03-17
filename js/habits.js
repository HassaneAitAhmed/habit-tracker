async function toggleCheck(habitId, day) {
  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const key = `${habitId}__${dateStr}`;
  setSyncState('saving');
  if (checks[key]) {
    const { error } = await sb.from('habit_checks').delete().eq('id', checks[key]);
    if (error) { setSyncState('error'); return; }
    delete checks[key];
  } else {
    const { data, error } = await sb.from('habit_checks')
      .insert({ user_id: currentUser.id, habit_id: habitId, checked_on: dateStr })
      .select().single();
    if (error) { setSyncState('error'); return; }
    checks[key] = data.id;
  }
  setSyncState('saved');
  
  const justChecked = !!checks[key];
  renderTable(); renderStats(); renderCharts(); renderSidebar();
  if (typeof renderAchievements === 'function') renderAchievements();
  
  setTimeout(() => {
    const boxes = document.querySelectorAll('.check-box.checked');
    if (justChecked && boxes.length > 0 && typeof popCheckbox === 'function') {
      
      const allBoxes = document.querySelectorAll('.day-cell .check-box');
      allBoxes.forEach(b => {
        if (b.onclick?.toString().includes(String(day) + ')')) {
          popCheckbox(b);
          if (typeof burstConfetti === 'function') burstConfetti(b);
        }
      });
    }
  }, 30);
}

function openModal(id) {
  editingHabitId = id || null;
  const h = id ? habits.find(x => x.id === id) : null;
  document.getElementById('modalTitle').textContent     = id ? 'Edit Habit' : 'New Habit';
  document.getElementById('modalSaveBtn').textContent   = id ? 'Save Changes' : 'Add Habit';
  selectedEmoji = h ? h.emoji : EMOJIS[0];
  selectedColor = h ? h.color : COLORS[0];
  document.getElementById('habitNameInput').value   = h ? h.name : '';
  document.getElementById('habitWeekGoal').value    = h ? h.weekGoal : 5;
  document.getElementById('emojiPicker').innerHTML  = EMOJIS.map(e =>
    `<div class="emoji-opt ${e === selectedEmoji ? 'selected' : ''}" onclick="selectEmoji('${e}')">${e}</div>`
  ).join('');
  document.getElementById('colorPicker').innerHTML  = COLORS.map(c =>
    `<div class="color-opt ${c === selectedColor ? 'selected' : ''}" style="background:${c}" onclick="selectColor('${c}')"></div>`
  ).join('');
  const catSel = document.getElementById('habitCatSelect');
  catSel.innerHTML = `<option value="">No Category</option>` +
    categories.map(c => `<option value="${c.id}" ${h && h.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
  document.getElementById('habitFreqSelect').value = h ? h.freq : 'daily';
  const ct = document.getElementById('habitCompletionType');
  if (ct) ct.value = h?.completion_type || 'check';
  const ctr = document.getElementById('habitCompletionTarget');
  if (ctr) ctr.value = h?.completion_target || 1;
  const cu = document.getElementById('habitCompletionUnit');
  if (cu) cu.value = h?.completion_unit || '';
  if (typeof toggleCompletionFields === 'function') toggleCompletionFields();
  toggleCustomDays();
  if (h && h.customDays) h.customDays.forEach(d => { const cb = document.getElementById('cd' + d); if (cb) cb.checked = true; });
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('habitNameInput').focus(), 80);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function selectEmoji(e) {
  selectedEmoji = e;
  document.querySelectorAll('.emoji-opt').forEach(el => el.classList.toggle('selected', el.textContent === e));
}

function selectColor(c) {
  selectedColor = c;
  document.querySelectorAll('.color-opt').forEach(el => el.classList.toggle('selected', el.style.background === c));
}

function toggleCustomDays() {
  document.getElementById('customDaysRow').style.display =
    document.getElementById('habitFreqSelect').value === 'custom' ? 'block' : 'none';
}

async function saveHabit() {
  const name = document.getElementById('habitNameInput').value.trim();
  if (!name) { showToast('Please enter a habit name'); return; }
  const freq = document.getElementById('habitFreqSelect').value;
  const customDays = freq === 'custom'
    ? [0, 1, 2, 3, 4, 5, 6].filter(d => document.getElementById('cd' + d)?.checked)
    : [];
  const payload = {
    user_id:     currentUser.id,
    name,
    emoji:       selectedEmoji,
    color:       selectedColor,
    category_id: document.getElementById('habitCatSelect').value || null,
    freq,
    custom_days: customDays,
    week_goal:        parseInt(document.getElementById('habitWeekGoal').value) || 5,
    completion_type:  document.getElementById('habitCompletionType')?.value  || 'check',
    completion_unit:  document.getElementById('habitCompletionUnit')?.value  || '',
    completion_target: parseInt(document.getElementById('habitCompletionTarget')?.value) || 1,
  };
  setSyncState('saving');
  if (editingHabitId) {
    const { error } = await sb.from('habits').update(payload).eq('id', editingHabitId);
    if (error) { setSyncState('error'); showToast('Error saving', 'error'); return; }
    const idx = habits.findIndex(h => h.id === editingHabitId);
    if (idx >= 0) habits[idx] = { ...habits[idx], ...payload, customDays, weekGoal: payload.week_goal, completion_type: payload.completion_type, completion_unit: payload.completion_unit, completion_target: payload.completion_target };
  } else {
    const { data, error } = await sb.from('habits').insert(payload).select().single();
    if (error) { setSyncState('error'); showToast('Error saving', 'error'); return; }
    habits.push({ ...data, customDays, weekGoal: data.week_goal, completion_type: data.completion_type||'check', completion_unit: data.completion_unit||'', completion_target: data.completion_target||1 });
  }
  setSyncState('saved');
  closeModal();
  if (typeof isMobile === 'function' && isMobile()) {
    mobAfterSave();
  } else {
    renderAll();
  }
  showToast(editingHabitId ? 'Habit updated!' : `"${name}" added!`);
}

async function deleteHabit(id) {
  const ok = await showConfirm('Delete this habit and all its data?', 'Delete', 'Cancel', true);
  if (!ok) return;
  setSyncState('saving');
  const { error } = await sb.from('habits').delete().eq('id', id);
  if (error) { setSyncState('error'); return; }
  habits = habits.filter(h => h.id !== id);
  Object.keys(checks).forEach(k => { if (k.startsWith(id + '__')) delete checks[k]; });
  setSyncState('saved');
  if (typeof isMobile === 'function' && isMobile()) {
    renderMobToday();
    if (mobileTab==='settings') renderMobSettings();
  } else {
    renderAll();
  }
}

function openNoteModal(hid) {
  noteModalHabitId = hid;
  const h   = habits.find(x => x.id === hid);
  const key = `habit__${hid}__${viewYear}__${viewMonth}`;
  document.getElementById('noteModalTitle').textContent = `Note: ${h ? h.name : ''}`;
  document.getElementById('noteModalText').value = notes[key] ? notes[key].content : '';
  document.getElementById('noteModal').classList.add('open');
}

function closeNoteModal() {
  document.getElementById('noteModal').classList.remove('open');
}

async function saveNoteModal() {
  const text = document.getElementById('noteModalText').value.trim();
  const key  = `habit__${noteModalHabitId}__${viewYear}__${viewMonth}`;
  setSyncState('saving');
  if (text) {
    const { data, error } = await sb.from('habit_notes')
      .upsert({ user_id: currentUser.id, habit_id: noteModalHabitId, year: viewYear, month: viewMonth, content: text },
               { onConflict: 'habit_id,year,month' })
      .select().single();
    if (error) { setSyncState('error'); return; }
    notes[key] = data;
  } else {
    if (notes[key]) await sb.from('habit_notes').delete().eq('id', notes[key].id);
    delete notes[key];
  }
  setSyncState('saved');
  renderTable();
  closeNoteModal();
  showToast('Note saved!');
}

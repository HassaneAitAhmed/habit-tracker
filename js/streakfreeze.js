let freezes = {};  

async function loadFreezes() {
  if (!currentUser) return;
  const now = new Date();
  const { data, error } = await sb.from('streak_freezes')
    .select('*')
    .eq('user_id', currentUser.id)
    .gte('year', now.getFullYear())
    .eq('month', now.getMonth());
  if (error || !data) return;
  data.forEach(f => {
    freezes[`${f.habit_id}__${f.year}__${f.month}`] = f;
  });
}

function getFreezeKey(habitId) {
  return `${habitId}__${today.getFullYear()}__${today.getMonth()}`;
}

function hasFreeze(habitId) {
  return !!freezes[getFreezeKey(habitId)];
}

function freezeUsed(habitId) {
  const f = freezes[getFreezeKey(habitId)];
  return f && f.used_on != null;
}

function isFrozenDay(habitId, year, month, day) {
  const key = `${habitId}__${year}__${month}`;
  const f = freezes[key];
  if (!f || !f.used_on) return false;
  const usedDate = new Date(f.used_on);
  return usedDate.getFullYear() === year &&
         usedDate.getMonth()    === month &&
         usedDate.getDate()     === day;
}

async function activateFreeze(habitId) {
  if (freezeUsed(habitId)) { showToast('Freeze already used this month'); return; }
  const year  = today.getFullYear();
  const month = today.getMonth();
  const key   = getFreezeKey(habitId);

  
  let missedDay = null;
  for (let d = today.getDate() - 1; d >= 1; d--) {
    if (isApplicable({ id: habitId, freq: 'daily', customDays: [] }, year, month, d)) {
      if (!isChecked(habitId, d)) { missedDay = d; break; }
      break; 
    }
  }
  if (!missedDay) { showToast('No missed day to protect'); return; }

  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(missedDay).padStart(2,'0')}`;

  if (!freezes[key]) {
    
    const { data, error } = await sb.from('streak_freezes')
      .insert({ user_id: currentUser.id, habit_id: habitId, year, month, used_on: dateStr })
      .select().single();
    if (error) { showToast('Error activating freeze', 'error'); return; }
    freezes[key] = data;
  } else {
    
    await sb.from('streak_freezes')
      .update({ used_on: dateStr })
      .eq('id', freezes[key].id);
    freezes[key].used_on = dateStr;
  }
  renderAll();
  showToast(`🧊 Streak freeze activated! Day ${missedDay} is protected.`);
}

async function grantMonthlyFreezes() {
  
  if (!currentUser || !habits.length) return;
  const year  = today.getFullYear();
  const month = today.getMonth();
  const inserts = habits
    .filter(h => !freezes[`${h.id}__${year}__${month}`])
    .map(h => ({ user_id: currentUser.id, habit_id: h.id, year, month, used_on: null }));
  if (!inserts.length) return;
  const { data, error } = await sb.from('streak_freezes')
    .upsert(inserts, { onConflict: 'user_id,habit_id,year,month' })
    .select();
  if (!error && data) {
    data.forEach(f => { freezes[`${f.habit_id}__${f.year}__${f.month}`] = f; });
  }
}

function renderFreezeShield(habitId) {
  const key = getFreezeKey(habitId);
  const f = freezes[key];
  if (!f) return '';
  if (f.used_on) {
    return `<span class="freeze-badge used" title="Freeze used this month">🧊</span>`;
  }
  return `<span class="freeze-badge available" onclick="activateFreeze('${habitId}')" title="Activate streak freeze">🛡️</span>`;
}

function getStreakWithFreeze(habitId, year, month, upToDay) {
  let streak = 0;
  for (let d = upToDay; d >= 1; d--) {
    const h = habits.find(x => x.id === habitId);
    if (!h) break;
    if (!isApplicable(h, year, month, d)) continue;
    if (isChecked(habitId, d) || isFrozenDay(habitId, year, month, d)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms on "${label}"`)), ms)
    )
  ]);
}

async function safeQuery(label, queryPromise) {
  try {
    const result = await withTimeout(queryPromise, 8000, label);
    if (result.error) {
      console.error(`[loadAll] FAIL "${label}":`, result.error.message, '| code:', result.error.code || '—');
    } else {
      console.log(`[loadAll] OK "${label}":`, Array.isArray(result.data) ? result.data.length + ' rows' : 'ok');
    }
    return result;
  } catch (err) {
    console.error(`[loadAll] EXCEPTION "${label}":`, err.message);
    return { data: null, error: { message: err.message, code: 'TIMEOUT' } };
  }
}

async function loadAll() {
  showLoading(true);
  const uid = currentUser.id;
  console.log('[loadAll] Fetching data for user:', uid);

  const now  = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const to   = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().slice(0, 10);

  const [habR, catR, chkR, moodR, noteR, jnoteR, setR] = await Promise.all([
    safeQuery('habits',        sb.from('habits').select('*').eq('user_id', uid).eq('archived', false).order('sort_order')),
    safeQuery('categories',    sb.from('categories').select('*').eq('user_id', uid).order('created_at')),
    safeQuery('habit_checks',  sb.from('habit_checks').select('*').eq('user_id', uid).gte('checked_on', from).lte('checked_on', to)),
    safeQuery('mood_logs',     sb.from('mood_logs').select('*').eq('user_id', uid).gte('log_date', from).lte('log_date', to)),
    safeQuery('habit_notes',   sb.from('habit_notes').select('*').eq('user_id', uid)),
    safeQuery('journal_notes', sb.from('journal_notes').select('*').eq('user_id', uid).order('note_date', { ascending: false }).limit(50)),
    safeQuery('user_settings', sb.from('user_settings').select('*').eq('user_id', uid).maybeSingle()),
  ]);

  const criticalErrors = [['habits', habR]].filter(([, r]) => r.error);
  if (criticalErrors.length > 0) {
    const [name, r] = criticalErrors[0];
    const isMissing = r.error.code === '42P01' || r.error.message.includes('does not exist');
    const ol = document.getElementById('loadingOverlay');
    ol.classList.remove('hidden');
    ol.innerHTML = `<div style="text-align:center;padding:32px;max-width:460px;font-family:Syne,sans-serif;">
      <div style="font-size:36px;margin-bottom:14px;">${isMissing ? '🗄️' : '⚠️'}</div>
      <div style="font-size:20px;margin-bottom:10px;font-weight:600;color:#1C1A15">
        ${isMissing ? 'Database tables not found' : 'Failed to load data'}
      </div>
      <div style="font-size:11px;font-family:'DM Mono',monospace;background:#FEF3C7;border:1px solid #FBBF24;border-radius:8px;padding:12px;margin-bottom:14px;text-align:left;line-height:2;color:#92400E;">
        <b>Table:</b> ${name}<br><b>Error:</b> ${r.error.message}<br><b>Code:</b> ${r.error.code || '—'}
      </div>
      ${isMissing ? '<div style="font-size:11px;font-family:DM Mono,monospace;color:#6B6558;margin-bottom:18px;line-height:2;text-align:left;">Run <b>schema.sql</b> in your Supabase SQL Editor, then reload.</div>' : ''}
      <button onclick="location.reload()" style="background:#4A3F2F;border:none;color:#F5F2EC;font-size:12px;padding:10px 24px;border-radius:8px;cursor:pointer;margin-right:8px;">Retry</button>
      <button onclick="forceSignOut()" style="background:none;border:1px solid #D8D2C4;color:#6B6558;font-size:12px;padding:10px 24px;border-radius:8px;cursor:pointer;">Sign Out</button>
    </div>`;
    return;
  }

  habits     = (habR.data  || []).map(h => ({ ...h, customDays: h.custom_days || [], weekGoal: h.week_goal || 5, freq: h.freq || 'daily' }));
  categories = catR.data   || [];
  checks     = {};
  (chkR.data  || []).forEach(c => { checks[`${c.habit_id}__${c.checked_on}`] = c.id; });
  moods      = {};
  (moodR.data || []).forEach(m => { moods[`mood__${m.log_date}`] = m.mood; moods[`motivation__${m.log_date}`] = m.motivation; moods[`_id__${m.log_date}`] = m.id; });
  notes      = {};
  (noteR.data  || []).forEach(n => { notes[`habit__${n.habit_id}__${n.year}__${n.month}`] = n; });
  (jnoteR.data || []).forEach(n => { notes[`day__${n.note_date}`] = n; });
  if (setR.data) settings = { dark: setR.data.dark_mode, theme: setR.data.theme || (setR.data.dark_mode ? 'dark' : 'light'), reminder: setR.data.reminder_on, reminderTime: setR.data.reminder_time || '20:00' };

  console.log('[loadAll] Done. habits:', habits.length, '| checks:', Object.keys(checks).length);
  
  if (typeof loadFreezes     === 'function') await loadFreezes();
  if (typeof grantMonthlyFreezes === 'function') await grantMonthlyFreezes();
  showLoading(false);
  applyDarkMode();
  if (typeof isMobile === 'function' && isMobile()) {
    renderMobileApp();
  } else {
    renderAll();
  }
  if (settings.reminder) scheduleReminder();
}

async function saveSettingsDB() {
  await sb.from('user_settings').upsert(
    { user_id: currentUser.id, dark_mode: settings.dark, theme: settings.theme || 'light', reminder_on: settings.reminder, reminder_time: settings.reminderTime },
    { onConflict: 'user_id' }
  );
}

async function saveMoodDB(logDate, moodVal, motivationVal) {
  setSyncState('saving');
  const existing = moods[`_id__${logDate}`];
  const payload = { user_id: currentUser.id, log_date: logDate, mood: moodVal, motivation: motivationVal };
  let res;
  if (existing) {
    res = await sb.from('mood_logs').update({ mood: moodVal, motivation: motivationVal }).eq('id', existing);
  } else {
    res = await sb.from('mood_logs').upsert(payload, { onConflict: 'user_id,log_date' }).select().single();
  }
  if (res.error) { setSyncState('error'); return; }
  if (!existing && res.data) moods[`_id__${logDate}`] = res.data.id;
  setSyncState('saved');
}

async function deleteAllData() {
  const ok = await showConfirm('Delete ALL habits and data permanently? This cannot be undone.', 'Delete Everything', 'Cancel', true);
  if (!ok) return;
  setSyncState('saving');
  await Promise.all([
    sb.from('habit_checks').delete().eq('user_id', currentUser.id),
    sb.from('habits').delete().eq('user_id', currentUser.id),
    sb.from('categories').delete().eq('user_id', currentUser.id),
    sb.from('mood_logs').delete().eq('user_id', currentUser.id),
    sb.from('journal_notes').delete().eq('user_id', currentUser.id),
    sb.from('habit_notes').delete().eq('user_id', currentUser.id),
  ]);
  habits = []; categories = []; checks = {}; moods = {}; notes = {};
  setSyncState('saved');
  renderAll();
  showToast('All data deleted.');
}

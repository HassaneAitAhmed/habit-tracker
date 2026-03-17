function renderAll() {
  renderMonthLabel();
  renderTable();
  renderStats();
  renderCharts();
  renderMood();
  renderSidebar();
  renderCatFilter();
  renderSettings();
  renderJournal();
  if (typeof renderAchievements === 'function') renderAchievements();
  if (typeof renderMobileToday === 'function') renderMobileToday();
  if (typeof renderBestDay     === 'function') renderBestDay();
  if (typeof renderHeatmap     === 'function') renderHeatmap();
}

function renderMonthLabel() {
  const el = document.getElementById('monthLabel');
  if (el) el.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
}

function renderTable() {
  const days      = getDays(viewYear, viewMonth);
  const todayThis = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayD    = today.getDate();
  const catFilter = document.getElementById('catFilter')?.value || '';
  const filtered  = habits.filter(h => !catFilter || h.category_id === catFilter);

  
  let hd = `<tr><th class="habit-col">My Habits</th>`;
  for (let d = 1; d <= days; d++) {
    const isT = todayThis && d === todayD;
    hd += `<th style="${isT ? 'background:rgba(196,146,74,.18);color:var(--gold);' : ''}">${d}</th>`;
  }
  hd += `<th title="Pomodoro">🍅</th><th>W.Goal</th><th>%</th><th style="min-width:60px">Bar</th></tr>`;
  document.getElementById('habitsHead').innerHTML = hd;

  
  let bd = '';
  filtered.forEach(h => {
    const cat        = getCat(h.category_id);
    const applicable = [];
    for (let d = 1; d <= days; d++) if (isApplicable(h, viewYear, viewMonth, d)) applicable.push(d);
    let done = 0;
    applicable.forEach(d => { if (isChecked(h.id, d)) done++; });
    const pct       = applicable.length > 0 ? Math.round((done / applicable.length) * 100) : 0;
    const freqLabel = h.freq === 'daily' ? '' : h.freq === 'weekdays' ? 'M-F' : h.freq === 'weekends' ? 'S-S' : '⚙';
    const noteKey   = `habit__${h.id}__${viewYear}__${viewMonth}`;
    const hasNote   = !!notes[noteKey];

    let weekDone = [0, 0, 0, 0, 0], weekApp = [0, 0, 0, 0, 0];
    for (let d = 1; d <= days; d++) {
      const w = Math.ceil(d / 7) - 1;
      if (isApplicable(h, viewYear, viewMonth, d)) {
        weekApp[w]++;
        if (isChecked(h.id, d)) weekDone[w]++;
      }
    }
    const wGoalMetCount = weekDone.filter((wd, i) => weekApp[i] > 0 && wd >= (h.weekGoal || 5)).length;
    const totalWeeks    = weekApp.filter(a => a > 0).length;

    bd += `<tr><td class="habit-name-cell">`;
    if (cat) bd += `<span class="cat-dot" style="background:${cat.color}"></span>`;
    bd += `<span class="habit-emoji">${h.emoji}</span>${h.name}`;
    if (freqLabel) bd += `<span class="freq-badge">${freqLabel}</span>`;
    if (h.completion_type && h.completion_type !== 'check') {
      bd += `<span class="qty-badge">${h.completion_target} ${h.completion_unit}</span>`;
    }
    bd += `<button class="note-btn ${hasNote ? 'has-note' : ''}" onclick="openNoteModal('${h.id}')" title="Note">📋</button>`;
    bd += `<button class="delete-btn" onclick="deleteHabit('${h.id}')">✕</button></td>`;
    bd += `<td class="pomo-cell"><button class="pomo-table-btn" onclick="openPomodoro('${h.id}','${h.name.replace(/'/g, '')}')" title="Start Pomodoro">🍅</button></td>`;

    for (let d = 1; d <= days; d++) {
      const isT    = todayThis && d === todayD;
      const na     = !isApplicable(h, viewYear, viewMonth, d);
      const checked = isChecked(h.id, d);
      bd += `<td class="day-cell" style="${isT ? 'background:rgba(196,146,74,.06);' : ''}">`;
      if (na) {
        bd += `<div class="check-box na"></div>`;
      } else {
        const isPast = new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (isPast) {
          bd += `<div class="check-box ${checked ? 'checked past' : 'past'}"
            style="${checked ? `background:${h.color}22;border-color:${h.color};` : ''}opacity:0.45;cursor:default;" title="Past day"></div>`;
        } else {
          bd += `<div class="check-box ${checked ? 'checked' : ''}"
            onclick="toggleCheck('${h.id}',${d})"
            style="${checked ? `background:${h.color}22;border-color:${h.color};` : ''}"></div>`;
        }
      }
      bd += `</td>`;
    }
    bd += `<td class="wgoal-cell"><span class="${wGoalMetCount > 0 ? 'wgoal-met' : ''}">${wGoalMetCount}/${totalWeeks}</span></td>`;
    bd += `<td class="pct-cell">${pct}%</td>`;
    bd += `<td class="mini-bar-cell"><div class="mini-bar-bg"><div class="mini-bar-fill" style="width:${pct}%;background:${h.color || COLORS[0]};"></div></div></td>`;
    bd += `</tr>`;
  });

  if (!filtered.length) {
    bd = `<tr><td colspan="41">
      <div class="empty-state">
        <div class="empty-state-art">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" stroke="var(--border)" stroke-width="2"/>
            <path d="M24 40 L35 51 L56 29" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
          </svg>
        </div>
        <div class="empty-state-title">No habits yet</div>
        <div class="empty-state-sub">Every great routine starts with a single habit.<br>Add your first one above.</div>
        <button class="empty-state-btn" onclick="openModal()">+ Add your first habit</button>
      </div>
    </td></tr>`;
  }
  document.getElementById('habitsBody').innerHTML = bd;
  
  setTimeout(() => {
    document.querySelectorAll('.mini-bar-fill').forEach(el => {
      const w = el.style.width;
      if (typeof animateBar === 'function') animateBar(el, w);
    });
  }, 50);
}

function renderStats() {
  const days      = getDays(viewYear, viewMonth);
  const todayThis = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayD    = todayThis ? today.getDate() : days;
  let goal = 0, done = 0;
  habits.forEach(h => {
    for (let d = 1; d <= days; d++) {
      if (isApplicable(h, viewYear, viewMonth, d)) {
        goal++;
        if (isChecked(h.id, d)) done++;
      }
    }
  });
  const left = Math.max(0, goal - done);
  const pct  = goal > 0 ? Math.round((done / goal) * 100) : 0;
  let td = 0, ta = 0;
  habits.forEach(h => {
    if (isApplicable(h, viewYear, viewMonth, todayD)) {
      ta++;
      if (isChecked(h.id, todayD)) td++;
    }
  });
  const tp = ta > 0 ? Math.round((td / ta) * 100) : 0;

  document.getElementById('statGoal').textContent   = goal;
  document.getElementById('statDone').textContent   = done;
  document.getElementById('statLeft').textContent   = left;
  document.getElementById('donutPct').textContent   = tp + '%';
  document.getElementById('statTodayRate').textContent = `${td}/${ta} today`;

  const circ = 2 * Math.PI * 23;
  document.getElementById('donutCircle').setAttribute('stroke-dashoffset', (circ * (1 - tp / 100)).toFixed(1));
  document.getElementById('overallPct').textContent = pct + '%';
  document.getElementById('sGoal').textContent = goal;
  document.getElementById('sDone').textContent = done;
  document.getElementById('sLeft').textContent = left;
}

function renderCharts() {
  const days      = getDays(viewYear, viewMonth);
  const todayThis = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayD    = today.getDate();

  let dH = '', dL = '';
  for (let d = 1; d <= days; d++) {
    let c = 0, a = 0;
    habits.forEach(h => {
      if (isApplicable(h, viewYear, viewMonth, d)) { a++; if (isChecked(h.id, d)) c++; }
    });
    const bh = Math.max(3, Math.round((a > 0 ? c / a : 0) * 60));
    dH += `<div class="bar ${todayThis && d === todayD ? 'today' : ''}" style="height:${bh}px" title="Day ${d}: ${c}/${a}"></div>`;
    dL += `<div style="flex:1;text-align:center;font-size:8px;font-family:var(--font-mono);color:var(--ink3)">${(d % 5 === 0 || d === 1 || d === days) ? d : ''}</div>`;
  }
  document.getElementById('dailyChart').innerHTML  = dH;
  document.getElementById('dailyLabels').innerHTML = dL;

  const weeks = Math.ceil(days / 7);
  let wH = '', wL = '';
  for (let w = 0; w < weeks; w++) {
    let wd = 0, wa = 0;
    for (let d = w * 7 + 1; d <= Math.min((w + 1) * 7, days); d++) {
      habits.forEach(h => {
        if (isApplicable(h, viewYear, viewMonth, d)) { wa++; if (isChecked(h.id, d)) wd++; }
      });
    }
    wH += `<div class="bar" style="height:${Math.max(3, Math.round((wa > 0 ? wd / wa : 0) * 60))}px" title="W${w + 1}: ${wd}/${wa}"></div>`;
    wL += `<div style="font-family:var(--font-mono);font-size:10px;color:var(--ink3)">W${w + 1}</div>`;
  }
  document.getElementById('weeklyChart').innerHTML = wH;
  document.getElementById('weekLabels').innerHTML  = wL;
}

function renderMood() {
  const days  = getDays(viewYear, viewMonth);
  const types = [['mood', 'Mood'], ['motivation', 'Motivation']];
  let html = '';
  types.forEach(([type, label]) => {
    html += `<div class="mood-row"><div class="mood-label">${label}</div>`;
    for (let d = 1; d <= days; d++) {
      const ds  = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const val = moods[`${type}__${ds}`] || null;
      html += `<div class="mood-dot ${val ? 'selected' : ''}" onclick="cycleMood('${type}','${ds}')">${val || ''}</div>`;
    }
    html += `</div>`;
  });
  document.getElementById('moodRows').innerHTML = html;
}

async function cycleMood(type, dateStr) {
  const curMood = moods[`mood__${dateStr}`] || 0;
  const curMot  = moods[`motivation__${dateStr}`] || 0;
  let nm = curMood, nmot = curMot;
  if (type === 'mood') nm = curMood === 0 ? 5 : curMood >= 10 ? 0 : curMood + 1;
  else nmot = curMot === 0 ? 5 : curMot >= 10 ? 0 : curMot + 1;
  moods[`mood__${dateStr}`]       = nm   || null;
  moods[`motivation__${dateStr}`] = nmot || null;
  if (!nm && !nmot) { delete moods[`mood__${dateStr}`]; delete moods[`motivation__${dateStr}`]; }
  renderMood();
  if (nm || nmot) {
    await saveMoodDB(dateStr, nm || null, nmot || null);
  } else if (moods[`_id__${dateStr}`]) {
    await sb.from('mood_logs').delete().eq('id', moods[`_id__${dateStr}`]);
    delete moods[`_id__${dateStr}`];
  }
}

function renderSidebar() {
  const days      = getDays(viewYear, viewMonth);
  const todayThis = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayD    = todayThis ? today.getDate() : days;

  
  let streak = 0;
  for (let d = todayD; d >= 1; d--) {
    let all = habits.length > 0;
    habits.forEach(h => { if (isApplicable(h, viewYear, viewMonth, d) && !isChecked(h.id, d)) all = false; });
    if (all) streak++; else break;
  }
  document.getElementById('streakNum').textContent = streak;
  document.getElementById('streakMsg').textContent =
    streak >= 14 ? 'Legendary!' : streak >= 7 ? 'Amazing!' : streak >= 3 ? 'Building…' : streak >= 1 ? 'Keep going!' : 'Start today!';

  let sg = '';
  for (let i = 20; i >= 0; i--) {
    const d = todayD - i;
    if (d < 1) { sg += `<div class="streak-cell"></div>`; continue; }
    let dn = 0, ap = 0;
    habits.forEach(h => { if (isApplicable(h, viewYear, viewMonth, d)) { ap++; if (isChecked(h.id, d)) dn++; } });
    const p = ap > 0 ? dn / ap : 0;
    sg += `<div class="streak-cell ${p >= 1 ? 'done' : p >= 0.5 ? 'partial' : ''}" title="Day ${d}: ${Math.round(p * 100)}%"></div>`;
  }
  document.getElementById('streakGrid').innerHTML = sg;

  
  const rows = habits.map(h => {
    let dn = 0, ap = 0;
    for (let d = 1; d <= days; d++) if (isApplicable(h, viewYear, viewMonth, d)) { ap++; if (isChecked(h.id, d)) dn++; }
    return { h, pct: ap > 0 ? Math.round((dn / ap) * 100) : 0 };
  }).sort((a, b) => b.pct - a.pct);

  document.getElementById('analysisList').innerHTML = rows.map(r =>
    `<div class="analysis-row">
      <div class="an-name">${r.h.emoji} ${r.h.name}</div>
      <div class="an-bar-bg"><div class="an-bar-fill" style="width:${r.pct}%;background:${r.h.color || COLORS[0]};"></div></div>
      <div class="an-pct">${r.pct}%</div>
    </div>`
  ).join('') || '<div style="color:var(--ink3);font-size:11px">No habits</div>';

  document.getElementById('topHabits').innerHTML = rows.slice(0, 10).map((r, i) =>
    `<div class="top-habit-row">
      <div class="top-num">${i + 1}</div>
      <div class="top-name">${r.h.emoji} ${r.h.name}</div>
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink3)">${r.pct}%</div>
    </div>`
  ).join('') || '<div style="color:var(--ink3);font-size:11px">No habits</div>';
}

function renderMobileToday() {
  const el = document.getElementById('mobileTodayList');
  const dateEl = document.getElementById('mobileTodayDate');
  const progEl = document.getElementById('mobileTodayProgress');
  if (!el) return;

  const todayD = today.getDate();
  const todayM = today.getMonth();
  const todayY = today.getFullYear();
  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayName = DAY_NAMES[today.getDay()];

  if (dateEl) dateEl.textContent = dayName + ', ' + MONTHS[todayM] + ' ' + todayD;

  
  const applicable = habits.filter(h => isApplicable(h, todayY, todayM, todayD));
  let done = 0;
  applicable.forEach(h => { if (isChecked(h.id, todayD)) done++; });

  if (progEl) {
    const pct = applicable.length > 0 ? Math.round((done / applicable.length) * 100) : 0;
    progEl.textContent = done + ' / ' + applicable.length + ' completed · ' + pct + '%';
  }

  if (!applicable.length) {
    el.innerHTML = '<div class="mobile-empty">No habits for today. <span onclick="openModal()" style="color:var(--accent);cursor:pointer">Add one →</span></div>';
    return;
  }

  let html = '';
  applicable.forEach(h => {
    const checked = isChecked(h.id, todayD);
    const cat = getCat(h.category_id);
    const streak = getMobileStreak(h);
    html += `<div class="mobile-habit-row ${checked ? 'checked' : ''}">
      <div class="mobile-habit-left" onclick="toggleCheckMobile('${h.id}', ${todayD})" style="flex:1;display:flex;align-items:center;gap:12px;">
        <div class="mobile-check ${checked ? 'checked' : ''}">
          ${checked ? '<svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 5.5,10.5 12,3" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
        </div>
        <span class="mobile-habit-emoji">${h.emoji}</span>
        <div style="min-width:0;">
          <div class="mobile-habit-name ${checked ? 'done' : ''}">${h.name}</div>
          ${cat ? '<div class="mobile-habit-cat">' + cat.name + '</div>' : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <button class="mobile-pomo-btn" onclick="event.stopPropagation();openPomodoro('${h.id}','${h.name.replace(/'/g,'')}')" title="Start Pomodoro">🍅</button>
        <div class="mobile-habit-streak" style="background:${h.color || 'var(--accent)'}20;color:${h.color || 'var(--accent)'}">
          ${streak}d
        </div>
      </div>
    </div>`;
  });
  el.innerHTML = html;
}

function getMobileStreak(h) {
  const todayD = today.getDate();
  const todayM = today.getMonth();
  const todayY = today.getFullYear();
  let streak = 0;
  for (let d = todayD; d >= 1; d--) {
    if (isApplicable(h, todayY, todayM, d) && isChecked(h.id, d)) streak++;
    else if (isApplicable(h, todayY, todayM, d)) break;
  }
  return streak;
}

async function toggleCheckMobile(habitId, day) {
  await toggleCheck(habitId, day);
  renderMobileToday();
}

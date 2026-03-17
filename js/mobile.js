let mobileTab = 'today';
let mobSidebarOpen = false;

function isMobile() {
  return window.innerWidth <= 700;
}

function openMobDrawer() {
  const overlay = document.getElementById('mobDrawerOverlay');
  const drawer  = document.getElementById('mobDrawer');
  if (overlay) overlay.classList.add('open');
  if (drawer)  drawer.classList.add('open');
}

function closeMobDrawer() {
  const overlay = document.getElementById('mobDrawerOverlay');
  const drawer  = document.getElementById('mobDrawer');
  if (overlay) overlay.classList.remove('open');
  if (drawer)  drawer.classList.remove('open');
}

function renderMobileApp() {
  if (!isMobile()) return;
  renderMobileNav();
  switchMobileTab(mobileTab);
}

function openMobSidebar() {
  mobSidebarOpen = true;
  renderMobSidebar();
  const sb2 = document.getElementById('mobSidebar');
  const ov  = document.getElementById('mobSidebarOverlay');
  if (sb2) sb2.classList.add('open');
  if (ov)  ov.classList.add('open');
}

function closeMobSidebar() {
  mobSidebarOpen = false;
  const sb2 = document.getElementById('mobSidebar');
  const ov  = document.getElementById('mobSidebarOverlay');
  if (sb2) sb2.classList.remove('open');
  if (ov)  ov.classList.remove('open');
}

function mobSidebarNav(tab) {
  closeMobSidebar();
  switchMobileTab(tab);
}

function renderMobileNav() {
  const nav = document.getElementById('mobileNav');
  if (!nav) return;
  const tabs = [
    { id: 'today',    icon: '✓',  label: 'Today'    },
    { id: 'history',  icon: '📅', label: 'History'  },
    { id: 'stats',    icon: '📊', label: 'Stats'    },
    { id: 'journal',  icon: '📓', label: 'Journal'  },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];
  nav.innerHTML = tabs.map(t => `
    <div class="mob-nav-item ${mobileTab === t.id ? 'active' : ''}" onclick="switchMobileTab('${t.id}')">
      <div class="mob-nav-icon">${t.icon}</div>
      <div class="mob-nav-label">${t.label}</div>
    </div>
  `).join('');
}

function switchMobileTab(tab) {
  mobileTab = tab;
  renderMobileNav();
  document.querySelectorAll('.mob-page').forEach(p => p.style.display = 'none');
  const el = document.getElementById('mob-' + tab);
  if (el) el.style.display = 'block';
  if (tab === 'today')    renderMobToday();
  if (tab === 'history')  renderMobHistory();
  if (tab === 'stats')    renderMobStats();
  if (tab === 'journal')  renderMobJournal();
  if (tab === 'settings') renderMobSettings();
  if (tab === 'heatmap')  renderMobHeatmap();
  if (tab === 'about')    renderMobAbout();
}

function renderMobSidebar() {
  const el = document.getElementById('mobSidebarContent');
  if (!el) return;
  const pages = [
    { id: 'today',    icon: '✓',  label: 'Today'      },
    { id: 'history',  icon: '📅', label: 'History'    },
    { id: 'stats',    icon: '📊', label: 'Stats'      },
    { id: 'journal',  icon: '📓', label: 'Journal'    },
    { id: 'heatmap',  icon: '🌿', label: 'Year View'  },
    { id: 'about',    icon: '👤', label: 'About'      },
    { id: 'settings', icon: '⚙', label: 'Settings'   },
  ];
  el.innerHTML = `
    <div class="mob-sidebar-header">
      <div class="mob-sidebar-title">DISCIPLINE<span style="opacity:.4">.</span></div>
      <button class="mob-sidebar-close" onclick="closeMobSidebar()">✕</button>
    </div>
    <div class="mob-sidebar-user">
      <div class="mob-sidebar-avatar">${currentUser?.email?.[0]?.toUpperCase()||'?'}</div>
      <div class="mob-sidebar-email">${currentUser?.email||''}</div>
    </div>
    <div class="mob-sidebar-divider"></div>
    ${pages.map(p => `
      <div class="mob-sidebar-item ${mobileTab === p.id ? 'active' : ''}" onclick="mobSidebarNav('${p.id}')">
        <span class="mob-sidebar-icon">${p.icon}</span>
        <span class="mob-sidebar-label">${p.label}</span>
      </div>`).join('')}
    <div class="mob-sidebar-divider"></div>
    <div class="mob-sidebar-theme">
      <div class="mob-sidebar-theme-label">Theme</div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="mob-theme-btn ${(settings.theme||'light')==='light'?'active':''}" onclick="setTheme('light');renderMobSidebar()">☀️ Light</button>
        <button class="mob-theme-btn ${settings.theme==='dark'?'active':''}" onclick="setTheme('dark');renderMobSidebar()">🌙 Dark</button>
        <button class="mob-theme-btn ${settings.theme==='pink'?'active':''}" onclick="setTheme('pink');renderMobSidebar()">🌸 Pink</button>
      </div>
    </div>
    <div class="mob-sidebar-signout" onclick="signOut()">Sign Out</div>
  `;
}

function renderMobToday() {
  const el = document.getElementById('mob-today');
  if (!el) return;
  const d = today.getDate(), m = today.getMonth(), y = today.getFullYear();
  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const applicable = habits.filter(h => isApplicable(h, y, m, d));
  const done = applicable.filter(h => isChecked(h.id, d)).length;
  const pct  = applicable.length ? Math.round(done / applicable.length * 100) : 0;

  const progressBar = `
    <div class="mob-header-card">
      <div class="mob-date">${DAY_NAMES[today.getDay()]}, ${MONTHS[m]} ${d}</div>
      <div class="mob-progress-row">
        <div class="mob-progress-text">${done} of ${applicable.length} done</div>
        <div class="mob-progress-pct">${pct}%</div>
      </div>
      <div class="mob-progress-bar-bg">
        <div class="mob-progress-bar-fill" style="width:${pct}%;background:${pct===100?'var(--check)':'var(--accent)'}"></div>
      </div>
    </div>`;

  if (!applicable.length) {
    el.innerHTML = progressBar + `
      <div class="mob-empty">
        <div class="mob-empty-icon">🎯</div>
        <div class="mob-empty-title">No habits today</div>
        <div class="mob-empty-sub">Add your first habit to get started</div>
        <button class="mob-add-btn" onclick="openMobHabitForm()">+ Add Habit</button>
        <button class="mob-add-btn" onclick="openMobTemplates()" style="background:var(--surface);color:var(--ink);border:1px solid var(--border);margin-top:8px;">📋 Use a Template</button>
      </div>`;
    return;
  }

  const rows = applicable.map(h => {
    const checked = isChecked(h.id, d);
    const cat = getCat(h.category_id);
    const streak = getMobileStreak(h);
    return `
      <div class="mob-habit-card ${checked ? 'checked' : ''}" onclick="mobToggle('${h.id}', ${d})">
        <div class="mob-habit-check ${checked ? 'checked' : ''}">
          ${checked ? '<svg width="16" height="16" viewBox="0 0 16 16"><polyline points="3,8 6.5,11.5 13,4" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
        </div>
        <div class="mob-habit-emoji">${h.emoji}</div>
        <div class="mob-habit-info">
          <div class="mob-habit-name ${checked ? 'done' : ''}">${h.name}</div>
          ${cat ? `<div class="mob-habit-cat" style="color:${cat.color}">${cat.name}</div>` : ''}
        </div>
        <div class="mob-habit-right">
          <button class="mob-pomo-btn" onclick="event.stopPropagation();openMobPomodoro('${h.id}','${h.name.replace(/'/g,'')}')">🍅</button>
          <div class="mob-streak-badge" style="background:${h.color||'var(--accent)'}22;color:${h.color||'var(--accent)'}">
            ${streak > 0 ? streak + 'd' : '–'}
          </div>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = progressBar + `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <div class="mob-section-title" style="margin:0">Today's Habits</div>
      <button class="mob-small-btn" onclick="openMobHabitForm()">+ Add</button>
    </div>
    ${rows}
    <div style="height:90px"></div>`;
}

async function mobToggle(habitId, day) {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetDate    = new Date(today.getFullYear(), today.getMonth(), day);
  if (targetDate < todayMidnight) return;
  await toggleCheck(habitId, day);
  renderMobToday();
  if (mobileTab === 'stats') renderMobStats();
}

function renderMobHistory() {
  const el = document.getElementById('mob-history');
  if (!el) return;
  const days = getDays(viewYear, viewMonth);
  const todayD = today.getFullYear()===viewYear && today.getMonth()===viewMonth ? today.getDate() : days;

  let html = `
    <div class="mob-section-header">
      <button class="mob-nav-arrow" onclick="mobPrevMonth()">‹</button>
      <div class="mob-section-month">${MONTHS[viewMonth]} ${viewYear}</div>
      <button class="mob-nav-arrow" onclick="mobNextMonth()">›</button>
    </div>`;

  let hasData = false;
  for (let d = 1; d <= days; d++) {
    const applicable = habits.filter(h => isApplicable(h, viewYear, viewMonth, d));
    if (!applicable.length) continue;
    hasData = true;
    const done = applicable.filter(h => isChecked(h.id, d)).length;
    const pct = Math.round(done / applicable.length * 100);
    const isToday = d === todayD && viewYear === today.getFullYear() && viewMonth === today.getMonth();
    const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(viewYear, viewMonth, d).getDay()];
    html += `
      <div class="mob-history-row ${isToday ? 'today' : ''}">
        <div class="mob-history-date">
          <div class="mob-history-d">${d}</div>
          <div class="mob-history-dow">${DOW}</div>
        </div>
        <div class="mob-history-bar-wrap">
          <div class="mob-history-bar" style="width:${pct}%;background:${pct>=80?'var(--check)':pct>=50?'var(--gold)':'var(--danger)'}"></div>
        </div>
        <div class="mob-history-pct">${pct}%</div>
        <div class="mob-history-count">${done}/${applicable.length}</div>
      </div>`;
  }
  if (!hasData) html += '<div class="mob-empty-text" style="padding:20px 0">No data for this month</div>';
  el.innerHTML = html + '<div style="height:90px"></div>';
}

function mobPrevMonth() { viewMonth--; if (viewMonth<0){viewMonth=11;viewYear--;} renderMobHistory(); }
function mobNextMonth() { viewMonth++; if (viewMonth>11){viewMonth=0;viewYear++;} renderMobHistory(); }

function renderMobStats() {
  const el = document.getElementById('mob-stats');
  if (!el) return;
  const days = getDays(viewYear, viewMonth);
  const todayD = today.getFullYear()===viewYear && today.getMonth()===viewMonth ? today.getDate() : days;
  let totalGoal=0, totalDone=0, bestStreak=0;
  habits.forEach(h => {
    let hS=0,hMax=0;
    for(let d=1;d<=todayD;d++){
      if(isApplicable(h,viewYear,viewMonth,d)){
        totalGoal++;
        if(isChecked(h.id,d)){totalDone++;hS++;hMax=Math.max(hMax,hS);}
        else hS=0;
      }
    }
    bestStreak=Math.max(bestStreak,hMax);
  });
  const pct = totalGoal>0 ? Math.round(totalDone/totalGoal*100) : 0;
  const topHabits = habits.map(h=>{
    let a=0,d=0;
    for(let dd=1;dd<=todayD;dd++) if(isApplicable(h,viewYear,viewMonth,dd)){a++;if(isChecked(h.id,dd))d++;}
    return {h,pct:a>0?Math.round(d/a*100):0,done:d,app:a};
  }).filter(x=>x.app>0).sort((a,b)=>b.pct-a.pct);
  const dayScores=[];
  for(let d=1;d<=todayD;d++){
    let a=0,dn=0;
    habits.forEach(h=>{if(isApplicable(h,viewYear,viewMonth,d)){a++;if(isChecked(h.id,d))dn++;}});
    if(a>0) dayScores.push({d,pct:Math.round(dn/a*100)});
  }
  const maxPct=Math.max(...dayScores.map(x=>x.pct),1);
  const chartBars=dayScores.map(({d,pct})=>`
    <div class="mob-chart-col">
      <div class="mob-chart-bar" style="height:${Math.max(4,Math.round(pct/maxPct*60))}px;background:${pct>=80?'var(--check)':pct>=50?'var(--accent)':'var(--gold)'}"></div>
      ${d%5===0||d===1?`<div class="mob-chart-label">${d}</div>`:'<div class="mob-chart-label"></div>'}
    </div>`).join('');
  el.innerHTML = `
    <div class="mob-section-title">${MONTHS[viewMonth]} ${viewYear}</div>
    <div class="mob-stats-grid">
      <div class="mob-stat-card accent"><div class="mob-stat-val">${pct}%</div><div class="mob-stat-lbl">Consistency</div></div>
      <div class="mob-stat-card"><div class="mob-stat-val">${totalDone}</div><div class="mob-stat-lbl">Completed</div></div>
      <div class="mob-stat-card"><div class="mob-stat-val">${totalGoal}</div><div class="mob-stat-lbl">Goal</div></div>
      <div class="mob-stat-card"><div class="mob-stat-val">${bestStreak}d</div><div class="mob-stat-lbl">Best Streak</div></div>
    </div>
    <div class="mob-card">
      <div class="mob-card-title">Daily Progress</div>
      <div class="mob-chart">${chartBars}</div>
    </div>
    <div class="mob-card">
      <div class="mob-card-title">Habit Rankings</div>
      ${topHabits.map((x,i)=>`
        <div class="mob-rank-row">
          <div class="mob-rank-num">${i+1}</div>
          <div class="mob-rank-emoji">${x.h.emoji}</div>
          <div class="mob-rank-name">${x.h.name}</div>
          <div class="mob-rank-bar-wrap"><div class="mob-rank-bar" style="width:${x.pct}%;background:${x.h.color||'var(--accent)'}"></div></div>
          <div class="mob-rank-pct">${x.pct}%</div>
        </div>`).join('')}
    </div>
    <div style="height:90px"></div>`;
}

function renderMobJournal() {
  const el = document.getElementById('mob-journal');
  if (!el) return;
  const key = `day__${jYear}-${String(jMonth+1).padStart(2,'0')}-${String(jDay).padStart(2,'0')}`;
  const existing = notes[key];
  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayName = DAY_NAMES[new Date(jYear,jMonth,jDay).getDay()];
  const recentEntries = Object.entries(notes).filter(([k])=>k.startsWith('day__')).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,10);
  el.innerHTML = `
    <div class="mob-section-title">Journal</div>
    <div class="mob-card" style="margin-bottom:12px;">
      <div class="mob-journal-date-row">
        <button class="mob-nav-arrow" onclick="mobJPrev()">‹</button>
        <div class="mob-journal-date">${dayName}, ${MONTHS[jMonth]} ${jDay}</div>
        <button class="mob-nav-arrow" onclick="mobJNext()">›</button>
      </div>
      <textarea class="mob-journal-textarea" id="mobJournalText" placeholder="Write your thoughts, wins, reflections…">${existing ? existing.content : ''}</textarea>
      <button class="mob-save-btn" onclick="saveMobJournal()">Save Entry</button>
    </div>
    <div class="mob-section-title" style="margin-top:16px;">Recent Entries</div>
    ${recentEntries.length ? recentEntries.map(([k,n])=>`
      <div class="mob-journal-entry" onclick="mobLoadEntry('${k}')">
        <div class="mob-journal-entry-date">${k.replace('day__','')}</div>
        <div class="mob-journal-entry-preview">${n.content.slice(0,80)}${n.content.length>80?'…':''}</div>
      </div>`).join('') : '<div class="mob-empty-text">No entries yet</div>'}
    <div style="height:90px"></div>`;
}

function mobJPrev() { jDay--; if(jDay<1){jMonth--;if(jMonth<0){jMonth=11;jYear--;}jDay=getDays(jYear,jMonth);} renderMobJournal(); }
function mobJNext() { jDay++; const dim=getDays(jYear,jMonth); if(jDay>dim){jDay=1;jMonth++;if(jMonth>11){jMonth=0;jYear++;}} renderMobJournal(); }
function mobLoadEntry(key) { const p=key.replace('day__','').split('-'); jYear=parseInt(p[0]);jMonth=parseInt(p[1])-1;jDay=parseInt(p[2]); renderMobJournal(); }

async function saveMobJournal() {
  const text = document.getElementById('mobJournalText')?.value?.trim();
  const dateStr = `${jYear}-${String(jMonth+1).padStart(2,'0')}-${String(jDay).padStart(2,'0')}`;
  const key = `day__${dateStr}`;
  setSyncState('saving');
  if (text) {
    const { data, error } = await sb.from('journal_notes').upsert({ user_id: currentUser.id, note_date: dateStr, content: text },{ onConflict: 'user_id,note_date' }).select().single();
    if (error) { setSyncState('error'); return; }
    notes[key] = data;
  } else {
    if (notes[key]) await sb.from('journal_notes').delete().eq('id', notes[key].id);
    delete notes[key];
  }
  setSyncState('saved');
  showToast('Journal saved!');
  renderMobJournal();
}

function renderMobHeatmap() {
  const el = document.getElementById('mob-heatmap');
  if (!el) return;
  el.innerHTML = `
    <div class="mob-section-title">Year View</div>
    <div class="mob-card">
      <div class="mob-card-title">Habit Heatmap — Last 12 Months</div>
      <div id="mobHeatmapCanvas" style="width:100%;overflow:hidden;"></div>
      <div class="heatmap-legend" style="margin-top:10px;">
        <span>Less</span>
        <div style="width:11px;height:11px;border-radius:2px;background:var(--surface);display:inline-block;"></div>
        <div style="width:11px;height:11px;border-radius:2px;background:var(--gold-light);display:inline-block;"></div>
        <div style="width:11px;height:11px;border-radius:2px;background:var(--gold);display:inline-block;opacity:.9"></div>
        <div style="width:11px;height:11px;border-radius:2px;background:var(--accent);display:inline-block;opacity:.75"></div>
        <div style="width:11px;height:11px;border-radius:2px;background:var(--accent);display:inline-block;"></div>
        <span>More</span>
      </div>
      <div id="mobHeatmapSummary" style="font-family:var(--font-mono);font-size:10px;color:var(--ink3);margin-top:8px;"></div>
    </div>
    <div class="mob-card" id="mobBestDayCard"></div>
    <div style="height:90px"></div>`;
  setTimeout(() => {
    renderHeatmapInContainer('mobHeatmapCanvas', 'mobHeatmapSummary');
    renderMobBestDay();
  }, 50);
}

function renderMobBestDay() {
  const el = document.getElementById('mobBestDayCard');
  if (!el) return;

  const DAY_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  if (!habits.length) {
    el.innerHTML = '<div class="mob-card-title">Your Best Day</div><div class="mob-empty-text">No habits yet.</div>';
    return;
  }

  const totalChecks  = [0,0,0,0,0,0,0];
  const daysWithData = [0,0,0,0,0,0,0];
  const seenDates    = new Set();

  Object.keys(checks).forEach(function(key) {
    var idx2 = key.indexOf('__');
    if (idx2 === -1) return;
    var ds = key.substring(idx2 + 2);
    if (!ds || ds.length < 10) return;
    var dow = new Date(parseInt(ds.substring(0,4)), parseInt(ds.substring(5,7))-1, parseInt(ds.substring(8,10))).getDay();
    totalChecks[dow]++;
    seenDates.add(ds);
  });

  if (!seenDates.size) {
    el.innerHTML = '<div class="mob-card-title">Your Best Day</div><div class="mob-empty-text">Not enough data yet — keep tracking!</div>';
    return;
  }

  seenDates.forEach(function(ds) {
    var dow = new Date(parseInt(ds.substring(0,4)), parseInt(ds.substring(5,7))-1, parseInt(ds.substring(8,10))).getDay();
    daysWithData[dow]++;
  });

  var avgs = totalChecks.map(function(total, i) {
    return daysWithData[i] > 0 ? Math.round((total / (daysWithData[i] * habits.length)) * 100) : 0;
  });

  var bestPct  = Math.max.apply(null, avgs);
  var worstPct = Math.min.apply(null, avgs);
  var bestIdx  = avgs.indexOf(bestPct);
  var worstIdx = avgs.lastIndexOf(worstPct);
  if (worstIdx === bestIdx) worstIdx = -1;

  if (bestPct === 0) {
    el.innerHTML = '<div class="mob-card-title">Your Best Day</div><div class="mob-empty-text">Not enough data yet — keep tracking!</div>';
    return;
  }

  var rows = DAY_SHORT.map(function(name, i) {
    var isBest  = i === bestIdx;
    var isWorst = i === worstIdx;
    var pct     = avgs[i];
    var barW    = Math.round((pct / bestPct) * 100);
    var color   = isBest ? 'var(--accent)' : isWorst ? 'var(--danger)' : 'var(--gold)';
    return '<div class="ybd-row">'
      + '<div class="ybd-day' + (isBest ? ' best' : isWorst ? ' worst' : '') + '">' + name + '</div>'
      + '<div class="ybd-bar-bg"><div class="ybd-bar" style="width:' + barW + '%;background:' + color + '"></div></div>'
      + '<div class="ybd-pct">' + pct + '%</div>'
      + (isBest  ? '<div class="ybd-tag best-tag">Best</div>'   : '')
      + (isWorst ? '<div class="ybd-tag worst-tag">Worst</div>' : '')
      + '</div>';
  }).join('');

  el.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">'
    + '<div class="mob-card-title" style="margin:0;">Best Day of the Week</div>'
    + '<div style="font-family:var(--font-mono);font-size:9px;color:var(--ink3);">' + seenDates.size + ' days</div>'
    + '</div>'
    + '<div style="background:var(--surface);border-radius:10px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;">'
    +   '<div style="font-size:28px;">🏆</div>'
    +   '<div>'
    +     '<div style="font-family:var(--font-head);font-size:20px;color:var(--accent);">' + DAY_FULL[bestIdx] + '</div>'
    +     '<div style="font-family:var(--font-mono);font-size:10px;color:var(--ink3);margin-top:2px;">' + bestPct + '% avg completion</div>'
    +   '</div>'
    + '</div>'
    + '<div class="ybd-rows">' + rows + '</div>';
}

function renderHeatmapInContainer(canvasId, summaryId) {
  const container = document.getElementById(canvasId);
  if (!container) return;
  const CELL=11, GAP=2, STEP=CELL+GAP, PAD_TOP=20, PAD_LEFT=20;
  const now=new Date(), endDate=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const startDate=new Date(endDate); startDate.setFullYear(startDate.getFullYear()-1); startDate.setDate(startDate.getDate()+1);
  const lookup={};
  for(let y=startDate.getFullYear();y<=endDate.getFullYear();y++){
    for(let m=0;m<12;m++){
      const dim=getDays(y,m);
      for(let d=1;d<=dim;d++){
        const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        let app=0,done=0;
        habits.forEach(h=>{if(isApplicable(h,y,m,d)){app++;if(checks[h.id+'__'+ds])done++;}});
        if(app>0) lookup[ds]=done/app;
      }
    }
  }
  const startDow=startDate.getDay();
  let totalDays=0, cur=new Date(startDate);
  while(cur<=endDate){totalDays++;cur.setDate(cur.getDate()+1);}
  const totalCols=Math.ceil((totalDays+startDow)/7);
  const W=PAD_LEFT+totalCols*STEP-GAP, H=PAD_TOP+7*STEP-GAP;
  let canvas=container.querySelector('canvas');
  if(!canvas){canvas=document.createElement('canvas');canvas.style.cssText='display:block;max-width:100%;';container.appendChild(canvas);}
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');
  const style=getComputedStyle(document.body);
  const surfaceColor=style.getPropertyValue('--surface').trim()||'#EEEBE2';
  const accentColor=style.getPropertyValue('--accent').trim()||'#4A3F2F';
  const goldColor=style.getPropertyValue('--gold').trim()||'#C4924A';
  const goldLight=style.getPropertyValue('--gold-light').trim()||'#F0DFC0';
  const ink3=style.getPropertyValue('--ink3').trim()||'#A09890';
  const MNAMES=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=ink3; ctx.font='8px "DM Mono",monospace'; ctx.textAlign='right';
  [1,3,5].forEach(dow=>ctx.fillText(['S','M','T','W','T','F','S'][dow],PAD_LEFT-3,PAD_TOP+dow*STEP+CELL*.75));
  ctx.textAlign='left';
  let prevMonth=-1, cur2=new Date(startDate), idx2=startDow;
  while(cur2<=endDate){
    if(cur2.getDate()===1&&cur2.getMonth()!==prevMonth){
      prevMonth=cur2.getMonth();
      ctx.fillStyle=ink3; ctx.font='8px "DM Mono",monospace';
      ctx.fillText(MNAMES[prevMonth],PAD_LEFT+Math.floor(idx2/7)*STEP,PAD_TOP-5);
    }
    cur2.setDate(cur2.getDate()+1); idx2++;
  }
  cur=new Date(startDate); let idx=startDow;
  while(cur<=endDate){
    const ds=cur.getFullYear()+'-'+String(cur.getMonth()+1).padStart(2,'0')+'-'+String(cur.getDate()).padStart(2,'0');
    const pct=lookup[ds]; let level=0;
    if(pct!==undefined){if(pct>=.9)level=4;else if(pct>=.65)level=3;else if(pct>=.4)level=2;else if(pct>0)level=1;}
    const col=Math.floor(idx/7), row=idx%7;
    const x=PAD_LEFT+col*STEP, y=PAD_TOP+row*STEP;
    ctx.fillStyle=level===0?surfaceColor:level===1?goldLight:level===2?goldColor:level===3?accentColor:accentColor;
    ctx.globalAlpha=level===3?.75:1;
    ctx.beginPath(); ctx.roundRect(x,y,CELL,CELL,2); ctx.fill(); ctx.globalAlpha=1;
    cur.setDate(cur.getDate()+1); idx++;
  }
  const total=Object.keys(lookup).length, perfect=Object.values(lookup).filter(v=>v>=.9).length;
  const s=document.getElementById(summaryId);
  if(s) s.textContent=perfect+' perfect days out of '+total+' tracked';
}

function renderBestDayInContainer(chartId, msgId) {
  const el = document.getElementById(chartId);
  if (!el) return;
  const days=getDays(viewYear,viewMonth);
  const scores=[0,0,0,0,0,0,0], counts=[0,0,0,0,0,0,0];
  for(let d=1;d<=days;d++){
    const dow=new Date(viewYear,viewMonth,d).getDay();
    let app=0,done=0;
    habits.forEach(h=>{if(isApplicable(h,viewYear,viewMonth,d)){app++;if(isChecked(h.id,d))done++;}});
    if(app>0){scores[dow]+=done/app;counts[dow]++;}
  }
  const avgs=scores.map((s,i)=>counts[i]>0?Math.round(s/counts[i]*100):null);
  const max=Math.max(...avgs.filter(v=>v!==null),1);
  const bestIdx=avgs.indexOf(Math.max(...avgs.filter(v=>v!==null)));
  el.innerHTML=['S','M','T','W','T','F','S'].map((label,i)=>{
    const pct=avgs[i]; const h=pct!==null?Math.max(4,Math.round(pct/100*52)):4;
    const isBest=i===bestIdx&&pct!==null;
    return `<div class="bd-col">
      <div class="bd-pct">${pct!==null?pct+'%':''}</div>
      <div class="bd-bar-wrap"><div class="bd-bar ${isBest?'best':''}" style="height:${h}px"></div></div>
      <div class="bd-label ${isBest?'best':''}">${label}</div>
    </div>`;
  }).join('');
  const msgEl=document.getElementById(msgId);
  const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  if(msgEl&&avgs[bestIdx]!==null) msgEl.textContent=DAY_NAMES[bestIdx]+'s are your strongest day · '+avgs[bestIdx]+'%';
}

function renderMobAbout() {
  const el = document.getElementById('mob-about');
  if (!el) return;

  fetch('pages/about.html')
    .then(r => r.text())
    .then(html => {
      el.innerHTML = `<div style="padding:12px 12px 90px;">${html}</div>`;
    })
    .catch(() => {
      el.innerHTML = `<div style="padding:12px 12px 90px;">
        <div class="about-hero">
          <img class="about-avatar-img"  src="https://i.ibb.co/QF9GQdtg/profile.png" alt="Hassane Ait Ahmed Lamara">
          <div>
            <div class="about-name">Hassane Ait Ahmed Lamara</div>
            <div class="about-role">Computer Science Student · Full-Stack Developer · AI &amp; ML Enthusiast</div>
            <div class="about-tagline">I build AI-powered systems and web applications that solve real-world problems.</div>
            <div class="about-links">
              <a class="about-link primary" href="https://github.com/HassaneAitAhmed" target="_blank">⟶ View Projects</a>
              <a class="about-link secondary" hassaneaitahmedlamara@gmail.com>✉ Contact</a>
              <a class="about-link secondary" href="https://www.linkedin.com/in/hassane-ait-ahmed-lamara/" target="_blank">in LinkedIn</a>
            </div>
          </div>
        </div>
      </div>`;
    });
}

function renderMobSettings() {
  const el = document.getElementById('mob-settings');
  if (!el) return;
  el.innerHTML = `
    <div class="mob-section-title">Settings</div>

    <div class="mob-card">
      <div class="mob-card-title">Add a Habit</div>
      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <button class="mob-settings-action-btn" onclick="openMobHabitForm()">
          <span style="font-size:18px;display:block;margin-bottom:4px;">✏️</span>
          <span>New Habit</span>
        </button>
        <button class="mob-settings-action-btn secondary" onclick="openMobTemplates()">
          <span style="font-size:18px;display:block;margin-bottom:4px;">📋</span>
          <span>Templates</span>
        </button>
      </div>
      <div class="mob-card-title" style="margin-top:4px;">My Habits</div>
      ${habits.length ? habits.map(h=>`
        <div class="mob-manage-row">
          <span style="font-size:16px;">${h.emoji}</span>
          <span class="mob-manage-name">${h.name}</span>
          <button class="mob-edit-btn" onclick="openMobHabitForm('${h.id}')">Edit</button>
          <button class="mob-del-btn" onclick="deleteHabit('${h.id}')">✕</button>
        </div>`).join('') : '<div class="mob-empty-text">No habits yet — add one above!</div>'}
    </div>

    <div class="mob-card">
      <div class="mob-card-title">Categories</div>
      ${categories.map(c=>`
        <div class="mob-manage-row">
          <div style="width:14px;height:14px;border-radius:50%;background:${c.color};flex-shrink:0;"></div>
          <span class="mob-manage-name">${c.name}</span>
          <button class="mob-del-btn" onclick="deleteCategory('${c.id}')">✕</button>
        </div>`).join('')}
      <button class="mob-save-btn" onclick="mobAddCategory()" style="margin-top:10px;">+ Add Category</button>
    </div>
    <div class="mob-card">
      <div class="mob-card-title">Account</div>
      <div class="mob-settings-row">
        <div class="mob-settings-label">Signed in as</div>
        <div class="mob-settings-email">${currentUser?.email||''}</div>
      </div>
      <div class="mob-settings-row">
        <button class="mob-danger-btn" onclick="signOut()">Sign Out</button>
      </div>
    </div>
    <div style="height:90px"></div>`;
}

function openMobModal(id) {
  openModal(id);
}

async function mobAddCategory() {
  openMobCategoryForm();
}

function openMobCategoryForm(existingCat) {
  let overlay = document.getElementById('mobCatFormOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobCatFormOverlay';
    document.body.appendChild(overlay);
  }
  const defaultColor = existingCat?.color || COLORS[0];
  overlay.innerHTML = `
    <div id="mobCatFormBg" onclick="closeMobCategoryForm()"></div>
    <div id="mobCatFormSheet">
      <div class="mhf-handle"></div>
      <div class="mhf-header">
        <div class="mhf-title">${existingCat ? 'Edit Category' : 'New Category'}</div>
        <button class="mhf-close" onclick="closeMobCategoryForm()">✕</button>
      </div>
      <div class="mhf-body">
        <div class="mhf-label">Category Name</div>
        <input class="mhf-input" id="mobCatName" type="text" placeholder="e.g. Health, Work, Learning…" maxlength="30" value="${existingCat?.name||''}">
        <div class="mhf-label">Color</div>
        <div class="mhf-color-grid" id="mobCatColorGrid">
          ${COLORS.map(c => `<div class="mhf-color ${c===defaultColor?'sel':''}" style="background:${c}" onclick="mobCatPickColor('${c}')"></div>`).join('')}
        </div>
        <button class="mhf-save-btn" onclick="mobSaveCategory('${existingCat?.id||''}')">
          ${existingCat ? 'Save Changes' : '+ Add Category'}
        </button>
        <div style="height:20px"></div>
      </div>
    </div>`;
  overlay.classList.add('open');
  setTimeout(() => document.getElementById('mobCatName')?.focus(), 100);
}

function closeMobCategoryForm() {
  const overlay = document.getElementById('mobCatFormOverlay');
  if (overlay) overlay.classList.remove('open');
}

function mobCatPickColor(c) {
  document.querySelectorAll('#mobCatColorGrid .mhf-color').forEach(el =>
    el.classList.toggle('sel', el.style.background === c)
  );
}

async function mobSaveCategory(existingId) {
  const name = document.getElementById('mobCatName')?.value?.trim();
  if (!name) { showToast('Please enter a category name'); return; }
  const selEl = document.querySelector('#mobCatColorGrid .mhf-color.sel');
  const color = selEl ? selEl.style.background : COLORS[0];
  setSyncState('saving');
  if (existingId) {
    const { error } = await sb.from('categories').update({ name, color }).eq('id', existingId);
    if (error) { setSyncState('error'); showToast('Error saving','error'); return; }
    const idx = categories.findIndex(c => c.id === existingId);
    if (idx >= 0) categories[idx] = { ...categories[idx], name, color };
  } else {
    const { data, error } = await sb.from('categories')
      .insert({ user_id: currentUser.id, name, color })
      .select().single();
    if (error) { setSyncState('error'); showToast('Error adding category','error'); return; }
    categories.push(data);
  }
  setSyncState('saved');
  closeMobCategoryForm();
  showToast(existingId ? 'Category updated!' : `"${name}" added!`);
  renderMobSettings();
}

/* mobAfterSave — called by habits.js after saving via the desktop modal (fallback) */
function mobAfterSave() {
  renderMobToday();
  if (mobileTab === 'settings') renderMobSettings();
}

function getMobileStreak(h) {
  const todayD=today.getDate(), todayM=today.getMonth(), todayY=today.getFullYear();
  let streak=0;
  for(let d=todayD;d>=1;d--){
    if(isApplicable(h,todayY,todayM,d)&&isChecked(h.id,d)) streak++;
    else if(isApplicable(h,todayY,todayM,d)) break;
  }
  return streak;
}

/* ═══════════════════════════════════════════════
   MOBILE HABIT FORM  (add / edit)
   ═══════════════════════════════════════════════ */

let mobFormEmoji = EMOJIS[0];
let mobFormColor = COLORS[0];
let mobFormEditId = null;

function openMobHabitForm(id) {
  mobFormEditId = id || null;
  const h = id ? habits.find(x => x.id === id) : null;
  mobFormEmoji = h ? h.emoji : EMOJIS[0];
  mobFormColor = h ? h.color : COLORS[0];

  // Build overlay
  let overlay = document.getElementById('mobHabitFormOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobHabitFormOverlay';
    document.body.appendChild(overlay);
  }

  const freqOptions = ['daily','weekdays','weekends','custom'].map(f =>
    `<option value="${f}" ${(h?.freq||'daily')===f?'selected':''}>${f.charAt(0).toUpperCase()+f.slice(1)}</option>`
  ).join('');

  const catOptions = `<option value="">No Category</option>` +
    categories.map(c => `<option value="${c.id}" ${h?.category_id===c.id?'selected':''}>${c.name}</option>`).join('');

  const emojiGrid = EMOJIS.map(e =>
    `<div class="mhf-emoji ${e===mobFormEmoji?'sel':''}" onclick="mobFormPickEmoji('${e}')">${e}</div>`
  ).join('');

  const colorGrid = COLORS.map(c =>
    `<div class="mhf-color ${c===mobFormColor?'sel':''}" style="background:${c}" onclick="mobFormPickColor('${c}')"></div>`
  ).join('');

  const customDaysHtml = `
    <div id="mhfCustomDays" style="display:${(h?.freq||'daily')==='custom'?'flex':'none'};flex-wrap:wrap;gap:6px;margin-top:6px;">
      ${['Su','Mo','Tu','We','Th','Fr','Sa'].map((d,i) =>
        `<label class="mhf-day-chip ${h?.customDays?.includes(i)?'sel':''}">
          <input type="checkbox" id="mhfcd${i}" style="display:none" ${h?.customDays?.includes(i)?'checked':''}>${d}
        </label>`
      ).join('')}
    </div>`;

  overlay.innerHTML = `
    <div id="mobHabitFormBg" onclick="closeMobHabitForm()"></div>
    <div id="mobHabitFormSheet">
      <div class="mhf-handle"></div>
      <div class="mhf-header">
        <div class="mhf-title">${id ? 'Edit Habit' : 'New Habit'}</div>
        <button class="mhf-close" onclick="closeMobHabitForm()">✕</button>
      </div>

      <div class="mhf-body">
        <div class="mhf-label">Habit Name</div>
        <input class="mhf-input" id="mhfName" type="text" placeholder="e.g. Morning Walk" maxlength="30" value="${h?.name||''}">

        <div class="mhf-label">Icon</div>
        <div class="mhf-emoji-grid" id="mhfEmojiGrid">${emojiGrid}</div>

        <div class="mhf-label">Color</div>
        <div class="mhf-color-grid" id="mhfColorGrid">${colorGrid}</div>

        <div class="mhf-row">
          <div style="flex:1">
            <div class="mhf-label">Frequency</div>
            <select class="mhf-select" id="mhfFreq" onchange="mhfToggleCustomDays()">${freqOptions}</select>
          </div>
          <div style="width:80px">
            <div class="mhf-label">Weekly goal</div>
            <input class="mhf-input" id="mhfGoal" type="number" min="1" max="7" value="${h?.weekGoal||5}">
          </div>
        </div>

        ${customDaysHtml}

        <div class="mhf-label">Category</div>
        <select class="mhf-select" id="mhfCat">${catOptions}</select>

        <div class="mhf-label">Completion Type</div>
        <select class="mhf-select" id="mhfCompType" onchange="mhfToggleCountRow()">
          <option value="check" ${(h?.completion_type||'check')==='check'?'selected':''}>Checkbox (done / not done)</option>
          <option value="count" ${h?.completion_type==='count'?'selected':''}>Count (pages, glasses…)</option>
          <option value="duration" ${h?.completion_type==='duration'?'selected':''}>Duration (minutes…)</option>
        </select>

        <div id="mhfCountRow" style="display:${h?.completion_type&&h.completion_type!=='check'?'flex':'none'};gap:8px;margin-top:8px;">
          <div style="flex:1">
            <div class="mhf-label">Target</div>
            <input class="mhf-input" id="mhfTarget" type="number" min="1" value="${h?.completion_target||1}">
          </div>
          <div style="flex:1">
            <div class="mhf-label">Unit</div>
            <input class="mhf-input" id="mhfUnit" type="text" placeholder="pages, min…" value="${h?.completion_unit||''}">
          </div>
        </div>

        <button class="mhf-save-btn" onclick="mobSaveHabit()">${id ? 'Save Changes' : '+ Add Habit'}</button>
        ${id ? `<button class="mhf-del-btn" onclick="mobDeleteHabit('${id}')">Delete Habit</button>` : ''}
        <div style="height:20px"></div>
      </div>
    </div>`;

  overlay.classList.add('open');
  setTimeout(() => document.getElementById('mhfName')?.focus(), 100);
}

function closeMobHabitForm() {
  const overlay = document.getElementById('mobHabitFormOverlay');
  if (overlay) overlay.classList.remove('open');
}

function mobFormPickEmoji(e) {
  mobFormEmoji = e;
  document.querySelectorAll('.mhf-emoji').forEach(el => el.classList.toggle('sel', el.textContent === e));
}

function mobFormPickColor(c) {
  mobFormColor = c;
  document.querySelectorAll('.mhf-color').forEach(el => el.classList.toggle('sel', el.style.background === c));
}

function mhfToggleCustomDays() {
  const v = document.getElementById('mhfFreq')?.value;
  const el = document.getElementById('mhfCustomDays');
  if (el) el.style.display = v === 'custom' ? 'flex' : 'none';
}

function mhfToggleCountRow() {
  const v = document.getElementById('mhfCompType')?.value;
  const el = document.getElementById('mhfCountRow');
  if (el) el.style.display = v !== 'check' ? 'flex' : 'none';
}

async function mobSaveHabit() {
  const name = document.getElementById('mhfName')?.value?.trim();
  if (!name) { showToast('Please enter a habit name'); return; }
  const freq = document.getElementById('mhfFreq')?.value || 'daily';
  const customDays = freq === 'custom'
    ? [0,1,2,3,4,5,6].filter(d => document.getElementById('mhfcd'+d)?.checked)
    : [];
  const payload = {
    user_id:           currentUser.id,
    name,
    emoji:             mobFormEmoji,
    color:             mobFormColor,
    category_id:       document.getElementById('mhfCat')?.value || null,
    freq,
    custom_days:       customDays,
    week_goal:         parseInt(document.getElementById('mhfGoal')?.value) || 5,
    completion_type:   document.getElementById('mhfCompType')?.value || 'check',
    completion_unit:   document.getElementById('mhfUnit')?.value || '',
    completion_target: parseInt(document.getElementById('mhfTarget')?.value) || 1,
  };
  setSyncState('saving');
  if (mobFormEditId) {
    const { error } = await sb.from('habits').update(payload).eq('id', mobFormEditId);
    if (error) { setSyncState('error'); showToast('Error saving','error'); return; }
    const idx = habits.findIndex(h => h.id === mobFormEditId);
    if (idx >= 0) habits[idx] = { ...habits[idx], ...payload, customDays, weekGoal: payload.week_goal };
  } else {
    const { data, error } = await sb.from('habits').insert(payload).select().single();
    if (error) { setSyncState('error'); showToast('Error saving','error'); return; }
    habits.push({ ...data, customDays, weekGoal: data.week_goal, completion_type: data.completion_type||'check', completion_unit: data.completion_unit||'', completion_target: data.completion_target||1 });
  }
  setSyncState('saved');
  closeMobHabitForm();
  showToast(mobFormEditId ? 'Habit updated!' : `"${name}" added!`);
  renderMobToday();
  if (mobileTab === 'settings') renderMobSettings();
}

async function mobDeleteHabit(id) {
  const ok = await showConfirm('Delete this habit and all its data?', 'Delete', 'Cancel', true);
  if (!ok) return;
  setSyncState('saving');
  const { error } = await sb.from('habits').delete().eq('id', id);
  if (error) { setSyncState('error'); return; }
  habits = habits.filter(h => h.id !== id);
  Object.keys(checks).forEach(k => { if (k.startsWith(id + '__')) delete checks[k]; });
  setSyncState('saved');
  closeMobHabitForm();
  renderMobToday();
  if (mobileTab === 'settings') renderMobSettings();
}

/* ═══════════════════════════════════════════════
   MOBILE TEMPLATES BROWSER
   ═══════════════════════════════════════════════ */

function openMobTemplates() {
  let overlay = document.getElementById('mobTemplatesOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobTemplatesOverlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div id="mobTemplatesBg" onclick="closeMobTemplates()"></div>
    <div id="mobTemplatesSheet">
      <div class="mhf-handle"></div>
      <div class="mhf-header">
        <div class="mhf-title">📋 Habit Templates</div>
        <button class="mhf-close" onclick="closeMobTemplates()">✕</button>
      </div>
      <div class="mhf-body" id="mobTemplatesBody">
        ${HABIT_TEMPLATE_PACKS.map(pack => `
          <div class="mob-tpl-pack" onclick="mobPreviewTemplate('${pack.id}')">
            <div class="mob-tpl-pack-icon" style="background:${pack.color}22;color:${pack.color}">${pack.emoji}</div>
            <div class="mob-tpl-pack-info">
              <div class="mob-tpl-pack-name">${pack.name}</div>
              <div class="mob-tpl-pack-desc">${pack.desc} · ${pack.habits.length} habits</div>
            </div>
            <div class="mob-tpl-arrow">›</div>
          </div>`).join('')}
        <div style="height:20px"></div>
      </div>
    </div>`;

  overlay.classList.add('open');
}

function closeMobTemplates() {
  const overlay = document.getElementById('mobTemplatesOverlay');
  if (overlay) overlay.classList.remove('open');
}

function mobPreviewTemplate(id) {
  const pack = HABIT_TEMPLATE_PACKS.find(p => p.id === id);
  if (!pack) return;
  const body = document.getElementById('mobTemplatesBody');
  if (!body) return;
  body.innerHTML = `
    <button class="mob-tpl-back" onclick="openMobTemplates()">‹ Back</button>
    <div class="mob-tpl-preview-header" style="border-left:4px solid ${pack.color}">
      <div style="font-size:28px">${pack.emoji}</div>
      <div>
        <div class="mob-tpl-pack-name" style="font-size:16px">${pack.name}</div>
        <div class="mob-tpl-pack-desc">${pack.desc}</div>
      </div>
    </div>
    ${pack.habits.map(h => `
      <div class="mob-tpl-habit-row">
        <span style="font-size:20px">${h.emoji}</span>
        <div style="flex:1">
          <div class="mob-tpl-habit-name">${h.name}</div>
          <div class="mob-tpl-habit-meta">${h.freq} · ${h.week_goal}×/week${h.completion_type!=='check'?' · '+h.completion_target+' '+h.completion_unit:''}</div>
        </div>
        <div class="mob-tpl-dot" style="background:${h.color}"></div>
      </div>`).join('')}
    <button class="mhf-save-btn" onclick="mobApplyTemplate('${id}')">Add ${pack.habits.length} habits →</button>
    <div style="height:20px"></div>`;
}

async function mobApplyTemplate(id) {
  const pack = HABIT_TEMPLATE_PACKS.find(p => p.id === id);
  if (!pack) return;
  setSyncState('saving');
  const inserts = pack.habits.map((h, i) => ({
    user_id: currentUser.id,
    name: h.name, emoji: h.emoji, color: h.color,
    freq: h.freq, custom_days: h.custom_days || [],
    week_goal: h.week_goal,
    completion_type: h.completion_type || 'check',
    completion_unit: h.completion_unit || '',
    completion_target: h.completion_target || 1,
    sort_order: habits.length + i,
  }));
  const { data, error } = await sb.from('habits').insert(inserts).select();
  if (error) { setSyncState('error'); showToast('Error adding template','error'); return; }
  data.forEach(d => habits.push({ ...d, customDays: d.custom_days||[], weekGoal: d.week_goal }));
  setSyncState('saved');
  closeMobTemplates();
  showToast(`${pack.name} added! (${pack.habits.length} habits) 🎉`);
  renderMobToday();
  if (mobileTab === 'settings') renderMobSettings();
}

function openMobShareCard() {
  let ov = document.getElementById('mobShareCardOv');
  if (!ov) { ov = document.createElement('div'); ov.id = 'mobShareCardOv'; document.body.appendChild(ov); }

  ov.innerHTML = `
    <div class="mob-sheet-bg" onclick="closeMobShareCard()"></div>
    <div class="mob-sheet">
      <div class="mob-sheet-handle"></div>
      <div class="mob-sheet-head">
        <span class="mob-sheet-title">✦ Share Month Card</span>
        <button class="mob-sheet-x" onclick="closeMobShareCard()">✕</button>
      </div>
      <div class="mob-sheet-body">
        <p class="mob-sheet-desc">${MONTHS[viewMonth]} ${viewYear} — your consistency card</p>
        <canvas id="mobShareCvs" style="width:100%;border-radius:10px;border:1px solid var(--border);display:block;margin-bottom:16px;"></canvas>
        <button class="mob-sheet-btn" onclick="downloadMobCard()">⬇ Download PNG</button>
        <div style="height:24px"></div>
      </div>
    </div>`;
  ov.className = 'mob-sheet-ov open';
  setTimeout(drawMobCard, 60);
}

function closeMobShareCard() {
  const ov = document.getElementById('mobShareCardOv');
  if (ov) ov.className = 'mob-sheet-ov';
}

function drawMobCard() {
  const canvas = document.getElementById('mobShareCvs');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 540, H = 720;
  canvas.width = W; canvas.height = H;

  const days = getDays(viewYear, viewMonth);
  let goal = 0, done = 0, bestStreak = 0, hS = 0;
  habits.forEach(h => {
    hS = 0;
    for (let d = 1; d <= days; d++) {
      if (isApplicable(h, viewYear, viewMonth, d)) {
        goal++;
        if (isChecked(h.id, d)) { done++; hS++; bestStreak = Math.max(bestStreak, hS); }
        else hS = 0;
      }
    }
  });
  const pct = goal > 0 ? Math.round(done / goal * 100) : 0;
  const cs = getComputedStyle(document.body);
  const bg = cs.getPropertyValue('--bg').trim() || '#F5F2EC';
  const ac = cs.getPropertyValue('--accent').trim() || '#4A3F2F';
  const gd = cs.getPropertyValue('--gold').trim() || '#C4924A';
  const ik = cs.getPropertyValue('--ink').trim() || '#1C1A15';
  const i3 = cs.getPropertyValue('--ink3').trim() || '#A09890';
  const bd = cs.getPropertyValue('--border').trim() || '#D8D2C4';

  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = ac; ctx.fillRect(0, 0, W, 6);
  ctx.fillStyle = ik; ctx.font = 'bold 13px "DM Mono",monospace';
  ctx.fillText('HABIT TRACKER', 40, 48);
  ctx.fillStyle = i3; ctx.font = '12px "DM Mono",monospace';
  ctx.fillText((MONTHS[viewMonth] + ' ' + viewYear).toUpperCase(), 40, 66);
  ctx.fillStyle = ac; ctx.font = 'bold 96px "DM Serif Display",serif';
  ctx.fillText(pct + '%', 40, 175);
  ctx.fillStyle = i3; ctx.font = '13px "DM Mono",monospace';
  ctx.fillText('consistency rate', 40, 198);

  [[done + '', 'habits done'], [bestStreak + 'd', 'best streak'], [habits.length + '', 'habits tracked']].forEach(([v, l], i) => {
    const x = 40 + i * 160;
    ctx.fillStyle = ik; ctx.font = 'bold 28px "DM Serif Display",serif'; ctx.fillText(v, x, 238);
    ctx.fillStyle = i3; ctx.font = '11px "DM Mono",monospace'; ctx.fillText(l, x, 256);
  });

  ctx.strokeStyle = bd; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 274); ctx.lineTo(W - 40, 274); ctx.stroke();

  const cs2 = 14, g2 = 3, sdow = getDOW(viewYear, viewMonth, 1);
  for (let d = 1; d <= days; d++) {
    const idx = d - 1 + sdow;
    const col = Math.floor(idx / 7), row = idx % 7;
    let app = 0, dn = 0;
    habits.forEach(h => { if (isApplicable(h, viewYear, viewMonth, d)) { app++; if (isChecked(h.id, d)) dn++; } });
    const p = app > 0 ? dn / app : -1;
    ctx.fillStyle = p < 0 ? bd : p >= .9 ? ac : p > 0 ? gd : bd;
    ctx.globalAlpha = (p >= .6 && p < .9) ? .7 : 1;
    const x = 40 + col * (cs2 + g2), y = 294 + row * (cs2 + g2);
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, cs2, cs2, 2); else ctx.rect(x, y, cs2, cs2);
    ctx.fill(); ctx.globalAlpha = 1;
  }

  const ly = 294 + 7 * (cs2 + g2) + 22;
  ctx.fillStyle = i3; ctx.font = '10px "DM Mono",monospace'; ctx.fillText('TOP HABITS', 40, ly);
  habits.map(h => {
    let a = 0, d = 0;
    for (let dd = 1; dd <= days; dd++) if (isApplicable(h, viewYear, viewMonth, dd)) { a++; if (isChecked(h.id, dd)) d++; }
    return { h, pct: a > 0 ? Math.round(d / a * 100) : 0 };
  }).sort((a, b) => b.pct - a.pct).slice(0, 5).forEach((r, i) => {
    const y = ly + 18 + i * 36;
    ctx.fillStyle = bd; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(40, y, W - 80, 22, 3); else ctx.rect(40, y, W - 80, 22); ctx.fill();
    ctx.fillStyle = r.h.color || ac; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(40, y, Math.max(8, (W - 80) * r.pct / 100), 22, 3); else ctx.rect(40, y, Math.max(8, (W - 80) * r.pct / 100), 22); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Syne",sans-serif'; ctx.fillText(r.h.emoji + ' ' + r.h.name, 50, y + 14);
    ctx.font = '10px "DM Mono",monospace'; ctx.textAlign = 'right'; ctx.fillText(r.pct + '%', W - 48, y + 14); ctx.textAlign = 'left';
  });

  ctx.fillStyle = i3; ctx.font = '10px "DM Mono",monospace'; ctx.textAlign = 'center';
  ctx.fillText('habit-tracker · Track · Reflect · Grow', W / 2, H - 26);
  ctx.textAlign = 'left';
}

function downloadMobCard() {
  const canvas = document.getElementById('mobShareCvs');
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = 'habit-month-' + MONTHS[viewMonth] + '-' + viewYear + '.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
  showToast('Card saved! 🎉');
}

function openMobAccountability() {
  let ov = document.getElementById('mobAccOv');
  if (!ov) { ov = document.createElement('div'); ov.id = 'mobAccOv'; document.body.appendChild(ov); }

  const token = currentUser ? btoa(currentUser.id).replace(/=/g, '') : '';
  const url = window.location.origin + window.location.pathname + '?view=' + token;

  ov.innerHTML = `
    <div class="mob-sheet-bg" onclick="closeMobAcc()"></div>
    <div class="mob-sheet">
      <div class="mob-sheet-handle"></div>
      <div class="mob-sheet-head">
        <span class="mob-sheet-title">👁 Accountability Partner</span>
        <button class="mob-sheet-x" onclick="closeMobAcc()">✕</button>
      </div>
      <div class="mob-sheet-body">
        <p class="mob-sheet-desc">Share this link with a friend or coach. They see your habits in real time — read only, they cannot edit anything.</p>
        <div class="mob-acc-url-box">
          <div class="mob-acc-url-text">${url}</div>
        </div>
        <button class="mob-sheet-btn" id="mobAccCopyBtn" onclick="mobCopyUrl('${url}')">📋 Copy Link</button>
        <div class="mob-acc-info">ℹ To disable sharing, change your account password.</div>
        <div style="height:24px"></div>
      </div>
    </div>`;
  ov.className = 'mob-sheet-ov open';
}

function closeMobAcc() {
  const ov = document.getElementById('mobAccOv');
  if (ov) ov.className = 'mob-sheet-ov';
}

function mobCopyUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('mobAccCopyBtn');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Link'; }, 2000); }
    showToast('Link copied — send it to your partner!');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = url; ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showToast('Link copied!');
  });
}

function openMobPomodoro(habitId, habitName) {
  let ov = document.getElementById('mobPomoOv');
  if (!ov) { ov = document.createElement('div'); ov.id = 'mobPomoOv'; document.body.appendChild(ov); }

  ov.innerHTML = `
    <div class="mob-sheet-bg" onclick="closeMobPomo()"></div>
    <div class="mob-sheet">
      <div class="mob-sheet-handle"></div>
      <div class="mob-sheet-head">
        <span class="mob-sheet-title">🍅 Pomodoro</span>
        <button class="mob-sheet-x" onclick="closeMobPomo()">✕</button>
      </div>
      <div class="mob-sheet-body" id="mobPomoBody" style="text-align:center;">
        <div class="mob-pomo-habit" id="mobPomoHabit">${habitName || 'Free session'}</div>
        <div class="mob-pomo-presets" id="mobPomoPresets"></div>
        <div class="mob-pomo-modes" id="mobPomoModes"></div>
        <div class="mob-pomo-ring-wrap">
          <svg id="mobPomoSvg" width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="66" fill="none" stroke="var(--border)" stroke-width="10"/>
            <circle id="mobPomoArc" cx="80" cy="80" r="66" fill="none" stroke="var(--accent)"
              stroke-width="10" stroke-linecap="round" transform="rotate(-90 80 80)"
              stroke-dasharray="414.7" stroke-dashoffset="414.7"/>
          </svg>
          <div class="mob-pomo-time" id="mobPomoTime">25:00</div>
          <div class="mob-pomo-label" id="mobPomoLabel">Focus</div>
        </div>
        <div class="mob-pomo-sessions" id="mobPomoSessions">Session 1 · 0 completed</div>
        <div class="mob-pomo-controls" id="mobPomoControls"></div>
        <div style="height:28px"></div>
      </div>
    </div>`;
  ov.className = 'mob-sheet-ov open';

  mobPomoState.habitId   = habitId   || null;
  mobPomoState.habitName = habitName || 'Free session';
  mobPomoState.mode      = 'work';
  mobPomoState.customMin = mobPomoState.customMin || 25;
  mobPomoState.seconds   = mobPomoState.customMin * 60;
  mobPomoState.total     = mobPomoState.customMin * 60;
  mobPomoState.running   = false;
  mobPomoState.paused    = false;
  clearInterval(mobPomoState.interval);
  renderMobPomo();
}

function closeMobPomo() {
  clearInterval(mobPomoState.interval);
  mobPomoState.running = false;
  mobPomoState.paused  = false;
  const ov = document.getElementById('mobPomoOv');
  if (ov) ov.className = 'mob-sheet-ov';
}

const mobPomoState = {
  running: false, paused: false,
  seconds: 25*60, total: 25*60, customMin: 25,
  mode: 'work', habitId: null, habitName: '', interval: null, sessions: 0
};

const MOB_POMO_MODES = {
  work:        { label: 'Focus',       secs: 25*60, color: 'var(--accent)' },
  short_break: { label: 'Short Break', secs:  5*60, color: 'var(--check)'  },
  long_break:  { label: 'Long Break',  secs: 15*60, color: '#185FA5'       },
};

function renderMobPomo() {
  const mins = Math.floor(mobPomoState.seconds / 60);
  const secs = mobPomoState.seconds % 60;
  const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  const progress = mobPomoState.total > 0 ? 1 - mobPomoState.seconds / mobPomoState.total : 0;
  const circ = 2 * Math.PI * 66;
  const offset = circ * (1 - progress);
  const color = MOB_POMO_MODES[mobPomoState.mode].color;

  const timeEl = document.getElementById('mobPomoTime');
  const arcEl  = document.getElementById('mobPomoArc');
  const labelEl= document.getElementById('mobPomoLabel');
  const sessEl = document.getElementById('mobPomoSessions');
  if (timeEl)  timeEl.textContent = timeStr;
  if (arcEl)   { arcEl.setAttribute('stroke-dashoffset', offset.toFixed(1)); arcEl.setAttribute('stroke', color); }
  if (labelEl) labelEl.textContent = MOB_POMO_MODES[mobPomoState.mode].label;
  if (sessEl)  sessEl.textContent = 'Session ' + (mobPomoState.sessions + 1) + ' · ' + mobPomoState.sessions + ' completed today';

  const presetsEl = document.getElementById('mobPomoPresets');
  if (presetsEl && mobPomoState.mode === 'work') {
    presetsEl.innerHTML = [5,10,15,20,25,30,45,60].map(m =>
      `<button class="mob-pomo-preset ${mobPomoState.customMin===m&&!mobPomoState.running&&!mobPomoState.paused?'active':''}"
        onclick="mobPomoSetDur(${m})">${m}m</button>`
    ).join('');
  } else if (presetsEl) presetsEl.innerHTML = '';

  const modesEl = document.getElementById('mobPomoModes');
  if (modesEl) {
    modesEl.innerHTML = Object.entries(MOB_POMO_MODES).map(([k,v]) =>
      `<button class="mob-pomo-mode ${mobPomoState.mode===k?'active':''}" onclick="mobPomoSetMode('${k}')">${v.label}</button>`
    ).join('');
  }

  const ctrlEl = document.getElementById('mobPomoControls');
  if (ctrlEl) {
    if (!mobPomoState.running || mobPomoState.paused) {
      ctrlEl.innerHTML = `
        <button class="mob-pomo-start" onclick="mobPomoStart()">▶ ${mobPomoState.paused ? 'Resume' : 'Start'}</button>
        <button class="mob-pomo-reset" onclick="mobPomoReset()">↺ Reset</button>`;
    } else {
      ctrlEl.innerHTML = `
        <button class="mob-pomo-start" onclick="mobPomoPause()">⏸ Pause</button>
        <button class="mob-pomo-reset" onclick="mobPomoReset()">↺ Reset</button>`;
    }
  }
}

function mobPomoSetDur(minutes) {
  if (mobPomoState.running) return;
  mobPomoState.customMin = minutes;
  mobPomoState.seconds   = minutes * 60;
  mobPomoState.total     = minutes * 60;
  mobPomoState.paused    = false;
  renderMobPomo();
}

function mobPomoSetMode(mode) {
  clearInterval(mobPomoState.interval);
  mobPomoState.mode    = mode;
  mobPomoState.running = false;
  mobPomoState.paused  = false;
  const defaults = { work: mobPomoState.customMin*60, short_break: 5*60, long_break: 15*60 };
  mobPomoState.seconds = defaults[mode];
  mobPomoState.total   = defaults[mode];
  renderMobPomo();
}

function mobPomoStart() {
  mobPomoState.running = true;
  mobPomoState.paused  = false;
  clearInterval(mobPomoState.interval);
  mobPomoState.interval = setInterval(() => {
    mobPomoState.seconds--;
    renderMobPomo();
    if (mobPomoState.seconds <= 0) {
      clearInterval(mobPomoState.interval);
      mobPomoState.running = false;
      mobPomoComplete();
    }
  }, 1000);
  renderMobPomo();
}

function mobPomoPause() {
  clearInterval(mobPomoState.interval);
  mobPomoState.paused  = true;
  mobPomoState.running = false;
  renderMobPomo();
}

function mobPomoReset() {
  clearInterval(mobPomoState.interval);
  mobPomoState.running = false;
  mobPomoState.paused  = false;
  const defaults = { work: mobPomoState.customMin*60, short_break: 5*60, long_break: 15*60 };
  mobPomoState.seconds = defaults[mobPomoState.mode];
  mobPomoState.total   = defaults[mobPomoState.mode];
  renderMobPomo();
}

async function mobPomoComplete() {
  mobPomoState.sessions++;
  try {
    const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const o = ctx2.createOscillator(), g = ctx2.createGain();
      o.connect(g); g.connect(ctx2.destination);
      o.frequency.value = freq; o.type = 'sine';
      g.gain.setValueAtTime(0.25, ctx2.currentTime + i*.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + i*.18 + .3);
      o.start(ctx2.currentTime + i*.18); o.stop(ctx2.currentTime + i*.18 + .35);
    });
  } catch(e) {}

  if (mobPomoState.mode === 'work' && mobPomoState.habitId) {
    const d = today.getDate();
    const key = `${mobPomoState.habitId}__${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (!checks[key]) {
      await toggleCheck(mobPomoState.habitId, d);
      renderMobToday();
    }
    showToast('🍅 Session done! Habit checked ✓');
  } else {
    showToast(mobPomoState.mode === 'work' ? '🍅 Session complete!' : '☕ Break over!');
  }

  try {
    if (Notification.permission === 'granted') {
      new Notification('🍅 Pomodoro', { body: mobPomoState.mode === 'work' ? 'Session done! Take a break.' : 'Back to work!' });
    }
  } catch(e) {}

  mobPomoSetMode(mobPomoState.mode === 'work'
    ? (mobPomoState.sessions % 4 === 0 ? 'long_break' : 'short_break')
    : 'work');
}

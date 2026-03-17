const ACHIEVEMENTS = [
  { id:'first_check',   icon:'✅', title:'First Step',        desc:'Checked your first habit',           check: (s) => s.totalChecks >= 1 },
  { id:'day_perfect',   icon:'⭐', title:'Perfect Day',        desc:'100% completion in a single day',    check: (s) => s.hadPerfectDay },
  { id:'week_streak',   icon:'🔥', title:'Week Warrior',       desc:'7-day streak on any habit',          check: (s) => s.maxStreak >= 7 },
  { id:'month_streak',  icon:'💎', title:'Diamond Month',      desc:'30-day streak on any habit',         check: (s) => s.maxStreak >= 30 },
  { id:'all_habits_14', icon:'👑', title:'Two Week King',      desc:'All habits done 14 days in a row',   check: (s) => s.allHabitStreak >= 14 },
  { id:'cold_shower',   icon:'🚿', title:'Ice Warrior',        desc:'Cold Shower checked 20+ times',      check: (s) => s.habitCounts['cold shower'] >= 20 || s.habitCounts['cold showers'] >= 20 },
  { id:'gym_10',        icon:'💪', title:'Iron Consistent',    desc:'GYM checked 10+ times this month',   check: (s) => (s.habitCounts['gym'] || 0) >= 10 },
  { id:'reader',        icon:'📚', title:'Knowledge Seeker',   desc:'Read habit done 15+ times',          check: (s) => (s.habitCounts['read'] || 0) >= 15 || (s.habitCounts['reading'] || 0) >= 15 },
  { id:'early_bird',    icon:'⏰', title:'Early Bird',         desc:'Wake-up habit 10+ days this month',  check: (s) => (s.habitCounts['wake'] || 0) >= 10 },
  { id:'no_sugar_week', icon:'🥗', title:'Clean Fuel',         desc:'No sugar 7+ days this month',        check: (s) => (s.habitCounts['no sugar'] || 0) >= 7 },
  { id:'planner',       icon:'📝', title:'Master Planner',     desc:'Planning habit 20+ times',           check: (s) => (s.habitCounts['planning'] || 0) >= 20 },
  { id:'half_month',    icon:'🎯', title:'Halfway Hero',       desc:'50%+ completion rate this month',    check: (s) => s.monthPct >= 50 },
  { id:'full_month',    icon:'🏆', title:'Monthly Champion',   desc:'80%+ completion rate this month',    check: (s) => s.monthPct >= 80 },
];

function computeAchievementStats() {
  const days = getDays(viewYear, viewMonth);
  const todayThis = today.getFullYear()===viewYear && today.getMonth()===viewMonth;
  const todayD = todayThis ? today.getDate() : days;
  let totalChecks = 0, hadPerfectDay = false, maxStreak = 0, allHabitStreak = 0;
  const habitCounts = {};

  habits.forEach(h => {
    const key = h.name.toLowerCase();
    let hStreak = 0, hMaxStreak = 0;
    for (let d = 1; d <= todayD; d++) {
      if (isApplicable(h, viewYear, viewMonth, d) && isChecked(h.id, d)) {
        totalChecks++;
        habitCounts[key] = (habitCounts[key] || 0) + 1;
        hStreak++;
        hMaxStreak = Math.max(hMaxStreak, hStreak);
        
        const parts = key.split(' ');
        parts.forEach(p => { if (p.length > 3) habitCounts[p] = (habitCounts[p] || 0) + 1; });
      } else if (isApplicable(h, viewYear, viewMonth, d)) {
        hStreak = 0;
      }
    }
    maxStreak = Math.max(maxStreak, hMaxStreak);
  });

  
  let curAllStreak = 0;
  for (let d = 1; d <= todayD; d++) {
    let app = 0, done = 0;
    habits.forEach(h => { if (isApplicable(h, viewYear, viewMonth, d)) { app++; if (isChecked(h.id, d)) done++; } });
    if (app > 0 && done === app) { hadPerfectDay = true; curAllStreak++; allHabitStreak = Math.max(allHabitStreak, curAllStreak); }
    else curAllStreak = 0;
  }

  let goal = 0, done = 0;
  habits.forEach(h => {
    for (let d = 1; d <= todayD; d++) if (isApplicable(h, viewYear, viewMonth, d)) { goal++; if (isChecked(h.id, d)) done++; }
  });
  const monthPct = goal > 0 ? Math.round((done / goal) * 100) : 0;

  return { totalChecks, hadPerfectDay, maxStreak, allHabitStreak, habitCounts, monthPct };
}

function getUnlockedAchievements() {
  if (!habits.length) return [];
  const stats = computeAchievementStats();
  return ACHIEVEMENTS.filter(a => { try { return a.check(stats); } catch(e) { return false; } });
}

function renderAchievements() {
  const unlocked = getUnlockedAchievements();
  const locked   = ACHIEVEMENTS.filter(a => !unlocked.find(u => u.id === a.id));

  if (!habits.length) {
    const empty = '<div class="empty-mini">Start tracking to earn badges</div>';
    const e1 = document.getElementById('achievementsList');
    const e2 = document.getElementById('achievementsListYearView');
    if (e1) e1.innerHTML = empty;
    if (e2) e2.innerHTML = empty;
    return;
  }

  let unlockedHtml = '';
  unlocked.forEach(a => {
    unlockedHtml += `<div class="badge-item unlocked" title="${a.desc}">
      <div class="badge-icon">${a.icon}</div>
      <div class="badge-name">${a.title}</div>
    </div>`;
  });

  let lockedHtml = '';
  locked.slice(0, 4).forEach(a => {
    lockedHtml += `<div class="badge-item locked" title="${a.desc}">
      <div class="badge-icon">🔒</div>
      <div class="badge-name">${a.title}</div>
    </div>`;
  });

  const html = unlockedHtml + lockedHtml || '<div class="empty-mini">Keep going to earn badges!</div>';

  const e1 = document.getElementById('achievementsList');
  const e2 = document.getElementById('achievementsListYearView');
  if (e1) e1.innerHTML = html;
  if (e2) e2.innerHTML = html;

  const badge = document.getElementById('achCountBadge');
  if (badge) {
    if (unlocked.length > 0) {
      badge.textContent = unlocked.length;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  const prevKey = 'ach_shown_' + viewYear + '_' + viewMonth;
  const prevShown = JSON.parse(localStorage.getItem(prevKey) || '[]');
  unlocked.forEach(a => {
    if (!prevShown.includes(a.id)) {
      prevShown.push(a.id);
      setTimeout(() => showAchievementToast(a), 400);
    }
  });
  localStorage.setItem(prevKey, JSON.stringify(prevShown));
}

function showAchievementToast(a) {
  const el = document.getElementById('achievementToast');
  if (!el) return;
  el.querySelector('.ach-icon').textContent = a.icon;
  el.querySelector('.ach-title').textContent = a.title;
  el.querySelector('.ach-desc').textContent = a.desc;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}
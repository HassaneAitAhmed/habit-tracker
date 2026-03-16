

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function renderBestDay() {
  const el = document.getElementById('bestDayChart');
  if (!el) return;
  const days = getDays(viewYear, viewMonth);
  const scores = [0,0,0,0,0,0,0]; // Sun-Sat totals
  const counts = [0,0,0,0,0,0,0];

  for (let d = 1; d <= days; d++) {
    const dow = getDOW(viewYear, viewMonth, d);
    let app = 0, done = 0;
    habits.forEach(h => { if (isApplicable(h, viewYear, viewMonth, d)) { app++; if (isChecked(h.id, d)) done++; } });
    if (app > 0) { scores[dow] += done / app; counts[dow]++; }
  }

  const avgs = scores.map((s, i) => counts[i] > 0 ? Math.round((s / counts[i]) * 100) : null);
  const max = Math.max(...avgs.filter(v => v !== null), 1);
  const bestIdx = avgs.indexOf(Math.max(...avgs.filter(v => v !== null)));

  let html = '';
  ['S','M','T','W','T','F','S'].forEach((label, i) => {
    const pct = avgs[i];
    const h = pct !== null ? Math.max(4, Math.round((pct / 100) * 52)) : 4;
    const isBest = i === bestIdx && pct !== null;
    html += `<div class="bd-col">
      <div class="bd-pct">${pct !== null ? pct+'%' : ''}</div>
      <div class="bd-bar-wrap">
        <div class="bd-bar ${isBest?'best':''}" style="height:${h}px" title="${DAY_NAMES[i]}: ${pct??0}%"></div>
      </div>
      <div class="bd-label ${isBest?'best':''}">${label}</div>
    </div>`;
  });
  el.innerHTML = html;

  const msgEl = document.getElementById('bestDayMsg');
  if (msgEl && avgs[bestIdx] !== null) {
    msgEl.textContent = DAY_NAMES[bestIdx] + 's are your strongest day · ' + avgs[bestIdx] + '% avg';
  }
}

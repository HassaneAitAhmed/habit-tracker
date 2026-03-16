
function renderHeatmap() {
  const el = document.getElementById('heatmapGrid');
  if (!el) return;
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + 1);

  const lookup = {};
  for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
    for (let m = 0; m < 12; m++) {
      const daysInM = getDays(y, m);
      for (let d = 1; d <= daysInM; d++) {
        const ds = y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        let app = 0, done = 0;
        habits.forEach(h => {
          if (isApplicable(h, y, m, d)) {
            app++;
            const ck = h.id + '__' + ds;
            if (checks[ck]) done++;
          }
        });
        if (app > 0) lookup[ds] = done / app;
      }
    }
  }

  const startDow = startDate.getDay();
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let cells = '', monthMarkers = {}, col = 0;
  for (let i = 0; i < startDow; i++) { cells += `<div class="hm-cell empty"></div>`; col++; }

  let cur = new Date(startDate);
  while (cur <= endDate) {
    const ds = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
    const pct = lookup[ds];
    let level = 0;
    if (pct !== undefined) {
      if (pct >= .9) level = 4;
      else if (pct >= .65) level = 3;
      else if (pct >= .4) level = 2;
      else if (pct > 0) level = 1;
    }
    const isPast = pct !== undefined;
    const dow = cur.getDay();
    if (dow === 0 && col > 0) {
      const mKey = cur.getFullYear() + '-' + cur.getMonth();
      if (!monthMarkers[mKey]) { monthMarkers[mKey] = col; }
    }
    const dateStr = cur.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const pctStr = pct !== undefined ? Math.round(pct*100)+'%' : 'no data';
    cells += `<div class="hm-cell level-${level}${!isPast?' future':''}" title="${dateStr}: ${pctStr}"></div>`;
    cur.setDate(cur.getDate() + 1);
    col++;
  }

  el.innerHTML = cells;

  const labelsEl = document.getElementById('heatmapMonths');
  if (labelsEl) {
    let lHtml = '';
    const totalCols = Math.ceil(col / 7);
    let prevM = -1;
    cur = new Date(startDate);
    let c2 = startDow;
    cur2 = new Date(startDate);
    while (cur2 <= endDate) {
      const colIdx = Math.floor(c2 / 7);
      if (cur2.getDate() === 1 && cur2.getMonth() !== prevM) {
        prevM = cur2.getMonth();
        lHtml += `<span style="grid-column:${colIdx+1}">${MONTH_LABELS[prevM]}</span>`;
      }
      cur2.setDate(cur2.getDate()+1);
      c2++;
    }
    labelsEl.innerHTML = lHtml;
  }

  // Summary
  const total = Object.values(lookup).filter(v=>v!==undefined).length;
  const perfect = Object.values(lookup).filter(v=>v>=.9).length;
  const el2 = document.getElementById('heatmapSummary');
  if (el2) el2.textContent = perfect + ' perfect days out of ' + total + ' tracked in the last year';
}

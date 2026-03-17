function renderHeatmap() {
  const container = document.getElementById('heatmapCanvas');
  if (!container) return;

  const CELL  = 13;
  const GAP   = 3;
  const STEP  = CELL + GAP;
  const PAD_TOP  = 22;  
  const PAD_LEFT = 24;  

  const now      = new Date();
  const endDate  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + 1);

  
  const lookup = {};
  for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
    for (let m = 0; m < 12; m++) {
      const dim = getDays(y, m);
      for (let d = 1; d <= dim; d++) {
        const ds = y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        let app = 0, done = 0;
        habits.forEach(h => {
          if (isApplicable(h, y, m, d)) { app++; if (checks[h.id + '__' + ds]) done++; }
        });
        if (app > 0) lookup[ds] = done / app;
      }
    }
  }

  
  const startDow = startDate.getDay(); 
  let cur = new Date(startDate);
  let totalDays = 0;
  while (cur <= endDate) { totalDays++; cur.setDate(cur.getDate() + 1); }
  const totalCols = Math.ceil((totalDays + startDow) / 7);

  
  const W = PAD_LEFT + totalCols * STEP - GAP;
  const H = PAD_TOP + 7 * STEP - GAP;

  
  let canvas = container.querySelector('canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;max-width:100%;';
    container.appendChild(canvas);
  }
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  const style = getComputedStyle(document.body);
  const surfaceColor = style.getPropertyValue('--surface').trim()  || '#EEEBE2';
  const accentColor  = style.getPropertyValue('--accent').trim()   || '#4A3F2F';
  const goldColor    = style.getPropertyValue('--gold').trim()      || '#C4924A';
  const goldLight    = style.getPropertyValue('--gold-light').trim()|| '#F0DFC0';
  const ink3         = style.getPropertyValue('--ink3').trim()      || '#A09890';

  const COLORS = ['transparent', goldLight, goldColor, accentColor, accentColor];
  ctx.clearRect(0, 0, W, H);

  
  ctx.fillStyle = ink3;
  ctx.font = '9px "DM Mono", monospace';
  ctx.textAlign = 'right';
  [1,3,5].forEach(dow => {
    const label = ['S','M','T','W','T','F','S'][dow];
    ctx.fillText(label, PAD_LEFT - 4, PAD_TOP + dow * STEP + CELL * 0.75);
  });

  
  ctx.textAlign = 'left';
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let prevMonth = -1;
  cur = new Date(startDate);
  let idx = startDow;
  while (cur <= endDate) {
    if (cur.getDate() === 1 && cur.getMonth() !== prevMonth) {
      prevMonth = cur.getMonth();
      const col = Math.floor(idx / 7);
      ctx.fillStyle = ink3;
      ctx.font = '9px "DM Mono", monospace';
      ctx.fillText(MONTHS[prevMonth], PAD_LEFT + col * STEP, PAD_TOP - 6);
    }
    cur.setDate(cur.getDate() + 1);
    idx++;
  }

  
  cur = new Date(startDate);
  idx = startDow;
  while (cur <= endDate) {
    const ds  = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
    const pct = lookup[ds];
    let level = 0;
    if (pct !== undefined) {
      if      (pct >= .9)  level = 4;
      else if (pct >= .65) level = 3;
      else if (pct >= .4)  level = 2;
      else if (pct >  0)   level = 1;
    }
    const col = Math.floor(idx / 7);
    const row = idx % 7;
    const x   = PAD_LEFT + col * STEP;
    const y   = PAD_TOP  + row * STEP;

    
    ctx.fillStyle = level === 0 ? surfaceColor : COLORS[level];
    if (level === 4) ctx.globalAlpha = 1;
    else if (level === 3) ctx.globalAlpha = .75;
    else if (level === 2) ctx.globalAlpha = .9;
    else ctx.globalAlpha = 1;
    roundRect(ctx, x, y, CELL, CELL, 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    cur.setDate(cur.getDate() + 1);
    idx++;
  }

  
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const col = Math.floor((mx - PAD_LEFT) / STEP);
    const row = Math.floor((my - PAD_TOP)  / STEP);
    if (col < 0 || row < 0 || row > 6) { canvas.title = ''; return; }
    const dayIdx = col * 7 + row - startDow;
    if (dayIdx < 0 || dayIdx >= totalDays) { canvas.title = ''; return; }
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayIdx);
    const ds = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    const pct = lookup[ds];
    const label = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    canvas.title = pct !== undefined ? label + ' · ' + Math.round(pct*100) + '%' : label + ' · no data';
  };

  
  const total   = Object.keys(lookup).length;
  const perfect = Object.values(lookup).filter(v => v >= .9).length;
  const el2 = document.getElementById('heatmapSummary');
  if (el2) el2.textContent = perfect + ' perfect days out of ' + total + ' tracked in the last year';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

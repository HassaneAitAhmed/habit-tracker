function openShareCard() {
  const overlay = document.getElementById('shareCardOverlay');
  if (!overlay) return;
  renderShareCardPreview();
  overlay.classList.add('open');
}

function closeShareCard() {
  document.getElementById('shareCardOverlay').classList.remove('open');
}

function renderShareCardPreview() {
  const canvas = document.getElementById('shareCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 540, H = 720;
  canvas.width = W; canvas.height = H;

  
  const days = getDays(viewYear, viewMonth);
  let goal = 0, done = 0, bestStreak = 0, curStreak = 0;
  habits.forEach(h => {
    let hS = 0;
    for (let d = 1; d <= days; d++) {
      if (isApplicable(h, viewYear, viewMonth, d)) {
        goal++;
        if (isChecked(h.id, d)) { done++; hS++; bestStreak = Math.max(bestStreak, hS); }
        else hS = 0;
      }
    }
  });
  const pct = goal > 0 ? Math.round((done/goal)*100) : 0;
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthName = MONTHS[viewMonth] + ' ' + viewYear;

  
  const style = getComputedStyle(document.body);
  const bg     = style.getPropertyValue('--bg').trim() || '#F5F2EC';
  const card   = style.getPropertyValue('--card').trim() || '#FDFBF7';
  const accent = style.getPropertyValue('--accent').trim() || '#4A3F2F';
  const gold   = style.getPropertyValue('--gold').trim() || '#C4924A';
  const ink    = style.getPropertyValue('--ink').trim() || '#1C1A15';
  const ink3   = style.getPropertyValue('--ink3').trim() || '#A09890';
  const border = style.getPropertyValue('--border').trim() || '#D8D2C4';

  
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 6);

  
  ctx.fillStyle = ink;
  ctx.font = 'bold 13px "DM Mono", monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText('HABIT TRACKER', 40, 48);
  ctx.fillStyle = ink3;
  ctx.font = '12px "DM Mono", monospace';
  ctx.fillText(monthName.toUpperCase(), 40, 66);

  
  ctx.fillStyle = accent;
  ctx.font = 'bold 96px "DM Serif Display", serif';
  ctx.fillText(pct + '%', 40, 175);

  ctx.fillStyle = ink3;
  ctx.font = '13px "DM Mono", monospace';
  ctx.fillText('consistency rate', 40, 198);

  
  const statY = 240;
  [ [done.toString(), 'habits done'], [bestStreak + 'd', 'best streak'], [habits.length.toString(), 'habits tracked'] ]
  .forEach(([val, label], i) => {
    const x = 40 + i * 160;
    ctx.fillStyle = ink;
    ctx.font = 'bold 28px "DM Serif Display", serif';
    ctx.fillText(val, x, statY);
    ctx.fillStyle = ink3;
    ctx.font = '11px "DM Mono", monospace';
    ctx.fillText(label, x, statY + 18);
  });

  
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 275); ctx.lineTo(W-40, 275); ctx.stroke();

  
  const cellSize = 14, gap = 3;
  const cols = Math.ceil(days / 7);
  const startX = 40, startY = 295;
  const startDow = getDOW(viewYear, viewMonth, 1);

  for (let d = 1; d <= days; d++) {
    const idx = d - 1 + startDow;
    const col = Math.floor(idx / 7);
    const row = idx % 7;
    let app = 0, doneD = 0;
    habits.forEach(h => { if (isApplicable(h,viewYear,viewMonth,d)){app++;if(isChecked(h.id,d)) doneD++;} });
    const p = app > 0 ? doneD/app : -1;
    if (p < 0) ctx.fillStyle = border;
    else if (p >= .9) ctx.fillStyle = accent;
    else if (p >= .6) ctx.globalAlpha = .7, ctx.fillStyle = accent, ctx.globalAlpha = 1;
    else if (p > 0) ctx.fillStyle = gold;
    else ctx.fillStyle = border;
    const x = startX + col*(cellSize+gap);
    const y = startY + row*(cellSize+gap);
    roundRect(ctx, x, y, cellSize, cellSize, 2);
    ctx.fill();
  }

  
  const listY = startY + 7*(cellSize+gap) + 24;
  ctx.fillStyle = ink3;
  ctx.font = '10px "DM Mono", monospace';
  ctx.fillText('TOP HABITS THIS MONTH', 40, listY);

  const ranked = habits.map(h => {
    let a=0,d=0;
    for(let dd=1;dd<=days;dd++) if(isApplicable(h,viewYear,viewMonth,dd)){a++;if(isChecked(h.id,dd))d++;}
    return {h, pct: a>0?Math.round(d/a*100):0};
  }).sort((a,b)=>b.pct-a.pct).slice(0,5);

  ranked.forEach((r, i) => {
    const y = listY + 20 + i * 38;
    
    ctx.fillStyle = border;
    roundRect(ctx, 40, y, W-80, 24, 4); ctx.fill();
    
    ctx.fillStyle = r.h.color || accent;
    roundRect(ctx, 40, y, Math.max(8,(W-80)*r.pct/100), 24, 4); ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "Syne", sans-serif';
    ctx.fillText(r.h.emoji + ' ' + r.h.name, 52, y+15);
    ctx.font = '11px "DM Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(r.pct+'%', W-50, y+15);
    ctx.textAlign = 'left';
  });

  
  ctx.fillStyle = ink3;
  ctx.font = '11px "DM Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('habit-tracker · Track · Reflect · Grow', W/2, H-28);
  ctx.textAlign = 'left';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function downloadShareCard() {
  const canvas = document.getElementById('shareCanvas');
  const a = document.createElement('a');
  a.download = 'my-habit-month.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
  showToast('Card saved! Share it anywhere 🎉');
}

let mobPomoState = {
  running: false, paused: false,
  seconds: 25*60, total: 25*60, customMin: 25,
  mode: 'work', habitId: null, habitName: '',
  interval: null, sessions: 0
};

function openMobPomodoro(habitId, habitName) {
  mobPomoState.habitId   = habitId   || null;
  mobPomoState.habitName = habitName || 'Free session';
  clearInterval(mobPomoState.interval);
  mobPomoState.running = false;
  mobPomoState.paused  = false;
  mobPomoState.mode    = 'work';
  mobPomoState.seconds = mobPomoState.customMin * 60;
  mobPomoState.total   = mobPomoState.customMin * 60;
  _buildMobPomoOverlay();
  _renderMobPomoUI();
}

function _buildMobPomoOverlay() {
  let o = document.getElementById('mobPomoOverlay');
  if (!o) {
    o = document.createElement('div');
    o.id = 'mobPomoOverlay';
    o.innerHTML = `
      <div id="mobPomoBg" onclick="_closeMobPomo()"></div>
      <div id="mobPomoSheet">
        <div class="mhf-handle"></div>
        <div class="mhf-header">
          <div class="mhf-title">🍅 Pomodoro</div>
          <button class="mhf-close" onclick="_closeMobPomo()">✕</button>
        </div>
        <div class="mhf-body" id="mobPomoBody"></div>
      </div>`;
    document.body.appendChild(o);
  }
  o.classList.add('open');
}

function _closeMobPomo() {
  clearInterval(mobPomoState.interval);
  mobPomoState.running = false;
  const o = document.getElementById('mobPomoOverlay');
  if (o) o.classList.remove('open');
}

function _renderMobPomoUI() {
  const el = document.getElementById('mobPomoBody');
  if (!el) return;
  const m = Math.floor(mobPomoState.seconds / 60);
  const s = mobPomoState.seconds % 60;
  const timeStr = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  const pct = mobPomoState.total > 0 ? (1 - mobPomoState.seconds / mobPomoState.total) * 100 : 0;
  const modes = { work:'Focus', short_break:'Short Break', long_break:'Long Break' };
  const modeColors = { work:'var(--accent)', short_break:'var(--check)', long_break:'#185FA5' };
  const col = modeColors[mobPomoState.mode];
  const presets = [5,10,15,20,25,30,45,60];

  el.innerHTML = `
    <div style="text-align:center;font-family:var(--font-mono);font-size:11px;color:var(--ink3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;">
      ${mobPomoState.habitName}
    </div>
    <div style="display:flex;gap:6px;justify-content:center;margin-bottom:16px;">
      ${['work','short_break','long_break'].map(md=>`
        <button onclick="_mobPomoSetMode('${md}')"
          style="padding:6px 12px;border-radius:20px;border:1.5px solid ${mobPomoState.mode===md?col:'var(--border)'};
                 background:${mobPomoState.mode===md?col:'var(--surface)'};
                 color:${mobPomoState.mode===md?'#fff':'var(--ink3)'};
                 font-family:var(--font-mono);font-size:10px;cursor:pointer;">
          ${modes[md]}
        </button>`).join('')}
    </div>
    ${mobPomoState.mode==='work' ? `
    <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:18px;">
      ${presets.map(p=>`
        <button onclick="_mobPomoSetDur(${p})"
          style="padding:5px 12px;border-radius:20px;border:1.5px solid ${mobPomoState.customMin===p&&!mobPomoState.running?col:'var(--border)'};
                 background:${mobPomoState.customMin===p&&!mobPomoState.running?col:'var(--surface)'};
                 color:${mobPomoState.customMin===p&&!mobPomoState.running?'#fff':'var(--ink3)'};
                 font-family:var(--font-mono);font-size:11px;cursor:pointer;">
          ${p}m
        </button>`).join('')}
    </div>` : ''}
    <div style="position:relative;width:160px;height:160px;margin:0 auto 16px;">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="68" fill="none" stroke="var(--border)" stroke-width="10"/>
        <circle cx="80" cy="80" r="68" fill="none" stroke="${col}" stroke-width="10"
          stroke-dasharray="${(2*Math.PI*68).toFixed(1)}"
          stroke-dashoffset="${((2*Math.PI*68)*(1-pct/100)).toFixed(1)}"
          stroke-linecap="round" transform="rotate(-90 80 80)"/>
      </svg>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
        <div style="font-family:var(--font-head);font-size:34px;color:var(--ink);line-height:1;">${timeStr}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-top:4px;">${modes[mobPomoState.mode]}</div>
      </div>
    </div>
    <div style="text-align:center;font-family:var(--font-mono);font-size:11px;color:var(--ink3);margin-bottom:16px;">
      Session ${mobPomoState.sessions+1} · ${mobPomoState.sessions} completed
    </div>
    <div style="display:flex;gap:10px;">
      ${!mobPomoState.running || mobPomoState.paused
        ? `<button onclick="_mobPomoStart()" class="mhf-save-btn" style="margin-top:0;">▶ ${mobPomoState.paused?'Resume':'Start'}</button>`
        : `<button onclick="_mobPomoPause()" class="mhf-save-btn" style="margin-top:0;background:var(--surface);color:var(--ink);border:1.5px solid var(--border);">⏸ Pause</button>`
      }
      <button onclick="_mobPomoReset()" class="mhf-save-btn" style="margin-top:0;background:var(--surface);color:var(--ink);border:1.5px solid var(--border);">↺</button>
    </div>
    <div style="height:20px"></div>`;
}

function _mobPomoSetMode(mode) {
  clearInterval(mobPomoState.interval);
  mobPomoState.mode = mode; mobPomoState.running = false; mobPomoState.paused = false;
  const dur = { work: mobPomoState.customMin*60, short_break: 5*60, long_break: 15*60 };
  mobPomoState.seconds = dur[mode]; mobPomoState.total = dur[mode];
  _renderMobPomoUI();
}

function _mobPomoSetDur(min) {
  if (mobPomoState.running) return;
  mobPomoState.customMin = min;
  mobPomoState.seconds = min*60; mobPomoState.total = min*60;
  mobPomoState.paused = false;
  _renderMobPomoUI();
}

function _mobPomoStart() {
  mobPomoState.running = true; mobPomoState.paused = false;
  clearInterval(mobPomoState.interval);
  mobPomoState.interval = setInterval(() => {
    mobPomoState.seconds--;
    _renderMobPomoUI();
    if (mobPomoState.seconds <= 0) {
      clearInterval(mobPomoState.interval);
      mobPomoState.running = false;
      _mobPomoComplete();
    }
  }, 1000);
  _renderMobPomoUI();
}

function _mobPomoPause() {
  clearInterval(mobPomoState.interval);
  mobPomoState.running = false; mobPomoState.paused = true;
  _renderMobPomoUI();
}

function _mobPomoReset() {
  clearInterval(mobPomoState.interval);
  mobPomoState.running = false; mobPomoState.paused = false;
  const dur = { work: mobPomoState.customMin*60, short_break: 5*60, long_break: 15*60 };
  mobPomoState.seconds = dur[mobPomoState.mode]; mobPomoState.total = dur[mobPomoState.mode];
  _renderMobPomoUI();
}

async function _mobPomoComplete() {
  mobPomoState.sessions++;
  try {
    const ctx2 = new (window.AudioContext||window.webkitAudioContext)();
    [523,659,784].forEach((freq,i) => {
      const o=ctx2.createOscillator(), g=ctx2.createGain();
      o.connect(g); g.connect(ctx2.destination);
      o.frequency.value=freq; o.type='sine';
      g.gain.setValueAtTime(0.3, ctx2.currentTime+i*.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime+i*.18+.3);
      o.start(ctx2.currentTime+i*.18); o.stop(ctx2.currentTime+i*.18+.35);
    });
  } catch(e) {}
  if (mobPomoState.mode==='work' && mobPomoState.habitId) {
    const d = today.getDate();
    const key = `${mobPomoState.habitId}__${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (!checks[key]) await toggleCheck(mobPomoState.habitId, d);
    showToast('🍅 Session done! Habit checked ✓');
    renderMobToday();
  } else {
    showToast(mobPomoState.mode==='work' ? '🍅 Session complete!' : '☕ Break over!');
  }
  _mobPomoSetMode(mobPomoState.mode==='work'
    ? (mobPomoState.sessions%4===0 ? 'long_break' : 'short_break')
    : 'work');
}

function openMobShareCard() {
  let o = document.getElementById('mobShareOverlay');
  if (!o) {
    o = document.createElement('div');
    o.id = 'mobShareOverlay';
    o.innerHTML = `
      <div id="mobShareBg" onclick="closeMobShareCard()"></div>
      <div id="mobShareSheet">
        <div class="mhf-handle"></div>
        <div class="mhf-header">
          <div class="mhf-title">✦ Share Month Card</div>
          <button class="mhf-close" onclick="closeMobShareCard()">✕</button>
        </div>
        <div class="mhf-body">
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink3);letter-spacing:.08em;margin-bottom:12px;text-transform:uppercase;">
            ${MONTHS[viewMonth]} ${viewYear}
          </div>
          <canvas id="mobShareCanvas" style="width:100%;border-radius:10px;border:1px solid var(--border);display:block;"></canvas>
          <button onclick="downloadMobShareCard()" class="mhf-save-btn">⬇ Download Card</button>
          <div style="height:20px"></div>
        </div>
      </div>`;
    document.body.appendChild(o);
  } else {
    o.querySelector('.mhf-body div:first-child').textContent = (MONTHS[viewMonth] + ' ' + viewYear).toUpperCase();
  }
  o.classList.add('open');
  setTimeout(_drawMobShareCanvas, 100);
}

function closeMobShareCard() {
  const o = document.getElementById('mobShareOverlay');
  if (o) o.classList.remove('open');
}

function _drawMobShareCanvas() {
  const canvas = document.getElementById('mobShareCanvas');
  if (!canvas) return;
  const W=540, H=720;
  canvas.width=W; canvas.height=H;
  const ctx = canvas.getContext('2d');

  const days = getDays(viewYear, viewMonth);
  let goal=0, done=0, bestStreak=0, hS=0;
  habits.forEach(h => {
    hS=0;
    for (let d=1;d<=days;d++) {
      if (isApplicable(h,viewYear,viewMonth,d)) {
        goal++;
        if (isChecked(h.id,d)) { done++; hS++; if(hS>bestStreak) bestStreak=hS; }
        else hS=0;
      }
    }
  });
  const pct = goal>0 ? Math.round(done/goal*100) : 0;

  const cs = getComputedStyle(document.body);
  const bg     = cs.getPropertyValue('--bg').trim()     || '#F5F2EC';
  const accent = cs.getPropertyValue('--accent').trim() || '#4A3F2F';
  const gold   = cs.getPropertyValue('--gold').trim()   || '#C4924A';
  const ink    = cs.getPropertyValue('--ink').trim()    || '#1C1A15';
  const ink3   = cs.getPropertyValue('--ink3').trim()   || '#A09890';
  const border = cs.getPropertyValue('--border').trim() || '#D8D2C4';

  const _rect = (x,y,w,h,r) => {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  };

  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=accent; ctx.fillRect(0,0,W,6);

  ctx.fillStyle=ink; ctx.font='bold 13px "DM Mono",monospace';
  ctx.fillText('HABIT TRACKER',40,48);
  ctx.fillStyle=ink3; ctx.font='12px "DM Mono",monospace';
  ctx.fillText((MONTHS[viewMonth]+' '+viewYear).toUpperCase(),40,66);

  ctx.fillStyle=accent; ctx.font='bold 96px "DM Serif Display",serif';
  ctx.fillText(pct+'%',40,175);
  ctx.fillStyle=ink3; ctx.font='13px "DM Mono",monospace';
  ctx.fillText('consistency rate',40,198);

  [[done+'','habits done'],[bestStreak+'d','best streak'],[habits.length+'','habits tracked']]
    .forEach(([v,l],i)=>{
      const x=40+i*160;
      ctx.fillStyle=ink; ctx.font='bold 28px "DM Serif Display",serif'; ctx.fillText(v,x,240);
      ctx.fillStyle=ink3; ctx.font='11px "DM Mono",monospace'; ctx.fillText(l,x,258);
    });

  ctx.strokeStyle=border; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(40,275); ctx.lineTo(W-40,275); ctx.stroke();

  const cs2=14, gap=3, sdow=getDOW(viewYear,viewMonth,1);
  for (let d=1;d<=days;d++) {
    const idx=d-1+sdow, col=Math.floor(idx/7), row=idx%7;
    let app=0,dn=0;
    habits.forEach(h=>{if(isApplicable(h,viewYear,viewMonth,d)){app++;if(isChecked(h.id,d))dn++;}});
    const p=app>0?dn/app:-1;
    ctx.fillStyle = p<0?border:p>=.9?accent:p>=.6?gold:p>0?gold:border;
    ctx.globalAlpha = (p>=.6&&p<.9)?.7:1;
    _rect(40+col*(cs2+gap), 295+row*(cs2+gap), cs2, cs2, 2); ctx.fill();
    ctx.globalAlpha=1;
  }

  const listY=295+7*(cs2+gap)+24;
  ctx.fillStyle=ink3; ctx.font='10px "DM Mono",monospace';
  ctx.fillText('TOP HABITS THIS MONTH',40,listY);

  habits.map(h=>{
    let a=0,d=0;
    for(let dd=1;dd<=days;dd++) if(isApplicable(h,viewYear,viewMonth,dd)){a++;if(isChecked(h.id,dd))d++;}
    return {h,pct:a>0?Math.round(d/a*100):0};
  }).sort((a,b)=>b.pct-a.pct).slice(0,5).forEach((r,i)=>{
    const y=listY+20+i*38;
    ctx.fillStyle=border; _rect(40,y,W-80,24,4); ctx.fill();
    ctx.fillStyle=r.h.color||accent; _rect(40,y,Math.max(8,(W-80)*r.pct/100),24,4); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 11px "Syne",sans-serif';
    ctx.fillText(r.h.emoji+' '+r.h.name,52,y+15);
    ctx.font='11px "DM Mono",monospace'; ctx.textAlign='right';
    ctx.fillText(r.pct+'%',W-50,y+15); ctx.textAlign='left';
  });

  ctx.fillStyle=ink3; ctx.font='11px "DM Mono",monospace'; ctx.textAlign='center';
  ctx.fillText('habit-tracker · Track · Reflect · Grow',W/2,H-28);
  ctx.textAlign='left';
}

function downloadMobShareCard() {
  const c = document.getElementById('mobShareCanvas');
  if (!c) return;
  const a = document.createElement('a');
  a.download = 'habit-month-'+MONTHS[viewMonth]+'-'+viewYear+'.png';
  a.href = c.toDataURL('image/png');
  a.click();
  showToast('Card saved! Share it anywhere 🎉');
}

function openMobAccountability() {
  let o = document.getElementById('mobAccOverlay');
  if (!o) {
    o = document.createElement('div');
    o.id = 'mobAccOverlay';
    document.body.appendChild(o);
  }
  const token = currentUser ? btoa(currentUser.id).replace(/=/g,'') : '';
  const url = window.location.origin + window.location.pathname + '?view=' + token;
  o.innerHTML = `
    <div id="mobAccBg" onclick="closeMobAccountability()"></div>
    <div id="mobAccSheet">
      <div class="mhf-handle"></div>
      <div class="mhf-header">
        <div class="mhf-title">👁 Accountability</div>
        <button class="mhf-close" onclick="closeMobAccountability()">✕</button>
      </div>
      <div class="mhf-body">
        <p style="font-size:13px;color:var(--ink2);line-height:1.65;margin-bottom:18px;">
          Share this link with a friend or coach. They can view your habits in real time — read-only, no edits.
        </p>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--ink3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px;">Your share link</div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:13px 14px;margin-bottom:14px;word-break:break-all;">
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--ink2);line-height:1.6;">${url}</span>
        </div>
        <button onclick="_copyMobLink('${url.replace(/'/g,"\\'")}', this)" class="mhf-save-btn" style="margin-top:0;">📋 Copy Link</button>
        <div style="background:var(--surface);border-radius:8px;padding:12px 14px;font-size:11px;color:var(--ink3);line-height:1.7;font-family:var(--font-mono);margin-top:14px;">
          ℹ Your partner sees a read-only view. To disable, change your password.
        </div>
        <div style="height:20px"></div>
      </div>
    </div>`;
  o.classList.add('open');
}

function closeMobAccountability() {
  const o = document.getElementById('mobAccOverlay');
  if (o) o.classList.remove('open');
}

function _copyMobLink(url, btn) {
  navigator.clipboard.writeText(url).then(() => {
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Link', 2000);
    showToast('Link copied! Send it to your partner ✅');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = url; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Link', 2000);
    showToast('Link copied!');
  });
}
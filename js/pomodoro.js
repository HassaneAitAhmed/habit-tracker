let pomodoroState = {
  running:   false,
  paused:    false,
  seconds:   25 * 60,
  total:     25 * 60,
  customMin: 25,
  mode:      'work',
  habitId:   null,
  habitName: '',
  interval:  null,
  sessions:  0,
};

function openPomodoro(habitId, habitName) {
  pomodoroState.habitId   = habitId   || null;
  pomodoroState.habitName = habitName || 'Free session';
  pausePomodoro();
  pomodoroState.running = false;
  pomodoroState.paused  = false;
  pomodoroState.mode    = 'work';
  
  const sec = pomodoroState.customMin * 60;
  pomodoroState.seconds = sec;
  pomodoroState.total   = sec;
  const el = document.getElementById('pomodoroOverlay');
  if (el) el.classList.add('open');
  renderPomodoroUI();
}

function closePomodoro() {
  pausePomodoro();
  document.getElementById('pomodoroOverlay').classList.remove('open');
}

function renderPomodoroUI() {
  const el = document.getElementById('pomodoroContent');
  if (!el) return;

  const mins = Math.floor(pomodoroState.seconds / 60);
  const secs = pomodoroState.seconds % 60;
  const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  const progress = pomodoroState.total > 0
    ? 1 - (pomodoroState.seconds / pomodoroState.total) : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - progress);

  const modeColors = {
    work:        'var(--accent)',
    short_break: 'var(--check)',
    long_break:  '#185FA5',
  };
  const modeLabels = {
    work: 'Focus', short_break: 'Short Break', long_break: 'Long Break'
  };
  const color = modeColors[pomodoroState.mode];

  
  const presets = [5, 10, 15, 20, 25, 30, 45, 60];
  const presetsHtml = pomodoroState.mode === 'work'
    ? `<div class="pomo-presets">
        ${presets.map(m =>
          `<button class="pomo-preset ${pomodoroState.customMin === m && !pomodoroState.running && !pomodoroState.paused ? 'active' : ''}"
           onclick="setPomoCustomDuration(${m})">${m}m</button>`
        ).join('')}
       </div>`
    : '';

  el.innerHTML = `
    <div class="pomo-habit-label">${pomodoroState.habitName}</div>

    <div class="pomo-mode-tabs">
      <button class="pomo-mode-btn ${pomodoroState.mode==='work'?'active':''}"
        onclick="setPomoMode('work')">Focus</button>
      <button class="pomo-mode-btn ${pomodoroState.mode==='short_break'?'active':''}"
        onclick="setPomoMode('short_break')">Short Break</button>
      <button class="pomo-mode-btn ${pomodoroState.mode==='long_break'?'active':''}"
        onclick="setPomoMode('long_break')">Long Break</button>
    </div>

    ${presetsHtml}

    <div class="pomo-ring-wrap">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="54" fill="none" stroke="var(--border)" stroke-width="8"/>
        <circle cx="65" cy="65" r="54" fill="none" stroke="${color}" stroke-width="8"
          stroke-dasharray="${circumference.toFixed(1)}"
          stroke-dashoffset="${offset.toFixed(1)}"
          stroke-linecap="round"
          transform="rotate(-90 65 65)"
          style="transition:stroke-dashoffset .9s linear"/>
      </svg>
      <div class="pomo-time">${timeStr}</div>
      <div class="pomo-mode-label">${modeLabels[pomodoroState.mode]}</div>
    </div>

    <div class="pomo-sessions">
      Session ${pomodoroState.sessions + 1} · ${pomodoroState.sessions} completed today
    </div>

    <div class="pomo-btns">
      ${!pomodoroState.running || pomodoroState.paused
        ? `<button class="pomo-btn primary" onclick="startPomodoro()">
             ▶ ${pomodoroState.paused ? 'Resume' : 'Start'}
           </button>`
        : `<button class="pomo-btn secondary" onclick="pausePomodoro()">⏸ Pause</button>`
      }
      <button class="pomo-btn secondary" onclick="resetPomodoro(true)">↺ Reset</button>
    </div>
  `;
}

function setPomoCustomDuration(minutes) {
  if (pomodoroState.running) return;
  pomodoroState.customMin = minutes;
  pomodoroState.seconds   = minutes * 60;
  pomodoroState.total     = minutes * 60;
  pomodoroState.paused    = false;
  renderPomodoroUI();
}

function setPomoMode(mode) {
  pausePomodoro();
  pomodoroState.mode    = mode;
  pomodoroState.paused  = false;
  pomodoroState.running = false;
  const defaults = { work: pomodoroState.customMin * 60, short_break: 5*60, long_break: 15*60 };
  pomodoroState.seconds = defaults[mode];
  pomodoroState.total   = defaults[mode];
  renderPomodoroUI();
}

function startPomodoro() {
  pomodoroState.running = true;
  pomodoroState.paused  = false;
  clearInterval(pomodoroState.interval);
  pomodoroState.interval = setInterval(() => {
    pomodoroState.seconds--;
    renderPomodoroUI();
    if (pomodoroState.seconds <= 0) {
      clearInterval(pomodoroState.interval);
      pomodoroState.running = false;
      onPomodoroComplete();
    }
  }, 1000);
  renderPomodoroUI();
}

function pausePomodoro() {
  clearInterval(pomodoroState.interval);
  if (pomodoroState.running) {
    pomodoroState.paused  = true;
    pomodoroState.running = false;
    renderPomodoroUI();
  }
}

function resetPomodoro(render = true) {
  clearInterval(pomodoroState.interval);
  pomodoroState.running = false;
  pomodoroState.paused  = false;
  const defaults = { work: pomodoroState.customMin * 60, short_break: 5*60, long_break: 15*60 };
  pomodoroState.seconds = defaults[pomodoroState.mode];
  pomodoroState.total   = defaults[pomodoroState.mode];
  if (render) renderPomodoroUI();
}

async function onPomodoroComplete() {
  pomodoroState.sessions++;

  
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq; o.type = 'sine';
      g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.3);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.35);
    });
  } catch(e) {}

  
  if (pomodoroState.mode === 'work' && pomodoroState.habitId) {
    const todayD = today.getDate();
    const key = `${pomodoroState.habitId}__${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(todayD).padStart(2,'0')}`;
    if (!checks[key]) await toggleCheck(pomodoroState.habitId, todayD);
    showToast('🍅 Session complete! Habit checked ✓');
  } else {
    showToast(pomodoroState.mode === 'work' ? '🍅 Session complete!' : '☕ Break over!');
  }

  
  try {
    if (Notification.permission === 'granted') {
      new Notification('🍅 Pomodoro', {
        body: pomodoroState.mode === 'work' ? 'Session done! Take a break.' : 'Break over. Back to work!'
      });
    }
  } catch(e) {}

  
  if (pomodoroState.mode === 'work') {
    setPomoMode(pomodoroState.sessions % 4 === 0 ? 'long_break' : 'short_break');
  } else {
    setPomoMode('work');
  }
}

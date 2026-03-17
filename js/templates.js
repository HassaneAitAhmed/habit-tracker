const HABIT_TEMPLATE_PACKS = [
  {
    id: 'morning_warrior',
    name: 'Morning Warrior',
    emoji: '⚔️',
    desc: 'The non-negotiable morning stack',
    color: '#C4924A',
    habits: [
      { name: 'Wake up at 05:30', emoji: '⏰', color: '#C4924A', freq: 'daily',    week_goal: 7, completion_type: 'check' },
      { name: 'Cold Shower',      emoji: '🚿', color: '#185FA5', freq: 'daily',    week_goal: 7, completion_type: 'check' },
      { name: 'Meditation',       emoji: '🧘', color: '#3B6D8A', freq: 'daily',    week_goal: 6, completion_type: 'duration', completion_unit: 'min', completion_target: 10 },
      { name: 'Workout',          emoji: '💪', color: '#4A3F2F', freq: 'weekdays', week_goal: 5, completion_type: 'duration', completion_unit: 'min', completion_target: 45 },
      { name: 'Read 10 pages',    emoji: '📚', color: '#3B6D11', freq: 'daily',    week_goal: 7, completion_type: 'count',    completion_unit: 'pages', completion_target: 10 },
    ]
  },
  {
    id: 'student_focus',
    name: 'Student Focus',
    emoji: '🎓',
    desc: 'Built for academic excellence',
    color: '#185FA5',
    habits: [
      { name: 'Study session',    emoji: '📖', color: '#185FA5', freq: 'daily',    week_goal: 6, completion_type: 'duration', completion_unit: 'min', completion_target: 90 },
      { name: 'No social media',  emoji: '🚫', color: '#993556', freq: 'weekdays', week_goal: 5, completion_type: 'check' },
      { name: 'Review notes',     emoji: '📝', color: '#6D8A3B', freq: 'daily',    week_goal: 6, completion_type: 'check' },
      { name: 'Practice problems',emoji: '🧮', color: '#5B4A8A', freq: 'weekdays', week_goal: 5, completion_type: 'count', completion_unit: 'problems', completion_target: 5 },
      { name: 'Sleep by 23:00',   emoji: '😴', color: '#D85A30', freq: 'daily',    week_goal: 7, completion_type: 'check' },
      { name: 'Daily planning',   emoji: '🗓', color: '#854F0B', freq: 'daily',    week_goal: 7, completion_type: 'check' },
    ]
  },
  {
    id: 'athlete',
    name: 'Athlete',
    emoji: '🏆',
    desc: 'Performance & recovery focused',
    color: '#993556',
    habits: [
      { name: 'Training',         emoji: '🏃', color: '#993556', freq: 'custom',   week_goal: 4, completion_type: 'duration', completion_unit: 'min', completion_target: 60, custom_days: [1,2,4,5] },
      { name: 'Protein goal',     emoji: '🥩', color: '#D85A30', freq: 'daily',    week_goal: 7, completion_type: 'count',    completion_unit: 'g',   completion_target: 150 },
      { name: 'Water intake',     emoji: '💧', color: '#185FA5', freq: 'daily',    week_goal: 7, completion_type: 'count',    completion_unit: 'glasses', completion_target: 8 },
      { name: 'Stretch / Mobility',emoji:'🤸', color: '#3B6D8A', freq: 'daily',    week_goal: 6, completion_type: 'duration', completion_unit: 'min', completion_target: 15 },
      { name: 'Sleep 8h',         emoji: '😴', color: '#3B6D11', freq: 'daily',    week_goal: 7, completion_type: 'check' },
      { name: 'Cold exposure',    emoji: '🧊', color: '#4A3F2F', freq: 'daily',    week_goal: 5, completion_type: 'duration', completion_unit: 'min', completion_target: 3 },
    ]
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    emoji: '🌿',
    desc: 'Calm, clarity, consistency',
    color: '#3B6D11',
    habits: [
      { name: 'Morning meditation',emoji: '🧘', color: '#3B6D8A', freq: 'daily',   week_goal: 7, completion_type: 'duration', completion_unit: 'min', completion_target: 10 },
      { name: 'Gratitude journal', emoji: '✍️', color: '#6D8A3B', freq: 'daily',   week_goal: 7, completion_type: 'check' },
      { name: 'No sugar',          emoji: '🚫', color: '#993556', freq: 'daily',   week_goal: 6, completion_type: 'check' },
      { name: 'Nature walk',       emoji: '🌲', color: '#3B6D11', freq: 'daily',   week_goal: 5, completion_type: 'duration', completion_unit: 'min', completion_target: 20 },
      { name: 'Digital detox 21h', emoji: '📵', color: '#5B4A8A', freq: 'daily',   week_goal: 6, completion_type: 'check' },
    ]
  },
  {
    id: 'builder',
    name: 'Builder / Dev',
    emoji: '💻',
    desc: 'For developers building in public',
    color: '#5B4A8A',
    habits: [
      { name: 'Code 1 hour',       emoji: '💻', color: '#5B4A8A', freq: 'weekdays', week_goal: 5, completion_type: 'duration', completion_unit: 'min', completion_target: 60 },
      { name: 'Ship something',    emoji: '🚀', color: '#D85A30', freq: 'weekdays', week_goal: 3, completion_type: 'check' },
      { name: 'Learn something',   emoji: '🎯', color: '#185FA5', freq: 'daily',    week_goal: 6, completion_type: 'duration', completion_unit: 'min', completion_target: 30 },
      { name: 'No meetings before 10am', emoji: '🔕', color: '#993556', freq: 'weekdays', week_goal: 5, completion_type: 'check' },
      { name: 'Plan tomorrow',     emoji: '📋', color: '#6D8A3B', freq: 'weekdays', week_goal: 5, completion_type: 'check' },
    ]
  }
];

function openTemplates() {
  const el = document.getElementById('templatesOverlay');
  if (!el) return;
  renderTemplateList();
  el.classList.add('open');
}

function closeTemplates() {
  document.getElementById('templatesOverlay').classList.remove('open');
}

function renderTemplateList() {
  const el = document.getElementById('templatesList');
  if (!el) return;
  el.innerHTML = HABIT_TEMPLATE_PACKS.map(pack => `
    <div class="template-pack" onclick="previewTemplate('${pack.id}')">
      <div class="template-pack-icon">${pack.emoji}</div>
      <div class="template-pack-info">
        <div class="template-pack-name">${pack.name}</div>
        <div class="template-pack-desc">${pack.desc} · ${pack.habits.length} habits</div>
      </div>
      <div class="template-pack-arrow">›</div>
    </div>
  `).join('');
}

function previewTemplate(id) {
  const pack = HABIT_TEMPLATE_PACKS.find(p => p.id === id);
  if (!pack) return;
  const el = document.getElementById('templatePreview');
  if (!el) return;
  el.innerHTML = `
    <div class="template-preview-header">
      <button onclick="renderTemplateList();document.getElementById('templatePreview').innerHTML=''" class="template-back">← Back</button>
      <div class="template-preview-title">${pack.emoji} ${pack.name}</div>
    </div>
    <div class="template-preview-habits">
      ${pack.habits.map(h => `
        <div class="template-habit-row">
          <span style="font-size:18px">${h.emoji}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:500;color:var(--ink)">${h.name}</div>
            <div style="font-size:10px;color:var(--ink3);font-family:var(--font-mono)">
              ${h.freq} · Goal ${h.week_goal}/week
              ${h.completion_type !== 'check' ? ' · ' + h.completion_target + ' ' + h.completion_unit : ''}
            </div>
          </div>
          <div class="template-habit-dot" style="background:${h.color}"></div>
        </div>
      `).join('')}
    </div>
    <button class="template-apply-btn" onclick="applyTemplate('${id}')">Add these ${pack.habits.length} habits →</button>
  `;
  document.getElementById('templatesList').style.display = 'none';
  el.style.display = 'block';
}

async function applyTemplate(id) {
  const pack = HABIT_TEMPLATE_PACKS.find(p => p.id === id);
  if (!pack) return;
  const btn = document.querySelector('.template-apply-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Adding habits…'; }
  const baseOrder = habits.length;
  const inserts = pack.habits.map((h, i) => ({
    user_id: currentUser.id,
    name: h.name, emoji: h.emoji, color: h.color,
    freq: h.freq, custom_days: h.custom_days || [],
    week_goal: h.week_goal,
    completion_type: h.completion_type || 'check',
    completion_unit: h.completion_unit || '',
    completion_target: h.completion_target || 1,
    sort_order: baseOrder + i
  }));
  const { data, error } = await sb.from('habits').insert(inserts).select();
  if (error) { showToast('Error adding template', 'error'); return; }
  data.forEach(h => habits.push({ ...h, customDays: h.custom_days || [], weekGoal: h.week_goal || 5 }));
  closeTemplates();
  document.getElementById('templatePreview').innerHTML = '';
  document.getElementById('templatePreview').style.display = 'none';
  document.getElementById('templatesList').style.display = 'block';
  renderAll();
  showToast(`${pack.name} pack added! (${pack.habits.length} habits) 🎉`);
}

// ══════════════════════════════════════════════
//  HABIT STACKING
//  Link habits into a named chain.
//  Visual chain view — see the full sequence.
// ══════════════════════════════════════════════

let stacks = [];  // loaded from DB

async function loadStacks() {
  if (!currentUser) return;
  const { data, error } = await sb.from('habit_stacks')
    .select('*').eq('user_id', currentUser.id).order('created_at');
  if (!error && data) stacks = data;
}

async function saveStack(name, emoji, habitIds) {
  if (!habitIds.length) { showToast('Add at least one habit to the stack'); return; }
  const { data, error } = await sb.from('habit_stacks')
    .insert({ user_id: currentUser.id, name, emoji, habit_ids: habitIds })
    .select().single();
  if (error) { showToast('Error saving stack', 'error'); return; }
  stacks.push(data);
  closeStackModal();
  renderStacks();
  showToast(`Stack "${name}" created!`);
}

async function deleteStack(id) {
  if (!confirm('Delete this habit stack?')) return;
  await sb.from('habit_stacks').delete().eq('id', id);
  stacks = stacks.filter(s => s.id !== id);
  renderStacks();
}

function openStackModal() {
  const el = document.getElementById('stackModal');
  if (!el) return;
  renderStackBuilder();
  el.classList.add('open');
}

function closeStackModal() {
  const el = document.getElementById('stackModal');
  if (el) el.classList.remove('open');
}

function renderStackBuilder() {
  const el = document.getElementById('stackBuilderHabits');
  if (!el) return;
  el.innerHTML = habits.map(h => `
    <div class="stack-habit-option" data-id="${h.id}" onclick="toggleStackHabit(this)">
      <span style="font-size:16px">${h.emoji}</span>
      <span style="font-size:12px;flex:1">${h.name}</span>
      <span class="stack-check">○</span>
    </div>
  `).join('');
}

function toggleStackHabit(el) {
  el.classList.toggle('selected');
  el.querySelector('.stack-check').textContent = el.classList.contains('selected') ? '✓' : '○';
  updateStackPreview();
}

function updateStackPreview() {
  const selected = [...document.querySelectorAll('.stack-habit-option.selected')]
    .map(el => el.dataset.id)
    .map(id => habits.find(h => h.id === id))
    .filter(Boolean);
  const preview = document.getElementById('stackPreview');
  if (!preview) return;
  if (!selected.length) { preview.innerHTML = ''; return; }
  preview.innerHTML = selected.map((h, i) =>
    `<span class="stack-chain-item">${h.emoji} ${h.name}</span>${i < selected.length-1 ? '<span class="stack-arrow">→</span>' : ''}`
  ).join('');
}

async function submitStack() {
  const name = document.getElementById('stackNameInput')?.value?.trim() || 'My Stack';
  const emoji = document.getElementById('stackEmojiInput')?.value || '🔗';
  const habitIds = [...document.querySelectorAll('.stack-habit-option.selected')]
    .map(el => el.dataset.id);
  await saveStack(name, emoji, habitIds);
}

function renderStacks() {
  const el = document.getElementById('stacksList');
  if (!el) return;
  if (!stacks.length) {
    el.innerHTML = '<div class="empty-mini">No stacks yet. Create a chain of habits you always do together.</div>';
    return;
  }
  el.innerHTML = stacks.map(stack => {
    const stackHabits = (stack.habit_ids || [])
      .map(id => habits.find(h => h.id === id))
      .filter(Boolean);
    const todayD = today.getDate();
    const allDone = stackHabits.every(h =>
      !isApplicable(h, today.getFullYear(), today.getMonth(), todayD) ||
      isChecked(h.id, todayD)
    );
    return `
      <div class="stack-card ${allDone ? 'complete' : ''}">
        <div class="stack-card-header">
          <span style="font-size:18px">${stack.emoji}</span>
          <div class="stack-card-name">${stack.name}</div>
          ${allDone ? '<span class="stack-complete-badge">✓ Done</span>' : ''}
          <button class="stack-delete-btn" onclick="deleteStack('${stack.id}')">✕</button>
        </div>
        <div class="stack-chain">
          ${stackHabits.map((h, i) => {
            const done = isChecked(h.id, todayD);
            return `<div class="stack-chain-step ${done ? 'done' : ''}">
              <div class="stack-step-dot ${done ? 'done' : ''}"></div>
              <span style="font-size:13px">${h.emoji} ${h.name}</span>
            </div>
            ${i < stackHabits.length-1 ? '<div class="stack-connector"></div>' : ''}`;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

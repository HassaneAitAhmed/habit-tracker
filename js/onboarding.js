const STARTER_HABITS = [
  { name:'Wake up at 06:00', emoji:'⏰', color:'#C4924A' },
  { name:'Cold Shower',      emoji:'🚿', color:'#185FA5' },
  { name:'GYM',              emoji:'💪', color:'#4A3F2F' },
  { name:'Meditation',       emoji:'🧘', color:'#3B6D8A' },
  { name:'Read 10 pages',    emoji:'📚', color:'#3B6D11' },
  { name:'No sugar',         emoji:'🚫', color:'#993556' },
  { name:'Planning',         emoji:'📝', color:'#6D8A3B' },
  { name:'Sleep before 11',  emoji:'😴', color:'#5B4A8A' },
  { name:'No alcohol',       emoji:'🍵', color:'#854F0B' },
  { name:'Learn a skill',    emoji:'🎯', color:'#D85A30' },
];

let onboardingStep = 1;
let onboardingSelected = new Set();

function shouldShowOnboarding() {
  return !localStorage.getItem('onboarding_done') && habits.length === 0;
}

function showOnboarding() {
  const el = document.getElementById('onboardingOverlay');
  if (el) { el.classList.add('open'); renderOnboardingStep(); }
}

function hideOnboarding() {
  document.getElementById('onboardingOverlay').classList.remove('open');
  localStorage.setItem('onboarding_done', '1');
}

function renderOnboardingStep() {
  document.querySelectorAll('.ob-step').forEach((s,i) => {
    s.classList.toggle('active', i+1 === onboardingStep);
  });
  document.querySelectorAll('.ob-dot').forEach((d,i) => {
    d.classList.toggle('active', i+1 === onboardingStep);
  });
}

function obNext() {
  if (onboardingStep === 2 && onboardingSelected.size === 0) {
    showToast('Pick at least one habit to continue'); return;
  }
  if (onboardingStep < 3) { onboardingStep++; renderOnboardingStep(); }
}
function obBack() { if (onboardingStep > 1) { onboardingStep--; renderOnboardingStep(); } }

function toggleStarterHabit(el, idx) {
  el.classList.toggle('selected');
  if (onboardingSelected.has(idx)) onboardingSelected.delete(idx);
  else onboardingSelected.add(idx);
}

async function finishOnboarding() {
  const wakeTime = document.getElementById('obWakeTime')?.value || '06:00';
  const inserts = [];
  onboardingSelected.forEach(idx => {
    const h = STARTER_HABITS[idx];
    inserts.push({ user_id: currentUser.id, name: h.name, emoji: h.emoji, color: h.color,
      freq: 'daily', custom_days: [], week_goal: 5 });
  });
  if (inserts.length > 0) {
    const { data, error } = await sb.from('habits').insert(inserts).select();
    if (!error && data) {
      data.forEach(h => habits.push({ ...h, customDays: h.custom_days||[], weekGoal: h.week_goal||5, freq: h.freq||'daily' }));
    }
  }
  settings.reminderTime = wakeTime;
  await saveSettingsDB();
  hideOnboarding();
  renderAll();
  showToast('Welcome! Your habits are set up 🎉');
}

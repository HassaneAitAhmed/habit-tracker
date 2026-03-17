function renderMood() {
  const container = document.getElementById('moodRows');
  if (!container) return;

  const days  = getDays(viewYear, viewMonth);
  const types = [
    ['mood',       'Mood'],
    ['motivation', 'Motivation']
  ];

  let html = '';
  types.forEach(([type, label]) => {
    html += `<div class="mood-row">`;
    html += `<div class="mood-label">${label}</div>`;

    for (let d = 1; d <= days; d++) {
      const ds  = toDateStr(viewYear, viewMonth, d);
      const val = moods[`${type}__${ds}`] || null;
      html += `<div
        class="mood-dot ${val ? 'selected' : ''}"
        onclick="cycleMood('${type}','${ds}')"
        title="${label} ${d}: ${val || 'not set'}">${val || ''}</div>`;
    }

    html += `</div>`;
  });

  container.innerHTML = html;
}

async function cycleMood(type, dateStr) {
  const curMood = moods[`mood__${dateStr}`]       || 0;
  const curMot  = moods[`motivation__${dateStr}`] || 0;

  let newMood = curMood;
  let newMot  = curMot;

  if (type === 'mood') {
    newMood = curMood === 0 ? 5 : curMood >= 10 ? 0 : curMood + 1;
  } else {
    newMot  = curMot  === 0 ? 5 : curMot  >= 10 ? 0 : curMot  + 1;
  }

  
  if (newMood) moods[`mood__${dateStr}`]         = newMood;
  else         delete moods[`mood__${dateStr}`];

  if (newMot)  moods[`motivation__${dateStr}`]   = newMot;
  else         delete moods[`motivation__${dateStr}`];

  
  renderMood();

  
  await dbSaveMood(dateStr, newMood || null, newMot || null);
}

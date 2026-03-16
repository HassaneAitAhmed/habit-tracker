
function renderJournal() {
  const jLabel = document.getElementById('jMonthLabel');
  if (!jLabel) return;
  jLabel.textContent = `${MONTHS[jMonth]} ${jYear}`;

  const days = getDays(jYear, jMonth);
  let dp = '';
  for (let d = 1; d <= days; d++) {
    const ds      = `${jYear}-${String(jMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasNote = !!notes[`day__${ds}`];
    const isActive = d === jDay && jYear === today.getFullYear() && jMonth === today.getMonth();
    dp += `<button class="journal-day-btn ${isActive ? 'active' : ''} ${hasNote ? 'has-note' : ''}" onclick="selectJDay(${d})">${d}</button>`;
  }
  document.getElementById('journalDayPicker').innerHTML = dp;

  const ds = `${jYear}-${String(jMonth + 1).padStart(2, '0')}-${String(jDay).padStart(2, '0')}`;
  document.getElementById('journalDateLabel').textContent = `${MONTHS[jMonth]} ${jDay}, ${jYear}`;
  const n = notes[`day__${ds}`];
  document.getElementById('journalTextarea').value = n ? n.content : '';

  const recent = Object.entries(notes)
    .filter(([k]) => k.startsWith('day__'))
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 5);

  document.getElementById('journalEntryList').innerHTML = recent.map(([k, n]) => {
    const parts = k.replace('day__', '').split('-');
    return `<div class="journal-entry-card">
      <div class="journal-entry-date">${MONTHS[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}</div>
      <div style="font-size:13px;color:var(--ink2);line-height:1.65">
        ${(n.content || '').substring(0, 200)}${(n.content || '').length > 200 ? '…' : ''}
      </div>
    </div>`;
  }).join('') || '<div style="color:var(--ink3);font-size:12px;font-family:var(--font-mono);">No entries yet.</div>';
}

function selectJDay(d) { jDay = d; renderJournal(); }
function jPrev() { jMonth--; if (jMonth < 0) { jMonth = 11; jYear--; } renderJournal(); }
function jNext() { jMonth++; if (jMonth > 11) { jMonth = 0; jYear++; } renderJournal(); }

async function saveJournalNote() {
  const text = document.getElementById('journalTextarea').value.trim();
  const ds   = `${jYear}-${String(jMonth + 1).padStart(2, '0')}-${String(jDay).padStart(2, '0')}`;
  const key  = `day__${ds}`;
  setSyncState('saving');
  if (text) {
    const { data, error } = await sb.from('journal_notes')
      .upsert({ user_id: currentUser.id, note_date: ds, content: text, updated_at: new Date().toISOString() },
               { onConflict: 'user_id,note_date' })
      .select().single();
    if (error) { setSyncState('error'); return; }
    notes[key] = data;
  } else {
    if (notes[key]) await sb.from('journal_notes').delete().eq('id', notes[key].id);
    delete notes[key];
  }
  setSyncState('saved');
  renderJournal();
  showToast('Note saved!');
}

let dragState = {
  dragging: null,   
  fromIdx:  null,
  ghost:    null,
  startY:   0,
  lastY:    0,
};

function initDragOrder() {
  
  const rows = document.querySelectorAll('.drag-habit-row');
  rows.forEach((row, idx) => {
    const handle = row.querySelector('.drag-handle');
    if (!handle) return;
    
    handle.addEventListener('mousedown', e => startDrag(e, row, idx, 'mouse'));
    
    handle.addEventListener('touchstart', e => startDrag(e, row, idx, 'touch'), { passive: false });
  });
}

function startDrag(e, row, idx, type) {
  e.preventDefault();
  const habitId = row.dataset.habitId;
  const y = type === 'touch' ? e.touches[0].clientY : e.clientY;

  dragState = { dragging: habitId, fromIdx: idx, ghost: null, startY: y, lastY: y, type };

  row.classList.add('dragging');

  const onMove = type === 'touch'
    ? ev => moveDrag(ev, ev.touches[0].clientY)
    : ev => moveDrag(ev, ev.clientY);

  const onEnd = () => {
    endDrag();
    document.removeEventListener(type === 'touch' ? 'touchmove' : 'mousemove', onMove);
    document.removeEventListener(type === 'touch' ? 'touchend'  : 'mouseup',   onEnd);
  };

  document.addEventListener(type === 'touch' ? 'touchmove' : 'mousemove', onMove, { passive: false });
  document.addEventListener(type === 'touch' ? 'touchend'  : 'mouseup',   onEnd);
}

function moveDrag(e, currentY) {
  e.preventDefault();
  dragState.lastY = currentY;

  const rows = [...document.querySelectorAll('.drag-habit-row')];
  const draggingRow = rows.find(r => r.dataset.habitId === dragState.dragging);
  if (!draggingRow) return;

  
  let targetIdx = dragState.fromIdx;
  rows.forEach((row, i) => {
    const rect = row.getBoundingClientRect();
    const mid  = rect.top + rect.height / 2;
    if (currentY > mid) targetIdx = i;
  });

  
  const container = draggingRow.parentElement;
  const rowsArr = [...container.querySelectorAll('.drag-habit-row')];
  const from = rowsArr.indexOf(draggingRow);
  if (from === targetIdx) return;

  const ref = rowsArr[targetIdx > from ? targetIdx + 1 : targetIdx];
  container.insertBefore(draggingRow, ref || null);
}

async function endDrag() {
  const rows = [...document.querySelectorAll('.drag-habit-row')];
  rows.forEach(r => r.classList.remove('dragging'));

  
  const newOrder = rows.map(r => r.dataset.habitId);

  
  const reordered = newOrder.map(id => habits.find(h => h.id === id)).filter(Boolean);
  habits.length = 0;
  reordered.forEach(h => habits.push(h));

  
  setSyncState('saving');
  const updates = newOrder.map((id, i) =>
    sb.from('habits').update({ sort_order: i }).eq('id', id).eq('user_id', currentUser.id)
  );
  await Promise.all(updates);
  setSyncState('saved');

  dragState = { dragging: null, fromIdx: null, ghost: null, startY: 0, lastY: 0 };
  renderAll();
}

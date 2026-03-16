
function renderCatFilter() {
  const sel = document.getElementById('catFilter');
  if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = `<option value="">All Categories</option>` +
    categories.map(c => `<option value="${c.id}" ${cur === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
}

async function addCategory() {
  const { data, error } = await sb.from('categories')
    .insert({ user_id: currentUser.id, name: 'New Category', color: COLORS[Math.floor(Math.random() * COLORS.length)] })
    .select().single();
  if (error) return;
  categories.push(data);
  renderSettings();
  renderCatFilter();
}

async function updateCatColor(id, color) {
  const c = categories.find(x => x.id === id);
  if (c) { c.color = color; await sb.from('categories').update({ color }).eq('id', id); renderAll(); }
}

async function updateCatName(id, name) {
  const c = categories.find(x => x.id === id);
  if (c) { c.name = name; await sb.from('categories').update({ name }).eq('id', id); renderCatFilter(); }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await sb.from('categories').delete().eq('id', id);
  categories = categories.filter(c => c.id !== id);
  habits.forEach(h => { if (h.category_id === id) h.category_id = null; });
  renderAll();
}

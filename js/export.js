
function exportCSV() {
  const days = getDays(viewYear, viewMonth);

  let csv = `Habit,Category,Frequency,`;
  for (let d = 1; d <= days; d++) csv += `Day ${d},`;
  csv += `Total,Completion%\n`;

  habits.forEach(h => {
    const cat = getCat(h.category_id);
    csv += `"${h.name}","${cat ? cat.name : ''}","${h.freq || 'daily'}",`;

    let done = 0, applicable = 0;
    for (let d = 1; d <= days; d++) {
      if (isApplicable(h, viewYear, viewMonth, d)) {
        applicable++;
        const checked = isChecked(h.id, d) ? 1 : 0;
        csv += `${checked},`;
        if (checked) done++;
      } else {
        csv += `N/A,`;
      }
    }
    const pct = applicable > 0 ? Math.round((done / applicable) * 100) : 0;
    csv += `${done},${pct}%\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `habits-${MONTHS[viewMonth]}-${viewYear}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);

  showToast('CSV exported!');
}

function exportPDF() {
  const days = getDays(viewYear, viewMonth);

  let tableRows = '';
  habits.forEach(h => {
    let done = 0;
    let cells = '';

    for (let d = 1; d <= days; d++) {
      if (isApplicable(h, viewYear, viewMonth, d)) {
        const checked = isChecked(h.id, d);
        cells += `<td class="${checked ? 'done' : ''}">${checked ? '✓' : ''}</td>`;
        if (checked) done++;
      } else {
        cells += `<td class="na">·</td>`;
      }
    }

    const applicable = habits.reduce((sum, _) => {
      let a = 0;
      for (let d = 1; d <= days; d++) if (isApplicable(h, viewYear, viewMonth, d)) a++;
      return a;
    }, 0);

    let app2 = 0;
    for (let d = 1; d <= days; d++) if (isApplicable(h, viewYear, viewMonth, d)) app2++;
    const pct = app2 > 0 ? Math.round((done / app2) * 100) : 0;

    tableRows += `<tr>
      <td class="name">${h.emoji} ${h.name}</td>
      ${cells}
      <td class="pct">${pct}%</td>
    </tr>`;
  });

  let dayHeaders = '';
  for (let d = 1; d <= days; d++) dayHeaders += `<th>${d}</th>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Habit Tracker — ${MONTHS[viewMonth]} ${viewYear}</title>
  <style>
    body  { font-family: Georgia, serif; padding: 32px; color: #1C1A15; background: #fff; }
    h1    { font-size: 22px; margin-bottom: 4px; }
    h2    { font-size: 14px; color: #6B6558; font-weight: 400; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th    { background: #4A3F2F; color: #fff; padding: 5px 4px; text-align: center; }
    th.left { text-align: left; padding-left: 8px; }
    td    { padding: 4px; border: 1px solid #D8D2C4; text-align: center; }
    td.name { text-align: left; padding-left: 8px; font-weight: 500; }
    td.done { background: #EAF3DE; color: #3B6D11; }
    td.na   { color: #aaa; }
    td.pct  { font-weight: 700; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <h1>Habit Tracker — ${MONTHS[viewMonth]} ${viewYear}</h1>
  <h2>Generated on ${today.toLocaleDateString()}</h2>
  <table>
    <thead>
      <tr>
        <th class="left">Habit</th>
        ${dayHeaders}
        <th>%</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);

  showToast('PDF ready to print!');
}

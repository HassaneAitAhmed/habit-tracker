function renderBestDay() {
  const el = document.getElementById('bestDayChart');
  if (!el) return;

  const DAY_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  if (!habits.length) {
    el.innerHTML = '<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink3);padding:8px 0;">No habits yet.</div>';
    return;
  }

  // Walk every raw check key: "habitId__YYYY-MM-DD"
  const totalChecks = [0,0,0,0,0,0,0];
  const daysWithData = [0,0,0,0,0,0,0];
  const seenDates = new Set();

  Object.keys(checks).forEach(function(key) {
    var idx = key.indexOf('__');
    if (idx === -1) return;
    var ds = key.substring(idx + 2);
    if (!ds || ds.length < 10) return;
    var yr = parseInt(ds.substring(0,4));
    var mo = parseInt(ds.substring(5,7)) - 1;
    var dy = parseInt(ds.substring(8,10));
    var dow = new Date(yr, mo, dy).getDay();
    totalChecks[dow]++;
    seenDates.add(ds);
  });

  if (!seenDates.size) {
    el.innerHTML = '<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink3);padding:8px 0;">Not enough data yet — keep tracking!</div>';
    return;
  }

  // Count how many times each DOW appears in the tracked dates
  seenDates.forEach(function(ds) {
    var yr = parseInt(ds.substring(0,4));
    var mo = parseInt(ds.substring(5,7)) - 1;
    var dy = parseInt(ds.substring(8,10));
    var dow = new Date(yr, mo, dy).getDay();
    daysWithData[dow]++;
  });

  // avg checks per day per habit (as %)
  var avgs = totalChecks.map(function(total, i) {
    if (daysWithData[i] === 0) return 0;
    return Math.round((total / (daysWithData[i] * habits.length)) * 100);
  });

  var bestPct  = Math.max.apply(null, avgs);
  var worstPct = Math.min.apply(null, avgs);
  var bestIdx  = avgs.indexOf(bestPct);
  var worstIdx = avgs.lastIndexOf(worstPct);
  if (worstIdx === bestIdx) worstIdx = -1;

  if (bestPct === 0) {
    el.innerHTML = '<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink3);padding:8px 0;">Not enough data yet — keep tracking!</div>';
    return;
  }

  var rows = DAY_SHORT.map(function(name, i) {
    var isBest  = i === bestIdx;
    var isWorst = i === worstIdx;
    var pct     = avgs[i];
    var barW    = Math.round((pct / bestPct) * 100);
    var color   = isBest ? 'var(--accent)' : isWorst ? 'var(--danger)' : 'var(--gold)';
    return '<div class="ybd-row">'
      + '<div class="ybd-day' + (isBest ? ' best' : isWorst ? ' worst' : '') + '">' + name + '</div>'
      + '<div class="ybd-bar-bg"><div class="ybd-bar" style="width:' + barW + '%;background:' + color + '"></div></div>'
      + '<div class="ybd-pct">' + pct + '%</div>'
      + (isBest  ? '<div class="ybd-tag best-tag">Best</div>'   : '')
      + (isWorst ? '<div class="ybd-tag worst-tag">Worst</div>' : '')
      + '</div>';
  }).join('');

  el.innerHTML = ''
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
    +   '<div class="chart-title" style="margin:0;">Your Best Day of the Week</div>'
    +   '<div style="font-family:var(--font-mono);font-size:10px;color:var(--ink3);">' + seenDates.size + ' days tracked</div>'
    + '</div>'
    + '<div style="background:var(--surface);border-radius:10px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:16px;">'
    +   '<div style="font-size:32px;">🏆</div>'
    +   '<div>'
    +     '<div style="font-family:var(--font-head);font-size:22px;color:var(--accent);">' + DAY_FULL[bestIdx] + '</div>'
    +     '<div style="font-family:var(--font-mono);font-size:11px;color:var(--ink3);margin-top:3px;">Your strongest day · ' + bestPct + '% avg completion</div>'
    +   '</div>'
    + '</div>'
    + '<div class="ybd-rows">' + rows + '</div>';
}

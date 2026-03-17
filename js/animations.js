function popCheckbox(el) {
  el.style.transform = 'scale(1.35)';
  el.style.transition = 'transform .12s cubic-bezier(.34,1.56,.64,1)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 180);
}

function burstConfetti(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['var(--gold)', 'var(--accent)', 'var(--check)', '#E091C8', '#7CB9E8'];
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 10;
    const dist = 22 + Math.random() * 14;
    dot.style.cssText = `position:fixed;width:5px;height:5px;border-radius:50%;
      background:${colors[i % colors.length]};pointer-events:none;z-index:9999;
      left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);
      transition:all .5s cubic-bezier(.2,.8,.3,1);opacity:1;`;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.left = (cx + Math.cos(angle) * dist) + 'px';
      dot.style.top  = (cy + Math.sin(angle) * dist) + 'px';
      dot.style.opacity = '0';
      dot.style.transform = 'translate(-50%,-50%) scale(0)';
    });
    setTimeout(() => dot.remove(), 550);
  }
}

function animateStreakNumber(el, from, to) {
  const dur = 600, start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateBar(el, targetWidth) {
  el.style.width = '0%';
  el.style.transition = 'none';
  requestAnimationFrame(() => {
    el.style.transition = 'width .6s cubic-bezier(.4,0,.2,1)';
    el.style.width = targetWidth;
  });
}

function slideInCard(el, delay = 0) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
  el.style.transition = `opacity .35s ${delay}ms ease, transform .35s ${delay}ms ease`;
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
}

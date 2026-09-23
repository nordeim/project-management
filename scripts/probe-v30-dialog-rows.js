// Row-by-row census of the add-task dialog form
(() => {
  const out = {};
  let root = null;
  for (const d of document.querySelectorAll('div')) {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    if (cs.position === 'fixed' && r.width > 300 && r.height > 200 && d.querySelector('form') && !root) root = d;
  }
  if (!root) return 'NO DIALOG';
  // walk every direct-ish block inside the panel
  const panel = [...root.querySelectorAll('div')].find(d => getComputedStyle(d).position === 'relative' && d.getBoundingClientRect().height > 200 && d.querySelector('form')) || root;
  const rows = [];
  const walk = (el, depth) => {
    for (const c of el.children) {
      const tag = c.tagName;
      if (tag === 'svg' || tag === 'path') continue;
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      if (r.height < 1 || r.width < 1) continue;
      rows.push('  '.repeat(depth) + tag + ' y=' + Math.round(r.y) + ' h=' + Math.round(r.height*10)/10 + ' mb=' + cs.marginBottom + ' mt=' + cs.marginTop + ' gap=' + (cs.display.includes('flex')||cs.display.includes('grid') ? cs.gap||cs.rowGap : '') + ' ' + (c.textContent||'').trim().slice(0,14));
      if (depth < 3 && rows.length < 40) walk(c, depth+1);
    }
  };
  walk(panel, 0);
  out.rows = rows;
  return JSON.stringify(out, null, 1);
})()

// Wizard DOM walk — outer panel rows
(() => {
  const out = {};
  // outer panel: the fixed flex root's direct panel child
  let root = null;
  for (const d of document.querySelectorAll('div')) {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    if (cs.position === 'fixed' && r.width > 300 && r.height > 700 && cs.backgroundColor.startsWith('rgba(46') && !root) root = d;
  }
  if (!root) return 'NO WIZARD';
  const rows = [];
  const walk = (el, depth) => {
    for (const c of el.children) {
      if (['svg','path','style','script'].includes(c.tagName)) continue;
      const r = c.getBoundingClientRect();
      const c2 = getComputedStyle(c);
      if (r.height < 1 || r.width < 1) continue;
      rows.push('  '.repeat(depth) + c.tagName + ' ' + [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(',') + ' r=' + c2.borderRadius.split(' ').slice(0,1)[0] + ' pad=' + c2.padding + ' bg=' + c2.backgroundColor.slice(0,14) + ' fs=' + c2.fontSize + '/' + c2.fontWeight + ' ' + (c.textContent||'').trim().slice(0,30).replace(/\n/g,' '));
      if (depth < 5 && rows.length < 44) walk(c, depth+1);
    }
  };
  walk(root, 0);
  out.rows = rows;
  return JSON.stringify(out, null, 1);
})()

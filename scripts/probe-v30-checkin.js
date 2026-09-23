// Check-in modal census (no form) — rows, typography, buttons
(() => {
  const out = {};
  let root = null;
  for (const d of document.querySelectorAll('div')) {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    if (cs.position === 'fixed' && r.width > 300 && r.height > 150 && (d.querySelector('form') || d.querySelector('h2')) && !root) root = d;
  }
  if (!root) return 'NO MODAL';
  const rr = root.getBoundingClientRect();
  const cs = getComputedStyle(root);
  out.root = { rect: [rr.x, rr.y, rr.width, rr.height].map(v=>Math.round(v*10)/10), z: cs.zIndex, bg: cs.backgroundColor, display: cs.display, pad: cs.padding };
  const st = (el) => { if (!el) return null; const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return [c.fontSize, c.fontWeight, c.lineHeight, c.letterSpacing, c.textTransform, c.color, Math.round(r.width)+'x'+Math.round(r.height), c.marginBottom, c.marginTop]; };
  out.h2 = st(root.querySelector('h2'));
  out.caption = st([...root.querySelectorAll('p,span,div')].find(e => /Post Status Update/i.test(e.textContent||'')));
  out.desc = st([...root.querySelectorAll('p')][1] || null);
  const rows = [];
  const walk = (el, depth) => {
    for (const c of el.children) {
      if (['svg','path','style','script'].includes(c.tagName)) continue;
      const r = c.getBoundingClientRect();
      const c2 = getComputedStyle(c);
      if (r.height < 1 || r.width < 1) continue;
      rows.push('  '.repeat(depth) + c.tagName + ' y=' + Math.round(r.y) + ' h=' + Math.round(r.height*10)/10 + ' mb=' + c2.marginBottom + ' mt=' + c2.marginTop + ' fs=' + c2.fontSize + ' ' + (c.textContent||'').trim().slice(0,22));
      if (depth < 4 && rows.length < 42) walk(c, depth+1);
    }
  };
  walk(root, 0);
  out.rows = rows;
  out.buttons = [...root.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); const c = getComputedStyle(b); return [(b.textContent||'X').trim().slice(0,14), Math.round(r.width)+'x'+Math.round(r.height), c.fontSize+'/'+c.fontWeight, c.backgroundColor.slice(0,18), c.borderRadius.split(' ')[0], c.color.slice(0,16)]; });
  out.radios = [...root.querySelectorAll('input[type=radio],[role=radio],label')].map(l => { const r = l.getBoundingClientRect(); const c = getComputedStyle(l); return [l.textContent.trim().slice(0,14), Math.round(r.width)+'x'+Math.round(r.height), c.fontSize, c.color.slice(0,16)]; });
  out.textarea = (()=>{const t=root.querySelector('textarea');if(!t)return null;const r=t.getBoundingClientRect();const c=getComputedStyle(t);return [Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius.split(' ')[0], c.fontSize, c.padding, c.marginTop]})();
  return JSON.stringify(out, null, 1);
})()

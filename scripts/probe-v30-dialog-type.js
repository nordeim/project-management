// Typography census of dialog heading, labels, buttons, inputs
(() => {
  const out = {};
  let root = null;
  for (const d of document.querySelectorAll('div')) {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    if (cs.position === 'fixed' && r.width > 300 && r.height > 200 && d.querySelector('form') && !root) root = d;
  }
  if (!root) return 'NO DIALOG';
  const st = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing, tt: cs.textTransform, col: cs.color, h: Math.round(el.getBoundingClientRect().height*10)/10, mb: cs.marginBottom, font: cs.fontFamily.split(',')[0] };
  };
  out.heading = st(root.querySelector('p, h2'));
  const lab = root.querySelector('label');
  out.label = st(lab);
  out.labelAll = [...root.querySelectorAll('label')].map(l => getComputedStyle(l).fontSize + '/' + getComputedStyle(l).fontWeight + '/' + getComputedStyle(l).textTransform);
  const btns = [...root.querySelectorAll('button')];
  out.buttons = btns.map(b => {
    const cs = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    return [(b.textContent||'X').trim().slice(0,10), Math.round(r.width)+'x'+Math.round(r.height), cs.fontSize+'/'+cs.fontWeight+'/'+cs.textTransform, cs.backgroundColor.slice(0,16), cs.borderRadius.split(' ')[0], cs.color, cs.letterSpacing];
  });
  const inp = root.querySelector('input:not([type]), input[type=text]');
  out.input = inp ? { w: inp.getBoundingClientRect().width, cs: (()=>{const c=getComputedStyle(inp);return [c.height, c.borderRadius.split(' ')[0], c.fontSize, c.backgroundColor.slice(0,16), c.color, c.border]})() } : null;
  const sel = root.querySelector('select');
  out.select = sel ? (()=>{const c=getComputedStyle(sel);const r=sel.getBoundingClientRect();return [Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius.split(' ')[0], c.fontSize, c.backgroundColor.slice(0,16)]})() : null;
  const ta = root.querySelector('textarea');
  out.textarea = ta ? (()=>{const c=getComputedStyle(ta);return [c.borderRadius.split(' ')[0], c.fontSize, c.padding, c.minHeight]})() : null;
  const x = [...root.querySelectorAll('svg')][0];
  out.closeIcon = x ? [Math.round(x.getBoundingClientRect().width), getComputedStyle(x).strokeWidth] : null;
  return JSON.stringify(out, null, 1);
})()

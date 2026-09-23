// Add-task dialog census (role-agnostic): find fixed flex container with form
(() => {
  const out = {};
  // dialog root: fixed, has form, big
  let root = null;
  for (const d of document.querySelectorAll('div')) {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    if (cs.position === 'fixed' && r.width > 300 && r.height > 200 && d.querySelector('form') && !root) root = d;
  }
  if (!root) { out.root = 'NOT FOUND'; return JSON.stringify(out); }
  const rr = root.getBoundingClientRect();
  const cs = getComputedStyle(root);
  out.root = { rect: [rr.x, rr.y, rr.width, rr.height].map(v=>Math.round(v*10)/10), z: cs.zIndex, bg: cs.backgroundColor, display: cs.display, align: cs.alignItems, justify: cs.justifyContent, pad: cs.padding };
  // panel: the relative div
  const panel = [...root.querySelectorAll('div')].find(d => getComputedStyle(d).position === 'relative' && d.getBoundingClientRect().height > 200 && d.querySelector('form'));
  if (panel) {
    const pr = panel.getBoundingClientRect();
    const pcs = getComputedStyle(panel);
    out.panel = { rect: [pr.x, pr.y, pr.width, pr.height].map(v=>Math.round(v*10)/10), z: pcs.zIndex, radius: pcs.borderRadius, bg: pcs.backgroundColor, pad: pcs.padding, shadow: (pcs.boxShadow||'none').slice(0,60), maxW: pcs.maxWidth };
  }
  // controls: inputs + selects + buttons
  out.controls = [...root.querySelectorAll('input,select,textarea,button')].map(el => {
    const r = el.getBoundingClientRect();
    const cs2 = getComputedStyle(el);
    return [el.tagName + (el.getAttribute('type')?':'+el.getAttribute('type'):''), (el.textContent||el.getAttribute('placeholder')||'').trim().slice(0,14), Math.round(r.width)+'x'+Math.round(r.height), cs2.borderRadius.split(' ')[0], cs2.fontSize, cs2.backgroundColor.slice(0,16)];
  });
  // labels
  out.labels = [...root.querySelectorAll('label')].map(l => l.textContent.trim().slice(0,18)).slice(0,10);
  // svgs
  out.icons = [...root.querySelectorAll('svg')].map(s => { const sr = s.getBoundingClientRect(); return [(s.getAttribute('class')||'').match(/lucide-([a-z-]+)/)?.[1]||'raw', Math.round(sr.width), getComputedStyle(s).strokeWidth]; });
  // headings
  out.headings = [...root.querySelectorAll('h1,h2,h3')].map(h => { const hr = h.getBoundingClientRect(); return [h.tagName, h.textContent.trim().slice(0,20), Math.round(hr.width)+'x'+Math.round(hr.height), getComputedStyle(h).fontSize]; });
  return JSON.stringify(out, null, 1);
})()

// MORE sheet panel census — find the rounded panel (r24) with rows
(() => {
  const out = {};
  // the panel: a fixed div with border-radius ~24px, height > 150
  const panels = [...document.querySelectorAll('div')].filter(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width > 300 && r.height > 100 && parseFloat(cs.borderTopLeftRadius) > 15 && r.y > 400;
  });
  const panel = panels.sort((a,b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
  if (!panel) { out.panel = 'NOT FOUND'; return JSON.stringify(out); }
  const r = panel.getBoundingClientRect();
  const cs = getComputedStyle(panel);
  out.panel = {
    rect: [r.x, r.y, r.width, r.height].map(v=>Math.round(v*10)/10),
    radius: cs.borderRadius, pad: cs.padding, z: cs.zIndex,
    bg: cs.backgroundColor, shadow: cs.boxShadow.slice(0,90)
  };
  out.texts = [...panel.querySelectorAll('span,button')].map(e => (e.textContent||'').trim().slice(0,30)).filter(t => t && t.length < 30).slice(0,12);
  out.icons = [...panel.querySelectorAll('svg')].map(s => {
    const sr = s.getBoundingClientRect();
    return [(s.getAttribute('class')||'').match(/lucide-([a-z-]+)/)?.[1], Math.round(sr.width), getComputedStyle(s).strokeWidth];
  });
  out.rows = [...panel.querySelectorAll('a')].map(a => {
    const ar = a.getBoundingClientRect();
    return [a.getAttribute('href'), (a.textContent||'').trim().slice(0,20), Math.round(ar.width), Math.round(ar.height)];
  });
  // scrim
  const scrim = [...document.querySelectorAll('div')].find(d => {
    const c2 = getComputedStyle(d); const r2 = d.getBoundingClientRect();
    return c2.position === 'fixed' && r2.width > 380 && r2.height > 800 && c2.backgroundColor.startsWith('rgba(0, 0, 0');
  });
  out.scrim = scrim ? getComputedStyle(scrim).zIndex : 'none';
  return JSON.stringify(out, null, 1);
})()

// MORE sheet census at 390
(() => {
  const out = {};
  // find the sheet: fixed bottom overlay with high z
  const sheet = [...document.querySelectorAll('div')].find(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width > 300 && r.height > 200 && r.y < 600 && parseFloat(cs.zIndex) >= 50 && cs.display !== 'none';
  });
  if (!sheet) { out.sheet = 'NOT FOUND'; return JSON.stringify(out); }
  const r = sheet.getBoundingClientRect();
  const cs = getComputedStyle(sheet);
  out.sheet = {
    rect: [r.x, r.y, r.width, r.height].map(v=>Math.round(v*10)/10),
    radius: cs.borderRadius, pad: cs.padding, z: cs.zIndex,
    bg: cs.backgroundColor, shadow: cs.boxShadow.slice(0,90)
  };
  // brand + close + rows
  const spans = [...sheet.querySelectorAll('span,button,a,div')].filter(e => e.children.length <= 2);
  out.texts = spans.slice(0, 14).map(e => (e.textContent||'').trim().slice(0,26)).filter(t => t && t.length < 26);
  const close = sheet.querySelector('button[aria-label],button');
  const svgs = [...sheet.querySelectorAll('svg')];
  out.icons = svgs.map(s => {
    const sr = s.getBoundingClientRect();
    return [(s.getAttribute('class')||'').match(/lucide-([a-z-]+)/)?.[1], Math.round(sr.width), Math.round(sr.height), getComputedStyle(s).strokeWidth];
  });
  // rows with hrefs
  out.rows = [...sheet.querySelectorAll('a')].map(a => {
    const ar = a.getBoundingClientRect();
    return [a.getAttribute('href'), (a.textContent||'').trim().slice(0,20), Math.round(ar.width), Math.round(ar.height)];
  });
  return JSON.stringify(out, null, 1);
})()

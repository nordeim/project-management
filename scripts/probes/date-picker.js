(() => {
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,80)); return o; };
// the picker wrap: fixed, 262 wide, contains September
const wrap = [...document.querySelectorAll('div')].find(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return Math.abs(r.width - 262) < 4 && r.height > 260 && cs.position === 'fixed' && /September/.test(e.textContent||''); });
// outer card: child with radius + border
let outer = null, inner = null;
if (wrap) {
  for (const c of wrap.querySelectorAll('div')) {
    const cs = getComputedStyle(c); const r = c.getBoundingClientRect();
    if (Math.abs(r.width - 262) < 4 && parseFloat(cs.borderTopWidth) > 0 && !outer) outer = c;
    if (r.width > 220 && r.width < 250 && cs.borderRadius !== '0px' && !inner && parseFloat(cs.borderTopWidth) === 0) inner = c;
  }
}
const chevBtns = wrap ? [...wrap.querySelectorAll('button')].filter(b => b.querySelector('svg')).slice(0, 2) : [];
const chevs = chevBtns.map(b => { const s = b.querySelector('svg'); const r = b.getBoundingClientRect(); return { btn: [Math.round(r.width), Math.round(r.height)], radius: getComputedStyle(b).borderRadius, sw: s.getAttribute('stroke-width'), w: Math.round(s.getBoundingClientRect().width) }; });
const days = wrap ? [...wrap.querySelectorAll('button')].filter(b => /^[0-9]{1,2}$/.test((b.textContent||'').trim())) : [];
const today = days.find(b => (b.textContent||'').trim() === String(new Date().getDate()));
return JSON.stringify({
  wrap: g(wrap, ['position']),
  outer: g(outer, ['border-radius','background-color','border-top-width','border-top-color','box-shadow','padding']),
  inner: g(inner, ['border-radius','background-color','padding','box-shadow']),
  chevs,
  dayCount: days.length,
  day0: g(days[0], ['width','height','border-radius','font-size']),
  today: today ? { fw: getComputedStyle(today).fontWeight, col: getComputedStyle(today).color, radius: getComputedStyle(today).borderRadius } : null,
  headers: wrap ? [...wrap.querySelectorAll('*')].filter(e => /^(Su|Mo|Tu|We|Th|Fr|Sa)$/.test((e.textContent||'').trim())).slice(0,7).map(e => ({ fs: getComputedStyle(e).fontSize, col: getComputedStyle(e).color, fw: getComputedStyle(e).fontWeight })) : null
});
})()

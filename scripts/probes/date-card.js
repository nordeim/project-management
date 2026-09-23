(() => {
// date-card deep probe: find the full card structure incl. photo + shadows
const q = s => document.querySelector(s);
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName, t: (el.textContent||'').trim().slice(0,24), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,140)); return o; };
// the date square holds the big day numeral
const dayLeaf = [...document.querySelectorAll('main *')].find(e => (e.textContent||'').trim() === String(new Date().getDate()) && parseInt(getComputedStyle(e).fontSize) > 30);
if (!dayLeaf) return JSON.stringify({missing: 'dayLeaf'});
// walk up 4 levels
const chain = [];
let el = dayLeaf;
for (let i = 0; i < 5 && el && el.tagName !== 'MAIN'; i++) {
  chain.push(g(el, ['display','flex-direction','align-items','padding','box-shadow','border-radius','background-color','background-image','overflow','position','gap']));
  el = el.parentElement;
}
// any img in the top-left area
const imgs = [...document.querySelectorAll('main img')].map(e => g(e, ['width','height','object-fit','opacity','position','inset','z-index']));
// first activity divider row (row index 5)
const rows = [...document.querySelectorAll('main *')].filter(e => /ago\s*$/.test((e.textContent||'').trim()) && e.getBoundingClientRect().height > 50 && e.getBoundingClientRect().height < 130 && !e.querySelector('main'));
const midRow = rows[5];
const dividerRow = midRow ? g(midRow, ['border-top-width','border-top-color','border-top-style','padding','gap','height']) : null;
// activity row icon gap: first row
const row0 = rows[0];
return JSON.stringify({ chain, imgs: imgs.slice(0,4), dividerRow, row0: row0 ? g(row0, ['display','gap','padding','height','align-items','border-top-width','border-top-color']) : null });
})()

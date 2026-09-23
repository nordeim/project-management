(() => {
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName, t: (el.textContent||'').trim().slice(0,40), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,120)); return o; };
// timestamp leaves anywhere in main
const tsLeaves = [...document.querySelectorAll('main *')].filter(e => /ago$/.test((e.textContent||'').trim()) && e.children.length === 0);
// row = the ancestor with padding 14px 18px (or the li/div whose height is 60-120)
const rowOf = (leaf) => {
  let el = leaf;
  for (let i = 0; i < 8 && el && el.tagName !== 'MAIN'; i++) {
    const pad = getComputedStyle(el).padding;
    if (pad === '14px 18px') return el;
    el = el.parentElement;
  }
  return leaf.parentElement;
};
const rows = tsLeaves.map(rowOf).filter((v,i,a) => a.indexOf(v) === i);
const rowEls = rows.slice(0, 8);
const icon = rowEls[0] ? rowEls[0].querySelector('svg') : null;
const iconWrap = icon ? icon.parentElement : null;
return JSON.stringify({
  rowCount: tsLeaves.length,
  first: g(rowEls[0], ['display','align-items','gap','padding','border-top-width','border-top-color','height']),
  second: g(rowEls[1], ['display','gap','padding','border-top-width','border-top-color','height']),
  sixth: g(rowEls[5], ['border-top-width','border-top-color','padding','height']),
  rowTag: rowEls[0] ? rowEls[0].tagName : null,
  icon: icon ? { stroke: icon.getAttribute('stroke-width'), box: [Math.round(icon.getBoundingClientRect().x), Math.round(icon.getBoundingClientRect().y), Math.round(icon.getBoundingClientRect().width)] } : null,
  iconWrap: g(iconWrap, ['width','height','background-color','border-radius','display','align-items','justify-content']),
  msg: rowEls[0] && rowEls[0].querySelector('p, span') ? g(rowEls[0].querySelector('p, span'), ['font-size','font-weight','color','line-height']) : null,
  ts: g(tsLeaves[0], ['font-size','font-weight','color'])
});
})()

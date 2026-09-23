(() => {
// activity panel rows probe: divider, gap, heights, icon
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName, t: (el.textContent||'').trim().slice(0,40), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,120)); return o; };
// find the activity panel: the container with the "Next Planned Action" label
const npa = [...document.querySelectorAll('main *')].find(e => (e.textContent||'').trim() === 'Next Planned Action' && e.children.length === 0);
const panel = npa ? npa.closest('section, div') : null;
const actPanel = npa ? npa.parentElement.parentElement.parentElement : null;
// rows: children of the panel that contain 'ago'
const rows = actPanel ? [...actPanel.querySelectorAll('*')].filter(e => /ago$/.test((e.textContent||'').trim().slice(-4)) && !e.querySelector('*')) : [];
const tsRows = rows.map(e => e.closest('li, div[class]')).filter((v,i,a) => a.indexOf(v) === i);
const rowEls = tsRows.slice(0, 8);
const list = rowEls[0] ? rowEls[0].parentElement : null;
return JSON.stringify({
  rowCount: rows.length,
  first: rowEls[0] ? g(rowEls[0], ['display','align-items','gap','padding','border-top-width','border-top-color','height']) : null,
  second: rowEls[1] ? g(rowEls[1], ['display','gap','padding','border-top-width','border-top-color','border-top-style','height']) : null,
  sixth: rowEls[5] ? g(rowEls[5], ['border-top-width','border-top-color','padding','height']) : null,
  listTag: list ? list.tagName : null,
  listStyle: list ? g(list, ['display','flex-direction','gap','padding','margin']) : null,
  icon: rowEls[0] && rowEls[0].querySelector('svg') ? (() => { const s = rowEls[0].querySelector('svg'); const w = rowEls[0].querySelector('div, span'); return { svgBox: [Math.round(s.getBoundingClientRect().x), Math.round(s.getBoundingClientRect().width)], strokeWidth: s.getAttribute('stroke-width') || s.getAttribute('width'), wrapBox: w ? [Math.round(w.getBoundingClientRect().x), Math.round(w.getBoundingClientRect().width)] : null }; })() : null,
  msg: rowEls[0] ? g(rowEls[0].querySelector('p, span'), ['font-size','font-weight','color','line-height']) : null,
  ts: rowEls[0] ? g(rows[0], ['font-size','font-weight','color']) : null
});
})()

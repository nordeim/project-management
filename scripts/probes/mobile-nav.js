(() => {
// mobile nav probe: app bar + bottom tab bar census
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName, t: (el.textContent||'').trim().slice(0,20), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,110)); return o; };
// bottom bar: fixed element at the bottom with tab-like children
const fixed = [...document.querySelectorAll('body *')].filter(e => {
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  return cs.position === 'fixed' && r.width > 350 && r.width < 420 && r.bottom < 100 && r.height < 120 && r.height > 50;
});
const bar = fixed[0];
if (!bar) return JSON.stringify({ barMissing: true, fixedCount: fixed.length });
const tabs = [...bar.children].filter(e => e.tagName === 'A' || e.tagName === 'BUTTON' || (e.textContent||'').trim().length > 0);
const tabInfo = tabs.map(tab => {
  const r = tab.getBoundingClientRect();
  const chip = tab.firstElementChild;
  const chipR = chip ? chip.getBoundingClientRect() : null;
  const icon = tab.querySelector('svg');
  return {
    t: (tab.textContent||'').trim().slice(0,12),
    box: [Math.round(r.x), Math.round(r.width)],
    chip: chipR ? [Math.round(chipR.x), Math.round(chipR.y), Math.round(chipR.width), Math.round(chipR.height)] : null,
    chipStyle: chip ? { bg: getComputedStyle(chip).backgroundColor, radius: getComputedStyle(chip).borderRadius, pad: getComputedStyle(chip).padding } : null,
    icon: icon ? { sw: icon.getAttribute('stroke-width'), w: Math.round(icon.getBoundingClientRect().width) } : null,
    flex: getComputedStyle(tab).flex
  };
});
const barCS = getComputedStyle(bar);
// app bar: fixed element at top
const appBars = [...document.querySelectorAll('body *')].filter(e => {
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  return cs.position === 'fixed' && r.y === 0 && r.width > 350 && r.width < 420 && r.height > 40 && r.height < 90;
});
return JSON.stringify({
  bar: g(bar, ['height','border-radius','box-shadow','padding','gap','display','background-color']),
  tabs: tabInfo,
  appBar: appBars[0] ? g(appBars[0], ['height','background-color','box-shadow','padding']) : null
});
})()

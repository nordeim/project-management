(() => {
// find the tab bar near the bottom of the scroll position
const vh = window.innerHeight;
const nearBottom = [...document.querySelectorAll('body *')].filter(e => {
  const r = e.getBoundingClientRect();
  const cs = getComputedStyle(e);
  if (e.children.length < 3) return false;
  const t = e.textContent || '';
  if (!/Dashboard/.test(t) || !/Goals/.test(t)) return false;
  return r.height > 50 && r.height < 120 && r.width > 350 && r.width < 400;
});
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName, t: (el.textContent||'').trim().slice(0,16), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,110)); return o; };
const bar = nearBottom[nearBottom.length - 1];
if (!bar) return JSON.stringify({ missing: true, candidates: nearBottom.length });
const tabs = [...bar.children].filter(e => (e.textContent||'').trim().length > 0 && e.tagName !== 'SPAN');
const tabInfo = tabs.map(tab => {
  const r = tab.getBoundingClientRect();
  const chip = tab.firstElementChild;
  const chipR = chip ? chip.getBoundingClientRect() : null;
  const icon = tab.querySelector('svg');
  return {
    t: (tab.textContent||'').trim().slice(0,10),
    w: Math.round(r.width),
    chip: chipR ? [Math.round(chipR.width), Math.round(chipR.height)] : null,
    chipStyle: chip ? { bg: getComputedStyle(chip).backgroundColor, radius: getComputedStyle(chip).borderRadius, pad: getComputedStyle(chip).padding } : null,
    icon: icon ? { sw: icon.getAttribute('stroke-width'), w: Math.round(icon.getBoundingClientRect().width) } : null,
    tabPad: getComputedStyle(tab).padding,
    flex: getComputedStyle(tab).flex
  };
});
return JSON.stringify({
  bar: g(bar, ['position','height','border-radius','box-shadow','padding','gap','display','background-color']),
  tabs: tabInfo,
  label: (() => { const l = bar.querySelector('span[class*=text], p'); return l ? { fs: getComputedStyle(l).fontSize, fw: getComputedStyle(l).fontWeight, ls: getComputedStyle(l).letterSpacing, tt: getComputedStyle(l).textTransform } : null; })()
});
})()

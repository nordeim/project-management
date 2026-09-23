(() => {
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName, t: (el.textContent||'').trim().slice(0,14), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,110)); return o; };
// the mobile tab: visible A whose text is exactly Dashboard (h>40)
const tab = [...document.querySelectorAll('a, button')].find(e => {
  const t = (e.textContent||'').trim(); const r = e.getBoundingClientRect();
  return t === 'Dashboard' && r.height > 40 && r.width > 50;
});
if (!tab) return JSON.stringify({ missing: 'tab' });
const bar = tab.parentElement;
const tabs = [...bar.children].filter(e => (e.textContent||'').trim().length > 0);
const tabInfo = tabs.map(t => {
  const r = t.getBoundingClientRect();
  const chip = t.firstElementChild;
  const chipR = chip ? chip.getBoundingClientRect() : null;
  const icon = t.querySelector('svg');
  const label = [...t.querySelectorAll('span, p')].find(s => s.textContent && !s.querySelector('svg'));
  return {
    t: (t.textContent||'').trim().slice(0,10),
    tag: t.tagName,
    w: Math.round(r.width), h: Math.round(r.height),
    chip: chipR ? [Math.round(chipR.x), Math.round(chipR.width), Math.round(chipR.height)] : null,
    chipStyle: chip ? { bg: getComputedStyle(chip).backgroundColor, radius: getComputedStyle(chip).borderRadius, pad: getComputedStyle(chip).padding, shadow: getComputedStyle(chip).boxShadow.slice(0,90) } : null,
    icon: icon ? { sw: icon.getAttribute('stroke-width'), w: Math.round(icon.getBoundingClientRect().width), h: Math.round(icon.getBoundingClientRect().height) } : null,
    label: label ? { fs: getComputedStyle(label).fontSize, fw: getComputedStyle(label).fontWeight, ls: getComputedStyle(label).letterSpacing, tt: getComputedStyle(label).textTransform, col: getComputedStyle(label).color } : null,
    flex: getComputedStyle(t).flex, pad: getComputedStyle(t).padding
  };
});
// app bar: the fixed element at top (y=0) containing ORBITAL
const appBar = [...document.querySelectorAll('body *')].find(e => {
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  return cs.position === 'fixed' && Math.round(r.y) === 0 && r.width > 380 && r.width < 400 && r.height > 40 && r.height < 90 && /ORBITAL/.test(e.textContent||'');
});
return JSON.stringify({
  bar: g(bar, ['position','height','border-radius','box-shadow','padding','display','background-color']),
  tabs: tabInfo
});
})()

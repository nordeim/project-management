// Dialog z-system probe: open add-task via its button, census overlay+panel+popover z
(() => {
  const out = {};
  const collect = (rootSel) => {
    const els = [...document.querySelectorAll('div,section,[role="dialog"]')].filter(d => {
      const cs = getComputedStyle(d);
      return (cs.position === 'fixed' || cs.position === 'absolute') && d.offsetParent !== null || (cs.position === 'fixed' && cs.display !== 'none');
    });
    return els.map(d => {
      const cs = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return {
        z: cs.zIndex, pos: cs.position, w: Math.round(r.width), h: Math.round(r.height),
        bg: cs.backgroundColor.slice(0,24), radius: cs.borderRadius.split(' ').slice(0,1)[0],
        cls: (d.getAttribute('class')||'').slice(0,40)
      };
    }).filter(e => parseFloat(e.z) > 0 || e.pos === 'fixed');
  };
  out.fixed = collect().slice(0, 24);
  return JSON.stringify(out, null, 1);
})()

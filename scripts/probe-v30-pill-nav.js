// 768 pill nav census
(() => {
  const out = {};
  const nav = document.querySelector('nav.orb-pill-nav-shadow') || [...document.querySelectorAll('nav')].find(n => { const r = n.getBoundingClientRect(); return r.width > 300 && r.width < 600 && r.y > 700 && getComputedStyle(n).display !== 'none'; });
  if (!nav) { out.pill = 'NOT FOUND'; return JSON.stringify(out); }
  const r = nav.getBoundingClientRect();
  const cs = getComputedStyle(nav);
  out.pill = { rect: [r.x, r.y, r.width, r.height].map(v=>Math.round(v*10)/10), z: cs.zIndex, radius: cs.borderRadius, pad: cs.padding, gap: cs.gap, bg: cs.backgroundColor, shadow: cs.boxShadow.slice(0,80) };
  // brand block
  const brand = nav.firstElementChild;
  if (brand) {
    const bcs = getComputedStyle(brand);
    out.brand = { w: Math.round(brand.getBoundingClientRect().width), mr: bcs.marginRight, borderRight: bcs.borderRightWidth + ' ' + bcs.borderRightColor, text: brand.textContent.trim().slice(0,8) };
  }
  // tabs
  out.tabs = [...nav.querySelectorAll('a')].map(a => {
    const ar = a.getBoundingClientRect();
    const chip = a.firstElementChild;
    const ccs = chip ? getComputedStyle(chip) : null;
    const svg = a.querySelector('svg');
    return {
      href: a.getAttribute('href'), w: Math.round(ar.width),
      chip: ccs ? [Math.round(chip.getBoundingClientRect().width)+'x'+Math.round(chip.getBoundingClientRect().height), ccs.minWidth, ccs.borderRadius.split(' ')[0], ccs.padding, ccs.backgroundColor.slice(0,16), (ccs.boxShadow||'none').slice(0,40)] : null,
      glyph: svg ? (svg.getAttribute('class')||'').match(/lucide-([a-z-]+)/)?.[1] : null,
      stroke: svg ? getComputedStyle(svg).strokeWidth : null,
      label: (a.textContent||'').trim()
    };
  });
  return JSON.stringify(out, null, 1);
})()

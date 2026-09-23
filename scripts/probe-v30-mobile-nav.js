// Mobile tab-bar + app-bar census at 390 (focus #1: mobile navigation)
(() => {
  const out = {};
  // --- app bar (first header) ---
  const hdr = document.querySelector('header');
  if (hdr) {
    const cs = getComputedStyle(hdr);
    const brand = hdr.querySelector('span,div');
    out.appbar = {
      rect: [hdr.getBoundingClientRect().x, hdr.getBoundingClientRect().y, hdr.getBoundingClientRect().width, hdr.getBoundingClientRect().height].map(v=>Math.round(v*10)/10),
      radius: cs.borderRadius, pad: cs.padding, bg: cs.backgroundColor,
      shadow: cs.boxShadow, brand: (hdr.textContent||'').replace(/[^A-Za-z]/g,'').slice(0,8)
    };
  }
  // --- tab bar: find visible nav at screen bottom ---
  const navs = [...document.querySelectorAll('nav')];
  const tabnav = navs.find(n => { const r = n.getBoundingClientRect(); return r.width > 300 && r.y > 600 && getComputedStyle(n).display !== 'none'; });
  if (!tabnav) { out.tabbar = 'NOT FOUND'; return JSON.stringify(out); }
  const nb = tabnav.getBoundingClientRect();
  const ncs = getComputedStyle(tabnav);
  out.tabbar = {
    rect: [nb.x, nb.y, nb.width, nb.height].map(v=>Math.round(v*10)/10),
    radius: ncs.borderRadius, pad: ncs.padding, shadow: ncs.boxShadow,
    z: ncs.zIndex, display: ncs.display
  };
  // tabs
  out.tabs = [...tabnav.querySelectorAll('button,a')].map(el => {
    const r = el.getBoundingClientRect();
    const svg = el.querySelector('svg');
    const chip = el.querySelector('div,span');
    const ccs = chip ? getComputedStyle(chip) : null;
    return {
      tag: el.tagName, href: el.getAttribute('href') || null,
      rect: [r.x, r.y, r.width, r.height].map(v=>Math.round(v*10)/10),
      label: (el.textContent||'').trim(),
      glyph: svg ? (svg.getAttribute('class')||'').match(/lucide-([a-z-]+)/)?.[1] : null,
      stroke: svg ? getComputedStyle(svg).strokeWidth : null,
      glyphSize: svg ? Math.round(svg.getBoundingClientRect().width) : null,
      chipBg: ccs ? ccs.backgroundColor : null,
      chipRadius: ccs ? ccs.borderRadius : null,
      chipShadow: ccs ? ccs.boxShadow.slice(0,80) : null
    };
  });
  return JSON.stringify(out, null, 1);
})()

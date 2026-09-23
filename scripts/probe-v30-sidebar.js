// Full sidebar census — aside spec + every top-level block + nav rows + clock + collapse
(() => {
  const out = {};
  const aside = document.querySelector('aside');
  if (!aside) return 'NO ASIDE';
  const acs = getComputedStyle(aside);
  const ar = aside.getBoundingClientRect();
  out.aside = { rect: [ar.x, ar.y, ar.width, ar.height].map(v=>Math.round(v)), radius: acs.borderRadius, pad: acs.padding, bg: acs.backgroundColor.slice(0,18), shadow: acs.boxShadow.slice(0,64), pos: acs.position, top: acs.top, height: acs.height };
  // top-level blocks
  out.blocks = [...aside.children].map(c => {
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    return { tag: c.tagName, rect: [Math.round(r.width), Math.round(r.height)].join('x'), pad: cs.padding, mt: cs.marginTop, mb: cs.marginBottom, pl: cs.paddingLeft, txt: (c.textContent||'').trim().slice(0,12).replace(/\n/g,' ') };
  });
  // nav rows
  const nav = aside.querySelector('nav');
  out.navRows = nav ? [...nav.children].map(a => {
    const r = a.getBoundingClientRect();
    const cs = getComputedStyle(a);
    return { href: a.getAttribute('href'), rect: [Math.round(r.width), Math.round(r.height)].join('x'), pad: cs.padding, fs: cs.fontSize, fw: cs.fontWeight, col: cs.color.slice(0,16), bg: cs.backgroundColor.slice(0,16), radius: cs.borderRadius.split(' ')[0], mt: cs.marginTop, active: cs.fontWeight === '600' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' };
  }) : null;
  // brand row
  const brandRow = aside.children[0];
  out.brand = brandRow ? (()=>{const cs=getComputedStyle(brandRow);const r=brandRow.getBoundingClientRect();const a=brandRow.querySelector('a');const mark=brandRow.querySelector('div');const span=brandRow.querySelector('span');return {rowH:Math.round(r.height), pl:cs.paddingLeft, mb:cs.marginBottom, aW:a?Math.round(a.getBoundingClientRect().width):0, mark:mark?Math.round(mark.getBoundingClientRect().width):0, spanFs:span?getComputedStyle(span).fontSize:'', spanLs:span?getComputedStyle(span).letterSpacing:'', spanFw:span?getComputedStyle(span).fontWeight:''}})() : null;
  // clock
  const clock = [...aside.querySelectorAll('div')].find(d => { const r = d.getBoundingClientRect(); return Math.abs(r.width-80)<3 && Math.abs(r.height-80)<3; });
  out.clock = clock ? (()=>{const cs=getComputedStyle(clock);return [Math.round(clock.getBoundingClientRect().width), cs.borderRadius, cs.backgroundColor.slice(0,16), (cs.boxShadow||'').slice(0,40)]})() : null;
  // collapse button
  const colBtn = [...aside.querySelectorAll('button')].find(b => Math.abs(b.getBoundingClientRect().width-208)<3 || /collapse/i.test(b.getAttribute('aria-label')||''));
  out.collapse = colBtn ? (()=>{const cs=getComputedStyle(colBtn);const r=colBtn.getBoundingClientRect();return [Math.round(r.width)+'x'+Math.round(r.height), cs.borderRadius.split(' ')[0], cs.padding, cs.backgroundColor.slice(0,16)]})() : null;
  // tasks status link
  const tsLink = [...aside.querySelectorAll('a')].find(a => /Tasks Status/i.test(a.textContent||''));
  out.tsLink = tsLink ? (()=>{const cs=getComputedStyle(tsLink);const r=tsLink.getBoundingClientRect();return [Math.round(r.width)+'x'+Math.round(r.height), cs.fontSize, cs.color.slice(0,16), cs.fontWeight]})() : null;
  return JSON.stringify(out, null, 1);
})()

// Wizard census — find the conversational wrapper (bot bubble + form panel)
(() => {
  const out = {};
  // find the fixed scrim
  const scrim = [...document.querySelectorAll('div')].find(d => {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    return cs.position === 'fixed' && r.width > 300 && r.height > 700 && cs.backgroundColor.startsWith('rgba(46');
  });
  out.scrim = scrim ? { z: getComputedStyle(scrim).zIndex, bg: getComputedStyle(scrim).backgroundColor, blur: getComputedStyle(scrim).backdropFilter } : 'none';
  // the wrapper: element containing the bot bubble text
  const bubble = [...document.querySelectorAll('div,p')].find(e => /Tell me about your goal/i.test(e.textContent||'') && e.children.length < 4);
  if (!bubble) { out.bubble = 'NOT FOUND'; return JSON.stringify(out); }
  let wrap = bubble;
  for (let i = 0; i < 8 && wrap.parentElement; i++) {
    const cs = getComputedStyle(wrap);
    if (cs.position === 'fixed' || cs.position === 'absolute') break;
    wrap = wrap.parentElement;
  }
  const wr = wrap.getBoundingClientRect();
  const wcs = getComputedStyle(wrap);
  out.wrap = { rect: [wr.x, wr.y, wr.width, wr.height].map(v=>Math.round(v*10)/10), pos: wcs.position, z: wcs.zIndex, display: wcs.display, pad: wcs.padding, maxW: wcs.maxWidth, gap: wcs.gap };
  // bot bubble + form panel
  const st = (el) => { if (!el) return null; const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return [Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius, c.backgroundColor.slice(0,20), c.padding, c.fontSize, c.color.slice(0,16), c.boxShadow.slice(0,60)]; };
  out.bubbleEl = st(bubble);
  const form = wrap.querySelector('form') || [...wrap.querySelectorAll('div')].find(d => d.querySelector('input'));
  out.formPanel = st(form);
  // close square
  const closeBtn = [...wrap.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.width < 40 && !b.textContent.trim() && b.querySelector('svg'); });
  out.close = closeBtn ? (()=>{const c=getComputedStyle(closeBtn);const r=closeBtn.getBoundingClientRect();const s=closeBtn.querySelector('svg');return [Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius.split(' ')[0], c.backgroundColor.slice(0,18), s?Math.round(s.getBoundingClientRect().width):0, s?getComputedStyle(s).strokeWidth:0, c.color.slice(0,16)]})() : null;
  // inputs + buttons
  out.inputs = [...wrap.querySelectorAll('input,textarea')].map(i => { const c = getComputedStyle(i); const r = i.getBoundingClientRect(); return [i.tagName, Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius.split(' ')[0], c.fontSize, c.padding]; });
  out.buttons = [...wrap.querySelectorAll('button')].filter(b=>b.textContent.trim()||b.querySelector('svg')).map(b => { const c = getComputedStyle(b); const r = b.getBoundingClientRect(); return [(b.textContent||'X').trim().slice(0,12), Math.round(r.width)+'x'+Math.round(r.height), c.fontSize+'/'+c.fontWeight+'/'+c.textTransform, c.backgroundColor.slice(0,18), c.borderRadius.split(' ')[0], c.color.slice(0,16), c.letterSpacing]; });
  out.icons = [...wrap.querySelectorAll('svg')].map(s => { const r = s.getBoundingClientRect(); return [(s.getAttribute('class')||'').match(/lucide-([a-z-]+)/)?.[1]||'raw', Math.round(r.width), getComputedStyle(s).strokeWidth]; });
  return JSON.stringify(out, null, 1);
})()

// Login page census
(() => {
  const out = {};
  const body = getComputedStyle(document.body);
  out.bodyBg = body.backgroundColor;
  const page = document.querySelector('div[class*="min-h"], main, form')?.parentElement || document.body.firstElementChild;
  // card: the white rounded element with shadow
  const card = [...document.querySelectorAll('div')].filter(d => { const c = getComputedStyle(d); const r = d.getBoundingClientRect(); return r.width > 300 && r.width < 600 && c.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(c.borderRadius) >= 12 && r.height > 400; }).sort((a,b) => Math.abs(b.getBoundingClientRect().width - 448) - Math.abs(a.getBoundingClientRect().width - 448))[0];
  if (!card) { out.card = 'NOT FOUND'; return JSON.stringify(out); }
  const r = card.getBoundingClientRect();
  const cs = getComputedStyle(card);
  out.card = { rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], radius: cs.borderRadius.split(' ').slice(0,1)[0], bg: cs.backgroundColor.slice(0,22), shadow: cs.boxShadow.slice(0,50), pad: cs.padding, overflow: cs.overflow, backdrop: cs.backdropFilter };
  // page bg (parent wrapper)
  let pg = card.parentElement;
  out.pageBg = pg ? getComputedStyle(pg).background.slice(0, 90) : null;
  // h1
  const h1 = card.querySelector('h1');
  out.h1 = h1 ? [h1.textContent.trim().slice(0,26), getComputedStyle(h1).fontSize, getComputedStyle(h1).fontWeight, getComputedStyle(h1).textAlign, Math.round(h1.getBoundingClientRect().x)] : null;
  // logo chip
  const logo = [...card.querySelectorAll('div')].find(d => { const lr = d.getBoundingClientRect(); return Math.abs(lr.width - 96) < 60 && Math.abs(lr.height - 96) < 60 && lr.width > 60 && d !== card && !d.querySelector('input'); });
  out.logo = logo ? (()=>{const c=getComputedStyle(logo);const lr=logo.getBoundingClientRect();return [Math.round(lr.width), c.borderRadius.split(' ')[0], c.boxShadow.slice(0,36), (c.ring=c.boxShadow?'':''), c.backgroundColor.slice(0,16)]})() : null;
  // google button
  const gbtn = [...card.querySelectorAll('button')].find(b => /Google/i.test(b.textContent||''));
  out.google = gbtn ? (()=>{const c=getComputedStyle(gbtn);const gr=gbtn.getBoundingClientRect();const svg=gbtn.querySelector('svg');return [Math.round(gr.width)+'x'+Math.round(gr.height), svg?Math.round(svg.getBoundingClientRect().width):0, c.borderRadius.split(' ')[0], c.backgroundColor.slice(0,16)]})() : 'NF';
  // inputs
  out.inputs = [...card.querySelectorAll('input')].map(i => { const c = getComputedStyle(i); const ir = i.getBoundingClientRect(); return [Math.round(ir.width)+'x'+Math.round(ir.height), c.borderRadius.split(' ')[0], c.backgroundColor.slice(0,20), c.fontSize]; });
  // input icons
  out.inputIcons = [...card.querySelectorAll('svg')].filter(s => { const sr = s.getBoundingClientRect(); return sr.width < 25 && s.closest('div[class*=relative],div[class*=absolute]') && !/Google/.test(s.closest('button')?.textContent||''); }).map(s => [Math.round(s.getBoundingClientRect().width), getComputedStyle(s).strokeWidth]);
  // or divider
  const or = [...card.querySelectorAll('span,p,div')].find(e => /^(or|OR)$/.test((e.textContent||'').trim()));
  out.orDivider = or ? [or.textContent.trim(), getComputedStyle(or).fontSize, getComputedStyle(or).textTransform, getComputedStyle(or).letterSpacing, or.getBoundingClientRect().width] : 'NF';
  // footer
  const footer = [...card.querySelectorAll('button')].find(b => /Sign up|account/i.test(b.textContent||''));
  out.footer = footer ? [footer.textContent.trim().slice(0,30), Math.round(footer.getBoundingClientRect().width)] : 'NF';
  // sign in button
  const signin = [...card.querySelectorAll('button')].find(b => /^Sign in$/i.test((b.textContent||'').trim()));
  out.signin = signin ? (()=>{const c=getComputedStyle(signin);const sr=signin.getBoundingClientRect();return [Math.round(sr.width)+'x'+Math.round(sr.height), c.borderRadius.split(' ')[0], c.backgroundColor.slice(0,16), c.fontSize]})() : 'NF';
  return JSON.stringify(out, null, 1);
})()

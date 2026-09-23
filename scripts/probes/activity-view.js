(() => {
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName, t: (el.textContent||'').trim().slice(0,26), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p).slice(0,100)); return o; };
// h1 + sub
const h1 = document.querySelector('main h1');
const sub = h1 ? h1.parentElement.querySelector('p, span') : null;
// Online pill
const online = [...document.querySelectorAll('main *')].find(e => /Online/.test(e.textContent||'') && e.children.length === 0 && e.getBoundingClientRect().width > 0);
const onlinePill = online ? online.closest('span, div, p') : null;
// hero block: contains "Last agent action"
const cap = [...document.querySelectorAll('main *')].find(e => /Last agent action/i.test(e.textContent||'') && e.children.length === 0);
const hero = cap ? cap.closest('div[class], section, li') : null;
const heroIcon = hero ? hero.querySelector('svg') : null;
// date label
const dateLabel = [...document.querySelectorAll('main *')].find(e => /THU JUL 16 2026|Thu Jul 16 2026/i.test((e.textContent||'').trim()) && e.children.length === 0 && e.getBoundingClientRect().width > 0);
// type tag: small text at the end of a row
const tag = [...document.querySelectorAll('main *')].find(e => /^(task assigned|tasks generated|goal analyzed|status update)$/i.test((e.textContent||'').trim()) && e.getBoundingClientRect().height < 20 && e.getBoundingClientRect().width > 0);
return JSON.stringify({
  h1: g(h1, ['font-size','font-weight','letter-spacing']),
  sub: g(sub, ['font-size','font-weight','color']),
  onlinePill: g(onlinePill, ['font-size','font-weight','color','padding','box-shadow','border-radius','background-color']),
  hero: g(hero, ['padding','gap','height','box-shadow','border-radius']),
  heroCap: g(cap, ['font-size','font-weight','color','text-transform','letter-spacing']),
  heroIcon: heroIcon ? { name: (heroIcon.getAttribute('class')||'').match(/lucide-([a-z0-9-]+)/)?.[1], sw: heroIcon.getAttribute('stroke-width'), w: Math.round(heroIcon.getBoundingClientRect().width) } : null,
  dateLabel: g(dateLabel, ['font-size','font-weight','color','text-transform','letter-spacing']),
  tag: g(tag, ['font-size','font-weight','color','text-transform','letter-spacing'])
});
})()

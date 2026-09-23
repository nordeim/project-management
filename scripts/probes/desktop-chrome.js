(() => {
const q = s => document.querySelector(s);
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g,'_')] = cs.getPropertyValue(p)); return o; };
const side = q('aside');
const greeting = [...document.querySelectorAll('h1,h2')].find(e => /Good (Morning|Afternoon|Evening)/.test(e.textContent));
const newGoal = [...document.querySelectorAll('button, a')].find(e => /NEW GOAL/i.test(e.textContent));
const nav = side ? [...side.querySelectorAll('a')].map(a => (a.textContent||'').trim().slice(0,14)) : null;
return JSON.stringify({
  aside: g(side, ['position','top','height','width','border-radius']),
  greeting: greeting ? { text: greeting.textContent.trim().slice(0,30), ...g(greeting, ['font-size','font-weight','letter-spacing','line-height']) } : null,
  newGoal: newGoal ? g(newGoal, ['border-radius','padding','font-size','font-weight']) : null,
  navLabels: nav,
  bodyBg: getComputedStyle(document.body).backgroundColor
});
})()

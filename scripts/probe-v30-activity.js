(() => {
  const out = {};
  const h1 = document.querySelector('h1');
  out.h1 = h1 ? [h1.textContent.trim().slice(0,16), getComputedStyle(h1).fontSize, Math.round(h1.getBoundingClientRect().x), Math.round(h1.getBoundingClientRect().y)] : null;
  const online = [...document.querySelectorAll('span,div,p')].find(e => /^Online · \d+/i.test((e.textContent||'').trim()) && e.getBoundingClientRect().width < 120);
  out.online = online ? (()=>{const c=getComputedStyle(online);const r=online.getBoundingClientRect();return [online.textContent.trim(), Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius.split(' ')[0], c.padding, c.backgroundColor.slice(0,14)]})() : 'NF';
  const hero = [...document.querySelectorAll('div')].find(d => /Last agent action/i.test(d.textContent||'') && d.getBoundingClientRect().height > 40 && d.getBoundingClientRect().height < 90);
  out.hero = hero ? (()=>{const r=hero.getBoundingClientRect();const c=getComputedStyle(hero);return [Math.round(r.width)+'x'+Math.round(r.height), c.padding, (c.boxShadow||'none').slice(0,36)]})() : 'NF';
  const groups = [...document.querySelectorAll('div')].filter(d => { const r = d.getBoundingClientRect(); const c = getComputedStyle(d); return r.width > 600 && r.height > 100 && parseFloat(c.borderTopLeftRadius) === 14; });
  out.groups = groups.length;
  out.svgCount = [...document.querySelectorAll('svg')].filter(s=>s.getBoundingClientRect().width>5).length;
  out.firstRowTxt = (document.querySelector('h4')?.closest('div')?.textContent || '').trim().slice(0,40);
  return JSON.stringify(out);
})()

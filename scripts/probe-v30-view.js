(() => {
  const out = {};
  const h1 = document.querySelector('h1');
  out.h1 = h1 ? [h1.textContent.trim().slice(0,14), Math.round(h1.getBoundingClientRect().x)] : null;
  // buttons in headers (plus buttons)
  const btns = [...document.querySelectorAll('button')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 30 && r.y < 300 && b.textContent.trim(); });
  out.btns = btns.map(b => { const c = getComputedStyle(b); const r = b.getBoundingClientRect(); return [b.textContent.trim().slice(0,12), Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius.split(' ')[0], c.fontSize, c.backgroundColor.slice(0,16)]; });
  // first cards
  const cards = [...document.querySelectorAll('div')].filter(d => { const r = d.getBoundingClientRect(); const c = getComputedStyle(d); return r.width > 300 && r.height > 60 && r.height < 200 && parseFloat(c.borderTopLeftRadius) >= 12 && c.boxShadow !== 'none' && r.y > 100; });
  out.cardCount = cards.length;
  if (cards[0]) { const c = getComputedStyle(cards[0]); const r = cards[0].getBoundingClientRect(); out.firstCard = [Math.round(r.width)+'x'+Math.round(r.height), c.borderRadius.split(' ')[0], c.padding, c.backgroundColor.slice(0,16)]; }
  out.svgs = [...document.querySelectorAll('svg')].filter(s => s.getBoundingClientRect().width > 5).map(s => [(s.getAttribute('class')||'').match(/lucide-([a-z-]+)/)?.[1]||'raw', Math.round(s.getBoundingClientRect().width), getComputedStyle(s).strokeWidth]);
  return JSON.stringify(out, null, 1);
})()

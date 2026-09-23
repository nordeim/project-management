(() => {
// svg stroke census on the whole main area (first 40 svgs)
const svgs = [...document.querySelectorAll('main svg')].slice(0, 40);
const census = svgs.map(s => {
  const r = s.getBoundingClientRect();
  const sw = s.getAttribute('stroke-width');
  const cls = (s.getAttribute('class') || '').slice(0, 30);
  const dataTest = s.closest('[data-slot]')?.getAttribute('data-slot') || '';
  // lucide renders the glyph name in class "lucide lucide-<name>"
  const name = (s.getAttribute('class') || '').match(/lucide-([a-z0-9-]+)/)?.[1] || '?';
  return { name, sw, w: Math.round(r.width), x: Math.round(r.x), y: Math.round(r.y), cls };
});
return JSON.stringify({ total: document.querySelectorAll('main svg').length, census });
})()

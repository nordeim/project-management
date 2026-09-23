(() => {
// Broad scan: any img or background-image anywhere in the document
const imgs = [...document.querySelectorAll('img')].map(e => {
  const r = e.getBoundingClientRect();
  return { src: (e.getAttribute('src')||'').slice(0,60), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], opacity: getComputedStyle(e).opacity, display: getComputedStyle(e).display };
});
const bgImages = [...document.querySelectorAll('*')].filter(e => {
  const bi = getComputedStyle(e).backgroundImage;
  return bi && bi !== 'none';
}).slice(0, 8).map(e => {
  const r = e.getBoundingClientRect();
  return { tag: e.tagName, cls: (e.getAttribute('class')||'').slice(0,50), bg: getComputedStyle(e).backgroundImage.slice(0,80), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] };
});
return JSON.stringify({ imgCount: imgs.length, imgs, bgImageCount: bgImages.length, bgImages });
})()

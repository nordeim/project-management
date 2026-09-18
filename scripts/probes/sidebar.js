// sidebar.js — desktop sidebar probe (1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 30), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };

const aside = document.querySelector("aside") || [...document.querySelectorAll("body *")].find(e => /dashboard/i.test(e.textContent || "") && /goals/i.test(e.textContent || "") && e.getBoundingClientRect().width < 300 && e.getBoundingClientRect().width > 200);
const sideRoot = aside || [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); return r.x < 300 && r.width >= 200 && r.width <= 260 && r.height > 700; })[0];

// brand "ORBITAL" text
const brand = [...document.querySelectorAll("body *")].filter(vis).filter(e => e.children.length === 0 && (e.textContent || "").trim() === "ORBITAL")[0];
// nav items
const navItems = sideRoot ? [...sideRoot.querySelectorAll("*")].filter(vis).filter(e => { const r = e.getBoundingClientRect(); const t = (e.textContent || "").trim(); return /^(Dashboard|Goals|My Tasks|Agent Activity|Team|Settings)$/.test(t) && r.height >= 30 && r.height <= 50; }) : [];
// section labels (WORKSPACE / MANAGEMENT)
const sectionLabels = sideRoot ? [...sideRoot.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /^(WORKSPACE|MANAGEMENT)$/i.test((e.textContent || "").trim())) : [];
// clock
const clock = sideRoot ? [...sideRoot.querySelectorAll("*")].filter(vis).filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return parseFloat(cs.borderRadius) >= 40 && r.width >= 60 && r.width <= 120; })[0] : null;
// tasks status block
const tasksStatus = sideRoot ? [...sideRoot.querySelectorAll("*")].filter(vis).filter(e => /^TASKS STATUS$/i.test((e.textContent || "").trim()) && e.children.length === 0)[0] : null;
// collapse button
const collapse = sideRoot ? [...sideRoot.querySelectorAll("button, [role=button], svg")].filter(vis).filter(e => e.getBoundingClientRect().width < 40 && e.getBoundingClientRect().y > 800)[0] : null;
// sidebar panel (the raised surface)
const panel = sideRoot ? [...sideRoot.querySelectorAll("*")].filter(vis).filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return cs.boxShadow !== "none" && r.width > 180 && r.height > 700; }).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0] : null;

return JSON.stringify({
  sideRoot: g(sideRoot, ["display", "flex-direction", "padding", "width", "height", "position", "top", "box-shadow"]),
  panel: g(panel, ["padding", "box-shadow", "border-radius", "width", "height", "display", "flex-direction"]),
  brand: brand ? { ...g(brand, ["font-size", "font-weight", "letter-spacing", "color", "font-family"]), box2: [Math.round(brand.getBoundingClientRect().x), Math.round(brand.getBoundingClientRect().y), Math.round(brand.getBoundingClientRect().width), Math.round(brand.getBoundingClientRect().height)] } : null,
  brandMark: brand && brand.previousElementSibling ? g(brand.previousElementSibling, ["width", "height"]) : (brand && brand.parentElement.firstElementChild !== brand ? g(brand.parentElement.firstElementChild, ["width", "height"]) : null),
  navItems: navItems.map(e => ({ ...g(e, ["font-size", "font-weight", "color", "height", "display", "align-items", "padding", "border-radius", "background-color", "box-shadow"]), t: (e.textContent || "").trim() })),
  sectionLabels: sectionLabels.map(e => ({ ...g(e, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]), t: (e.textContent || "").trim() })),
  clock: clock ? g(clock, ["width", "height", "box-shadow", "border-radius"]) : null,
  tasksStatus: tasksStatus ? g(tasksStatus, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  tasksStatusParent: tasksStatus ? g(tasksStatus.parentElement, ["display", "gap", "padding", "box-shadow"]) : null,
  collapse: collapse ? g(collapse, ["width", "height", "display", "align-items", "justify-content", "box-shadow", "border-radius"]) : null
});

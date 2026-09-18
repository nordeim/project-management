// dashboard.js — dashboard surface probe (run on both live and clone at 1440x900)
const g = (el, props) => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const o = { t: (el.textContent || "").trim().slice(0, 32), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] };
  props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p));
  return o;
};
const q = (sel) => document.querySelector(sel);
const byText = (txt) => {
  const els = [...document.querySelectorAll("main *")].filter(e =>
    (e.textContent || "").trim() === txt && e.children.length === 0);
  return els[0];
};
// find stat column links/buttons: elements whose text starts with Active Goals etc.
const statCols = ["Active Goals", "Blocked Tasks", "Completed Tasks"].map(t => {
  const el = [...document.querySelectorAll("main a, main button")].find(e => (e.textContent || "").trim().startsWith(t));
  return el ? g(el, ["display", "flex-direction", "align-items", "justify-content", "padding", "gap", "text-decoration-line"]) : { t, missing: true };
});
const statInner = ["Active Goals", "Blocked Tasks", "Completed Tasks"].map(t => {
  const col = [...document.querySelectorAll("main a, main button")].find(e => (e.textContent || "").trim().startsWith(t));
  if (!col) return { t, missing: true };
  return g(col.firstElementChild, ["display", "flex-direction", "align-items", "padding", "gap", "width"]);
});
const statNums = [...document.querySelectorAll("main a *, main button *")].filter(e =>
  /^[0-9]{1,3}$/.test((e.textContent || "").trim()) && parseInt(getComputedStyle(e).fontSize) > 30).map(e => g(e, ["font-size", "font-weight", "letter-spacing", "color", "line-height"]));
const statLabels = [...document.querySelectorAll("main a *, main button *")].filter(e =>
  /^(ACTIVE|BLOCKED|COMPLETED)/i.test((e.textContent || "").trim()) && e.children.length === 0).map(e => g(e, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]));
const statSubs = [...document.querySelectorAll("main a *, main button *")].filter(e =>
  /^[0-9]+ (total|completed)/.test((e.textContent || "").trim()) || /of total$/.test((e.textContent || "").trim())).map(e => g(e, ["font-size", "font-weight", "color"]));

// date card: element containing the big day number (e.g. "18")
const dayNum = [...document.querySelectorAll("main *")].filter(e =>
  (e.textContent || "").trim() === String(new Date().getDate()) && parseInt(getComputedStyle(e).fontSize) > 30).map(e => g(e, ["font-size", "font-weight", "letter-spacing", "color"]));
// month label near the date
const monthEl = [...document.querySelectorAll("main *")].filter(e =>
  /^(September|October|November|December|January|February|March|April|May|June|July|August)$/.test((e.textContent || "").trim()) && e.children.length === 0).map(e => g(e, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]));
// done caption in ring card
const doneCap = byText("done") ? g(byText("done"), ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null;
// ring circle: element with large border radius and width 100-200px in main
const circles = [...document.querySelectorAll("main *")].filter(e => {
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  return (cs.borderRadius === "9999px" || parseFloat(cs.borderRadius) >= 70) && r.width >= 100 && r.width <= 200 && r.height >= 100 && r.height <= 200;
}).slice(0, 2).map(e => g(e, ["width", "height", "box-shadow", "background-color"]));

// panel headers (h2)
const h2s = [...document.querySelectorAll("main h2")].map(e => g(e, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]));
// NPA block
const npa = byText("Next Planned Action") ? (() => {
  const lbl = byText("Next Planned Action");
  return { label: g(lbl, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]), value: lbl.nextElementSibling ? g(lbl.nextElementSibling, ["font-size", "font-weight", "color"]) : null, parent: g(lbl.parentElement, ["box-shadow", "padding", "margin", "border-radius"]) };
})() : { missing: true };
// activity rows (first 2): rows with svg icons in the activity panel
const actRows = [...document.querySelectorAll("main *")].filter(e => e.querySelector(":scope > svg") && /task|goal|assigned|generated|analyzed|status|invited|update/i.test(e.textContent) && e.getBoundingClientRect().height > 40 && e.getBoundingClientRect().height < 120).slice(0, 3).map(e => g(e, ["display", "align-items", "gap", "padding", "line-height"]));
// goals panel rows (inset wells with svg ring)
const goalRows = [...document.querySelectorAll("main *")].filter(e => {
  const r = e.getBoundingClientRect();
  const svg = e.querySelector("svg");
  return svg && r.height > 50 && r.height < 90 && r.width > 300;
}).slice(0, 3).map(e => g(e, ["display", "align-items", "gap", "padding", "box-shadow"]));

// grid sections
const sections = [...document.querySelectorAll("main section, main > div > div")].slice(0, 4).map(e => {
  const cs = getComputedStyle(e);
  return { cls: (typeof e.className === "string" ? e.className.slice(0, 70) : ""), display: cs.display, gap: cs.gap, cols: cs.gridTemplateColumns.slice(0, 90), mt: cs.marginTop };
});

return JSON.stringify({
  h1: g(q("h1"), ["font-size", "line-height", "font-weight", "letter-spacing", "color"]),
  statCols, statInner, statNums, statLabels, statSubs,
  dayNum, monthEl, doneCap, circles, h2s, npa, actRows, goalRows, sections
});

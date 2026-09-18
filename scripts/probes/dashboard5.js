// dashboard5.js — activity rows + full-log links + panel row counts (both apps)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 36), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };

// find activity rows: elements containing a quoted message like 'assigned to' / 'Generated' with an svg icon, full panel width
const rows = [...document.querySelectorAll("main *")].filter(vis).filter(e => {
  const r = e.getBoundingClientRect();
  return r.width > 400 && r.height >= 40 && r.height <= 110 && e.querySelector("svg") &&
    /(assigned to|Generated|generated|set|invited|created|analyzed|completed)/i.test(e.textContent || "") &&
    e.querySelectorAll("*").length < 30;
}).filter(e => !e.querySelector("h1,h2,p[class*=label]"));
// dedupe nested: keep outermost (sort by area desc, drop elements whose parent is also in list)
const outermost = rows.filter(e => !rows.some(o => o !== e && o.contains(e)));

const firstRow = outermost.sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)[0];
// inside firstRow: icon circle, message, timestamp
const iconWrap = firstRow ? [...firstRow.querySelectorAll("*")].filter(vis).filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width >= 25 && r.width <= 40 && r.height >= 25 && r.height <= 40 && (cs.borderRadius === "50%" || parseFloat(cs.borderRadius) > 12) && cs.backgroundColor !== "rgba(0, 0, 0, 0)"; })[0] : null;
const msg = firstRow ? [...firstRow.querySelectorAll("p, span, div")].filter(vis).filter(e => e.children.length === 0 && (e.textContent || "").trim().length > 20 && !/\d{1,2}:\d{2}|month|day|hour|minute|ago/i.test(e.textContent))[0] : null;
const ts = firstRow ? [...firstRow.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /(month|day|hour|minute|ago|\d{1,2}:\d{2})/i.test(e.textContent || ""))[0] : null;

// Full log links
const fullLogs = [...document.querySelectorAll("main *")].filter(vis).filter(e => e.children.length === 0 && /full log/i.test(e.textContent || ""));

// count distinct activity rows by y
const rowYs = [...new Set(outermost.map(e => Math.round(e.getBoundingClientRect().y)))].sort((a, b) => a - b);

// goal rows in goals panel: wells with inset shadow + svg ring, in the right half
const goalWells = [...document.querySelectorAll("main *")].filter(vis).filter(e => {
  const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  return r.x > 800 && r.width > 400 && r.height > 50 && r.height < 100 && cs.boxShadow.includes("inset") && e.querySelector("svg");
});
const goalYs = [...new Set(goalWells.map(e => Math.round(e.getBoundingClientRect().y)))].sort((a, b) => a - b);
const goalPitches = goalYs.slice(1).map((y, i) => y - goalYs[i]);

// full log
return JSON.stringify({
  rowYs, row0: g(firstRow, ["display", "align-items", "gap", "padding", "border-top-width", "border-top-color", "height"]),
  iconWrap: g(iconWrap, ["width", "height", "border-radius", "background-color", "display", "align-items", "justify-content"]),
  iconSvg: iconWrap ? g(iconWrap.querySelector("svg"), ["width", "height", "color"]) : null,
  msg: g(msg, ["font-size", "font-weight", "color", "line-height"]),
  ts: g(ts, ["font-size", "font-weight", "color", "flex", "margin-left", "align-self"]),
  fullLog0: fullLogs[0] ? g(fullLogs[0], ["font-size", "font-weight", "color", "text-transform", "letter-spacing"]) : null,
  fullLogParent: fullLogs[0] ? g(fullLogs[0].parentElement, ["font-size", "font-weight", "color", "text-transform", "letter-spacing", "gap", "display", "align-items"]) : null,
  goalYs, goalPitches,
  goalWell0: goalWells[0] ? g(goalWells[0], ["display", "align-items", "gap", "padding", "box-shadow", "margin-bottom", "height", "border-radius"]) : null,
  goalWell0Kids: goalWells[0] ? [...goalWells[0].children].filter(vis).map(k => g(k, ["display", "flex-direction", "align-items", "gap", "padding", "width"])) : null
});

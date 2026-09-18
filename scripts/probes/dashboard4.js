// dashboard4.js — activity panel + goals panel internals (visible only, 1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 36), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };
const leaves = (root) => [...root.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0);

// activity panel = ancestor of "Agent Activity" header with height > 300
const actHeader = leaves(document.querySelector("main")).find(e => /^agent activity$/i.test((e.textContent || "").trim()));
const actPanel = actHeader ? (() => { let n = actHeader; while (n && n.getBoundingClientRect().height < 300) n = n.parentElement; return n; })() : null;

// rows: direct-ish children of the panel that contain an svg and text, 40-100px tall
const rows = actPanel ? [...actPanel.querySelectorAll("*")].filter(vis).filter(e => {
  const r = e.getBoundingClientRect();
  return r.height > 40 && r.height < 100 && r.width > 300 && e.querySelector("svg") && (e.textContent || "").trim().length > 12;
}).sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y) : [];

// NPA well: the element containing "Next Planned Action"
const npaLabel = actPanel ? leaves(actPanel).find(e => /next planned action/i.test(e.textContent || "")) : null;

// goals panel
const goalsHeader = leaves(document.querySelector("main")).find(e => /^goals$/i.test((e.textContent || "").trim()) && parseInt(getComputedStyle(e).fontSize) < 16);
const goalsPanel = goalsHeader ? (() => { let n = goalsHeader; while (n && n.getBoundingClientRect().height < 300) n = n.parentElement; return n; })() : null;
const goalWells = goalsPanel ? [...goalsPanel.querySelectorAll("*")].filter(vis).filter(e => {
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  return r.height > 55 && r.height < 90 && r.width > 400 && cs.boxShadow.includes("inset");
}).sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y) : [];
const goalMeta = goalWells[0] ? leaves(goalWells[0]).filter(e => /\d/.test(e.textContent || "") && (e.textContent || "").trim().length < 30) : [];

// full log links
const fullLog = leaves(document.querySelector("main")).filter(e => /full log/i.test(e.textContent || ""));

// online dot / live dot in activity header
const dot = actHeader ? [...actHeader.parentElement.querySelectorAll("*")].filter(vis).filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width <= 12 && r.width > 3 && r.height <= 12 && r.height > 3 && cs.borderRadius !== "0px"; })[0] : null;

return JSON.stringify({
  actPanel: g(actPanel, ["padding", "box-shadow", "border-radius", "height"]),
  actHeaderRow: actHeader ? g(actHeader.parentElement, ["display", "align-items", "gap", "padding", "margin", "height"]) : null,
  actHeader: g(actHeader, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]),
  dot: dot ? g(dot, ["width", "height", "background-color", "border-radius"]) : null,
  npa: npaLabel ? {
    label: g(npaLabel, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]),
    value: npaLabel.nextElementSibling && vis(npaLabel.nextElementSibling) ? g(npaLabel.nextElementSibling, ["font-size", "font-weight", "color", "line-height"]) : null,
    well: g(npaLabel.closest("div"), ["box-shadow", "padding", "margin", "border-radius", "display", "align-items", "gap", "height"])
  } : { missing: true },
  rowCount: rows.length,
  row0: rows[0] ? g(rows[0], ["display", "align-items", "gap", "padding", "border-top-width", "border-top-color"]) : null,
  row0icon: rows[0] ? g(rows[0].querySelector("svg").parentElement, ["width", "height", "border-radius", "background-color", "display", "align-items", "justify-content"]) : null,
  row0svg: rows[0] ? g(rows[0].querySelector("svg"), ["width", "height"]) : null,
  row0leaves: rows[0] ? leaves(rows[0]).slice(0, 4).map(e => g(e, ["font-size", "font-weight", "color", "line-height", "flex", "margin-left"])) : null,
  row1: rows[1] ? g(rows[1], ["display", "align-items", "gap", "padding", "border-top-width"]) : null,
  goalsPanel: g(goalsPanel, ["padding", "box-shadow", "border-radius", "height"]),
  goalsHeader: g(goalsHeader, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]),
  goalsHeaderRow: goalsHeader ? g(goalsHeader.parentElement, ["display", "align-items", "gap", "margin-bottom", "height"]) : null,
  goalWellCount: goalWells.length,
  goalWell0: goalWells[0] ? g(goalWells[0], ["display", "align-items", "gap", "padding", "box-shadow", "margin-bottom", "height"]) : null,
  goalMeta0: goalMeta.slice(0, 3).map(e => g(e, ["font-size", "font-weight", "color"])),
  fullLog: fullLog[0] ? g(fullLog[0], ["font-size", "font-weight", "color", "text-transform", "text-decoration-line"]) : null
});

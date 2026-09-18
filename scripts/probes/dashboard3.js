// dashboard3.js — date card, ring card, activity panel, goals panel (visible only, 1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 36), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };

// --- top-left cell: date panel (330) + ring panel (180)
const dayLeaf = [...document.querySelectorAll("main *")].filter(vis).filter(e => e.children.length === 0 && (e.textContent || "").trim() === String(new Date().getDate()) && parseInt(getComputedStyle(e).fontSize) > 30)[0];
const datePanel = dayLeaf ? (() => { let n = dayLeaf; while (n && !(n.getBoundingClientRect().width >= 300 && n.getBoundingClientRect().width <= 340 && n.getBoundingClientRect().height >= 170 && n.getBoundingClientRect().height <= 190)) n = n.parentElement; return n; })() : null;
const dateSquare = dayLeaf ? dayLeaf.parentElement.getBoundingClientRect().height < 120 && dayLeaf.parentElement !== datePanel ? dayLeaf.parentElement : (() => { let n = dayLeaf; while (n && n.parentElement !== datePanel) n = n.parentElement; return n; })() : null;
const monthLeaf = [...document.querySelectorAll("main *")].filter(vis).filter(e => e.children.length === 0 && / 2026$/.test((e.textContent || "").trim()) && (e.textContent || "").trim().length < 16)[0];

// ring: the done caption
const doneLeaf = [...document.querySelectorAll("main *")].filter(vis).filter(e => e.children.length === 0 && (e.textContent || "").trim() === "done" && parseInt(getComputedStyle(e).fontSize) < 14)[0];
const ringPanel = doneLeaf ? (() => { let n = doneLeaf; while (n && !(n.getBoundingClientRect().width >= 160 && n.getBoundingClientRect().width <= 200 && n.getBoundingClientRect().height >= 170 && n.getBoundingClientRect().height <= 190)) n = n.parentElement; return n; })() : null;
const ringCircle = doneLeaf ? (() => { let n = doneLeaf; for (let i = 0; i < 4; i++) { n = n.parentElement; if (n && parseFloat(getComputedStyle(n).borderRadius) >= 70) return n; } return null; })() : null;
const pctLeaf = doneLeaf && doneLeaf.previousElementSibling ? doneLeaf.previousElementSibling : null;

// --- activity panel: header "Agent Activity" leaf
const actHeader = [...document.querySelectorAll("main *")].filter(vis).filter(e => e.children.length === 0 && /^agent activity$/i.test((e.textContent || "").trim()))[0];
const actPanel = actHeader ? (() => { let n = actHeader; while (n && n.getBoundingClientRect().height < 200) n = n.parentElement; return n; })() : null;
// first activity row (has svg + text, height 40-120)
const actRow = actPanel ? [...actPanel.querySelectorAll("*")].filter(vis).filter(e => e.querySelector(":scope > svg") && e.getBoundingClientRect().height > 40 && e.getBoundingClientRect().height < 100 && (e.textContent || "").trim().length > 10).sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)[0] : null;
const actIcon = actRow ? actRow.querySelector("svg") : null;
const actMsg = actRow ? [...actRow.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && (e.textContent || "").trim().length > 15)[0] : null;
const actTime = actRow ? [...actRow.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /\d{1,2}:\d{2}/.test((e.textContent || "").trim()))[0] : null;

// --- goals panel: header "Goals"
const goalsHeader = [...document.querySelectorAll("main *")].filter(vis).filter(e => e.children.length === 0 && /^goals$/i.test((e.textContent || "").trim()) && parseInt(getComputedStyle(e).fontSize) < 16)[0];
const goalsPanel = goalsHeader ? (() => { let n = goalsHeader; while (n && n.getBoundingClientRect().height < 200) n = n.parentElement; return n; })() : null;
// first goal row (inset well with svg ring)
const goalRow = goalsPanel ? [...goalsPanel.querySelectorAll("*")].filter(vis).filter(e => e.querySelector("svg") && e.getBoundingClientRect().height > 50 && e.getBoundingClientRect().height < 100 && (e.textContent || "").trim().length > 10 && !e.querySelector("h1,h2")).sort((a, b) => a.getBoundingClientRect().y - b.getBoundingClientRect().y)[0] : null;
const goalTitle = goalRow ? [...goalRow.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && (e.textContent || "").trim().length > 12 && !/^\d/.test((e.textContent || "").trim()))[0] : null;
const goalRing = goalRow ? goalRow.querySelector("svg") : null;
const goalPct = goalRow ? [...goalRow.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /^\d+%$/.test((e.textContent || "").trim()))[0] : null;

return JSON.stringify({
  datePanel: datePanel ? g(datePanel, ["display", "flex-direction", "align-items", "padding", "box-shadow", "border-radius"]) : null,
  dateSquare: dateSquare ? g(dateSquare, ["display", "flex-direction", "align-items", "padding", "box-shadow", "border-radius", "background-color"]) : null,
  dayLeaf: g(dayLeaf, ["font-size", "font-weight", "letter-spacing", "color", "line-height"]),
  monthLeaf: monthLeaf ? g(monthLeaf, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  ringPanel: ringPanel ? g(ringPanel, ["display", "align-items", "justify-content", "padding", "box-shadow", "border-radius", "background-color"]) : null,
  ringCircle: ringCircle ? g(ringCircle, ["width", "height", "box-shadow", "border-radius", "display", "align-items", "justify-content", "flex-direction"]) : null,
  pctLeaf: pctLeaf ? g(pctLeaf, ["font-size", "font-weight", "letter-spacing", "color", "line-height"]) : null,
  doneLeaf: doneLeaf ? g(doneLeaf, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  actHeaderRow: actHeader ? g(actHeader.parentElement, ["display", "align-items", "gap", "padding", "margin"]) : null,
  actHeader: actHeader ? g(actHeader, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  actPanel: actPanel ? g(actPanel, ["padding", "box-shadow", "border-radius"]) : null,
  actRow: actRow ? g(actRow, ["display", "align-items", "gap", "padding", "border-top-width"]) : null,
  actIcon: actIcon ? g(actIcon.parentElement, ["width", "height", "border-radius", "background-color", "display", "align-items", "justify-content", "margin-right"]) : null,
  actMsg: actMsg ? g(actMsg, ["font-size", "font-weight", "color", "line-height"]) : null,
  actTime: actTime ? g(actTime, ["font-size", "font-weight", "color", "flex", "margin-left"]) : null,
  goalsHeader: goalsHeader ? g(goalsHeader, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  goalsHeaderRow: goalsHeader ? g(goalsHeader.parentElement, ["display", "align-items", "gap", "padding", "margin-bottom"]) : null,
  goalsPanel: goalsPanel ? g(goalsPanel, ["padding", "box-shadow", "border-radius"]) : null,
  goalRow: goalRow ? g(goalRow, ["display", "align-items", "gap", "padding", "box-shadow", "border-radius", "margin"]) : null,
  goalTitle: goalTitle ? g(goalTitle, ["font-size", "font-weight", "color"]) : null,
  goalRing: goalRing ? g(goalRing, ["width", "height"]) : null,
  goalPct: goalPct ? g(goalPct, ["font-size", "font-weight", "color"]) : null
});

// goal-detail.js — goal detail view probe (1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 30), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };
const main = document.querySelector("main");
const leaves = (root) => [...root.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0);

// back link
const back = leaves(main).find(e => /back to goals/i.test(e.textContent || ""));
// h1 title (goal title)
const h1 = main.querySelector("h1");
// status chip (word ACTIVE/DONE etc near h1)
const chip = leaves(main).filter(e => /^(Active|Done|Draft|Paused|In Progress)$/i.test((e.textContent || "").trim()) && e.getBoundingClientRect().y < 250)[0];
// DELETE button
const del = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /delete/i.test((e.textContent || "").trim()) && e.getBoundingClientRect().width < 130)[0];
// stat cards: panels with big numbers (Progress / Blocked)
const statPanels = [...main.querySelectorAll("*")].filter(vis).filter(e => {
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  return cs.boxShadow !== "none" && !cs.boxShadow.includes("inset") && r.width > 300 && r.width < 600 && r.height > 80 && r.height < 200 && !e.closest("aside") && e.querySelector("p, span");
});
const blockedPanel = statPanels.find(e => /blocked/i.test(e.textContent || ""));
const progressPanel = statPanels.find(e => /progress/i.test(e.textContent || "") && !/blocked/i.test(e.textContent || ""));
// blocked panel internals
const blockedNum = blockedPanel ? leaves(blockedPanel).find(e => /^\d+$/.test((e.textContent || "").trim()) && parseInt(getComputedStyle(e).fontSize) > 18) : null;
const blockedNumBox = blockedPanel ? [...blockedPanel.querySelectorAll("*")].filter(vis).filter(e => e.children.length <= 1 && e.getBoundingClientRect().width > 40 && e.getBoundingClientRect().width < 80 && e.getBoundingClientRect().height > 40 && e.getBoundingClientRect().height < 90 && !e.querySelector("svg"))[0] : null;
// progress panel internals
const progLabel = progressPanel ? leaves(progressPanel).find(e => /progress/i.test(e.textContent || "")) : null;
const progVal = progressPanel ? leaves(progressPanel).find(e => /\d+\/\d+ tasks done/.test((e.textContent || "").trim())) : null;
// Tasks header row
const tasksLabel = leaves(main).find(e => /^tasks$/i.test((e.textContent || "").trim()) && parseInt(getComputedStyle(e).fontSize) < 16);
const totalTxt = leaves(main).find(e => /^\d+ total$/.test((e.textContent || "").trim()));
const addTask = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /add task/i.test((e.textContent || "").trim()))[0];
// task cards: rows with status words
const taskCards = [...main.querySelectorAll("*")].filter(vis).filter(e => {
  const t = (e.textContent || "").trim();
  return /^(Pending|In Progress|Blocked|Need Help|Done)/i.test(t) && t.length > 20 && e.getBoundingClientRect().height > 60 && e.getBoundingClientRect().height < 130 && e.getBoundingClientRect().width > 400 && e.querySelectorAll("*").length > 4 && e.querySelectorAll("*").length < 40;
}).filter(e => ![...main.querySelectorAll("*")].some(o => o !== e && o.contains(e) && /^(Pending|In Progress|Blocked|Need Help|Done)/i.test((o.textContent || "").trim()) && o.getBoundingClientRect().height < e.getBoundingClientRect().height));
const tc = taskCards[0];
const tcLeaves = tc ? leaves(tc) : [];
const tcStatus = tcLeaves.find(e => /^(Pending|In Progress|Blocked|Need Help|Done)$/i.test((e.textContent || "").trim()));
const tcTitle = tcLeaves.filter(e => (e.textContent || "").trim().length > 15 && !/pending|progress|blocked|help|done|ai$/i.test(e.textContent))[0];
const tcDesc = tcLeaves.filter(e => (e.textContent || "").trim().length > 25 && e !== tcTitle && !/\d/.test(e.textContent))[0];
const tcAi = tcLeaves.filter(e => /^ai$/i.test((e.textContent || "").trim()))[0];
const tcMeta = tcLeaves.filter(e => /(h\b|hours|Oct|Sep|Aug|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul)/i.test(e.textContent || "") && (e.textContent || "").trim().length < 30)[0];
const tcActions = tc ? [...tc.querySelectorAll("button")].filter(vis).filter(e => e.getBoundingClientRect().width < 50) : [];

return JSON.stringify({
  back: back ? g(back, ["font-size", "font-weight", "color", "letter-spacing"]) : null,
  h1: g(h1, ["font-size", "line-height", "font-weight", "letter-spacing", "color"]),
  chip: chip ? g(chip, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  chipPill: chip ? g(chip.parentElement, ["padding", "box-shadow", "border-radius", "display", "align-items", "gap", "height"]) : null,
  del: del ? g(del, ["font-size", "font-weight", "letter-spacing", "color", "padding", "border-radius", "box-shadow", "text-transform", "width", "height"]) : null,
  blockedPanel: blockedPanel ? g(blockedPanel, ["padding", "box-shadow", "border-radius", "width", "height", "display", "flex-direction"]) : null,
  blockedLabel: blockedPanel ? g(leaves(blockedPanel).find(e => /blocked/i.test(e.textContent || "")), ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  blockedNum: g(blockedNum, ["font-size", "font-weight", "color", "line-height"]),
  blockedNumBox: g(blockedNumBox, ["width", "height", "background-color", "border-radius", "box-shadow", "display", "align-items", "justify-content"]),
  progressPanel: progressPanel ? g(progressPanel, ["padding", "box-shadow", "border-radius", "width", "height"]) : null,
  progLabel: g(progLabel, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]),
  progVal: g(progVal, ["font-size", "font-weight", "color"]),
  tasksLabel: g(tasksLabel, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]),
  tasksLabelRow: tasksLabel ? g(tasksLabel.parentElement, ["display", "align-items", "gap", "justify-content"]) : null,
  totalTxt: g(totalTxt, ["font-size", "font-weight", "color"]),
  totalTxtRow: totalTxt ? g(totalTxt.parentElement, ["display", "justify-content", "width"]) : null,
  addTask: addTask ? g(addTask, ["font-size", "font-weight", "letter-spacing", "color", "padding", "border-radius", "box-shadow", "text-transform", "height"]) : null,
  taskCardCount: taskCards.length,
  tc: tc ? g(tc, ["display", "flex-direction", "padding", "box-shadow", "border-radius", "height", "gap"]) : null,
  tcStatus: tcStatus ? g(tcStatus, ["font-size", "font-weight", "color", "letter-spacing"]) : null,
  tcStatusPill: tcStatus ? g(tcStatus.parentElement, ["display", "align-items", "gap", "padding", "box-shadow", "border-radius", "background-color"]) : null,
  tcTitle: g(tcTitle, ["font-size", "font-weight", "color", "letter-spacing"]),
  tcDesc: g(tcDesc, ["font-size", "font-weight", "color", "line-height"]),
  tcAi: tcAi ? g(tcAi, ["font-size", "font-weight", "color", "background-color", "padding", "border-radius", "border-width", "border-color"]) : null,
  tcAiPill: tcAi ? g(tcAi.parentElement, ["display", "align-items", "gap", "padding", "background-color", "border-radius", "border-width", "border-color", "box-shadow"]) : null,
  tcMeta: g(tcMeta, ["font-size", "font-weight", "color"]),
  tcActions: tcActions.slice(0, 2).map(e => g(e, ["width", "height", "border-radius", "box-shadow", "background-color", "margin-left"]))
});

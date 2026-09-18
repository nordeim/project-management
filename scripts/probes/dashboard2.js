// dashboard2.js — refined dashboard probe, visible elements only, at 1440x900
const vis = (e) => {
  if (!e) return false;
  const r = e.getBoundingClientRect();
  const cs = getComputedStyle(e);
  return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden";
};
const g = (el, props) => {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const o = { t: (el.textContent || "").trim().slice(0, 40), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] };
  props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p));
  return o;
};
const visibleAll = (sel) => [...document.querySelectorAll(sel)].filter(vis);
const leafByText = (txt) => visibleAll("main *").filter(e => e.children.length === 0 && (e.textContent || "").trim() === txt);

// --- stats panel: the VISIBLE column whose text starts with each label
const statPanel = visibleAll("main a, main button, main div").filter(e => {
  const t = (e.textContent || "").trim();
  return t.startsWith("Active Goals") && t.includes("31") && e.querySelectorAll("*").length >= 3 && e.querySelectorAll("*").length <= 12;
}).sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0];

const statCol = statPanel ? (() => {
  const col = [...statPanel.children].find(c => vis(c) && /Active Goals/i.test(c.textContent));
  const inner = col ? [...col.children].find(c => vis(c)) : null;
  const kids = inner ? [...inner.children].filter(vis) : [];
  return {
    col: g(col, ["display", "align-items", "justify-content", "padding", "width", "height"]),
    inner: g(inner, ["display", "flex-direction", "align-items", "justify-content", "padding", "gap", "width", "height"]),
    kids: kids.map(k => g(k, ["font-size", "font-weight", "letter-spacing", "color", "text-transform", "line-height", "text-align"])),
    panel: g(statPanel, ["display", "align-items", "justify-content", "padding", "gap", "box-shadow", "border-radius", "background-color", "width", "height"]),
    siblings: statPanel.parentElement ? g(statPanel.parentElement, ["display", "gap", "padding", "grid-template-columns"]) : null
  };
})() : { missing: true };

// --- date card: big day numeral
const dayEls = leafByText(String(new Date().getDate())).filter(e => parseInt(getComputedStyle(e).fontSize) > 30);
const monthEls = visibleAll("main *").filter(e => e.children.length === 0 && /^(September|October|November|December|January|February|March|April|May|June|July|August)$/.test((e.textContent || "").trim()));
const dateCard = dayEls[0] ? (() => {
  let n = dayEls[0]; const chain = [];
  for (let i = 0; i < 4 && n && n.tagName !== "SECTION"; i++) { chain.push(g(n, ["display", "flex-direction", "align-items", "gap", "padding", "box-shadow", "border-radius"])); n = n.parentElement; }
  return { day: g(dayEls[0], ["font-size", "font-weight", "letter-spacing", "color", "line-height"]), month: monthEls[0] ? g(monthEls[0], ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null, chain };
})() : { missing: true };

// --- ring card (done %)
const doneEls = leafByText("done");
const ringCard = doneEls[0] ? (() => {
  const circle = doneEls[0].parentElement && [...doneEls[0].parentElement.children].find(c => { const cs = getComputedStyle(c); const r = c.getBoundingClientRect(); return parseFloat(cs.borderRadius) >= 70 && r.width > 100; });
  return {
    caption: g(doneEls[0], ["font-size", "font-weight", "letter-spacing", "color"]),
    pct: doneEls[0].previousElementSibling ? g(doneEls[0].previousElementSibling, ["font-size", "font-weight", "color"]) : null,
    circle: circle ? g(circle, ["width", "height", "box-shadow", "border-radius"]) : null,
    card: (() => { let n = doneEls[0]; for (let i = 0; i < 4; i++) { n = n.parentElement; if (n && n.getBoundingClientRect().width > 140 && n.getBoundingClientRect().width < 220) return g(n, ["padding", "box-shadow", "border-radius", "display", "width", "height"]); } return null; })()
  };
})() : { missing: true };

// --- panel headers: visible elements that look like AGENT ACTIVITY / GOALS headers
const headers = visibleAll("main *").filter(e => e.children.length === 0 && /^(Agent Activity|Goals|AGENT ACTIVITY|GOALS)$/i.test((e.textContent || "").trim()) && parseInt(getComputedStyle(e).fontSize) <= 20).map(e => {
  return { self: g(e, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]), parent: g(e.parentElement, ["display", "align-items", "justify-content", "padding", "margin-bottom", "height"]) };
});

// --- NPA well
const npaLabel = visibleAll("main *").find(e => e.children.length === 0 && /next planned action/i.test(e.textContent || ""));
const npa = npaLabel ? {
  label: g(npaLabel, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]),
  value: npaLabel.nextElementSibling && vis(npaLabel.nextElementSibling) ? g(npaLabel.nextElementSibling, ["font-size", "font-weight", "color"]) : null,
  well: g(npaLabel.closest("div"), ["box-shadow", "padding", "margin", "border-radius", "display", "align-items", "gap"])
} : { missing: true };

// --- activity panel first row + goals panel first row (both under main)
const panelCards = visibleAll("main section > div, main section > *").filter(e => e.getBoundingClientRect().height > 100).map(e => g(e, ["padding", "box-shadow", "border-radius", "display", "width", "height"]));

return JSON.stringify({ statCol, dateCard, ringCard, headers, npa, panelCards: panelCards.slice(0, 6) });

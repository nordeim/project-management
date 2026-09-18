// goals2.js — goals view: chips + goal card internals (1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 30), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };
const main = document.querySelector("main");

// chips: buttons with count text like "All (3)"
const chips = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /^(All|Active|Done|Draft|Paused) \(\d+\)$/i.test((e.textContent || "").trim()));
// NEW GOAL button
const newGoal = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /^new goal/i.test((e.textContent || "").trim()) && e.getBoundingClientRect().width > 80)[0];
// goal cards: the links/buttons whose text starts with a status word and includes a title
const cards = [...main.querySelectorAll("a, button")].filter(vis).filter(e => {
  const t = (e.textContent || "").trim();
  return /^(ACTIVE|COMPLETED|DRAFT|PAUSED|ON TRACK)/i.test(t) && t.length > 30 && e.getBoundingClientRect().height > 120;
});
const card = cards[0];
const leaves = card ? [...card.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0) : [];
// the chip pill (contains ACTIVE + dot)
const chip = card ? leaves.filter(e => /^(ACTIVE|COMPLETED|DRAFT|PAUSED)$/i.test((e.textContent || "").trim()))[0] : null;
const chipPill = chip ? chip.closest("div,span") : null;
const blockedTxt = card ? leaves.filter(e => /blocked/i.test(e.textContent || ""))[0] : null;
const chevron = card ? leaves.filter(e => (e.textContent || "").trim() === "›")[0] : null;
const title = card ? leaves.filter(e => (e.textContent || "").trim().length > 15 && !/task|block|%|ACTIVE|COMPLETE/i.test(e.textContent || ""))[0] : null;
const meta = card ? leaves.filter(e => /tasks ·/.test(e.textContent || ""))[0] : null;
const date = card ? leaves.filter(e => /^(Sep|Aug|Jul|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun) \d{1,2}$/.test((e.textContent || "").trim()))[0] : null;
const pct = card ? leaves.filter(e => /^\d+%$/.test((e.textContent || "").trim()))[0] : null;
const frac = card ? leaves.filter(e => /^\d+\/\d+$/.test((e.textContent || "").trim()))[0] : null;
const track = card ? [...card.querySelectorAll("*")].filter(vis).filter(e => { const cs = getComputedStyle(e); return (cs.backgroundColor === "rgb(221, 216, 208)" || /rgb\(221, ?216, ?208\)/.test(cs.backgroundColor)) && e.getBoundingClientRect().height < 14; })[0] : null;
const ringSvg = card ? card.querySelector("svg") : null;
const editBtns = card ? [...card.querySelectorAll("button")].filter(vis).filter(e => e.getBoundingClientRect().width < 50) : [];

return JSON.stringify({
  chips: chips.map(e => ({ ...g(e, ["font-size", "font-weight", "letter-spacing", "color", "padding", "background-color", "box-shadow", "border-radius", "text-transform"]), t: (e.textContent || "").trim() })),
  newGoal: newGoal ? g(newGoal, ["font-size", "font-weight", "letter-spacing", "color", "padding", "background-color", "box-shadow", "border-radius", "text-transform", "width", "height"]) : null,
  cardCount: cards.length,
  card: card ? g(card, ["padding", "box-shadow", "border-radius", "width", "height", "display", "flex-direction", "gap"]) : null,
  chip: chip ? g(chip, ["font-size", "font-weight", "letter-spacing", "color", "text-transform"]) : null,
  chipPill: chipPill ? g(chipPill, ["padding", "box-shadow", "border-radius", "background-color", "display", "align-items", "gap", "height"]) : null,
  blockedTxt: blockedTxt ? g(blockedTxt, ["font-size", "font-weight", "color"]) : null,
  chevron: chevron ? g(chevron, ["font-size", "color"]) : null,
  title: title ? g(title, ["font-size", "font-weight", "letter-spacing", "color"]) : null,
  meta: meta ? g(meta, ["font-size", "font-weight", "color"]) : null,
  date: date ? g(date, ["font-size", "font-weight", "color"]) : null,
  pct: pct ? g(pct, ["font-size", "font-weight", "color"]) : null,
  frac: frac ? g(frac, ["font-size", "font-weight", "color"]) : null,
  track: track ? g(track, ["height", "border-radius", "background-color", "box-shadow", "width"]) : null,
  ringSvg: ringSvg ? g(ringSvg, ["width", "height"]) : null,
  editBtns: editBtns.slice(0, 2).map(e => g(e, ["width", "height", "border-radius", "box-shadow", "background-color"]))
});

// goals.js — goals view probe (1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 30), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };

const main = document.querySelector("main");
// h1
const h1 = main.querySelector("h1");
// filter chips: small pill buttons All / Active / Completed ...
const chips = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /^(All|Active|Completed|Done|Draft|Paused|Blocked|Pending|In Progress)$/i.test((e.textContent || "").trim()) && e.getBoundingClientRect().height < 45);
// NEW GOAL button
const newGoal = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /^new goal$/i.test((e.textContent || "").trim()))[0];
// goal cards: large raised cards with progress bar
const cards = [...main.querySelectorAll("*")].filter(vis).filter(e => {
  const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  return cs.boxShadow !== "none" && !cs.boxShadow.includes("inset") && r.width > 300 && r.height > 180 && r.height < 400 && e.querySelector("svg");
});
const card = cards[0];
// card internals: title, chip row, progress track, fraction, meta, action buttons
const cardKids = card ? [...card.querySelectorAll("*")].filter(vis) : [];
const title = card ? cardKids.filter(e => e.children.length === 0 && (e.textContent || "").trim().length > 12 && !/^\d/.test((e.textContent || "").trim())).sort((a, b) => parseInt(getComputedStyle(b).fontSize) - parseInt(getComputedStyle(a).fontSize))[0] : null;
const chipRow = card ? cardKids.find(e => e.querySelectorAll("*").length >= 1 && /progress|active|done|draft|paused/i.test(e.textContent || "") && e.getBoundingClientRect().height < 32 && e !== title) : null;
const statusChip = card ? cardKids.filter(e => e.children.length <= 1 && /^(In Progress|Active|Done|Draft|Paused|On Track)$/i.test((e.textContent || "").trim()) && e.getBoundingClientRect().height < 32)[0] : null;
const track = card ? cardKids.filter(e => { const cs = getComputedStyle(e); return cs.backgroundColor === "rgb(221, 216, 208)" || (cs.borderRadius === "999px" && e.getBoundingClientRect().height < 12 && e.getBoundingClientRect().width > 100); })[0] : null;
const fraction = card ? cardKids.filter(e => e.children.length === 0 && /^\d+\/\d+$/.test((e.textContent || "").trim()))[0] : null;
const metaLine = card ? cardKids.filter(e => e.children.length === 0 && /(blocked|task|day)/i.test(e.textContent || "") && (e.textContent || "").length < 40 && !/^\d+\/\d+$/.test(e.textContent))[0] : null;
const actions = card ? cardKids.filter(e => (e.tagName === "BUTTON" || e.getAttribute("role") === "button") && e.getBoundingClientRect().width < 50 && e.getBoundingClientRect().height < 50) : [];
const pctText = card ? cardKids.filter(e => e.children.length === 0 && /^\d+%$/.test((e.textContent || "").trim()))[0] : null;

return JSON.stringify({
  h1: g(h1, ["font-size", "line-height", "font-weight", "letter-spacing", "color"]),
  chips: chips.map(e => ({ ...g(e, ["font-size", "font-weight", "letter-spacing", "color", "padding", "background-color", "box-shadow", "border-radius", "text-transform"]), t: (e.textContent || "").trim() })),
  newGoal: newGoal ? g(newGoal, ["font-size", "font-weight", "letter-spacing", "color", "padding", "background-color", "box-shadow", "border-radius", "text-transform"]) : null,
  card: card ? g(card, ["padding", "box-shadow", "border-radius", "width", "height", "display", "flex-direction", "gap"]) : null,
  cardCount: cards.length,
  title: g(title, ["font-size", "font-weight", "letter-spacing", "color"]),
  statusChip: statusChip ? g(statusChip, ["font-size", "font-weight", "letter-spacing", "color", "padding", "box-shadow", "border-radius", "text-transform", "background-color"]) : null,
  track: track ? g(track, ["height", "border-radius", "background-color", "box-shadow", "width"]) : null,
  fraction: fraction ? g(fraction, ["font-size", "font-weight", "color"]) : null,
  metaLine: metaLine ? g(metaLine, ["font-size", "font-weight", "color"]) : null,
  actions: actions.slice(0, 3).map(e => g(e, ["width", "height", "border-radius", "box-shadow", "background-color", "margin-left"])),
  pctText: pctText ? g(pctText, ["font-size", "font-weight", "color"]) : null
});

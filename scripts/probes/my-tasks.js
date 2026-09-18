// my-tasks.js — My Tasks view: header, tabs, cards (1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 30), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };
const main = document.querySelector("main");
const h1 = main.querySelector("h1");
// subtitle "N tasks assigned to you"
const sub = [...main.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /tasks assigned to you/i.test(e.textContent || ""))[0];
// tabs: All / Pending / In Progress / Blocked / Done
const tabs = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /^(All|Pending|In Progress|Blocked|Done)( \(\d+\))?$/i.test((e.textContent || "").trim()) && e.getBoundingClientRect().y < 250);
// task cards count (rows with status words below y 250)
const cards = [...main.querySelectorAll("*")].filter(vis).filter(e => {
  const t = (e.textContent || "").trim();
  return /^(Pending|In Progress|Blocked|Need Help|Done)/i.test(t) && t.length > 20 && e.getBoundingClientRect().y > 240 && e.getBoundingClientRect().height > 60 && e.getBoundingClientRect().height < 140 && e.querySelectorAll("*").length > 4 && e.querySelectorAll("*").length < 40;
});
return JSON.stringify({
  h1: g(h1, ["font-size", "line-height", "font-weight", "letter-spacing", "color"]),
  sub: sub ? g(sub, ["font-size", "font-weight", "color"]) : null,
  subRow: sub ? g(sub.parentElement, ["display", "gap", "align-items"]) : null,
  tabs: tabs.map(e => ({ ...g(e, ["font-size", "font-weight", "letter-spacing", "color", "padding", "background-color", "box-shadow", "border-radius", "text-transform"]), t: (e.textContent || "").trim() })),
  cardCount: cards.length
});

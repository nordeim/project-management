// team-settings.js — Team + Settings view details (1440x900)
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
const g = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { t: (el.textContent || "").trim().slice(0, 30), tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; props.forEach(p => o[p.replace(/-/g, "_")] = cs.getPropertyValue(p)); return o; };
const main = document.querySelector("main");
const path = location.pathname;
const out = {};

if (path.includes("team")) {
  const h1 = main.querySelector("h1");
  out.h1 = h1 ? { ...g(h1, ["font-size", "letter-spacing", "font-weight"]), t: h1.textContent } : null;
  // buttons Invite Member / New Agent
  const invite = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /invite member/i.test(e.textContent || ""))[0];
  const agent = [...main.querySelectorAll("button, a")].filter(vis).filter(e => /new agent/i.test(e.textContent || ""))[0];
  out.invite = invite ? g(invite, ["font-size", "font-weight", "letter-spacing", "color", "padding", "border-radius", "text-transform", "box-shadow", "height"]) : null;
  out.agent = agent ? g(agent, ["font-size", "font-weight", "letter-spacing", "color", "padding", "border-radius", "text-transform", "box-shadow", "height"]) : null;
  // section headers Team Members / AI Agents
  const heads = [...main.querySelectorAll("h2, h3, p, span")].filter(vis).filter(e => /^(Team Members|AI Agents|Members)$/i.test((e.textContent || "").trim()) && parseInt(getComputedStyle(e).fontSize) >= 14);
  out.heads = heads.map(e => ({ ...g(e, ["font-size", "font-weight", "color", "letter-spacing"]), t: e.textContent }));
  // empty state icons: svg elements in the empty areas
  const empties = [...main.querySelectorAll("*")].filter(vis).filter(e => {
    const cs = getComputedStyle(e);
    return e.tagName === "svg" && e.getBoundingClientRect().width >= 20 && e.getBoundingClientRect().width <= 60 && !e.closest("button");
  });
  out.emptyIcons = empties.slice(0, 4).map(e => ({ cls: [...e.classList].filter(c => c.startsWith("lucide-")).join(","), size: Math.round(e.getBoundingClientRect().width), color: getComputedStyle(e).color, parentBox: [Math.round(e.parentElement.getBoundingClientRect().width), Math.round(e.parentElement.getBoundingClientRect().height)], parentCls: (typeof e.parentElement.className === "string" ? e.parentElement.className.slice(0, 40) : "") }));
  // empty state title/desc
  const emptyTitle = [...main.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /no (team members|agents)/i.test(e.textContent || ""))[0];
  out.emptyTitle = emptyTitle ? g(emptyTitle, ["font-size", "font-weight", "color"]) : null;
} else if (path.includes("settings")) {
  const h1 = main.querySelector("h1");
  out.h1 = h1 ? { ...g(h1, ["font-size", "letter-spacing"]), t: h1.textContent } : null;
  // field labels + descriptions
  const labels = [...main.querySelectorAll("label, p, span")].filter(vis).filter(e => e.children.length === 0 && /^(Workspace Name|Working Hours|AI Assistant|Ping Frequency|AI Tone|Active Window)$/i.test((e.textContent || "").trim()));
  out.labels = labels.map(e => ({ ...g(e, ["font-size", "font-weight", "color", "letter-spacing", "text-transform"]), t: e.textContent }));
  // input: the workspace name field
  const input = main.querySelector("input");
  out.input = input ? { ...g(input, ["height", "box-shadow", "border-radius", "background-color", "padding", "border-width"]), placeholder: input.placeholder } : null;
  // selects (start/end)
  const triggers = [...main.querySelectorAll("button")].filter(vis).filter(e => e.getAttribute("role") === "combobox" || /combobox/i.test(e.getAttribute("aria-haspopup") || ""));
  out.selects = triggers.map(e => g(e, ["height", "width", "box-shadow", "border-radius", "padding", "font-size"]));
  // section cards
  const cards = [...main.querySelectorAll("*")].filter(vis).filter(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return cs.boxShadow !== "none" && !cs.boxShadow.includes("inset") && r.width > 400 && r.height > 100 && r.height < 400 && !e.closest("aside"); });
  out.cards = cards.slice(0, 3).map(e => g(e, ["padding", "box-shadow", "border-radius", "width", "height"]));
  // sub-headers (Active Window)
  const sub = [...main.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /^(Active Window|Working Hours|AI Assistant)$/i.test((e.textContent || "").trim()));
  out.subHeads = sub.map(e => ({ ...g(e, ["font-size", "font-weight", "color", "text-transform", "letter-spacing"]), t: e.textContent }));
  // Start/End labels
  const se = [...main.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && /^(Start|End)$/.test((e.textContent || "").trim()));
  out.startEnd = se.map(e => g(e, ["font-size", "font-weight", "color"]));
  // hints
  const hints = [...main.querySelectorAll("*")].filter(vis).filter(e => e.children.length === 0 && (e.textContent || "").match(/^(Name shown|How often|Tone)/i));
  out.hints = hints.map(e => ({ ...g(e, ["font-size", "font-weight", "color"]), t: (e.textContent || "").trim().slice(0, 20) }));
}
return JSON.stringify(out);

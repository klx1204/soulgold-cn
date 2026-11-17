// Adds pinyin search keys to the generated data and builds a global index.
import fs from "node:fs";
import path from "node:path";
import { pinyin } from "pinyin-pro";

const DATA = path.resolve("public/data");

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const write = (f, v) =>
  fs.writeFileSync(path.join(DATA, f), JSON.stringify(v), "utf8");

function py(text) {
  if (!text) return "";
  return pinyin(text, { toneType: "none", type: "array" }).join("").toLowerCase();
}
function pyi(text) {
  if (!text) return "";
  return pinyin(text, { pattern: "first", toneType: "none", type: "array" })
    .join("")
    .toLowerCase();
}
function keys(...parts) {
  const text = parts.filter(Boolean).join("");
  const full = py(text);
  const init = pyi(text);
  return { py: full, pyi: init };
}

function add(list, fn) {
  for (const row of list) Object.assign(row, fn(row));
  return list;
}

// ---------- species ----------
const species = add(read("species.json"), (r) => ({
  ...keys(r.name, r.nameEn.replace(/\s/g, "")),
  search: [r.name, r.nameEn, String(r.dex ?? ""), ...r.types].join(" "),
}));
write("species.json", species);

// ---------- moves ----------
const moves = add(read("moves.json"), (r) => ({
  ...keys(r.name, r.nameEn.replace(/\s/g, "")),
  search: [r.name, r.nameEn, r.type, r.category].join(" "),
}));
write("moves.json", moves);

// ---------- abilities ----------
const abilities = add(read("abilities.json"), (r) => ({
  ...keys(r.name, r.nameEn.replace(/\s/g, "")),
  search: [r.name, r.nameEn].join(" "),
}));
write("abilities.json", abilities);

// ---------- items ----------
const items = add(read("items.json"), (r) => ({
  ...keys(r.name, r.nameEn.replace(/\s/g, "")),
  search: [r.name, r.nameEn, r.pocket].join(" "),
}));
write("items.json", items);

// ---------- machines ----------
const machines = add(read("machines.json"), (r) => ({
  ...keys(r.name, r.label),
  search: [r.name, r.moveName, r.label, r.kind].join(" "),
}));
write("machines.json", machines);

// ---------- encounters ----------
const encounters = add(read("encounters.json"), (r) => ({
  ...keys(r.nameZh, r.name),
  search: [r.nameZh, r.name].join(" "),
}));
write("encounters.json", encounters);

// ---------- trainers ----------
const trainers = add(read("trainers.json"), (r) => ({
  ...keys(r.name),
  search: [r.name, r.difficulty, ...r.locations.map((l) => l.mapZh)].join(" "),
}));
write("trainers.json", trainers);

// ---------- guides ----------
const guides = add(read("guides.json"), (r) => ({
  ...keys(r.title),
  search: [r.title, r.summary, r.category].join(" "),
}));
write("guides.json", guides);

// ---------- global index ----------
const index = [];
const push = (type, list, url, label) => {
  for (const r of list) {
    index.push({
      t: type,
      s: url(r),
      n: label(r),
      e: r.nameEn ?? "",
      py: r.py ?? "",
      pyi: r.pyi ?? "",
    });
  }
};
push("宝可梦", species, (r) => `/pokedex/${r.slug}`, (r) => r.name);
push("招式", moves, (r) => `/moves/${r.slug}`, (r) => r.name);
push("特性", abilities, (r) => `/abilities/${r.slug}`, (r) => r.name);
push("道具", items, (r) => `/items/${r.slug}`, (r) => r.name);
push("技能机", machines, (r) => `/machines`, (r) => r.name);
push("遇敌", encounters, (r) => `/encounters/${r.map.toLowerCase()}`, (r) => r.nameZh);
push("训练家", trainers, (r) => `/trainers/${r.constant}`, (r) => r.name);
push("指南", guides, (r) => `/guides/${r.slug}`, (r) => r.title);

fs.writeFileSync(path.join(DATA, "search.json"), JSON.stringify(index), "utf8");
console.log(`search index: ${index.length} entries`);

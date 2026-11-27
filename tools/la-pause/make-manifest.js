// Builds public/la-pause/manifest.json (French text -> mp3 path) and tools/la-pause/clips.json (what to record).
// Run from the SayBon root:  node tools/la-pause/make-manifest.js
// Rule: any object with an "fr" key in vocab/*.json is a spoken clip. The FIRST occurrence of identical French text
// (order: hubs -> activities -> JSON order) owns the file; later identical text reuses it.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = process.cwd(), lp = path.join(root, "public", "la-pause");
if (!fs.existsSync(lp)) { console.error("Run this from the SayBon root (the folder that contains public)."); process.exit(1); }

function slug(s) {   // must match LP.slug in core.js
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
const audioPath = (folder, prefix, fr) => "/assets/audio/la-pause/" + folder + "/" + prefix + "_" + slug(fr) + ".mp3";

const sb = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(lp, "data.js"), "utf8"), sb);
const D = sb.window.LP_DATA, cfg = JSON.parse(fs.readFileSync(path.join(lp, "config.json"), "utf8"));
const clips = [], byPath = {}, manifest = {};
function add(p, text, kind) {
  if (byPath[p]) { if (byPath[p] !== text) throw new Error("File name clash: " + p + " for '" + text + "' and '" + byPath[p] + "'"); return; }
  byPath[p] = text; clips.push({ path: p, text, kind });
}
function walk(o, cb) {
  if (Array.isArray(o)) o.forEach(x => walk(x, cb));
  else if (o && typeof o === "object") { if (typeof o.fr === "string") cb(o.fr); Object.keys(o).forEach(k => { if (k !== "fr" && k !== "en") walk(o[k], cb); }); }
}
add(cfg.invite.audio, cfg.invite.spoken, "invitation");
D.hubs.forEach(h => {
  const hp = h.id.replace(/-/g, "_");
  add(audioPath(h.folder, hp + "_hub", h.fr), h.fr, "hub");
  h.activities.forEach(a => add(audioPath(h.folder, hp + "_" + a.id, a.fr), a.fr, "activity"));
  const f = path.join(lp, "vocab", h.id + ".json");
  if (!fs.existsSync(f)) { console.warn("No vocab file for hub " + h.id); return; }
  const J = JSON.parse(fs.readFileSync(f, "utf8"));
  h.activities.forEach(a => {
    const def = J.activities && J.activities[a.id]; if (!def) { console.warn("No vocab for " + h.id + "/" + a.id); return; }
    walk(def, fr => {
      if (manifest[fr]) return;
      const p = audioPath(h.folder, hp + "_" + a.id, fr); manifest[fr] = p; add(p, fr, "word");
    });
  });
});
fs.writeFileSync(path.join(lp, "manifest.json"), JSON.stringify({ voice: "ERYN", clips: manifest }, null, 1));
fs.writeFileSync(path.join(root, "tools", "la-pause", "clips.json"), JSON.stringify(clips, null, 1));
const words = clips.filter(c => c.kind === "word").length;
console.log("manifest.json: " + Object.keys(manifest).length + " words | clips.json: " + clips.length + " clips (" + words + " words + " + (clips.length - words) + " names/invitation)");

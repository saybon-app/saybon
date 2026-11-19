// SayBon teacher audio. Usage:
//   node make-audio.mjs --level a0-les-petits --lesson 1 --script lesson1.txt [--dry]
// Key: environment variable ELEVENLABS_API_KEY (never stored in the project).
import fs from "fs"; import path from "path"; import crypto from "crypto";
import { spawnSync } from "child_process";
let ffmpeg = "ffmpeg"; try { ffmpeg = (await import("ffmpeg-static")).default || "ffmpeg"; } catch {}
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(here, "config.json"), "utf8"));
const a = {}; for (let i = 2; i < process.argv.length; i++) { const k = process.argv[i]; if (k.startsWith("--")) { const n = process.argv[i + 1]; if (!n || n.startsWith("--")) a[k.slice(2)] = true; else { a[k.slice(2)] = n; i++; } } }
if (!a.script) { console.log("Need --script <file.txt>"); process.exit(1); }
const level = a.level || "default";
const voiceName = a.voice || cfg.voices[level] || cfg.voices.default;
const outName = a.name || `${level}-lesson${a.lesson || "x"}`;
const outDir = a.outdir ? path.resolve(a.outdir) : path.join(here, "out"), cache = path.join(here, "cache"), tmp = path.join(here, "cache", "tmp-" + outName);
for (const d of [outDir, cache, tmp]) fs.mkdirSync(d, { recursive: true });
const run = (args) => { const r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", ...args]); if (r.status) throw new Error("ffmpeg: " + r.stderr); };

// ---- parse: split on pause tags; everything else (emotion tags) goes to ElevenLabs untouched
export function parse(text) {
  const items = []; let buf = "", sil = 0;
  const flush = () => {
    const t = buf.trim(); buf = "";
    if (/\p{L}/u.test(t.replace(/\[[^\]]*\]/g, ""))) { if (sil) items.push({ sil }); sil = 0; items.push({ say: t.replace(/[ \t]*\n[ \t]*/g, " ").replace(/\s{2,}/g, " ") }); }
  };
  for (const part of text.split(/(\[(?:short pause|long pause|pause)\])/gi)) {
    const m = part.match(/^\[(short pause|long pause|pause)\]$/i);
    if (m) { flush(); sil += cfg.pauseSeconds[m[1].toLowerCase()]; } else buf += part;
  }
  flush(); return items;
}
const items = parse(fs.readFileSync(a.script, "utf8"));
for (const it of items) if (it.say && cfg.alwaysTag && !it.say.toLowerCase().includes(cfg.alwaysTag)) it.say = cfg.alwaysTag + " " + it.say;
// a silence right after the child's cue (a drilled word, or "you will say...") is the child's turn: make sure it is long enough
const CUE = /(bonjour|salut|au revoir)[\s?!.\u2026,]*$/i, CUE2 = /you will say[\s?!.\u2026,]*$/i;
for (let i = 1; i < items.length; i++) if (items[i].sil && items[i - 1].say) { const bare = items[i - 1].say.replace(/\[[^\]]*\]/g, "").trim(); if (CUE.test(bare) || CUE2.test(bare)) { items[i].child = true; items[i].sil = Math.max(items[i].sil, cfg.childGapSeconds || 2); } }
console.log(`${items.filter(i => i.say).length} spoken pieces, voice: ${a.dry ? "(dry run)" : voiceName}`);

const key = process.env.ELEVENLABS_API_KEY;
let voiceId;
async function getVoice() {
  const idf = path.join(cache, `voice-${voiceName}.txt`);
  if (fs.existsSync(idf)) return fs.readFileSync(idf, "utf8");
  const r = await fetch(`https://api.elevenlabs.io/v2/voices?search=${encodeURIComponent(voiceName)}&page_size=100`, { headers: { "xi-api-key": key } });
  if (!r.ok) throw new Error(`Voice lookup failed (${r.status}): ${await r.text()}`);
  const v = (await r.json()).voices.filter(x => x.name.toLowerCase().startsWith(voiceName.toLowerCase()));
  if (!v.length) throw new Error(`No voice named "${voiceName}" in your account. Add it to My Voices first.`);
  const id = (v.find(x => x.name.toLowerCase() === voiceName.toLowerCase()) || v[0]).voice_id; fs.writeFileSync(idf, id); return id;
}
async function speak(text) {
  const h = crypto.createHash("sha1").update([voiceName, cfg.model, cfg.stability, text].join("|")).digest("hex").slice(0, 16);
  const f = path.join(cache, h + (a.dry ? ".dry.mp3" : ".mp3"));
  if (fs.existsSync(f)) return f;
  if (a.dry) { const words = text.replace(/\[[^\]]*\]/g, "").split(/\s+/).filter(Boolean).length; run(["-f", "lavfi", "-i", `sine=frequency=440:duration=${Math.max(.4, words * .35)}`, "-ar", "44100", "-ac", "1", f]); return f; }
  voiceId ||= await getVoice();
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, { method: "POST", headers: { "xi-api-key": key, "Content-Type": "application/json" }, body: JSON.stringify({ text, model_id: cfg.model, voice_settings: { stability: cfg.stability } }) });
  if (!r.ok) throw new Error(`ElevenLabs error (${r.status}): ${await r.text()}`);
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); return f;
}
if (!a.dry && !key) { console.log("Set ELEVENLABS_API_KEY first (see instructions)."); process.exit(1); }

const dur = (f) => { const r = spawnSync(ffmpeg, ["-i", f]); const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(String(r.stderr)); return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) : 0; };
const parts = []; const gaps = []; let n = 0, cur = 0;
for (const it of items) {
  const w = path.join(tmp, String(n++).padStart(3, "0") + ".wav");
  if (it.say) { const f = await speak(it.say); run(["-i", f, "-ar", "44100", "-ac", "1", w]); cur += dur(w); process.stdout.write("."); }
  else { run(["-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(it.sil), w]); if (it.child) gaps.push([+(cur + 0.25).toFixed(2), +(cur + it.sil - 0.1).toFixed(2)]); cur += it.sil; }
  parts.push(w);
}
const list = path.join(tmp, "list.txt"); fs.writeFileSync(list, parts.map(p => `file '${p.replace(/\\/g, "/")}'`).join("\n"));
const out = path.join(outDir, outName + ".mp3");
run(["-f", "concat", "-safe", "0", "-i", list, "-codec:a", "libmp3lame", "-q:a", "3", out]);
fs.rmSync(tmp, { recursive: true, force: true });
if (gaps.length) { fs.writeFileSync(path.join(outDir, outName + ".json"), JSON.stringify({ dur: +cur.toFixed(2), gaps })); console.log(`\n${gaps.length} child turns marked`); }
console.log(`\nDone: ${out}`);

// Fits the background music to a recording: loud opening -> quiet bed stretched to the speech -> loud ending.
//  Intro:    node mix-intro.mjs --body body.mp3 --end end.mp3 --out intro.mp3
//  Dialogue: node mix-intro.mjs --body voice.mp3 --json voice.json --out dlg.mp3   (the song's own closing line ends it; the teacher does not say it)
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
let ffmpeg = "ffmpeg", ffprobe = "ffprobe";
try { const m = await import("ffmpeg-static"); if (m.default) ffmpeg = m.default; } catch {}
const a = {}; for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].slice(2)] = process.argv[i + 1];
const here = path.dirname(fileURLToPath(import.meta.url));
const music = a.music || path.join(here, "bg_music.mp3");
if (!a.body || !a.out) { console.log("Need --body and --out"); process.exit(1); }
const dur = f => { const r = spawnSync(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]); if (r.status === 0 && r.stdout.toString().trim()) return parseFloat(r.stdout.toString()); const q = spawnSync(ffmpeg, ["-i", f, "-f", "null", "-"]); const m = /time=(\d+):(\d+):([\d.]+)/g; let t, x; while ((x = m.exec(q.stderr.toString()))) t = +x[1] * 3600 + +x[2] * 60 + +x[3]; return t; };
const f = n => n.toFixed(2), V0 = 2.4, KEEP = 7.6;
const hasEnd = !!a.end, B = dur(a.body), GAP = 0.35, F = hasEnd ? dur(a.end) : 0;
const Te = hasEnd ? V0 + B + GAP : V0 + B + 0.8;
const Tt = hasEnd ? Math.max(4, Te - 0.5) : Math.max(4, V0 + B - 0.3), TOTAL = Tt + KEEP;
const run = args => { const r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", ...args]); if (r.status) throw new Error("ffmpeg: " + r.stderr.toString()); };
let voiceIn = [], voiceFilter;
if (hasEnd) {
  const pad = a.out + ".body.tmp.mp3"; run(["-i", a.body, "-af", `apad=pad_dur=${GAP}`, "-ar", "44100", "-ac", "1", pad]);
  voiceIn = ["-i", pad, "-i", a.end]; voiceFilter = `[0:a][1:a]concat=n=2:v=0:a=1[v0]`;
} else { voiceIn = ["-i", a.body]; voiceFilter = `[0:a]anull[v0]`; }
const mi = hasEnd ? 2 : 1;
const filt = [
  `[${mi}:a]atrim=0:3.2,afade=t=out:st=2.1:d=1.1,asetpts=PTS-STARTPTS[head]`,
  `[${mi}:a]atrim=3.2:29,asetpts=PTS-STARTPTS,aloop=loop=-1:size=2000000000,atrim=0:${f(Tt + 1.2)},afade=t=in:st=0:d=0.9,afade=t=out:st=${f(Tt + 0.4)}:d=0.8,adelay=2300|2300[bed]`,
  `[${mi}:a]atrim=29.4:37.0,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.5,afade=t=out:st=6.4:d=1.2,adelay=${Math.round(Tt * 1000)}|${Math.round(Tt * 1000)}[tail]`,
  voiceFilter, `[v0]adelay=${Math.round(V0 * 1000)}|${Math.round(V0 * 1000)}[voice]`,
  `[head][bed][tail][voice]amix=inputs=4:normalize=0:duration=longest,atrim=0:${f(TOTAL)}[out]`,
].join(";");
run([...voiceIn, "-i", music, "-filter_complex", filt, "-map", "[out]", "-ar", "44100", "-ac", "2", "-b:a", "128k", a.out]);
if (hasEnd) fs.unlinkSync(a.out + ".body.tmp.mp3");
if (a.json && fs.existsSync(a.json)) {
  const j = JSON.parse(fs.readFileSync(a.json, "utf8"));
  fs.writeFileSync(a.out.replace(/\.mp3$/i, ".json"), JSON.stringify({ dur: +f(TOTAL), gaps: (j.gaps || []).map(g => [+f(g[0] + V0), +f(g[1] + V0)]) }));
}
console.log(`${hasEnd ? "Intro" : "Dialogue"} made: ${a.out}  (speech ${f(B)}s, music fitted to ${f(TOTAL)}s)`);

// Builds an intro with the background music fitted to the speech:
//   loud opening -> quiet bed stretched to the speech length -> loud ending under the last line.
// node mix-intro.mjs --body body.mp3 --end end.mp3 --out intro.mp3 [--music bg_music.mp3]
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
let ffmpeg = "ffmpeg", ffprobe = "ffprobe";
try { const m = await import("ffmpeg-static"); if (m.default) ffmpeg = m.default; } catch {}
const a = {}; for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].slice(2)] = process.argv[i + 1];
const here = path.dirname(fileURLToPath(import.meta.url));
const music = a.music || path.join(here, "bg_music.mp3");
if (!a.body || !a.end || !a.out) { console.log("Need --body --end --out"); process.exit(1); }
const dur = f => { const r = spawnSync(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]); if (r.status !== 0) { const q = spawnSync(ffmpeg, ["-i", f, "-f", "null", "-"]); const m = /time=(\d+):(\d+):([\d.]+)/g; let t, x; while ((x = m.exec(q.stderr.toString()))) t = +x[1] * 3600 + +x[2] * 60 + +x[3]; return t; } return parseFloat(r.stdout.toString()); };
const B = dur(a.body), F = dur(a.end), V0 = 2.4, GAP = 0.35;
const Te = V0 + B + GAP, Tt = Math.max(4, Te - 0.5), TOTAL = Tt + 11.7;
const f = (n) => n.toFixed(2);
const filt = [
  `[2:a]atrim=0:3.2,afade=t=out:st=2.1:d=1.1,asetpts=PTS-STARTPTS[head]`,
  `[2:a]atrim=3.2:29,asetpts=PTS-STARTPTS,aloop=loop=-1:size=2000000000,atrim=0:${f(Tt + 1.2)},afade=t=in:st=0:d=0.9,afade=t=out:st=${f(Tt + 0.4)}:d=0.8,adelay=2300|2300[bed]`,
  `[2:a]atrim=29.4:41.2,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.5,adelay=${Math.round(Tt * 1000)}|${Math.round(Tt * 1000)}[tail]`,
  `[0:a][1:a]concat=n=2:v=0:a=1[v0]`,
  `[v0]adelay=${Math.round(V0 * 1000)}|${Math.round(V0 * 1000)}[voice]`,
  `[head][bed][tail][voice]amix=inputs=4:normalize=0:duration=longest,atrim=0:${f(TOTAL)}[out]`,
].join(";");
// body + a short silence is joined through concat: pad body with GAP of silence
const bodyPad = a.out + ".body.tmp.mp3";
let r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", "-i", a.body, "-af", `apad=pad_dur=${GAP}`, "-ar", "44100", "-ac", "1", bodyPad]); if (r.status) throw new Error(r.stderr.toString());
r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", "-i", bodyPad, "-i", a.end, "-i", music, "-filter_complex", filt, "-map", "[out]", "-ar", "44100", "-ac", "2", "-b:a", "128k", a.out]);
fs.unlinkSync(bodyPad);
if (r.status) throw new Error("ffmpeg: " + r.stderr.toString());
console.log(`Intro made: ${a.out}  (speech ${f(B)}s + ending ${f(F)}s, music fitted to ${f(TOTAL)}s)`);

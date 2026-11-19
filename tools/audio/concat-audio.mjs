// Joins audio files with a gap. Usage: node concat-audio.mjs <gapSeconds> <out.mp3> <in1.mp3> <in2.mp3> ...
import { spawnSync } from "child_process";
let ffmpeg = "ffmpeg"; try { ffmpeg = (await import("ffmpeg-static")).default || "ffmpeg"; } catch {}
const [gap, out, ...ins] = process.argv.slice(2), a = ["-y", "-loglevel", "error"];
ins.forEach(f => a.push("-i", f));
const parts = ins.map((_, i) => `[${i}:a]aresample=44100,aformat=channel_layouts=mono[a${i}]`), sil = `anullsrc=r=44100:cl=mono,atrim=0:${gap}[g]`;
let chain = [], lab = "";
ins.forEach((_, i) => { lab += `[a${i}]` + (i < ins.length - 1 ? "[g" + i + "]" : ""); });
const split = `[g]asplit=${Math.max(1, ins.length - 1)}` + Array.from({ length: Math.max(1, ins.length - 1) }, (_, i) => `[g${i}]`).join("");
a.push("-filter_complex", parts.join(";") + ";" + sil + ";" + (ins.length > 1 ? split + ";" : "") + lab + `concat=n=${ins.length * 2 - 1}:v=0:a=1[o]`, "-map", "[o]", "-codec:a", "libmp3lame", "-q:a", "3", out);
const r = spawnSync(ffmpeg, a); if (r.status) { console.log(String(r.stderr)); process.exit(1); }

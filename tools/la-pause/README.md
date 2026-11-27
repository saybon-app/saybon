# La Pause

A leisure world inside Talkletics. Four hubs, no scores, timers, penalties or speaking.

| Hub | Activities |
|---|---|
| Le Centre commercial | fashion, supermarket, salon, beauty (explore: click, see, hear) |
| Le Centre d'ingenierie | car, construction, bridges, robotics, inventions (build: pick a part, it flies into place) |
| La Maison et le Jardin | interior, garden, outdoor (build); housekeeping (explore) |
| Le Centre des jeux d'esprit | jigsaw, memory pairs, spell-the-word, what-comes-next |

## How it appears
`public/la-pause/invite.js` runs on every Talkletics place page. After 5 minutes of play and at least 6 items it offers
La Pause at a quiet gap between items, and again every 5 minutes (after "Maybe later" and after a visit).
All numbers are in `public/la-pause/config.json`. There is no permanent La Pause button on the map. To force the
invitation while testing, run `localStorage.lpForce = 1` in the browser console on a place page.

## Deploy
Put `Deploy-LaPause.ps1` and `la-pause-final.zip` in one folder, then in PowerShell:

    powershell -ExecutionPolicy Bypass -File .\Deploy-LaPause.ps1

It installs the files, rebuilds the manifest, makes the voices (asks for your ElevenLabs key, hidden, never stored),
refuses to continue if any clip is missing, then commits and pushes to main. `-NoPush` stops before the push.
If credits run out, top up and run it again: it only makes missing clips.

## Voice
ElevenLabs voice **ERYN**, found by name (pass `-VoiceId` to Make-LaPauseAudio.ps1 to override). Model `eleven_v4`
(`-Model` to change). There is no silent fallback to another voice or model: on any error it stops and says why.

## Content
- `public/la-pause/vocab/<hub>.json` holds the words. Any object with an `fr` key is a spoken clip.
- `public/la-pause/data.js` lists hubs and activities and the engine each uses.
- After editing words or data.js run `node tools/la-pause/make-manifest.js`, then the audio script.
- Identical French text shares one mp3 (first occurrence owns it). Files: `/assets/audio/la-pause/<hub>/<hub>_<activity>_<slug>.mp3`.
- Engines: `kit.js` (explore, build), `kit-games.js` (jigsaw, memory, words, pattern). Art is all SVG: `art.js` (objects), `scenes-*.js` (scenes).

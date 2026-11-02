// DELF listening audio: French neural text-to-speech through Azure Speech.
// POST /api/delf/tts  { text, level }  ->  audio/mpeg   (needs a signed-in Firebase user)
module.exports = function (app, ctx) {
  var admin = ctx.admin, express = ctx.express;
  var cache = new Map();            // text+voice settings -> Buffer (kept in memory)
  var CACHE_MAX = 300;
  var RATE = { a1: "-18%", a2: "-12%", b1: "-6%", b2: "0%", c1: "0%", c2: "0%" };

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

  function buildSsml(text, level, voice, noProsody, oneVoice){
    var rate = RATE[level] || "-10%";
    var F = "fr-FR-DeniseNeural", M = "fr-FR-HenriNeural";
    var voices = (voice === "m") ? [M, F] : [F, M];
    var turns = text.split(/(?:^|\s)[–—]\s+/).map(function(t){ return t.trim(); }).filter(Boolean);
    var wrap = function(t){ return noProsody ? esc(t) : '<prosody rate="' + rate + '">' + esc(t) + '</prosody>'; };
    var body;
    if (/(?:^|\s)[–—]\s/.test(text) && turns.length > 1) {
      body = turns.map(function(t, i){ return '<voice name="' + voices[oneVoice ? 0 : i % 2] + '">' + wrap(t) + '</voice>'; }).join(noProsody ? "" : '<break time="500ms"/>');
    } else {
      body = '<voice name="' + voices[0] + '">' + wrap(text) + '</voice>';
    }
    return '<speak version="1.0" xml:lang="fr-FR" xmlns="http://www.w3.org/2001/10/synthesis">' + body + '</speak>';
  }

  app.post("/api/delf/tts", express.json({ limit: "20kb" }), async function (req, res) {
    try {
      var h = req.headers.authorization || "";
      if (h.indexOf("Bearer ") !== 0) return res.status(401).json({ error: "authentication required" });
      try { await admin.auth().verifyIdToken(h.slice(7)); }
      catch (e) { return res.status(401).json({ error: "authentication required" }); }

      var text = String((req.body && req.body.text) || "").trim();
      var level = String((req.body && req.body.level) || "").toLowerCase();
      var voice = String((req.body && req.body.voice) || "f").toLowerCase() === "m" ? "m" : "f";
      if (!text || text.length > 1500) return res.status(400).json({ error: "text missing or too long" });

      var key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) return res.status(500).json({ error: "speech service is not configured" });

      var ck = level + "|" + voice + "|" + text;
      var hit = cache.get(ck);
      if (!hit) {
        // try the full request; if Azure rejects it (400), retry with simpler speech markup. Log Azure's real message.
        var variants = [buildSsml(text, level, voice), buildSsml(text, level, voice, true), buildSsml(text, level, voice, true, true),
          "<speak version='1.0' xml:lang='fr-FR'><voice xml:lang='fr-FR' xml:gender='" + (voice === 'm' ? 'Male' : 'Female') + "' name='" + (voice === 'm' ? 'fr-FR-HenriNeural' : 'fr-FR-DeniseNeural') + "'>" + esc(text.replace(/(^|\s)[–—]\s+/g, '$1')) + "</voice></speak>"];
        var r = null;
        for (var vi = 0; vi < variants.length; vi++) {
          r = await fetch("https://" + region + ".tts.speech.microsoft.com/cognitiveservices/v1", {
            method: "POST",
            headers: {
              "Ocp-Apim-Subscription-Key": key,
              "Content-Type": "application/ssml+xml",
              "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
              "User-Agent": "saybon-delf-tts"
            },
            body: variants[vi]
          });
          if (r.ok) break;
          var msg = ""; try { msg = (await r.text()).slice(0, 300); } catch (e) {}
          console.error("DELF TTS Azure error", r.status, "variant", vi, "region", region, msg);
          if (r.status !== 400) break;
        }
        if (!r.ok) return res.status(502).json({ error: "speech synthesis failed (" + r.status + ")" });
        hit = Buffer.from(await r.arrayBuffer());
        if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
        cache.set(ck, hit);
      }
      res.set({ "Content-Type": "audio/mpeg", "Content-Length": hit.length, "Cache-Control": "private, max-age=86400" });
      res.send(hit);
    } catch (err) {
      console.error("DELF TTS error", err);
      res.status(500).json({ error: "could not create audio" });
    }
  });
};

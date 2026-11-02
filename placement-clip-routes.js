// Entry placement test listening clips: French neural voices (Azure Speech), fixed set of clips.
// GET /api/placement/clip/:id  ->  audio/mpeg   (no login needed; only the clips below can be requested)
module.exports = function (app, ctx) {
  var RATE = { a0: "-22%", a1: "-18%", a2: "-12%", b1: "-6%", b2: "0%", c1: "0%" };
  var F = "fr-FR-DeniseNeural", M = "fr-FR-HenriNeural";
  // voice = first speaker; dialogues (lines starting with a dash) alternate between the two voices
  var CLIPS = {
    "a0-1": { voice: "f", text: "Bonjour ! Je m'appelle Marie. J'ai dix ans." },
    "a1-1": { voice: "m", text: "Bonjour, je m'appelle Paul. J'habite à Lyon, avec ma femme et mes deux enfants. Je travaille dans un hôpital." },
    "a1-2": { voice: "m", text: "– Je voudrais un café et un croissant, s'il vous plaît. – Voilà. Ça fait trois euros cinquante." },
    "a2-1": { voice: "f", text: "Demain, je vais à Bordeaux pour voir ma sœur. Mon train part à sept heures quarante et arrive à dix heures. Je prends un taxi, parce qu'elle habite loin de la gare." },
    "a2-2": { voice: "m", text: "– Allô, bonjour, je voudrais changer mon rendez-vous de mardi. – Mardi à quatorze heures ? Je peux vous proposer mercredi à seize heures. – Mercredi, c'est impossible, je travaille. – Alors jeudi matin, à neuf heures ? – Parfait, merci." },
    "a2-3": { voice: "f", text: "Ce week-end, il va pleuvoir dans le nord, mais dans le sud, il fera beau, avec vingt-cinq degrés. N'oubliez pas votre parapluie si vous restez à Lille !" },
    "b1-1": { voice: "m", text: "Depuis que j'habite en ville, je n'utilise plus ma voiture. Le métro est rapide et je gagne du temps. Le seul inconvénient, c'est le bruit, surtout le matin." },
    "b1-2": { voice: "m", text: "– Tu as vu l'offre d'emploi à Toulouse ? – Oui, mais je n'ai pas envie de déménager. – Pourtant, le salaire est bien meilleur. – C'est vrai, mais ma famille et mes amis sont ici. Je préfère rester." },
    "b1-3": { voice: "f", text: "Le musée sera exceptionnellement fermé lundi à cause de travaux. Les visiteurs qui ont déjà un billet pourront le garder et venir un autre jour avant la fin du mois." },
    "b2-1": { voice: "m", text: "Le télétravail a progressé, mais il divise. Certains salariés apprécient l'autonomie, alors que d'autres se plaignent d'isolement. Selon une enquête récente, la majorité souhaiterait un système mixte, avec deux ou trois jours au bureau." },
    "b2-2": { voice: "m", text: "– Pourquoi avoir quitté la grande entreprise ? – J'avais l'impression de ne plus apprendre. Même si la sécurité de l'emploi me rassurait, j'ai préféré créer ma propre société, quitte à gagner moins les premières années." },
    "b2-3": { voice: "f", text: "Le projet de nouvelle ligne de tramway suscite des réactions contrastées. Si les commerçants espèrent une hausse de la fréquentation, les riverains craignent des nuisances pendant les deux ans de travaux." },
    "c1-1": { voice: "m", text: "Loin de constituer une simple mode passagère, la sobriété numérique répond à une prise de conscience : chaque courriel, chaque vidéo en continu consomme de l'énergie. Reste à savoir si les usagers accepteront de modifier durablement leurs habitudes." },
    "c1-2": { voice: "f", text: "Bien que les résultats de l'étude soient encourageants, ses auteurs appellent à la prudence : l'échantillon était restreint et les effets observés pourraient disparaître à long terme. Une réplication à plus grande échelle s'impose." },
    "c1-3": { voice: "m", text: "– Certains jugent la réforme inéquitable. – Elle l'est, dans la mesure où elle pénalise d'abord les plus modestes, alors même qu'elle prétend les protéger. – Vous ne dites pas qu'elle est inutile, pourtant. – Non : le principe est juste, c'est son calendrier qui est précipité." }
  };
  var cache = new Map();

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function ssml(clip, level, noProsody, oneVoice){
    var rate = RATE[level] || "-10%";
    var voices = clip.voice === "m" ? [M, F] : [F, M];
    var turns = clip.text.split(/(?:^|\s)[–—]\s+/).map(function(t){ return t.trim(); }).filter(Boolean);
    var wrap = function(t){ return noProsody ? esc(t) : '<prosody rate="' + rate + '">' + esc(t) + '</prosody>'; };
    var body;
    if (/(?:^|\s)[–—]\s/.test(clip.text) && turns.length > 1) {
      body = turns.map(function(t, i){ return '<voice name="' + voices[oneVoice ? 0 : i % 2] + '">' + wrap(t) + '</voice>'; }).join(noProsody ? "" : '<break time="500ms"/>');
    } else {
      body = '<voice name="' + voices[0] + '">' + wrap(clip.text) + '</voice>';
    }
    return '<speak version="1.0" xml:lang="fr-FR" xmlns="http://www.w3.org/2001/10/synthesis">' + body + '</speak>';
  }

  app.get("/api/placement/clip/:id", async function (req, res) {
    try {
      var id = String(req.params.id || "").toLowerCase();
      var clip = Object.prototype.hasOwnProperty.call(CLIPS, id) ? CLIPS[id] : null;
      if (!clip) return res.status(404).json({ error: "unknown clip" });
      var key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
      if (!key || !region) return res.status(500).json({ error: "speech service is not configured" });
      var buf = cache.get(id);
      if (!buf) {
        var lvl = id.split("-")[0], r = null;
        var variants = [ssml(clip, lvl), ssml(clip, lvl, true), ssml(clip, lvl, true, true),
          "<speak version='1.0' xml:lang='fr-FR'><voice xml:lang='fr-FR' xml:gender='" + (clip.voice === 'm' ? 'Male' : 'Female') + "' name='" + (clip.voice === 'm' ? 'fr-FR-HenriNeural' : 'fr-FR-DeniseNeural') + "'>" + esc(clip.text.replace(/(^|\s)[–—]\s+/g, '$1')) + "</voice></speak>"];
        for (var vi = 0; vi < variants.length; vi++) {
          r = await fetch("https://" + region + ".tts.speech.microsoft.com/cognitiveservices/v1", {
            method: "POST",
            headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3", "User-Agent": "saybon-placement-clips" },
            body: variants[vi]
          });
          if (r.ok) break;
          var msg = ""; try { msg = (await r.text()).slice(0, 300); } catch (e) {}
          console.error("Placement clip Azure error", r.status, "variant", vi, "region", region, msg);
          if (r.status !== 400) break;
        }
        if (!r.ok) return res.status(502).json({ error: "speech synthesis failed (" + r.status + ")" });
        buf = Buffer.from(await r.arrayBuffer());
        cache.set(id, buf);
      }
      res.set({ "Content-Type": "audio/mpeg", "Content-Length": buf.length, "Cache-Control": "public, max-age=86400" });
      res.send(buf);
    } catch (err) {
      console.error("Placement clip error", err);
      res.status(500).json({ error: "could not create audio" });
    }
  });
};

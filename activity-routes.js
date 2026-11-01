// SayBon activity tracking: streaks, daily goal minutes, achievements.
// Mounted once from server.js: require("./activity-routes")(app, { admin, db, express })
module.exports = function mountActivity(app, deps) {
  const { admin, db, express } = deps;
  const TYPES = ["lesson", "game", "music", "exam"];
  const EVENTS = { lesson_complete: "lesson", game_complete: "game", exam_complete: "exam" };
  const GOALS = [5, 10, 15, 20, 30];
  const DEFAULT_GOAL = 10;
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const MAX_SEC_PER_CALL = 180;
  const MAX_SEC_PER_DAY = 5 * 3600;

  function dayNum(s) { return Math.round(Date.parse(s + "T00:00:00Z") / 86400000); }
  function dayStr(n) { return new Date(n * 86400000).toISOString().slice(0, 10); }
  function validDay(s) {
    if (typeof s !== "string" || !DAY_RE.test(s) || isNaN(Date.parse(s + "T00:00:00Z"))) return false;
    return Math.abs(dayNum(s) - Math.floor(Date.now() / 86400000)) <= 2;
  }
  async function uidFrom(req, res) {
    const h = req.headers.authorization || "";
    const t = h.indexOf("Bearer ") === 0 ? h.slice(7) : null;
    if (!t) { res.status(401).json({ error: "authentication required" }); return null; }
    try { return (await admin.auth().verifyIdToken(t)).uid; }
    catch (e) { res.status(401).json({ error: "authentication failed" }); return null; }
  }
  const sumRef = (uid) => db.collection("userActivity").doc(uid);
  const dayRef = (uid, d) => db.collection("userActivity").doc(uid).collection("days").doc(d);

  function emptySec() { return { lesson: 0, game: 0, music: 0, exam: 0 }; }
  function totalSec(sec) { return TYPES.reduce((a, k) => a + (sec[k] || 0), 0); }

  // ---------- LOG ----------
  app.post("/api/activity/log", express.json({ limit: "20kb" }), async (req, res) => {
    const uid = await uidFrom(req, res); if (!uid) return;
    try {
      const { day, type } = req.body || {};
      let seconds = Math.floor(Number(req.body && req.body.seconds) || 0);
      const event = req.body && req.body.event;
      if (!validDay(day)) return res.status(400).json({ error: "bad day" });
      if (!TYPES.includes(type)) return res.status(400).json({ error: "bad type" });
      if (event && !EVENTS[event]) return res.status(400).json({ error: "bad event" });
      seconds = Math.max(0, Math.min(MAX_SEC_PER_CALL, seconds));

      const out = await db.runTransaction(async (tx) => {
        const sRef = sumRef(uid), dRef = dayRef(uid, day);
        const [sSnap, dSnap] = await Promise.all([tx.get(sRef), tx.get(dRef)]);
        const s = sSnap.exists ? sSnap.data() : {};
        const d = dSnap.exists ? dSnap.data() : {};
        const goal = GOALS.includes(s.goalMinutes) ? s.goalMinutes : DEFAULT_GOAL;
        const sec = Object.assign(emptySec(), d.sec || {});
        const room = Math.max(0, MAX_SEC_PER_DAY - totalSec(sec));
        const add = Math.min(seconds, room);
        sec[type] += add;
        const comp = Object.assign({ lesson: 0, game: 0, exam: 0 }, d.completions || {});
        const totals = Object.assign(emptySec(), s.totals || {});
        totals[type] += add;
        const counts = Object.assign({ lesson_complete: 0, game_complete: 0, exam_complete: 0 }, s.counts || {});
        if (event) { comp[EVENTS[event]] += 1; counts[event] += 1; }
        const total = totalSec(sec);
        const goalMet = total >= goal * 60;
        const counted = goalMet || comp.lesson + comp.game + comp.exam > 0;
        let streak = s.streak || 0, best = s.bestStreak || 0, last = s.lastCountedDay || null;
        let goalDays = s.goalDays || 0;
        if (goalMet && !d.goalCounted) goalDays += 1;
        let streakGrew = false;
        if (counted && last !== day) {
          if (last && dayNum(day) - dayNum(last) === 1) streak += 1;
          else if (!last || dayNum(day) > dayNum(last)) streak = 1;
          // if day is earlier than last (clock skew) leave streak alone
          if (!last || dayNum(day) >= dayNum(last)) { last = day; streakGrew = true; }
          best = Math.max(best, streak);
        }
        tx.set(dRef, { sec, completions: comp, total, goalMet, goalCounted: goalMet || !!d.goalCounted, counted, day }, { merge: true });
        tx.set(sRef, { goalMinutes: goal, streak, bestStreak: best, lastCountedDay: last, totals, counts, goalDays, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        return { streak, goalMinutes: goal, todaySeconds: total, goalMet, streakGrew };
      });
      res.json(out);
    } catch (err) {
      console.error("ACTIVITY LOG ERROR:", err);
      res.status(500).json({ error: "could not log activity" });
    }
  });

  // ---------- SETTINGS ----------
  app.post("/api/activity/settings", express.json({ limit: "5kb" }), async (req, res) => {
    const uid = await uidFrom(req, res); if (!uid) return;
    try {
      const g = Number(req.body && req.body.goalMinutes);
      if (!GOALS.includes(g)) return res.status(400).json({ error: "goalMinutes must be one of " + GOALS.join(", ") });
      await sumRef(uid).set({ goalMinutes: g }, { merge: true });
      res.json({ success: true, goalMinutes: g });
    } catch (err) {
      console.error("ACTIVITY SETTINGS ERROR:", err);
      res.status(500).json({ error: "could not save settings" });
    }
  });

  // ---------- SUMMARY ----------
  function achievements(stats) {
    const m = (sec) => Math.floor(sec / 60);
    const list = [
      ["first_lesson", "🎯", "First Steps", "Complete your first lesson", stats.lessons, 1],
      ["five_lessons", "📘", "Dedicated Learner", "Complete 5 lessons", stats.lessons, 5],
      ["twentyfive_lessons", "📚", "Bookworm", "Complete 25 lessons", stats.lessons, 25],
      ["first_game", "🧩", "Game On", "Finish your first Talkletics mission", stats.games, 1],
      ["first_exam", "📝", "Exam Ready", "Finish a DELF mock exam", stats.exams, 1],
      ["music_30", "🎧", "Music Lover", "Listen for 30 minutes", m(stats.musicSec), 30],
      ["goal_1", "🎉", "Goal Getter", "Hit your daily goal", stats.goalDays, 1],
      ["goal_7", "🏅", "Goal Crusher", "Hit your daily goal 7 times", stats.goalDays, 7],
      ["streak_3", "🔥", "Streak Keeper", "3-day streak", stats.bestStreak, 3],
      ["streak_7", "⚡", "On Fire", "7-day streak", stats.bestStreak, 7],
      ["streak_30", "🌟", "Unstoppable", "30-day streak", stats.bestStreak, 30],
      ["minutes_100", "⏱️", "Century", "Practise for 100 minutes in total", m(stats.totalSec), 100]
    ];
    return list.map(([id, icon, title, sub, value, target]) => ({
      id, icon, title, sub, earned: value >= target, value: Math.min(value, target), target
    }));
  }

  app.get("/api/activity/summary", async (req, res) => {
    const uid = await uidFrom(req, res); if (!uid) return;
    try {
      const day = req.query.day;
      if (!validDay(day)) return res.status(400).json({ error: "bad day" });
      const dn = dayNum(day);
      const weekDays = []; for (let i = 6; i >= 0; i--) weekDays.push(dayStr(dn - i));
      const refs = weekDays.map((d) => dayRef(uid, d));
      const [sSnap, lpSnap, ...dSnaps] = await Promise.all([
        sumRef(uid).get(), db.collection("levelProgress").doc(uid).get(), ...refs.map((r) => r.get())
      ]);
      const s = sSnap.exists ? sSnap.data() : {};
      const goal = GOALS.includes(s.goalMinutes) ? s.goalMinutes : DEFAULT_GOAL;
      const week = weekDays.map((d, i) => {
        const x = dSnaps[i].exists ? dSnaps[i].data() : {};
        return { day: d, minutes: Math.round(((x.total || 0) / 60) * 10) / 10, counted: !!x.counted };
      });
      const todayDoc = dSnaps[6].exists ? dSnaps[6].data() : {};
      const todaySec = Object.assign(emptySec(), todayDoc.sec || {});
      let streak = s.streak || 0;
      const last = s.lastCountedDay;
      const alive = last && dn - dayNum(last) <= 1;
      const countedToday = last === day;
      if (!alive) streak = 0;
      const levels = {}; let lessons = 0;
      if (lpSnap.exists) {
        const lp = lpSnap.data();
        Object.keys(lp).forEach((k) => { const n = ((lp[k] && lp[k].completedLessons) || []).length; levels[k] = n; lessons += n; });
      }
      const totals = Object.assign(emptySec(), s.totals || {});
      const counts = s.counts || {};
      const stats = {
        lessons: Math.max(lessons, counts.lesson_complete || 0), games: counts.game_complete || 0,
        exams: counts.exam_complete || 0, musicSec: totals.music, totalSec: totalSec(totals),
        goalDays: s.goalDays || 0, bestStreak: Math.max(s.bestStreak || 0, streak)
      };
      res.json({
        streak, bestStreak: stats.bestStreak, countedToday,
        goalMinutes: goal,
        today: { seconds: totalSec(todaySec), bySeconds: todaySec, goalMet: totalSec(todaySec) >= goal * 60 },
        week, totalsSeconds: totals, levels, lessonsCompleted: lessons,
        achievements: achievements(stats)
      });
    } catch (err) {
      console.error("ACTIVITY SUMMARY ERROR:", err);
      res.status(500).json({ error: "could not load summary" });
    }
  });
};

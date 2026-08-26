function goLevels(){ window.location.href="/levels/"; }
function goTalkletics(){ window.location.href="/talkletics/"; }
function goMusic(){ window.location.href="/music/"; }
function goDelf(){ window.location.href="/delf/"; }
function goTranslation(){ window.location.href="/translation/"; }
function goChat(){ window.location.href="/chat/"; }
function goFeedback(){ window.location.href="/feedback/"; }
function goSupport(){ window.location.href="/support/"; }
function goHome(){ if(window.stopAppBgMusic){ window.stopAppBgMusic(); } window.location.href="/"; }

const level = sessionStorage.getItem("saybon_level");
document.querySelectorAll(".js-profile-level").forEach(el => el.textContent = level || "Level not set");

const streak = Number(localStorage.getItem("saybon_streak")) || 0;
document.querySelectorAll(".js-streak-num").forEach(el => el.textContent = streak);

const dailyMinutes = Number(localStorage.getItem("saybon_daily_minutes")) || 0;
const goalTarget = 30;
document.querySelectorAll(".js-goal-minutes").forEach(el => el.textContent = dailyMinutes);

const circumference = 2 * Math.PI * 42;
const pct = Math.min(dailyMinutes / goalTarget, 1);
document.querySelectorAll(".js-goal-ring-fill").forEach(ringFill => {
  ringFill.style.strokeDasharray = circumference;
  ringFill.style.strokeDashoffset = circumference * (1 - pct);
});

const goalCaptionText = dailyMinutes === 0
  ? "Start today's session"
  : dailyMinutes >= goalTarget
    ? "Goal reached! Keep it up"
    : "Keep going, you're doing great";
document.querySelectorAll(".js-goal-caption").forEach(el => el.textContent = goalCaptionText);


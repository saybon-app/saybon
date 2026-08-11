function goLevels(){ window.location.href="/levels/"; }
function goTalkletics(){ window.location.href="/talkletics/"; }
function goMusic(){ window.location.href="/music/"; }
function goDelf(){ window.location.href="/delf/"; }
function goTranslation(){ window.location.href="/translation/"; }
function goChat(){ window.location.href="/chat/"; }
function goFeedback(){ window.location.href="/feedback/"; }
function goSupport(){ window.location.href="/support/"; }
function goHome(){ window.location.href="/"; }

const level = sessionStorage.getItem("saybon_level");
document.getElementById("dashLevel").textContent = level || "Level not set";

const streak = Number(localStorage.getItem("saybon_streak")) || 0;
document.getElementById("streakNum").textContent = streak;

const dailyMinutes = Number(localStorage.getItem("saybon_daily_minutes")) || 0;
const goalTarget = 30;
document.getElementById("goalMinutes").textContent = dailyMinutes;

const ringFill = document.getElementById("goalRingFill");
const circumference = 2 * Math.PI * 42;
const pct = Math.min(dailyMinutes / goalTarget, 1);
ringFill.style.strokeDasharray = circumference;
ringFill.style.strokeDashoffset = circumference * (1 - pct);

const goalCaption = document.getElementById("goalCaption");
if (dailyMinutes === 0) {
  goalCaption.textContent = "Start today's session";
} else if (dailyMinutes >= goalTarget) {
  goalCaption.textContent = "Goal reached! Keep it up";
} else {
  goalCaption.textContent = "Keep going, you're doing great";
}
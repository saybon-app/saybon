const API_BASE = "https://saybonapp-server.onrender.com";
import { app, auth, db } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

var LEVEL_LABELS = { a1:"A1", a2:"A2", b1:"B1", b2:"B2", c1:"C1", prim:"DELF Prim", junior:"DELF Junior" };
var LEVEL_ORDER = ["a1","a2","b1","b2","c1"];

var root = document.getElementById("ddRoot");

function render(html){
  root.innerHTML = html;
}

function formatDate(ts){
  if(!ts || !ts.toDate) return "";
  var d = ts.toDate();
  return d.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
}

function renderLoginPrompt(){
  render(
    '<div class="dd-login-prompt">' +
    '<p class="dd-eyebrow">DELF Progress</p>' +
    '<p>Log in to see your placement history and track your progress.</p>' +
    '<button class="dd-cta-btn" onclick="location.href=\'/auth/login.html\'">Log In</button>' +
    '</div>'
  );
}

function renderEmpty(){
  render(
    '<p class="dd-eyebrow">DELF Progress</p>' +
    '<h1 class="dd-title">Your Dashboard</h1>' +
    '<div class="dd-empty-card">' +
    'You haven\'t taken a placement test yet. Once you do, your results will show up here, along with every test score from your prep as you go.' +
    '<button class="dd-cta-btn" onclick="location.href=\'/delf/placement.html\'">Start Your Placement</button>' +
    '</div>'
  );
}

function renderDashboard(attempts){
  var highestPassed = null;
  attempts.forEach(function(a){
    if(a.passed && LEVEL_ORDER.indexOf(a.level) !== -1){
      if(!highestPassed || LEVEL_ORDER.indexOf(a.level) > LEVEL_ORDER.indexOf(highestPassed)){
        highestPassed = a.level;
      }
    }
  });

  var summaryHtml = highestPassed
    ? '<div class="dd-summary-card">' +
      '<div class="dd-summary-label">Current Placement</div>' +
      '<div class="dd-summary-level">' + (LEVEL_LABELS[highestPassed] || highestPassed) + '</div>' +
      '<div class="dd-summary-sub">Based on your highest cleared placement level</div>' +
      '</div>'
    : '<div class="dd-summary-card">' +
      '<div class="dd-summary-label">Current Placement</div>' +
      '<div class="dd-summary-level">-</div>' +
      '<div class="dd-summary-sub">No level cleared yet - every attempt still counts toward your picture</div>' +
      '</div>';

  var listHtml = attempts.map(function(a){
    var pct = Math.round((a.pct || 0) * 100);
    var tagClass = a.passed ? "dd-tag-pass" : "dd-tag-fail";
    var tagText = a.passed ? "Cleared" : "Below Threshold";
    return '<div class="dd-attempt-card">' +
      '<div class="dd-attempt-left">' +
      '<div class="dd-attempt-level">' + (LEVEL_LABELS[a.level] || a.level) + ' Placement</div>' +
      '<div class="dd-attempt-date">' + formatDate(a.timestamp) + '</div>' +
      '</div>' +
      '<div class="dd-attempt-right">' +
      '<div class="dd-attempt-score">' + pct + '%</div>' +
      '<span class="dd-attempt-tag ' + tagClass + '">' + tagText + '</span>' +
      '</div>' +
      '</div>';
  }).join("");

  render(
    '<p class="dd-eyebrow">DELF Progress</p>' +
    '<h1 class="dd-title">Your Dashboard</h1>' +
    summaryHtml +
    '<div class="dd-section-label">Placement History</div>' +
    '<div class="dd-attempt-list">' + listHtml + '</div>' +
    '<div class="dd-section-label">Prep Test Scores</div>' +
    '<div class="dd-empty-card">Once you begin your prep, each of your ten test scores will appear here alongside your placement, so you can see your progress build over time.</div>' +
    '<button class="dd-cta-btn" onclick="location.href=\'/delf/placement.html\'">Take Another Placement</button>'
  );
}

onAuthStateChanged(auth, function(user){
  if(!user){
    renderLoginPrompt();
    return;
  }

  var attemptsRef = collection(db, "delfPlacements", user.uid, "attempts");
  var q = query(attemptsRef, orderBy("timestamp", "desc"));

  getDocs(q).then(function(snapshot){
    var attempts = [];
    snapshot.forEach(function(doc){
      attempts.push(doc.data());
    });

    if(attempts.length === 0){
      renderEmpty();
    } else {
      renderDashboard(attempts);
    }
  }).catch(function(err){
    console.error("Could not load DELF dashboard data:", err);
    render('<p class="dd-eyebrow">DELF Progress</p><div class="dd-empty-card">Could not load your progress right now. Please try again shortly.</div>');
  });
});


const API_BASE = "https://saybonapp-server.onrender.com";
import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

var LABEL = { a1:"A1", a2:"A2", b1:"B1", b2:"B2", c1:"C1", c2:"C2", prim:"DELF Prim", junior:"DELF Junior" };
var root = document.getElementById("ddRoot");
function render(h){ root.innerHTML = h; }
function fmt(ms){ return ms ? new Date(ms).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}) : ""; }
function pc(x){ return Math.round((x||0)*100); }
function bar(label, got, total, note){
  var p = total ? Math.round(got/total*100) : 0;
  return '<div class="dd-skill"><div class="dd-skill-top"><span>'+label+'</span><span>'+(total ? got+' / '+total+' &middot; '+p+'%' : (note||''))+'</span></div>' +
    '<div class="dd-skill-track"><div class="dd-skill-fill'+(p>=70?' dd-ok':'')+'" style="width:'+p+'%"></div>'+(total?'<i class="dd-pass" style="left:70%"></i>':'')+'</div></div>';
}

function loginPrompt(){
  render('<div class="dd-login-prompt"><p class="dd-eyebrow">DELF Progress</p><p>Log in and your DELF results will be waiting for you here.</p>' +
    '<button class="dd-cta-btn" onclick="location.href=\'/auth/login.html\'">Log In</button></div>');
}
function newLearner(){
  render('<p class="dd-eyebrow">DELF Progress</p><h1 class="dd-title">Your DELF Journey</h1>' +
    '<div class="dd-empty-card">Your results will live right here. Take the placement test, about ten minutes, and you will see your level, your scores skill by skill, and the next step.' +
    '<button class="dd-cta-btn" onclick="location.href=\'/delf/placement.html\'">Start Your Placement</button></div>' +
    '<a class="dd-link" href="/delf/?landing=1">What is SayBon DELF Prep?</a>');
}
function results(st){
  var best = st.attempts.filter(function(a){ return a.passed; })[0] || st.attempts[0];
  // latest attempt at the highest cleared level (or just the latest)
  var show = st.attempts.filter(function(a){ return a.level === st.highestCleared; })[0] || st.attempts[0];
  var placed = st.highestCleared ? LABEL[st.highestCleared] : "Starting out";
  var sub = st.highestCleared ? "You cleared " + LABEL[st.highestCleared] + " with " + pc(show.pct) + "%" : "No level cleared yet. That is a perfectly good place to begin.";
  var weak = null;
  if(show.listening && show.reading){
    var lp = show.listening.total ? show.listening.correct/show.listening.total : 1, rp = show.reading.total ? show.reading.correct/show.reading.total : 1;
    weak = lp < rp ? "listening" : rp < lp ? "reading" : null;
  }
  var tip = weak ? "Start with " + weak + ": it is your lowest score, so it will lift your overall result fastest." :
    "Your listening and reading are level. Mix both in your first mock and let the results guide you.";
  var skills = '';
  if(show.listening) skills += bar("Listening", show.listening.correct, show.listening.total);
  if(show.reading) skills += bar("Reading", show.reading.correct, show.reading.total);
  skills += bar("Writing", 0, 0, show.writing === "submitted" ? "Submitted, feedback coming" : "Not attempted yet");
  skills += bar("Speaking", 0, 0, show.speaking === "recorded" ? "Recorded, feedback coming" : "Not attempted yet");
  var out = '<p class="dd-eyebrow">DELF Progress</p><h1 class="dd-title">Your DELF Journey</h1>' +
    '<div class="dd-summary-card"><div class="dd-summary-label">Placed at</div><div class="dd-summary-level">' + placed + '</div><div class="dd-summary-sub">' + sub + '</div></div>' +
    '<div class="dd-section-label">Your scores, skill by skill</div><div class="dd-card-plain">' + skills +
    '<p class="dd-note">The line marks the 70% placement mark for listening and reading. Writing and speaking are reviewed separately.</p>' +
    '<p class="dd-tip"><b>First focus:</b> ' + tip + '</p></div>';

  if(st.state === "enrolled"){
    out += '<div class="dd-section-label">Pick up where you left off</div><div class="dd-cta-card"><div class="dd-cta-title">Continue your preparation</div>' +
      '<div class="dd-cta-sub">' + (st.mocks.length ? "Your next mock exam is ready when you are." : "Your first mock exam is waiting. Take it when you feel ready.") + '</div>' +
      '<button class="dd-cta-btn" onclick="location.href=\'/delf/tout-public/\'">Continue</button></div>';
    out += '<div class="dd-section-label">Mock exam scores</div>';
    if(st.mocks.length){
      out += '<div class="dd-attempt-list">' + st.mocks.slice(0,6).map(function(m){
        var t = Math.round(m.total || 0);
        return '<div class="dd-attempt-card"><div class="dd-attempt-left"><div class="dd-attempt-level">Mock exam</div><div class="dd-attempt-date">' + fmt(m.at) + '</div></div>' +
          '<div class="dd-attempt-right"><div class="dd-attempt-score">' + t + '/100</div><span class="dd-attempt-tag ' + (m.passed ? 'dd-tag-pass' : 'dd-tag-fail') + '">' + (m.passed ? 'Pass' : 'Keep going') + '</span></div></div>';
      }).join("") + '</div>';
    } else {
      out += '<div class="dd-empty-card">Your first mock score will appear here, right beside your placement, so you can watch yourself improve.</div>';
    }
  } else {
    out += '<div class="dd-section-label">Your path to the DELF</div><div class="dd-cta-card"><div class="dd-cta-title">You placed at ' + placed + '. Next stop: DELF ' + LABEL[st.targetExam] + '</div>' +
      '<div class="dd-cta-sub">Ten full mock exams, scored the way the real DELF is scored. <span id="ddPrice"></span></div>' +
      '<button class="dd-cta-btn" onclick="location.href=\'/delf/payment.html?exam=' + st.targetExam + '\'">Start DELF ' + LABEL[st.targetExam] + ' Prep</button>' +
      '<a class="dd-link" href="/delf/tout-public/">Choose a different level</a></div>';
    fetch(API_BASE + "/api/getDelfPrice?exam=" + encodeURIComponent(st.targetExam)).then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      var el = document.getElementById("ddPrice"); if(el && d && d.priceDisplay) el.textContent = "One payment of " + d.priceDisplay + ".";
    }).catch(function(){});
  }
  out += '<div class="dd-section-label">Placement history</div><div class="dd-attempt-list">' + st.attempts.map(function(a){
    return '<div class="dd-attempt-card"><div class="dd-attempt-left"><div class="dd-attempt-level">' + (LABEL[a.level]||a.level) + ' Placement</div><div class="dd-attempt-date">' + fmt(a.at) + '</div></div>' +
      '<div class="dd-attempt-right"><div class="dd-attempt-score">' + pc(a.pct) + '%</div><span class="dd-attempt-tag ' + (a.passed ? 'dd-tag-pass' : 'dd-tag-fail') + '">' + (a.passed ? 'Cleared' : 'Room to grow') + '</span></div></div>';
  }).join("") + '</div>' +
  '<a class="dd-link" href="/delf/placement.html">Retake placement</a> <span class="dd-sep">&middot;</span> <a class="dd-link" href="/delf/?landing=1">About DELF Prep</a>';
  render(out);
}

onAuthStateChanged(auth, function(user){
  if(!user){ loginPrompt(); return; }
  user.getIdToken().then(function(t){
    return fetch(API_BASE + "/api/delf/state", { headers: { Authorization: "Bearer " + t } });
  }).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(st){
    if(st.state === "new" && !st.attempts.length) newLearner(); else if(!st.attempts.length) {
      // enrolled without a placement: still show the continue card
      st.attempts = []; render('<p class="dd-eyebrow">DELF Progress</p><h1 class="dd-title">Your DELF Journey</h1><div class="dd-cta-card"><div class="dd-cta-title">Continue your preparation</div><div class="dd-cta-sub">Your mock exams are ready when you are.</div><button class="dd-cta-btn" onclick="location.href=\'/delf/tout-public/\'">Continue</button></div><a class="dd-link" href="/delf/placement.html">Take the placement test</a>');
    } else results(st);
  }).catch(function(err){
    console.error("DELF state:", err);
    render('<p class="dd-eyebrow">DELF Progress</p><div class="dd-empty-card">We are warming things up. Give it a moment and refresh, and your results will be right here.</div>');
  });
});

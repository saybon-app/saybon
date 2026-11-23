const API_BASE = "https://saybonapp-server.onrender.com";
import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

var LABEL = { a1:"A1", a2:"A2", b1:"B1", b2:"B2", c1:"C1", c2:"C2", prim:"DELF Prim", junior:"DELF Junior" };
var root = document.getElementById("dxRoot");
var gid = 0;
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
function fmt(ms){ return ms ? new Date(ms).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}) : ""; }
function pc(x){ return Math.round((x || 0) * 100); }

function nameOf(user){
  if(user.displayName) return user.displayName;
  var e = user.email || "";
  var base = e.split("@")[0].replace(/[._\-+0-9]+/g, " ").trim();
  if(!base) return "Learner";
  return base.split(" ").map(function(w){ return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ");
}

// one clean ring for the placement result
function ring(pct, size, stroke, inner, sub){
  var r = (size - stroke) / 2, C = 2 * Math.PI * r;
  var off = C * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return '<div class="dx-ring" style="width:' + size + 'px;height:' + size + 'px">' +
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
    '<circle class="dx-bg" cx="' + size/2 + '" cy="' + size/2 + '" r="' + r + '" stroke-width="' + stroke + '"/>' +
    '<circle class="dx-fg" cx="' + size/2 + '" cy="' + size/2 + '" r="' + r + '" stroke-width="' + stroke + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" data-off="' + off + '"/>' +
    '</svg><div class="dx-ring-mid"><div class="dx-ring-num">' + inner + '</div>' + (sub ? '<div class="dx-ring-sub">' + sub + '</div>' : '') + '</div></div>';
}
function animateRings(){
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    var els = root.querySelectorAll(".dx-fg");
    for(var i = 0; i < els.length; i++){ els[i].style.strokeDashoffset = els[i].getAttribute("data-off"); }
    var fills = root.querySelectorAll(".dx-fill");
    for(var j = 0; j < fills.length; j++){ fills[j].style.width = fills[j].getAttribute("data-w") + "%"; }
  }); });
}

// progress line chart: placement baseline, then each mock exam
function chart(points){
  if(points.length < 2){
    return '<p class="dx-chart-empty">Your baseline is set. Take your first mock exam and your progress line starts here.</p>';
  }
  var W = 600, H = 210, L = 34, R = 34, T = 18, B = 34, iw = W - L - R, ih = H - T - B;
  var x = function(i){ return L + iw * i / (points.length - 1); };
  var y = function(v){ return T + ih * (1 - v / 100); };
  var grid = "";
  [0, 50, 100].forEach(function(g){
    grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="rgba(255,255,255,' + (g === 50 ? '.18' : '.06') + ')"' + (g === 50 ? ' stroke-dasharray="4 5"' : '') + '/>' +
      '<text x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + '</text>';
  });
  var line = points.map(function(p, i){ return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1); }).join(" ");
  var dots = points.map(function(p, i){
    return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="4.5" fill="#d9b36c"/>' +
      '<text class="dx-pt-l" x="' + x(i).toFixed(1) + '" y="' + (y(p.v) - 11).toFixed(1) + '" text-anchor="middle">' + Math.round(p.v) + '</text>' +
      '<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(p.label) + '</text>';
  }).join("");
  return '<svg class="dx-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Your scores over time">' + grid +
    '<path d="' + line + '" fill="none" stroke="#d9b36c" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' + dots + '</svg>' +
    '<p class="dx-chart-empty" style="margin-top:8px">The dashed line is the DELF pass mark, 50 out of 100.</p>';
}

function profile(user){
  return '<div class="dx-head"><div class="dx-eyebrow">DELF Dashboard</div><div class="dx-name">' + esc(nameOf(user)) + '</div><div class="dx-email">' + esc(user.email || "") + '</div></div>';
}

function placementCard(st){
  if(!st.attempts || !st.attempts.length){
    return '<div class="dx-card"><div class="dx-label">Your placement</div><p class="dx-empty">No placement result yet. It takes about ten minutes, and your level and scores will appear here.</p></div>';
  }
  var show = st.attempts.filter(function(a){ return a.level === st.highestCleared; })[0] || st.attempts[0];
  var placed = st.highestCleared ? LABEL[st.highestCleared] : "A1";
  var title = st.highestCleared ? "You are placed at " + placed : "You are starting at A1";
  var sub = st.highestCleared ? "You cleared " + placed + " with " + pc(show.pct) + "%. This is your baseline, and every mock exam score lands beside it." :
    "No level cleared yet, which is a perfectly good place to begin.";
  return '<div class="dx-card"><div class="dx-label">Your placement</div><div class="dx-place">' +
    ring(pc(show.pct), 120, 7, st.highestCleared ? placed : "A1", pc(show.pct) + "%") +
    '<div class="dx-place-txt"><h2>' + esc(title) + '</h2><p>' + esc(sub) + '</p><div class="dx-date">' + esc(fmt(show.at)) + '</div></div></div></div>';
}

// marking that is still "pending" long after the test was never started (older tests): call it not marked
function effStatus(a, key){
  var s = a[key];
  if(s === "pending" && a.at && (Date.now() - a.at) > 4 * 60 * 1000) return "ungraded";
  return s;
}

function bar(name, pct, valText, note){
  return '<div><div class="dx-bar-top"><span>' + name + '</span><span><span class="dx-val">' + valText + '</span>' + (note ? ' &middot; ' + note : '') + '</span></div>' +
    '<div class="dx-track"><div class="dx-fill" data-w="' + (pct || 0) + '"></div></div></div>';
}

function skillsCard(st){
  if(!st.attempts || !st.attempts.length) return '<div class="dx-card"><div class="dx-label">Skill by skill</div><p class="dx-empty">Your listening, reading, writing and speaking scores will show here after your placement.</p></div>';
  var show = st.attempts.filter(function(a){ return a.level === st.highestCleared; })[0] || st.attempts[0];
  var lp = show.listening && show.listening.total ? Math.round(show.listening.correct / show.listening.total * 100) : null;
  var rp = show.reading && show.reading.total ? Math.round(show.reading.correct / show.reading.total * 100) : null;
  var ws = effStatus(show, "writing"), ss = effStatus(show, "speaking");
  function open(status, score, name){
    if(status === "graded" && score != null) return bar(name, score, score + "%", "marked");
    var note = status === "pending" ? "marking now" : status === "no_speech" ? "no speech heard" : status === "ungraded" ? "not marked" : "not tried";
    return bar(name, 0, "-", note);
  }
  var h = '<div class="dx-card"><div class="dx-label">Skill by skill</div><div class="dx-bars">' +
    bar("Listening", lp, lp == null ? "-" : lp + "%", "") + bar("Reading", rp, rp == null ? "-" : rp + "%", "") +
    open(ws, show.writingScore, "Writing") + open(ss, show.speakingScore, "Speaking") + '</div>';
  var focus = (lp != null && rp != null && lp !== rp) ? "<b>First focus:</b> " + (lp < rp ? "listening" : "reading") + " is your lowest score, so it will lift your overall result fastest." :
    "<b>First focus:</b> your listening and reading are level, so mix both in your first mock exam.";
  h += '<p class="dx-note">' + focus + '</p>';
  if(show.writingFeedback) h += '<p class="dx-fbk"><b>Writing:</b> ' + esc(show.writingFeedback) + '</p>';
  if(show.speakingFeedback) h += '<p class="dx-fbk"><b>Speaking:</b> ' + esc(show.speakingFeedback) + '</p>';
  return h + '</div>';
}

function mocksCard(st){
  var list = (st.mocks || []).slice().reverse();
  var done = Math.min(list.length, 10), cells = "";
  for(var i = 0; i < 10; i++){
    var m = list[i];
    if(m){ var t = Math.round(m.total || 0); cells += '<div class="dx-mock dx-done' + (t >= 50 ? ' dx-pass' : '') + '"><b>' + t + '</b><span>Mock ' + (i + 1) + '</span></div>'; }
    else cells += '<div class="dx-mock"><b>-</b><span>Mock ' + (i + 1) + '</span></div>';
  }
  var msg = done ? "You have completed <b>" + done + " of 10</b> mock exams, scored the way the real DELF is scored." : "Ten full mock exams, scored the way the real DELF is scored. Your results will appear here one by one.";
  return '<div class="dx-card dx-wide"><div class="dx-label">Mock exams</div><p class="dx-mock-line">' + msg + '</p><div class="dx-mocks">' + cells + '</div></div>';
}

function ctaCard(st){
  if(st.state === "enrolled"){
    return '<div class="dx-card dx-wide dx-cta"><div><h3>Continue Your Preparation</h3><p>' +
      (st.mocks && st.mocks.length ? "Your next mock exam is ready when you are." : "Your first mock exam is waiting. Take it when you feel ready.") +
      '</p></div><button class="dx-btn" onclick="location.href=\'/delf/tout-public/\'">Continue</button></div>';
  }
  if(!st.attempts || !st.attempts.length){
    return '<div class="dx-card dx-wide dx-cta"><div><h3>Start with your placement</h3><p>About ten minutes. You will see your level and your scores right here.</p></div>' +
      '<button class="dx-btn" onclick="location.href=\'/delf/placement.html\'">Start Your Placement</button></div>';
  }
  return '<div class="dx-card dx-wide dx-cta"><div><h3>Begin Your Preparation</h3><p>You placed at ' + (st.highestCleared ? LABEL[st.highestCleared] : "A1") + '. Next stop: DELF ' + LABEL[st.targetExam] +
    '. Forty structured lessons and ten full mock exams, all tracked here. <span id="dxPrice"></span></p></div>' +
    '<button class="dx-btn" onclick="location.href=\'/delf/payment.html?exam=' + encodeURIComponent(st.targetExam) + '\'">Begin Your Preparation</button></div>';
}

var pollsLeft = 8;
function hasPending(st){ return (st.attempts || []).slice(0, 2).some(function(a){ return effStatus(a, "writing") === "pending" || effStatus(a, "speaking") === "pending"; }); }

function paint(user, st){
  try{ if(st && (st.state !== "new" || (st.attempts && st.attempts.length))){ localStorage.setItem("saybon_delf_returning","1"); } }catch(e){}
  if(st.state === "new" && (!st.attempts || !st.attempts.length)){ location.replace("/delf/?landing=1"); return; }
  var pts = [];
  if(st.attempts && st.attempts.length){
    var base = st.attempts.filter(function(a){ return a.level === st.highestCleared; })[0] || st.attempts[0];
    pts.push({ v: pc(base.pct), label: "Placement", kind: "base" });
  }
  (st.mocks || []).slice().reverse().forEach(function(m, i){ pts.push({ v: Math.round(m.total || 0), label: "Mock " + (i + 1), kind: "mock" }); });

  var out = profile(user) + '<div class="dx-grid">' + placementCard(st) + skillsCard(st) + ctaCard(st) +
    '<div class="dx-card dx-wide"><div class="dx-label">Your progress</div>' + chart(pts) + '</div>' + mocksCard(st) + '</div>';
  root.innerHTML = out;
  animateRings();
  if(hasPending(st) && pollsLeft-- > 0){ setTimeout(function(){ refresh(user); }, 8000); }
  if(st.state !== "enrolled" && st.attempts && st.attempts.length && st.targetExam){
    fetch(API_BASE + "/api/delf/prices").then(function(r){ return r.ok ? r.json() : null; }).then(function(d){ var it = d && (d.items || []).filter(function(i){ return i.exam === st.targetExam; })[0];
      var el = document.getElementById("dxPrice"); if(el && it) el.textContent = "One payment of $" + it.usd + (it.ghs ? " (about GH\u20B5" + it.ghs + ")" : "") + ".";
    }).catch(function(){});
  }
}

function anonPrompt(){
  root.innerHTML = '<div class="dx-card"><div class="dx-label">DELF Dashboard</div><p class="dx-empty">You are not logged in to your SayBon account on this device, so we cannot show your results. Log in and your dashboard will be waiting.</p><br><button class="dx-btn" id="dxRelog">Log In</button></div>';
  document.getElementById("dxRelog").onclick = function(){ signOut(auth).catch(function(){}).then(function(){ location.href = "/auth/login.html"; }); };
}
function loginPrompt(){
  root.innerHTML = '<div class="dx-card"><div class="dx-label">DELF Dashboard</div><p class="dx-empty">Log in and your DELF dashboard will be waiting for you here.</p><br><button class="dx-btn" onclick="location.href=\'/auth/login.html\'">Log In</button></div>';
}
function warming(code){
  root.innerHTML = '<div class="dx-card"><div class="dx-label">DELF Dashboard</div><p class="dx-empty">We are warming things up. Give it a moment and refresh, and your results will be right here.' + (code ? ' <small>(Error: ' + esc(code) + ')</small>' : '') + '</p></div>';
}

// the server may be waking up (free hosting), so try a few times before giving up
function getState(token, tries){
  return fetch(API_BASE + "/api/delf/state", { headers: { Authorization: "Bearer " + token } }).then(function(r){
    if(r.ok) return r.json();
    if(tries > 1 && (r.status >= 500 || r.status === 404 || r.status === 429)){
      return new Promise(function(res){ setTimeout(res, 6000); }).then(function(){ return getState(token, tries - 1); });
    }
    var e = new Error(String(r.status)); e.code = r.status; throw e;
  }, function(err){
    if(tries > 1) return new Promise(function(res){ setTimeout(res, 6000); }).then(function(){ return getState(token, tries - 1); });
    throw err;
  });
}

function refresh(user){
  return user.getIdToken().then(function(t){ return getState(t, 9); }).then(function(st){
    st.attempts = st.attempts || []; st.mocks = st.mocks || [];
    paint(user, st);
  });
}

onAuthStateChanged(auth, function(user){
  if(!user){ loginPrompt(); return; }
  if(user.isAnonymous && !user.email){ anonPrompt(); return; }
  refresh(user).catch(function(err){
    console.error("DELF state:", err);
    warming(err && err.code);
  });
});

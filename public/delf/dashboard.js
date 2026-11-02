const API_BASE = "https://saybonapp-server.onrender.com";
import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

// circular graph: pct 0-100, colours c1->c2, inner = HTML in the centre
function ring(pct, size, stroke, c1, c2, inner, sub){
  var id = "dxg" + (++gid), r = (size - stroke) / 2, C = 2 * Math.PI * r;
  var off = C * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return '<div class="dx-ring" style="width:' + size + 'px;height:' + size + 'px">' +
    '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
    '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
    '<circle class="dx-bg" cx="' + size/2 + '" cy="' + size/2 + '" r="' + r + '" stroke-width="' + stroke + '"/>' +
    '<circle class="dx-fg" cx="' + size/2 + '" cy="' + size/2 + '" r="' + r + '" stroke-width="' + stroke + '" stroke="url(#' + id + ')" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '" data-off="' + off + '"/>' +
    '</svg><div class="dx-ring-mid"><div class="dx-ring-num">' + inner + '</div>' + (sub ? '<div class="dx-ring-sub">' + sub + '</div>' : '') + '</div></div>';
}
function animateRings(){
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    var els = root.querySelectorAll(".dx-fg");
    for(var i = 0; i < els.length; i++){ els[i].style.strokeDashoffset = els[i].getAttribute("data-off"); }
  }); });
}

// progress line chart: placement baseline, then each mock exam
function chart(points){
  if(points.length < 2){
    return '<div class="dx-chart-empty">Your baseline is set. Take your first mock exam and your progress line starts here.</div>';
  }
  var W = 600, H = 230, L = 38, R = 18, T = 20, B = 40, iw = W - L - R, ih = H - T - B;
  var x = function(i){ return L + (points.length === 1 ? iw / 2 : iw * i / (points.length - 1)); };
  var y = function(v){ return T + ih * (1 - v / 100); };
  var grid = "";
  [0, 25, 50, 75, 100].forEach(function(g){
    grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(g) + '" y2="' + y(g) + '" stroke="rgba(255,255,255,' + (g === 50 ? '.0' : '.07') + ')"/>' +
      '<text x="' + (L - 8) + '" y="' + (y(g) + 4) + '" text-anchor="end">' + g + '</text>';
  });
  var pass = '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(50) + '" y2="' + y(50) + '" stroke="#f6c978" stroke-width="1.4" stroke-dasharray="5 5" opacity=".7"/>' +
    '<text x="' + (W - R) + '" y="' + (y(50) - 6) + '" text-anchor="end" style="fill:#f6c978">DELF pass mark 50</text>';
  var line = points.map(function(p, i){ return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1); }).join(" ");
  var area = line + " L" + x(points.length - 1).toFixed(1) + " " + y(0) + " L" + x(0).toFixed(1) + " " + y(0) + " Z";
  var dots = points.map(function(p, i){
    var col = p.kind === "base" ? "#f6c978" : (p.v >= 50 ? "#22d3b6" : "#ff6f91");
    return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="6.5" fill="#0a0e1c" stroke="' + col + '" stroke-width="3"/>' +
      '<text class="dx-pt-l" x="' + x(i).toFixed(1) + '" y="' + (y(p.v) - 13).toFixed(1) + '" text-anchor="middle">' + Math.round(p.v) + '</text>' +
      '<text x="' + x(i).toFixed(1) + '" y="' + (H - 14) + '" text-anchor="middle">' + esc(p.label) + '</text>';
  }).join("");
  return '<svg class="dx-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Your scores over time">' +
    '<defs><linearGradient id="dxArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b6cff" stop-opacity=".45"/><stop offset="1" stop-color="#8b6cff" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="dxLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6c978"/><stop offset=".5" stop-color="#8b6cff"/><stop offset="1" stop-color="#22d3b6"/></linearGradient></defs>' +
    grid + pass + '<path d="' + area + '" fill="url(#dxArea)"/><path d="' + line + '" fill="none" stroke="url(#dxLine)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' + dots + '</svg>' +
    '<div class="dx-legend"><span><i style="background:#f6c978"></i>Placement baseline</span><span><i style="background:#22d3b6"></i>Mock exam, passed</span><span><i style="background:#ff6f91"></i>Mock exam, keep going</span></div>';
}

function profile(user){
  var nm = nameOf(user);
  return '<div class="dx-profile"><div class="dx-avatar">' + esc(nm.charAt(0).toUpperCase()) + '</div>' +
    '<div class="dx-who"><div class="dx-eyebrow">DELF Dashboard</div><div class="dx-name">' + esc(nm) + '</div><div class="dx-email">' + esc(user.email || "") + '</div></div>' +
    '<div class="dx-badge">DELF PREP</div></div>';
}

function placementCard(st){
  if(!st.attempts || !st.attempts.length){
    return '<div class="dx-card"><div class="dx-label">Your placement</div><p class="dx-empty">No placement result yet. It takes about ten minutes, and your level and scores will appear here.</p></div>';
  }
  var show = st.attempts.filter(function(a){ return a.level === st.highestCleared; })[0] || st.attempts[0];
  var placed = st.highestCleared ? LABEL[st.highestCleared] : "A1";
  var title = st.highestCleared ? "You are placed at " + placed : "You are starting at A1";
  var sub = st.highestCleared ? "You cleared " + placed + " with " + pc(show.pct) + "%. This is your baseline, and every mock exam score lands beside it." :
    "No level cleared yet, which is a perfectly good place to begin. Your mock exams will show how far you climb.";
  return '<div class="dx-card"><div class="dx-label">Your placement</div><div class="dx-place">' +
    ring(pc(show.pct), 132, 12, "#f6c978", "#ff6f91", st.highestCleared ? placed : "A1", pc(show.pct) + "%") +
    '<div class="dx-place-txt"><h2>' + esc(title) + '</h2><p>' + esc(sub) + '</p><div class="dx-date">' + esc(fmt(show.at)) + '</div></div></div></div>';
}

function skillsCard(st){
  if(!st.attempts || !st.attempts.length) return '<div class="dx-card"><div class="dx-label">Skill by skill</div><p class="dx-empty">Listening, reading, writing and speaking will show here as circles after your placement.</p></div>';
  var show = st.attempts.filter(function(a){ return a.level === st.highestCleared; })[0] || st.attempts[0];
  var lp = show.listening && show.listening.total ? Math.round(show.listening.correct / show.listening.total * 100) : null;
  var rp = show.reading && show.reading.total ? Math.round(show.reading.correct / show.reading.total * 100) : null;
  function openSkill(status, score, name, c1, c2){
    var done = status === "graded" && score != null;
    var pct = done ? score : 0;
    var inner = done ? score + "%" : (status === "pending" ? "..." : "-");
    var note = done ? "Marked" : status === "pending" ? "Marking now" : status === "no_speech" ? "No speech heard" : status === "ungraded" ? "Not marked" : "Not tried";
    return '<div class="dx-skill">' + ring(pct, 74, 8, c1, c2, inner) + '<div class="dx-skill-name">' + name + '</div><div class="dx-skill-note">' + note + '</div></div>';
  }
  var h = '<div class="dx-card"><div class="dx-label">Skill by skill</div><div class="dx-skills">';
  h += '<div class="dx-skill">' + ring(lp || 0, 74, 8, "#4cc0ff", "#8b6cff", lp == null ? "-" : lp + "%") + '<div class="dx-skill-name">Listening</div></div>';
  h += '<div class="dx-skill">' + ring(rp || 0, 74, 8, "#8b6cff", "#ff6f91", rp == null ? "-" : rp + "%") + '<div class="dx-skill-name">Reading</div></div>';
  h += openSkill(show.writing, show.writingScore, "Writing", "#22d3b6", "#4cc0ff");
  h += openSkill(show.speaking, show.speakingScore, "Speaking", "#f6c978", "#ff6f91");
  h += '</div>';
  var tip = (lp != null && rp != null && lp !== rp) ? "<b>First focus:</b> " + (lp < rp ? "listening" : "reading") + " is your lowest score, so it will lift your overall result fastest." :
    "<b>First focus:</b> your listening and reading are level, so mix both in your first mock exam.";
  h += '<div class="dx-tip">' + tip + '</div>';
  if(show.writingFeedback) h += '<div class="dx-tip dx-fb"><b>Your writing:</b> ' + esc(show.writingFeedback) + '</div>';
  if(show.speakingFeedback) h += '<div class="dx-tip dx-fb"><b>Your speaking:</b> ' + esc(show.speakingFeedback) + '</div>';
  h += '</div>';
  return h;
}

function mocksCard(st){
  var list = (st.mocks || []).slice().reverse();          // oldest first
  var done = Math.min(list.length, 10);
  var slots = "";
  for(var i = 0; i < 10; i++){
    var m = list[i];
    if(m){
      var t = Math.round(m.total || 0), ok = t >= 50;
      slots += '<div class="dx-mock">' + ring(t, 54, 6, ok ? "#22d3b6" : "#ff6f91", ok ? "#4cc0ff" : "#f6c978", t) + '<span>Mock ' + (i + 1) + '</span></div>';
    } else {
      slots += '<div class="dx-mock dx-todo">' + ring(0, 54, 6, "#fff", "#fff", "-") + '<span>Mock ' + (i + 1) + '</span></div>';
    }
  }
  var msg = done ? "You have completed <b>" + done + " of 10</b> mock exams. Each one is scored the way the real DELF is scored." : "Ten full mock exams, scored the way the real DELF is scored. Your results will appear here one by one.";
  return '<div class="dx-card"><div class="dx-label">Mock exams</div><div class="dx-mock-head">' +
    ring(done * 10, 84, 9, "#22d3b6", "#8b6cff", done + "/10") + '<p>' + msg + '</p></div><div class="dx-mocks">' + slots + '</div></div>';
}

function ctaCard(st){
  if(st.state === "enrolled"){
    return '<div class="dx-card dx-wide dx-cta"><div><h3>Continue Your Preparation</h3><p>' +
      (st.mocks && st.mocks.length ? "Your next mock exam is ready when you are." : "Your first mock exam is waiting. Take it when you feel ready.") +
      '</p></div><button class="dx-btn" onclick="location.href=\'/delf/tout-public/\'">Continue Your Preparation</button></div>';
  }
  if(!st.attempts || !st.attempts.length){
    return '<div class="dx-card dx-wide dx-cta"><div><h3>Start with your placement</h3><p>About ten minutes. You will see your level, your scores skill by skill, and your next step right here.</p></div>' +
      '<button class="dx-btn" onclick="location.href=\'/delf/placement.html\'">Start Your Placement</button></div>';
  }
  return '<div class="dx-card dx-wide dx-cta"><div><h3>Begin Your Preparation</h3><p>You placed at ' + (st.highestCleared ? LABEL[st.highestCleared] : "A1") + '. Next stop: DELF ' + LABEL[st.targetExam] +
    '. Forty structured lessons and ten full mock exams, all tracked on this dashboard. <span id="dxPrice"></span></p></div>' +
    '<button class="dx-btn" onclick="location.href=\'/delf/payment.html?exam=' + encodeURIComponent(st.targetExam) + '\'">Begin Your Preparation</button></div>';
}

var pollsLeft = 8;
function hasPending(st){ return (st.attempts || []).slice(0, 2).some(function(a){ return a.writing === "pending" || a.speaking === "pending"; }); }

function paint(user, st){
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
    fetch(API_BASE + "/api/getDelfPrice?exam=" + encodeURIComponent(st.targetExam)).then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      var el = document.getElementById("dxPrice"); if(el && d && d.priceDisplay) el.textContent = "One payment of " + d.priceDisplay + ".";
    }).catch(function(){});
  }
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
  refresh(user).catch(function(err){
    console.error("DELF state:", err);
    warming(err && err.code);
  });
});

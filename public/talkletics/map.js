(function(){

  var API_BASE = "https://saybonapp-server.onrender.com";

  var ROW_HEIGHT = 150;
  var TOP_PADDING = 90;
  var BOTTOM_PADDING = 90;
  var RUNOFF = 160;

  var X_DESKTOP = { left: 60, right: 340, center: 200 };
  var X_MOBILE  = { left: 140, right: 260, center: 200 };

  function slugify(name){
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function buildLayout(locations){

    var n = locations.length;
    var containerHeight = TOP_PADDING + BOTTOM_PADDING + Math.max(0, n - 1) * ROW_HEIGHT;

    var nodesEl = document.getElementById("tkmNodes");
    nodesEl.style.height = containerHeight + "px";

    var points = [];

    for(var i = 0; i < n; i++){
      var top = TOP_PADDING + i * ROW_HEIGHT;
      var side;
      if(i === 0){
        side = "center";
      } else {
        side = (i % 2 === 1) ? "left" : "right";
      }
      points.push({ top: top, side: side, loc: locations[i] });
    }

    renderNodes(points);
    renderPath(points, containerHeight);

  }

  function renderNodes(points){

    var nodesEl = document.getElementById("tkmNodes");
    nodesEl.innerHTML = "";

    points.forEach(function(p, tkmIndex){

      var loc = p.loc;

      var btn = document.createElement("button");
      btn.className = "tkm-node " + (loc.unlocked ? "tkm-node-unlocked" : "tkm-node-locked");
      btn.setAttribute("data-side", p.side);
      btn.setAttribute("data-location-id", loc.id);
      btn.style.top = p.top + "px";
      if(!loc.unlocked){
        btn.tabIndex = -1;
      }

      var badge = document.createElement("span");
      badge.className = "tkm-node-badge";
      badge.textContent = String(loc.order).padStart(2, "0");

      var img = document.createElement("img");
      img.className = "tkm-node-img";
      img.src = loc.imageUrl;
      img.alt = loc.name;

      btn.appendChild(badge);
      btn.appendChild(img);

      if(loc.unlocked){
        btn.addEventListener("click", function(){
          window.location.href = slugify(loc.name) + ".html";
        });
      }

      nodesEl.appendChild(btn);

      setTimeout(function(){ btn.classList.add("tkm-node-visible"); }, tkmIndex * 90);

    });

  }

  function pathD(points, xmap){

    if(points.length === 0) return "";

    var firstX = xmap[points[0].side];
    var entryY = points[0].top - RUNOFF;
    var entryMid = points[0].top - RUNOFF / 2;

    var d = "M" + firstX + "," + entryY;
    d += " C" + firstX + "," + entryMid + " " + firstX + "," + entryMid + " " + firstX + "," + points[0].top;

    for(var i = 1; i < points.length; i++){
      var prev = points[i-1];
      var cur = points[i];
      var x0 = xmap[prev.side];
      var y0 = prev.top;
      var x1 = xmap[cur.side];
      var y1 = cur.top;
      var midY = (y0 + y1) / 2;
      d += " C" + x0 + "," + midY + " " + x1 + "," + midY + " " + x1 + "," + y1;
    }

    var last = points[points.length - 1];
    var lastX = xmap[last.side];
    var tailY = last.top + (RUNOFF * 0.5);
    var tailMid = last.top + (RUNOFF * 0.25);

    d += " C" + lastX + "," + tailMid + " " + lastX + "," + tailMid + " " + lastX + "," + tailY;

    return d;

  }

  function renderPath(points, containerHeight){

    var minY = -RUNOFF;
    var vbHeight = containerHeight + RUNOFF + (RUNOFF * 0.5);
    var viewBox = "0 " + minY + " 400 " + vbHeight;

    document.getElementById("tkmPathDesktop").setAttribute("viewBox", viewBox);
    document.getElementById("tkmPathMobile").setAttribute("viewBox", viewBox);
    document.getElementById("tkmPathDesktop").style.height = vbHeight + "px";
    document.getElementById("tkmPathMobile").style.height = vbHeight + "px";

    var dDesktop = pathD(points, X_DESKTOP);
    var dMobile = pathD(points, X_MOBILE);

    document.getElementById("tkmPathBgDesktop").setAttribute("d", dDesktop);
    document.getElementById("tkmPathLineDesktop").setAttribute("d", dDesktop);
    document.getElementById("tkmPathBgMobile").setAttribute("d", dMobile);
    document.getElementById("tkmPathLineMobile").setAttribute("d", dMobile);

  }

  async function loadLocations(){

    var nodesEl = document.getElementById("tkmNodes");

    try{

      var res = await fetch(API_BASE + "/api/locations");
      var locations = await res.json();

      if(!locations.length){
        nodesEl.innerHTML = "<p style='text-align:center;color:#0d2a4d;font-weight:700;padding:40px;'>No locations yet. Check back soon!</p>";
        return;
      }

      buildLayout(locations);

    }catch(err){
      console.error(err);
      nodesEl.innerHTML = "<p style='text-align:center;color:#0d2a4d;font-weight:700;padding:40px;'>Could not load the map. Please try again.</p>";
    }

  }

  loadLocations();

})();

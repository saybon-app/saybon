const level =
  sessionStorage.getItem("saybon_level") || "Absolute Beginner";

const levelText = document.getElementById("levelText");
levelText.textContent = level;

function buildWreath(){
  const svg = document.getElementById("wreathSvg");

  const defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
  const grad = document.createElementNS("http://www.w3.org/2000/svg","linearGradient");
  grad.setAttribute("id","leafGradient");
  grad.setAttribute("x1","0%");
  grad.setAttribute("y1","0%");
  grad.setAttribute("x2","100%");
  grad.setAttribute("y2","100%");

  const stops = [
    { offset:"0%", color:"#ffe9a8" },
    { offset:"55%", color:"#f0b429" },
    { offset:"100%", color:"#a8690a" }
  ];

  stops.forEach(s => {
    const stop = document.createElementNS("http://www.w3.org/2000/svg","stop");
    stop.setAttribute("offset", s.offset);
    stop.setAttribute("stop-color", s.color);
    grad.appendChild(stop);
  });

  defs.appendChild(grad);
  svg.appendChild(defs);

  const leafCount = 7;
  const radius = 105;

  [-1, 1].forEach(side => {
    for (let i = 0; i < leafCount; i++) {
      const t = i / (leafCount - 1);
      const angleDeg = 100 + t * 85;
      const angle = side * angleDeg;

      const leaf = document.createElementNS("http://www.w3.org/2000/svg","ellipse");
      leaf.setAttribute("cx", 0);
      leaf.setAttribute("cy", 0);
      leaf.setAttribute("rx", 11);
      leaf.setAttribute("ry", 22);
      leaf.setAttribute("class", "wreath-leaf");
      leaf.setAttribute("transform", "rotate(" + angle + ") translate(0," + (-radius) + ")");

      svg.appendChild(leaf);
    }
  });
}

buildWreath();

document.getElementById("startJourney").onclick = () => {
  sessionStorage.setItem("saybon_next", "/auth/login.html");
  window.location.href = "/loader.html";
};

document.getElementById("backHome").onclick = () => {
  window.location.href = "/";
};
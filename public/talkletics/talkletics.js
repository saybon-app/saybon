(function(){
  var bubble = document.getElementById("tkSpeechBubble");
  var greetingEl = document.getElementById("tkGreetText");
  var ctaEl = document.getElementById("tkTypeText");
  var startBtn = document.getElementById("tkStartBtn");

  startBtn.addEventListener("click", function(){
    window.location.href = "map.html";
  });

  var pairs = [
    { greeting: "Bonjour !", cta: "Click on START and Let's go." },
    { greeting: "Salut !", cta: "Let's begin this adventure together! Ready?" },
    { greeting: "Bonjour !", cta: "Fun and French Awaits ya! Allons-y." },
    { greeting: "Coucou !", cta: "What a way to pick up French! Go on..." },
    { greeting: "Bonjour !", cta: "The Adventure is here! Let's begin." },
    { greeting: "Allo !", cta: "Time to play, or learn, or both." },
    { greeting: "Bonjour !", cta: "Off we go. Dive in." },
    { greeting: "Tchao !", cta: "Are we beginning or what?" }
  ];
  var pairIndex = 0;

  var holdAfterReveal = 10000;
  var rollAwayDuration = 500;
  var pauseBeforeNext = 3000;

  function rollAway(){
    bubble.classList.remove("tk-bubble-unroll");
    bubble.classList.add("tk-bubble-rollaway");
    setTimeout(function(){
      bubble.classList.remove("tk-bubble-rollaway");
      pairIndex = (pairIndex + 1) % pairs.length;
      setTimeout(cycle, pauseBeforeNext);
    }, rollAwayDuration);
  }

  function cycle(){
    greetingEl.textContent = pairs[pairIndex].greeting;
    ctaEl.textContent = pairs[pairIndex].cta;
    bubble.classList.add("tk-bubble-unroll");
    setTimeout(rollAway, holdAfterReveal);
  }

  setTimeout(cycle, 1000);
})();
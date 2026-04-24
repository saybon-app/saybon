(function(){
  "use strict";

  function go(path){
    window.location.href = path;
  }

  document.addEventListener("DOMContentLoaded", function(){
    const homeSelectors = [
      "#homeBtn",
      "#backHomeBtn",
      ".home-btn",
      "[data-home]"
    ];

    homeSelectors.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        el.addEventListener("click", function(e){
          e.preventDefault();
          go("/");
        });
      });
    });

    const signupSelectors = [
      "#signupBtn",
      "#registerBtn",
      "#createAccountBtn",
      ".signup-btn",
      "[data-signup]"
    ];

    signupSelectors.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        el.addEventListener("click", function(e){
          const href = el.getAttribute("href");
          if(!href || href === "#" || href.trim() === ""){
            e.preventDefault();
            go("/signup.html");
          }
        });
      });
    });

    const forgotSelectors = [
      "#forgotPasswordBtn",
      "#forgotBtn",
      ".forgot-password",
      "[data-forgot-password]"
    ];

    forgotSelectors.forEach(function(selector){
      document.querySelectorAll(selector).forEach(function(el){
        el.addEventListener("click", function(e){
          const href = el.getAttribute("href");
          if(!href || href === "#" || href.trim() === ""){
            e.preventDefault();
            go("/forgot-password.html");
          }
        });
      });
    });

    document.querySelectorAll("button").forEach(function(btn){
      if(!btn.getAttribute("type")){
        const form = btn.closest("form");
        btn.setAttribute("type", form ? "submit" : "button");
      }
    });
  });
})();

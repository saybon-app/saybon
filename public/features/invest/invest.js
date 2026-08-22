document.addEventListener("DOMContentLoaded", function(){
  var forms = ["angelForm", "seedForm", "strategicForm"];

  forms.forEach(function(id){
    var form = document.getElementById(id);
    if(!form) return;

    form.addEventListener("submit", function(e){
      e.preventDefault();

      if (window.showGlobalLoader) {
        window.showGlobalLoader();
      }

      setTimeout(function(){
        window.location.href = "/support/index.html";
      }, 1800);
    });
  });
});
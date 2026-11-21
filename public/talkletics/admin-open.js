/* Talkletics: the SayBon admin account opens every place, the same way the lessons are opened for it.
   Reads the signed-in Firebase user that the browser already holds; nothing is sent anywhere. */
(function(){
  var ADMIN="saybon.fr@gmail.com";
  function fromLocal(){
    try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);
      if(k&&k.indexOf("firebase:authUser:")===0){var u=JSON.parse(localStorage.getItem(k)||"null");if(u&&u.email)return String(u.email).toLowerCase();}}}catch(e){}
    return "";
  }
  function fromIDB(){
    return new Promise(function(res){
      try{
        var rq=indexedDB.open("firebaseLocalStorageDb");
        rq.onerror=function(){res("");};
        rq.onsuccess=function(){
          try{
            var db=rq.result;if(!db.objectStoreNames.contains("firebaseLocalStorage")){db.close();return res("");}
            var g=db.transaction("firebaseLocalStorage","readonly").objectStore("firebaseLocalStorage").getAll();
            g.onsuccess=function(){var out="";(g.result||[]).forEach(function(r){var v=r&&r.value;if(r&&String(r.fbase_key).indexOf("firebase:authUser:")===0&&v&&v.email)out=String(v.email).toLowerCase();});db.close();res(out);};
            g.onerror=function(){db.close();res("");};
          }catch(e){res("");}
        };
      }catch(e){res("");}
    });
  }
  window.tkIsAdmin=function(){
    var l=fromLocal();if(l)return Promise.resolve(l===ADMIN);
    return fromIDB().then(function(e){return e===ADMIN;});
  };
})();

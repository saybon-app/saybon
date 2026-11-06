(function(){
  function IMG(){return (window.matchMedia&&matchMedia('(max-width:700px)').matches)?'/assets/images/levels-cinema-m-':'/assets/images/levels-cinema-';}
  var FB=['linear-gradient(160deg,#3a2f22,#14110c)','linear-gradient(160deg,#10203a,#070b14)','linear-gradient(160deg,#2a3340,#0c0f14)','linear-gradient(160deg,#5a2f20,#1c0e08)','linear-gradient(160deg,#17362a,#07110c)'];
  var ICON={
    A0:'<path d="M12 21v-8"/><path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6z"/><path d="M12 16c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
    A1:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    A2:'<path d="M3 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H3z"/><path d="M21 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z"/>',
    B1:'<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-5.5A8 8 0 1 1 21 12z"/>',
    B2:'<path d="M20 4c-8 0-14 5-14 13"/><path d="M20 4c0 8-5 13-13 13"/><path d="M6 20l5-5"/>',
    C1:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'};
  var QUIP={A0:'Every master began here.',A1:'Your first real words.',A2:'Now you are talking.',B1:'Say what you really mean.',B2:'Start thinking in French.',C1:'Speak like you belong.'};
  var tiles=[].slice.call(document.querySelectorAll('.level-tile'));
  var L=[document.createElement('div'),document.createElement('div')],cur=1;L.forEach(function(x){x.className='cin-bg';});function isM(){return window.matchMedia&&matchMedia('(max-width:700px)').matches;}
  var vig=document.createElement('div');vig.className='cin-vig';
  var dip=document.createElement('div');dip.className='cin-dip on';
  document.body.insertBefore(L[1],document.body.firstChild);document.body.insertBefore(L[0],document.body.firstChild);document.body.appendChild(vig);document.body.appendChild(dip);
  tiles.forEach(function(t){
    var lab=t.querySelector('.lv-tile-label'),sub=t.querySelector('.lv-tile-sub');
    t._lab=lab.textContent.trim();t._sub=sub.textContent.trim();t._q=QUIP[t._lab]||'';
    t.setAttribute('aria-label',t._lab+', '+t._sub);
    var ic=document.createElement('span');ic.className='cin-ic';ic.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(ICON[t._lab]||'')+'</svg>';
    t.insertBefore(ic,t.firstChild);
    var q=document.createElement('span');q.className='cin-q';t.appendChild(q);t._el={lab:lab,sub:sub,q:q};
  });
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G=0;
  function after(g,ms,fn){setTimeout(function(){if(g===G)fn();},ms);}
  function typeInto(g,el,text,speed,done){
    var i=0;el.textContent='';el.classList.add('typing');
    (function step(){ if(g!==G)return; i++;el.textContent=text.slice(0,i);
      if(i<text.length)setTimeout(step,speed);else{el.classList.remove('typing');if(done)done();} })();
  }
  function fillAll(){tiles.forEach(function(t){t._el.lab.textContent=t._lab;t._el.sub.textContent=t._sub;t._el.q.textContent=t._q;t._el.q.classList.add('show');});}
  function setScene(n){
    var k=n%5;document.body.setAttribute('data-scene',String(k+1));
    var nxt=L[1-cur],old=L[cur];
    nxt.style.transition='none';nxt.style.opacity='0';nxt.className='cin-bg';void nxt.offsetWidth;
    nxt.style.backgroundImage='url("'+IMG()+(k+1)+'.jpg"),'+FB[k];
    nxt.className='cin-bg k'+(n%3+1);nxt.style.zIndex='-2';old.style.zIndex='-3';
    if(isM()){void nxt.offsetWidth;nxt.style.transition='opacity 2.8s ease';nxt.style.opacity='1';setTimeout(function(){old.style.transition='none';old.style.opacity='0';},3000);}
    else{nxt.style.opacity='1';old.style.transition='none';old.style.opacity='0';}
    cur=1-cur;
  }
  function run(n){
    var g=++G;var M=isM();setScene(n);
    tiles.forEach(function(t){t.classList.remove('in','out');t.classList.add('pre');t.style.transitionDelay='';t._el.lab.textContent='';t._el.sub.textContent='';t._el.q.textContent=t._q;t._el.q.classList.remove('show');});
    if(reduce){tiles.forEach(function(t){t.classList.remove('pre');});fillAll();dip.classList.remove('on');return;}
    after(g,200,function(){dip.classList.remove('on');});
    tiles.forEach(function(t,i){
      after(g,(M?1400:2300)+i*280,function(){
        t.classList.remove('pre');t.classList.add('in');
        after(g,900,function(){
          typeInto(g,t._el.lab,t._lab,170,function(){
            after(g,250,function(){
              typeInto(g,t._el.sub,t._sub,70,function(){ t._el.q.classList.add('show'); });
            });
          });
        });
      });
    });
    after(g,15500,function(){tiles.forEach(function(t,i){t.style.transitionDelay=(i*130)+'ms';t.classList.remove('in');t.classList.add('out');});});
    if(M){after(g,17300,function(){run(n+1);});}
    else{after(g,17000,function(){dip.classList.add('on');});after(g,18700,function(){run(n+1);});}
  }
  var sub=document.querySelector('.lv-subtitle');
  function fit(){ if(!sub)return; sub.style.fontSize=''; if(!isM())return; var s=13; sub.style.fontSize=s+'px'; while(sub.scrollWidth>sub.clientWidth&&s>8){s-=.25;sub.style.fontSize=s+'px';} }
  fit();window.addEventListener('resize',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  run(0);
})();

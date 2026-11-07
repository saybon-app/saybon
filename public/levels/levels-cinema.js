(function(){
  function IMG(){return (window.matchMedia&&matchMedia('(max-width:700px)').matches)?'/assets/images/levels-cinema-m-':'/assets/images/levels-cinema-';}
  var FB=['linear-gradient(160deg,#3a2f22,#14110c)','linear-gradient(160deg,#10203a,#070b14)','linear-gradient(160deg,#2a3340,#0c0f14)','linear-gradient(160deg,#5a2f20,#1c0e08)','linear-gradient(160deg,#17362a,#07110c)'];
  var ICON={
    A0:'<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8L2 22"/><path d="M17.5 15H9"/>',
    A1:'<circle cx="12" cy="12" r="9.5"/><path d="M8 14s1.5 2.2 4 2.2 4-2.2 4-2.2"/><path d="M9 9.2h.01M15 9.2h.01"/>',
    A2:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
    B1:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/><path d="M17 4v3M15.5 5.5h3"/>',
    B2:'<path d="M5 22V3"/><path d="M5 4h13l-2.5 4.5L18 13H5"/>',
    C1:'<g transform="rotate(-35 12 12)"><rect x="1.5" y="8.8" width="21" height="6.4" rx="3.2"/><path d="M7 9l1.4 6M11.6 9l1.4 6M16.2 9l1.4 6"/></g>'};
  var QUIP={A0:['French, ','P','easier than you think.'],A1:['Look at you getting ','P','Frenchier.'],A2:['Real flow, real ','P','convos, Frenchier by the day.'],B1:['Thinking in French, ','P','dreaming in French.'],B2:['Fully ','P','Frenched up, no going back.'],C1:['Pass the ','P',"baguette, you're French now."]};
  var tiles=[].slice.call(document.querySelectorAll('.level-tile'));
  var L=[document.createElement('div'),document.createElement('div')],cur=1;L.forEach(function(x){x.className='cin-bg';});function isM(){return window.matchMedia&&matchMedia('(max-width:700px)').matches;}
  var vig=document.createElement('div');vig.className='cin-vig';
  var dip=document.createElement('div');dip.className='cin-dip on';
  document.body.insertBefore(L[1],document.body.firstChild);document.body.insertBefore(L[0],document.body.firstChild);document.body.appendChild(vig);document.body.appendChild(dip);
  tiles.forEach(function(t){
    var lab=t.querySelector('.lv-tile-label'),sub=t.querySelector('.lv-tile-sub');
    t._lab=lab.textContent.trim();t._sub=sub.textContent.trim();t._q=QUIP[t._lab]||[];
    t.setAttribute('aria-label',t._lab+', '+t._sub);
    var ic=document.createElement('span');ic.className='cin-ic';ic.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(ICON[t._lab]||'')+'</svg>';
    t.insertBefore(ic,t.firstChild);
    var qw=document.createElement('span');qw.className='cin-q';t._q.forEach(function(p){if(p==='P'){var im=document.createElement('img');im.className='cin-pic';im.alt='';im.src='/assets/images/levels-icon-'+t._lab.toLowerCase()+'.png';qw.appendChild(im);}else{qw.appendChild(document.createTextNode(p));}});t.appendChild(qw);t._el={lab:lab,sub:sub,qw:qw};
  });
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G=0;
  function after(g,ms,fn){setTimeout(function(){if(g===G)fn();},ms);}
  function typeInto(g,el,text,speed,done){
    var i=0;el.textContent='';el.classList.add('typing');
    (function step(){ if(g!==G)return; i++;el.textContent=text.slice(0,i);
      if(i<text.length)setTimeout(step,speed);else{el.classList.remove('typing');if(done)done();} })();
  }
  function fillAll(){tiles.forEach(function(t){t._el.lab.textContent=t._lab;t._el.sub.textContent=t._sub;t._el.qw.classList.add('show');});}
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
    tiles.forEach(function(t){t.classList.remove('in','out');t.classList.add('pre');t.style.transitionDelay='';t._el.lab.textContent='';t._el.sub.textContent='';t._el.qw.classList.remove('show');});
    if(reduce){tiles.forEach(function(t){t.classList.remove('pre');});fillAll();dip.classList.remove('on');return;}
    after(g,200,function(){dip.classList.remove('on');});
    tiles.forEach(function(t,i){
      after(g,(M?1400:2300)+i*280,function(){
        t.classList.remove('pre');t.classList.add('in');
        after(g,900,function(){
          typeInto(g,t._el.lab,t._lab,170,function(){
            after(g,250,function(){
              typeInto(g,t._el.sub,t._sub,70,function(){ t._el.qw.classList.add('show'); });
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

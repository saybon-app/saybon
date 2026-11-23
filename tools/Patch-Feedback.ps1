cd C:\SayBon
$f = "public\admin\tester-feedback.html"
$t = [IO.File]::ReadAllText((Resolve-Path $f), [Text.Encoding]::UTF8)
if ($t.Contains('id="dl"')) { "Already has the download icon, nothing to do." } else {
$css = @'
.w{position:relative}#dl{position:absolute;right:0;top:0;width:42px;height:42px;border-radius:50%;border:1px solid rgba(212,175,106,.45);background:rgba(255,255,255,.05);color:#d4af6a;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}#dl:hover{background:#d4af6a;color:#16120a}#dl svg{width:20px;height:20px}
'@
$btn = @'
<div class="w"><button id="dl" title="Download all feedback" aria-label="Download all feedback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></svg></button><a class="bk" href="/admin/panel.html">
'@
$js = @'
document.getElementById("dl").onclick=function(){
 if(!rows.length){alert("No feedback to download yet.");return}
 var known={};L.forEach(function(p){known[p[0]]=1});
 var out=["SAYBON TESTER FEEDBACK","Downloaded: "+new Date().toLocaleString(),"Responses: "+rows.length+" (all, new and reviewed)","Average lesson rating: "+avg("ls_r")+" / 5","Average placement rating: "+avg("pl_r")+" / 5",""];
 rows.forEach(function(x,i){var a=x.answers||{};
  out.push("=== "+(i+1)+". "+(a.name||"Anonymous")+" | "+(x.created||"")+" | "+(a.device||"")+" | "+(x.reviewed?"reviewed":"new")+" | id "+x.id+" ===");
  L.forEach(function(p){var v=a[p[0]];if(Array.isArray(v))v=v.join(", ");if(v&&v!==0){if(/_r$/.test(p[0]))v=v+" / 5";out.push(p[1]+": "+v)}});
  Object.keys(a).forEach(function(k){if(known[k]||k==="name"||k==="device")return;var v=a[k];if(Array.isArray(v))v=v.join(", ");if(v&&typeof v==="object")v=JSON.stringify(v);if(v&&v!==0)out.push(k+": "+v)});
  out.push("")});
 var blob=new Blob(["\ufeff"+out.join("\r\n")],{type:"text/plain;charset=utf-8"}),u=URL.createObjectURL(blob),a2=document.createElement("a");
 a2.href=u;a2.download="saybon-tester-feedback-"+new Date().toISOString().slice(0,10)+".txt";document.body.appendChild(a2);a2.click();a2.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000)};
window.addEventListener("adminAuthorized",load);
'@
$a1 = '</style></head>'
$a2 = '<div class="w"><a class="bk" href="/admin/panel.html">'
$a3 = 'window.addEventListener("adminAuthorized",load);'
foreach ($a in $a1,$a2,$a3) { if (([regex]::Matches($t,[regex]::Escape($a))).Count -ne 1) { throw "Cannot patch: anchor not found exactly once: $a" } }
$t = $t.Replace($a1, $css + $a1).Replace($a2, $btn).Replace($a3, $js)
[IO.File]::WriteAllText((Resolve-Path $f), $t, (New-Object Text.UTF8Encoding($false)))
"Patched."
explorer.exe /select,(Resolve-Path $f)
}

cd C:\SayBon
$f = "public\features\admin\tester-feedback\index.html"
$t = [IO.File]::ReadAllText((Resolve-Path $f), [Text.Encoding]::UTF8)
if ($t.Contains('id="dl"')) { "Already patched, nothing to do." } else {
$css = '.bar #dl{margin-left:auto;background:linear-gradient(180deg,#e8c98a,#d4af6a);color:#1c1408;border-color:transparent}'
$btn = '<div class="bar"><button id="f0" class="on">New</button><button id="f1">All</button><button id="dl">Download all</button></div>'
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
$pairs = @(
 @('</style></head>', $css + '</style></head>'),
 @('<div class="bar"><button id="f0" class="on">New</button><button id="f1">All</button></div>', $btn),
 @('window.addEventListener("adminAuthorized",load);', $js)
)
foreach ($p in $pairs) { if (([regex]::Matches($t,[regex]::Escape($p[0]))).Count -ne 1) { throw "Cannot patch: anchor not found exactly once: $($p[0])" } }
foreach ($p in $pairs) { $t = $t.Replace($p[0], $p[1]) }
[IO.File]::WriteAllText((Resolve-Path $f), $t, (New-Object Text.UTF8Encoding($false)))
"Patched."
explorer.exe /select,(Resolve-Path $f)
}

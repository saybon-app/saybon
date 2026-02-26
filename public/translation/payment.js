
let params =
new URLSearchParams(location.search);


document.getElementById("price").innerText =
"$"+params.get("price");


document.getElementById("time").innerText =
params.get("time");


document.getElementById("type").innerText =
params.get("type").toUpperCase();



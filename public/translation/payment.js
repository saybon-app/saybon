
const params=new URLSearchParams(window.location.search);


document.getElementById("plan").innerHTML=

params.get("type");


document.getElementById("words").innerHTML=

params.get("words");


document.getElementById("delivery").innerHTML=

params.get("delivery");


document.getElementById("amount").innerHTML=

params.get("price");


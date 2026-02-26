<script>

async function payStripe(){

const params = new URLSearchParams(window.location.search);

const words = params.get("words");

const plan = params.get("plan");

const rate = plan === "standard" ? 0.025 : 0.05;

const amount = words * rate;

const res = await fetch("http://localhost:3000/api/stripe",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body: JSON.stringify({

amount,

words,

plan

})

});

const data = await res.json();

window.location = data.url;

}


async function payPaystack(){

const params = new URLSearchParams(window.location.search);

const words = params.get("words");

const plan = params.get("plan");

const rate = plan === "standard" ? 0.025 : 0.05;

const amount = words * rate;

const res = await fetch("http://localhost:3000/api/paystack",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body: JSON.stringify({

amount,

words,

plan,

email:"customer@email.com"

})

});

const data = await res.json();

window.location = data.url;

}

</script>

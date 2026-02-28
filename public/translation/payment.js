
const stripe = Stripe("PASTE_YOUR_REAL_STRIPE_PUBLIC_KEY_HERE")


const qs=new URLSearchParams(location.search)

const plan=qs.get("plan")

const words=Number(qs.get("words"))

const price=words*(plan==="express"?0.05:0.025)


document.getElementById("summary").innerHTML=

plan.toUpperCase()+"<br>"+

words+" words<br>"+

"$"+price.toFixed(2)




document.getElementById("stripeBtn").onclick=async()=>{


const res=await fetch("/api/pay/stripe",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({

amount:Math.round(price*100),

currency:document.getElementById("currency").value

})

})


const data=await res.json()


location=data.url

}




document.getElementById("paystackBtn").onclick=async()=>{


const res=await fetch("/api/pay/paystack",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({

amount:Math.round(price*100),

currency:document.getElementById("currency").value

})

})


const data=await res.json()


location=data.url

}


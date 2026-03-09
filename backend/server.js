import express from "express"
import Stripe from "stripe"
import cors from "cors"

const app=express()

app.use(cors())
app.use(express.json())

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)

app.post("/api/createCheckout",async(req,res)=>{

const {words,plan}=req.body

let price=0

if(plan==="express"){
price=words*0.05
}else{
price=words*0.025
}

const session=await stripe.checkout.sessions.create({

payment_method_types:["card"],

line_items:[{
price_data:{
currency:"usd",
product_data:{
name:"Translation Service"
},
unit_amount:Math.round(price*100)
},
quantity:1
}],

mode:"payment",

success_url:"https://saybonapp.com/translation/success.html",

cancel_url:"https://saybonapp.com/translation/request.html"

})

res.json({
url:session.url
})

})

app.listen(3000,()=>{
console.log("Server running")
})

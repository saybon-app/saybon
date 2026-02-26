
const functions = require("firebase-functions");

const express = require("express");

const cors = require("cors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const app = express();


app.use(cors({origin:true}));

app.use(express.json());



app.post("/stripe", async (req,res)=>{


try{


const session = await stripe.checkout.sessions.create({


payment_method_types:["card"],


mode:"payment",


line_items:[{


price_data:{


currency:req.body.currency||"usd",


product_data:{


name:"SayBon Translation"


},


unit_amount:req.body.amount


},


quantity:1


}],


success_url:"https://saybonapp.com/success.html",


cancel_url:"https://saybonapp.com/cancel.html"


});


res.json({url:session.url});


}


catch(error){


console.log(error);


res.status(500).json({error:error.message});


}


});



exports.api = functions.https.onRequest(app);


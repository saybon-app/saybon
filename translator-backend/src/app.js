require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");

const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());

app.use(express.json());



/*
UPLOAD
*/

const upload = multer({
storage: multer.memoryStorage()
});



/*
PRICING RULES
*/

const STANDARD_RATE = 0.025;
const EXPRESS_RATE = 0.05;



function getDelivery(words){

let standard = "";
let express = "";

if(words <= 300){

standard = "1–3 hrs";
express = "30–60 mins";

}

else if(words <= 1000){

standard = "3–6 hrs";
express = "1–3 hrs";

}

else if(words <= 3000){

standard = "6–12 hrs";
express = "3–6 hrs";

}

else{

standard = "12–24 hrs";
express = "6–12 hrs";

}

return { standard, express };

}



/*
WORD COUNT ENDPOINT
*/

app.post(
"/request",
upload.single("file"),
async(req,res)=>{

try{

const text = req.file.buffer.toString();

const words = text.trim().split(/\s+/).length;

const standardPrice =
Number((words * STANDARD_RATE).toFixed(2));

const expressPrice =
Number((words * EXPRESS_RATE).toFixed(2));


const delivery =
getDelivery(words);



res.json({

success:true,

words,

standardPrice,

expressPrice,

standardTime: delivery.standard,

expressTime: delivery.express

});

}
catch(err){

console.log(err);

res.status(500).json({

success:false,
message:"Server error"

});

}

});



/*
STRIPE CHECKOUT SESSION
*/

app.post(
"/create-stripe-session",
async(req,res)=>{

try{

const {

amount,
type,
words

} = req.body;



const session = await stripe.checkout.sessions.create({

payment_method_types: ["card"],

mode:"payment",

line_items:[{

price_data:{

currency:"usd",

product_data:{

name:`SayBon Translation (${type})`,
description:`${words} words`

},

unit_amount:

Math.round(amount * 100)

},

quantity:1

}],

success_url:

"https://saybonapp.com/translation/success.html",

cancel_url:

"https://saybonapp.com/translation/request.html"

});


res.json({

id:session.id

});


}
catch(err){

console.log(err);

res.status(500).json({

error:"Stripe error"

});

}

});



/*
START SERVER
*/

const PORT =
process.env.PORT || 3000;



app.listen(PORT, ()=>{

console.log(

"Server running on port",
PORT

);

});

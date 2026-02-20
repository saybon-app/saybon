import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export const createPaystackSession = async (req, res) => {

try{

const { amount, email } = req.body;

if(!amount){

return res.status(400).json({

success:false,
message:"Amount required"

});

}

const response = await fetch(

"https://api.paystack.co/transaction/initialize",

{

method:"POST",

headers:{

Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

"Content-Type":"application/json"

},

body:JSON.stringify({

email: email || "pay@saybonapp.com",

amount: Math.round(amount*100),

callback_url:

"https://saybonapp.com/success.html"

})

}

);

const data = await response.json();

res.json({

success:true,
url:data.data.authorization_url

});

}
catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

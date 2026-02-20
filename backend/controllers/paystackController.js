import fetch from "node-fetch";


export const initializePayment = async (req,res)=>{

try{


const {

email,

amount,

words,

filename

}=req.body;



const response = await fetch(

"https://api.paystack.co/transaction/initialize",

{

method:"POST",

headers:{

Authorization:

`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

"Content-Type":"application/json"

},

body:JSON.stringify({

email,

amount:amount*100,

callback_url:

`${process.env.FRONTEND_URL}/translation/success.html`,

metadata:{

words,

filename

}

})

}

);


const data=await response.json();


res.json({

success:true,

payment_url:

data.data.authorization_url

});


}catch(error){

res.json({

success:false

});

}

};




export const verifyPayment = async (req,res)=>{


const reference=req.params.reference;


const response=await fetch(

`https://api.paystack.co/transaction/verify/${reference}`,

{

headers:{

Authorization:

`Bearer ${process.env.PAYSTACK_SECRET_KEY}`

}

}

);


const data=await response.json();


res.json(data);


};
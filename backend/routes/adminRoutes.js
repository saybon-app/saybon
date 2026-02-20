import express from "express";


const router=express.Router();



router.get("/orders",(req,res)=>{


res.json({


orders:[


{

email:"customer@saybon.com",

filename:"document.pdf",

words:1200,

price:60,

status:"Paid",

fileUrl:"#"

}


]


});


});


export default router;

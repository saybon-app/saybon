const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

const router = express.Router();


// STORAGE CONFIG


const storage = multer.diskStorage({

destination: function (req, file, cb) {

if(file.fieldname === "cv") cb(null, "src/storage/cv/");
else if(file.fieldname === "certificates") cb(null, "src/storage/cert/");
else if(file.fieldname === "nationalId") cb(null, "src/storage/id/");

},

filename: function (req, file, cb) {

cb(null, Date.now() + "-" + file.originalname);

}

});


const upload = multer({ storage: storage });




// EMAIL CONFIG


const transporter = nodemailer.createTransport({

service: "gmail",

auth: {

user: process.env.EMAIL_USER,

pass: process.env.EMAIL_PASS

}

});




// DATABASE FILE


const DB = "src/database/translators.json";






// REGISTER TRANSLATOR


router.post("/register",

upload.fields([

{ name: "cv" },

{ name: "certificates" },

{ name: "nationalId" }

]),

(req, res) => {

try{


const {

name,

email,

phone,

address,

country,

experience,

translationTest,

ndaAgree

} = req.body;



if(!ndaAgree){

return res.json({

success:false,

message:"NDA required"

});

}



const passkey = uuidv4().slice(0,8);



const translator = {

id: uuidv4(),

name,

email,

phone,

address,

country,

experience,

translationTest,

cv: req.files.cv[0].filename,

certificates: req.files.certificates[0].filename,

nationalId: req.files.nationalId[0].filename,

passkey,

status:"PENDING",

created: Date.now()

};



const db = JSON.parse(fs.readFileSync(DB));

db.push(translator);

fs.writeFileSync(DB, JSON.stringify(db,null,2));




res.json({

success:true,

message:"Registration received"

});



}
catch(err){

console.log(err);

res.json({

success:false

});

}

});






// LOGIN WITH PASSKEY


router.post("/login",(req,res)=>{


const { passkey } = req.body;

const db = JSON.parse(fs.readFileSync(DB));


const user = db.find(t=>t.passkey === passkey);


if(!user){

return res.json({

success:false

});

}



if(user.status !== "APPROVED"){

return res.json({

success:false,

message:"Not approved yet"

});

}



res.json({

success:true,

user

});


});






module.exports = router;

import fs from "fs";

export default async function(req,res){

try{

const file=req.file;

if(!file){

return res.status(400).json({

error:"No file"

});

}

const text=fs.readFileSync(file.path,"utf8");

const words=text.trim().split(/\s+/).length;

res.json({

wordCount:words,

standard:(words*0.025).toFixed(2),

express:(words*0.05).toFixed(2)

});

}catch(e){

res.status(500).json({

error:e.message

});

}

}
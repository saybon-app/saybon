import pdf from "pdf-parse";


export const handleRequest = async (req, res) => {

try{

if(!req.file){

return res.status(400).json({
success:false,
message:"No file uploaded"
});

}


const data = await pdf(req.file.buffer);

const words = data.text
.trim()
.split(/\s+/)
.length;


res.json({

success:true,
words:words

});

}
catch(error){

console.log(error);

res.status(500).json({

success:false,
message:"Parsing failed"

});

}

};
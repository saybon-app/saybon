import {extractText} from "../services/fileParser.js";
import {countWords} from "../utils/wordCounter.js";


export const uploadRequest = async(req,res)=>{


try{


const file = req.file;

const text = await extractText(file.path);

const words = countWords(text);

const price = words * 0.025;


res.json({

success:true,

words,

price

});


}catch(e){

console.log(e);

res.status(500).json({

success:false

});

}

};
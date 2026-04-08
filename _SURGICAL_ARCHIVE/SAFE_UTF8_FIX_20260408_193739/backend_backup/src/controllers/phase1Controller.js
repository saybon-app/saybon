import { runPhase1Translation } from "../services/phase1Service.js";
import { savePhase1, getPhase1 } from "../utils/phase1Storage.js";


export async function startPhase1(req,res){

try{

const { jobCode, text } = req.body;

const result = await runPhase1Translation(jobCode, text);

savePhase1(result);

res.json({

success:true,

job: result

});

}
catch(err){

console.log(err);

res.status(500).json({

error:"Phase 1 failed"

});

}

}



export async function getPhase1Status(req,res){

const job = getPhase1(req.params.jobCode);

if(!job){

return res.status(404).json({

error:"Not found"

});

}

res.json(job);

}
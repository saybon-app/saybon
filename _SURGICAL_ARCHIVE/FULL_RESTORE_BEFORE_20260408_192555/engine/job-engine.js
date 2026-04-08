export async function acceptJob(db,jobId,translatorId){

const jobRef=db.collection("translationJobs").doc(jobId);
const doc=await jobRef.get();

let job=doc.data();

let accepted=job.acceptedTranslators||[];

if(accepted.includes(translatorId))
return {message:"already accepted"};

if(accepted.length>=3)
return {message:"job closed"};

accepted.push(translatorId);

await jobRef.update({
acceptedTranslators:accepted,
status:"in_progress"
});

return {success:true};

}

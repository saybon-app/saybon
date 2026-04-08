export async function deliverTranslation(db,jobId,translation){

const jobRef=db.collection("translationJobs").doc(jobId);

const jobDoc=await jobRef.get();

if(!jobDoc.exists){
throw new Error("Job not found");
}

await jobRef.update({

status:"completed",
finalTranslation:translation,
deliveredAt:new Date()

});

return{
delivered:true
};

}
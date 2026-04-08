export async function acceptJob(db,jobId,translatorId){

const jobRef=db.collection("translationJobs").doc(jobId);

const jobDoc=await jobRef.get();

if(!jobDoc.exists){
throw new Error("Job not found");
}

let job=jobDoc.data();

if(job.acceptedCount>=3){
throw new Error("Job already closed");
}

const acceptRef=db.collection("jobAcceptances");

const existing=await acceptRef
.where("jobId","==",jobId)
.where("translatorId","==",translatorId)
.get();

if(!existing.empty){
throw new Error("Translator already accepted job");
}

await acceptRef.add({

jobId:jobId,
translatorId:translatorId,
acceptedAt:new Date()

});

await jobRef.update({

acceptedCount:job.acceptedCount+1

});

return{
accepted:true
};

}
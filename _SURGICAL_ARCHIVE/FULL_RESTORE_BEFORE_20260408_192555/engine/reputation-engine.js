export async function updateReputation(db,translatorId,score,onTime){

const ref=db.collection("translatorProfiles").doc(translatorId);

const doc=await ref.get();

if(!doc.exists) return;

let data=doc.data();

let jobsSubmitted=data.jobsSubmitted+1;

let jobsPassed=data.jobsPassed;
let jobsRejected=data.jobsRejected;

if(score>=85){
jobsPassed++;
}else{
jobsRejected++;
}

let averageScore=((data.averageScore*(jobsSubmitted-1))+score)/jobsSubmitted;

let completionRate=jobsPassed/jobsSubmitted;

let onTimeRate=((data.onTimeRate*(jobsSubmitted-1))+(onTime?1:0))/jobsSubmitted;

let reputation=

(averageScore*0.6)+
(completionRate*100*0.3)+
(onTimeRate*100*0.1);

await ref.update({

jobsSubmitted,
jobsPassed,
jobsRejected,
averageScore,
onTimeRate,
reputationScore:reputation

});

}

const phase1DB = {};

export function savePhase1(job){

phase1DB[job.jobCode] = job;

}

export function getPhase1(jobCode){

return phase1DB[jobCode];

}
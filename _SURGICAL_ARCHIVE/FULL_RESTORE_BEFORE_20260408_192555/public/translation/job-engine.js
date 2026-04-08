
async function loadJobs(){

const response = await fetch("jobs.json");
const jobs = await response.json();

const table = document.getElementById("jobRows");
table.innerHTML = "";

jobs.forEach(job => {

let status = job.accepted + " / " + job.max;

let disabled = job.accepted >= job.max ? "disabled" : "";

let row = `
<tr>

<td>${job.jobId}</td>
<td>${job.words}</td>
<td>${job.deadline}</td>
<td>${job.plan}</td>
<td>${status}</td>

<td>
<button onclick="acceptJob('${job.jobId}')" ${disabled}>
Accept Job
</button>
</td>

</tr>
`;

table.innerHTML += row;

});

}


async function acceptJob(id){

const response = await fetch("jobs.json");
const jobs = await response.json();

const job = jobs.find(j => j.jobId === id);

if(job.accepted >= job.max){

alert("Job already closed");

return;

}

job.accepted++;

alert("Job accepted");

loadJobs();

}

loadJobs();


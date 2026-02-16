const { v4: uuid } = require("uuid")

let jobs = []


module.exports = function createJob(original, phase1){

const job = {

id: uuid(),

original,

phase1,

status:"OPEN",

translators:[],

submissions:[]

}

jobs.push(job)

return job

}
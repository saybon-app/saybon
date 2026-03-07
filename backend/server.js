import express from "express"
import cors from "cors"
import fs from "fs"

const app = express()

app.use(cors())
app.use(express.json())

const JOB_FILE = "./backend/data/jobs.json"

function loadJobs(){
  return JSON.parse(fs.readFileSync(JOB_FILE))
}

function saveJobs(jobs){
  fs.writeFileSync(JOB_FILE,JSON.stringify(jobs,null,2))
}

function createJobId(){
  return "JOB-"+Date.now()
}

############################################
# SERVER STATUS
############################################

app.get("/",(req,res)=>{
  res.send("SayBon backend running")
})

############################################
# CREATE JOB
############################################

app.post("/api/createJob",(req,res)=>{

  const { words, plan } = req.body

  const jobs = loadJobs()

  const job = {
    id:createJobId(),
    words,
    plan,
    status:"pending_payment",
    created:new Date().toISOString()
  }

  jobs.push(job)

  saveJobs(jobs)

  res.json(job)

})

############################################
# LIST JOBS
############################################

app.get("/api/jobs",(req,res)=>{

  const jobs = loadJobs()

  res.json(jobs)

})

############################################

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{
  console.log("SayBon backend running")
})

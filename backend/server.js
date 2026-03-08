const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const DATA_FILE = path.join(__dirname,"data","jobs.json")

function loadJobs(){

  if(!fs.existsSync(DATA_FILE)){
    fs.writeFileSync(DATA_FILE,"[]")
  }

  return JSON.parse(fs.readFileSync(DATA_FILE))
}

function saveJobs(jobs){
  fs.writeFileSync(DATA_FILE,JSON.stringify(jobs,null,2))
}

function createJobCode(){

  const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  let code="SB-"

  for(let i=0;i<6;i++){
    code+=chars[Math.floor(Math.random()*chars.length)]
  }

  return code
}

app.post("/api/createJob",(req,res)=>{

  const { fileId, words, plan, price } = req.body

  if(!fileId || !words || !plan){

    return res.status(400).json({
      error:"Missing job parameters"
    })

  }

  const jobs = loadJobs()

  const jobCode = createJobCode()

  const job = {

    jobCode,
    fileId,
    words,
    plan,
    price,

    status:"awaiting_payment",
    stage:"waiting_for_payment",
    progress:0,

    created:new Date().toISOString()

  }

  jobs.push(job)

  saveJobs(jobs)

  res.json({
    jobCode
  })

})

app.post("/api/createCheckout",(req,res)=>{

  const { jobCode } = req.body

  if(!jobCode){

    return res.status(400).json({
      error:"Missing jobCode"
    })

  }

  res.json({
    url:"/translation/payment.html?jobCode="+jobCode
  })

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

  console.log("SayBon backend running on port "+PORT)

})

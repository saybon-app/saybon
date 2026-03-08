const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")
const Stripe = require("stripe")

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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



# ==========================================
# CREATE JOB
# ==========================================

app.post("/api/createJob",(req,res)=>{

  const { fileId, words, plan, price } = req.body

  if(!words || !plan){

    return res.status(400).json({
      error:"Missing parameters"
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



# ==========================================
# STRIPE CHECKOUT
# ==========================================

app.post("/api/createCheckout", async (req,res)=>{

  try{

    const { jobCode } = req.body

    const jobs = loadJobs()

    const job = jobs.find(j => j.jobCode === jobCode)

    if(!job){

      return res.status(404).json({
        error:"Job not found"
      })

    }

    const rate = job.plan === "express" ? 0.05 : 0.025

    const price = Math.round(job.words * rate * 100)

    const session = await stripe.checkout.sessions.create({

      payment_method_types:["card"],

      mode:"payment",

      line_items:[{

        price_data:{

          currency:"usd",

          product_data:{
            name:"SayBon Translation ("+job.words+" words)"
          },

          unit_amount:price

        },

        quantity:1

      }],

      success_url:"https://saybonapp.com/translation/success.html?jobCode="+jobCode,

      cancel_url:"https://saybonapp.com/translation/job.html?jobCode="+jobCode

    })

    res.json({
      url:session.url
    })

  }

  catch(err){

    console.error(err)

    res.status(500).json({
      error:"Stripe session failed"
    })

  }

})



const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{

  console.log("SayBon backend running on port "+PORT)

})

import express from "express"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
  res.send("SayBon backend running (request page state)")
})

app.get("/api/status",(req,res)=>{
  res.json({status:"SayBon backend active"})
})

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{
  console.log("SayBon minimal backend running")
})

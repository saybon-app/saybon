import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import quoteRoute from "./translation/routes/quoteRoute.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/", quoteRoute);

app.get("/", (req,res)=>{

res.send("SayBon Translation Backend Running");

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>{

console.log("Server running on port",PORT);

});

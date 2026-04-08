import express from "express";
import cors from "cors";
import multer from "multer";
import quoteController from "./controllers/quoteController.js";

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/api/quote", upload.single("file"), quoteController);

app.get("/", (req,res)=>{

res.send("SayBon Engine Running");

});

app.listen(10000, ()=>{

console.log("Engine running on port 10000");

});
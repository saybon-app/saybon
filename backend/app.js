import express from "express";

import cors from "cors";

import requestRoute from "./routes/requestRoute.js";


const app = express();


app.use(cors());


app.use("/api", requestRoute);


app.get("/", (req, res) => {

  res.send("SayBon Backend Running");

});


const PORT = process.env.PORT || 10000;


app.listen(PORT, () => {

  console.log("Server running on port", PORT);

});

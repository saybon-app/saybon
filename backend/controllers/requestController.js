import fs from "fs/promises";
import { getWordCountFromFile } from "../services/fileParser.js";


export async function handleQuoteRequest(req, res) {

  try {

    if (!req.file)

      return res.status(400).json({ error: "No file uploaded" });



    const wordCount = await getWordCountFromFile(

      req.file.path,

      req.file.mimetype,

      req.file.originalname

    );



    const standardPrice = Number((wordCount * 0.025).toFixed(2));

    const expressPrice = Number((wordCount * 0.05).toFixed(2));



    res.json({

      success: true,

      wordCount,

      pricing: {

        standard: standardPrice,

        express: expressPrice,

      },

    });



    await fs.unlink(req.file.path);



  } catch (err) {

    console.error(err);

    res.status(500).json({

      error: "Quote generation failed",

    });

  }

}

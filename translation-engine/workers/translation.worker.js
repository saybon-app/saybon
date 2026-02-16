const fs = require("fs");
const path = require("path");

const { translateText } = require("../providers/ai.provider");
const { extractTextFromFile } = require("../utils/file.utils");

const OUTPUT_DIR = path.join(__dirname, "..", "storage");

async function runTranslationJob(filePath, sourceLang, targetLang) {

    try {

        console.log("Starting translation job...");

        const originalText = await extractTextFromFile(filePath);

        console.log("Text extracted.");

        const translatedText = await translateText(
            originalText,
            sourceLang,
            targetLang
        );

        console.log("Translation complete.");

        const outputFile = path.join(
            OUTPUT_DIR,
            "translated-" + Date.now() + ".txt"
        );

        fs.writeFileSync(outputFile, translatedText);

        console.log("Saved:", outputFile);

        return {
            success: true,
            file: outputFile
        };

    } catch (error) {

        console.error(error);

        return {
            success: false,
            error: error.message
        };

    }

}

module.exports = { runTranslationJob };

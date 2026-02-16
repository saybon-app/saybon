const fs = require("fs");

async function extractTextFromFile(filePath) {

    return fs.readFileSync(filePath, "utf8");

}

module.exports = { extractTextFromFile };

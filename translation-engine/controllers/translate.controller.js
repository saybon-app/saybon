const { runTranslationJob } =
require("../workers/translation.worker");

async function handleTranslation(req, res) {

    const file = req.file;

    const result = await runTranslationJob(
        file.path,
        "French",
        "English"
    );

    res.json(result);

}

module.exports = { handleTranslation };

const OpenAI = require("openai");

require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function translateText(text, source, target) {

    const prompt = `
Translate from ${source} to ${target}.

TEXT:

${text}
`;

    const response = await openai.chat.completions.create({

        model: "gpt-4o-mini",

        messages: [
            { role: "user", content: prompt }
        ]

    });

    return response.choices[0].message.content;

}

module.exports = { translateText };

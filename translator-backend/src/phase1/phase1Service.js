const OpenAI = require("openai")

const openai = new OpenAI({

apiKey: process.env.OPENAI_API_KEY

})


module.exports = async function runPhase1(text){

const response = await openai.chat.completions.create({

model:"gpt-4o-mini",

messages:[

{
role:"system",
content:
"Translate to French professionally. This is Phase 1 draft."
},

{
role:"user",
content:text
}

]

})


return response.choices[0].message.content

}

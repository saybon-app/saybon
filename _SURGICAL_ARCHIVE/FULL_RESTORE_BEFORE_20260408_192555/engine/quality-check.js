import OpenAI from "openai";

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

export async function evaluateTranslation(source,translation){

try{

const response = await openai.chat.completions.create({

model:"gpt-4o-mini",

temperature:0.2,

messages:[

{
role:"system",
content:`You are a professional translation reviewer. 
Score the translation quality from 0 to 100.
Return JSON with score and feedback.`
},

{
role:"user",
content:`
SOURCE TEXT:

${source}

TRANSLATION:

${translation}

Evaluate:

1 accuracy
2 grammar
3 meaning preservation
4 completeness

Return JSON format:

{
score: number,
feedback: "short explanation"
}
`
}

]

});

const content=response.choices[0].message.content;

return JSON.parse(content);

}catch(err){

console.error("QUALITY CHECK ERROR",err);

return {
score:0,
feedback:"AI evaluation failed"
};

}

}

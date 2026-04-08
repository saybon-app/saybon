import { segmentText } from "./segmenter.js";
import { translateText } from "./ai-translation.js";

export async function translateLargeDocument(text,sourceLang,targetLang){

const segments=segmentText(text);

let translatedSegments=[];

for(const segment of segments){

const translated=await translateText(segment,sourceLang,targetLang);

translatedSegments.push(translated);

}

return translatedSegments.join("\n\n");

}
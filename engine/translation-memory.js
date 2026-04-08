export async function saveTranslationMemory(db,source,target,sourceLang,targetLang){

if(!source || !target) return;

await db.collection("translationMemory").add({

source:source.trim(),
target:target.trim(),
sourceLang:sourceLang,
targetLang:targetLang,
createdAt:new Date()

});

}



export async function applyTranslationMemory(db,text){

const snapshot = await db.collection("translationMemory").get();

let output=text;

snapshot.forEach(doc=>{

const memory=doc.data();

if(memory.source && memory.target){

const regex=new RegExp(memory.source,"gi");

output=output.replace(regex,memory.target);

}

});

return output;

}
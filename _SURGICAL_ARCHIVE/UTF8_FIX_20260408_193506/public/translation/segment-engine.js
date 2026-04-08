export function segmentText(text){

const sentences = text
.replace(/\n+/g," ")
.split(/(?<=[.!?])\s+/)
.filter(s => s.trim().length > 0);

return sentences.map((s,i)=>({
 id:i+1,
 source:s,
 edit:""
}));

}
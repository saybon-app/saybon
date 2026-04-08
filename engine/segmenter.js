export function segmentText(text){

const maxWords=900;

const words=text.split(" ");

let segments=[];
let current=[];

for(let word of words){

current.push(word);

if(current.length>=maxWords){

segments.push(current.join(" "));
current=[];

}

}

if(current.length>0){

segments.push(current.join(" "));

}

return segments;

}
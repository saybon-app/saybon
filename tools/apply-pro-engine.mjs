// Lets the lesson engine run from /professional/lesson1.html (small, safe, run from the project root).
import fs from "fs";
const F="public/levels/lesson-engine-tp.js";
if(!fs.existsSync(F)){console.log("STOP: "+F+" not found.");process.exit(1);}
let s=fs.readFileSync(F,"utf8");
if(s.includes("__LS_LEVEL")){console.log("Engine already allows professional lessons.");process.exit(0);}
const a='var LEVEL;\nif(pathParts.indexOf("tout-public") !== -1){ LEVEL = "a0-tout-public"; }\nelse { LEVEL = pathParts[1].toLowerCase(); }\nconst LESSON = parseInt((location.pathname.match(/lesson(\\d+)\\.html/) || [null, "1"])[1]);';
const b='var LEVEL;\nif(window.__LS_LEVEL){ LEVEL = window.__LS_LEVEL; }\nelse if(pathParts.indexOf("tout-public") !== -1){ LEVEL = "a0-tout-public"; }\nelse { LEVEL = pathParts[1].toLowerCase(); }\nconst LESSON = window.__LS_LESSON ? parseInt(window.__LS_LESSON) : parseInt((location.pathname.match(/lesson(\\d+)\\.html/) || [null, "1"])[1]);';
const t=s.replace(/\r\n/g,"\n");
if(!t.includes(a)){console.log("STOP: could not find the level lines in the engine. Nothing changed.");process.exit(1);}
fs.writeFileSync(F+".bakPro",s);
fs.writeFileSync(F,t.replace(a,b));
console.log("Engine updated (backup: "+F+".bakPro).");

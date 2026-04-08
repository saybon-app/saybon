export function calculatePayout(position,score){

if(score<85) return 0;

if(position===1) return 1.0;
if(position===2) return 0.4;
if(position===3) return 0.2;

return 0;

}

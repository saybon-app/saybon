const sequence = [

    "guideIdle",
    "guideIdle",
    "guideBlink",

    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideWave",
    "guideWave",
    "guideWave",

    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideIdle",
    "guideIdle",

    "guideWink",

    "guideIdle",
    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideWave",
    "guideWave",

    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideIdle",
    "guideIdle",

    "guideSalute",

    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideWink",

    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideSalute",
    "guideSalute",

    "guideIdle",
    "guideIdle"
];

let current = 0;

function showPose(id){

    document
        .querySelectorAll(".guide-layer")
        .forEach(layer => layer.classList.remove("active"));

    const target = document.getElementById(id);

    if(target){
        target.classList.add("active");
    }
}

function nextPose(){

    showPose(sequence[current]);

    current++;

    if(current >= sequence.length){
        current = 0;
    }
}

showPose("guideIdle");

setTimeout(() => {

    setInterval(nextPose, 700);

}, 1500);

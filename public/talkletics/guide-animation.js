const sequence = [
    "guideIdle",
    "guideIdle",
    "guideBlink",

    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideWave",

    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideWink",

    "guideIdle",
    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideWave",

    "guideSalute",

    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideWink",

    "guideBlink",

    "guideSalute",

    "guideIdle",
    "guideIdle"
];

let current = 0;

function showPose(id){

    const layers =
        document.querySelectorAll(".guide-layer");

    layers.forEach(layer => {
        layer.classList.remove("active");
    });

    const target =
        document.getElementById(id);

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

/* start after a short delay */
setTimeout(() => {

    setInterval(nextPose, 500);

}, 1500);

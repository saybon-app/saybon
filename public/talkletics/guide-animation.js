const sequence = [

    "guideIdle",
    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideIdle",
    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideIdle",
    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideIdle",
    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideBlink",

    "guideIdle",
    "guideIdle",
    "guideIdle",
    "guideIdle",

    "guideBlink"
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

setInterval(nextPose, 900);

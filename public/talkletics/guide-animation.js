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

    "guideBlink"
];

let current = 0;

function showPose(id){

    document
        .querySelectorAll(".guide-layer")
        .forEach(layer => layer.classList.remove("active"));

    document
        .getElementById(id)
        ?.classList.add("active");
}

function nextPose(){

    const pose = sequence[current];

    showPose(pose);

    current++;

    if(current >= sequence.length){
        current = 0;
    }

    const nextDelay =
        pose === "guideBlink"
            ? 300
            : 850;

    setTimeout(nextPose, nextDelay);
}

showPose("guideIdle");
setTimeout(nextPose, 850);

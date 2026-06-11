const poses = [
    "guideIdle",
    "guideBlink",
    "guideIdle",
    "guideWave",
    "guideIdle",
    "guideWink",
    "guideIdle",
    "guideSalute",
    "guideIdle"
];

let current = 0;

function showPose(id){

    document
        .querySelectorAll(".guide-layer")
        .forEach(el => el.classList.remove("active"));

    const target = document.getElementById(id);

    if(target){
        target.classList.add("active");
    }
}

function nextPose(){

    showPose(poses[current]);

    current++;

    if(current >= poses.length){
        current = 0;
    }
}

showPose("guideIdle");

setInterval(nextPose,1800);

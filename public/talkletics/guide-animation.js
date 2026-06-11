const guide = document.querySelector(".guide");

if (guide) {

  const poses = [
    "/assets/talkletics/guide.png",
    "/assets/talkletics/guide-blink.png",
    "/assets/talkletics/guide.png",
    "/assets/talkletics/guide-wave.png",
    "/assets/talkletics/guide.png",
    "/assets/talkletics/guide-wink.png",
    "/assets/talkletics/guide.png",
    "/assets/talkletics/guide-salute.png",
    "/assets/talkletics/guide.png"
  ];

  let frame = 0;

  setInterval(() => {

    frame++;

    if(frame >= poses.length){
      frame = 0;
    }

    guide.src = poses[frame];

  }, 2200);

}

document.addEventListener("DOMContentLoaded", () => {
  const teacher = document.getElementById("teacherCircle");
  const audio = document.getElementById("introAudio");

  if (!teacher || !audio) {
    console.log("Teacher or audio not found");
    return;
  }

  teacher.addEventListener("click", () => {
    console.log("Teacher tapped");

    audio.currentTime = 0;

    audio.play()
      .then(() => {
        console.log("Audio playing");
      })
      .catch(err => {
        console.error("Audio blocked:", err);
        alert("Tap once more to allow sound");
      });
  });
});

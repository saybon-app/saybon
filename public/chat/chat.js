window.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("chatInput");
    const sendBtn = document.querySelector(".send-btn");
    const messages = document.querySelector(".messages");

    function sendMessage(){

        const text = input.value.trim();

        if(!text) return;

        const bubble = document.createElement("div");

        bubble.className = "message outgoing";

        bubble.textContent = text;

        messages.appendChild(bubble);

        messages.scrollTop = messages.scrollHeight;

        input.value = "";
    }

    sendBtn.addEventListener("click", sendMessage);

    input.addEventListener("keydown", (e)=>{
        if(e.key === "Enter"){
            sendMessage();
        }
    });

    document.querySelector(".record-btn").addEventListener("click", ()=>{
        alert("Voice recording UI active");
    });

    document.querySelector(".media-btn").addEventListener("click", ()=>{
        alert("Photo/video picker active");
    });

    document.querySelector(".attach-btn").addEventListener("click", ()=>{
        alert("Attachment picker active");
    });

});

/* ========================================
   SAYBON DELF TEST ENGINE (CLEAN SCORING)
======================================== */

const params = new URLSearchParams(window.location.search);
const test = params.get("test") || "prim";

let testData = null;
let current = 0;
let answers = {};

const stage = document.getElementById("stage");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const progressLabel = document.getElementById("progressLabel");
const progressFill = document.getElementById("progressFill");
const title = document.getElementById("title");
const candidateLine = document.getElementById("candidateCodeLine");

/* =========================
   LOAD TEST
========================= */
async function loadTest(){
    const res = await fetch(`/features/delf/tests/${test}.json`);
    testData = await res.json();

    title.innerText = testData.title;

    const code = "C-" + Math.floor(100000 + Math.random()*900000);
    candidateLine.innerText = "Candidate ID: " + code;

    render();
}

loadTest();

/* =========================
   RENDER
========================= */
function render(){
    const q = testData.questions[current];

    progressLabel.innerText = `${current+1} / ${testData.questions.length}`;
    progressFill.style.width = ((current+1)/testData.questions.length)*100 + "%";

    if(q.type === "reading" || q.type === "listening"){
        stage.innerHTML = `
            <div class="pill">${q.type.toUpperCase()}</div>
            <h2 class="questionText">${q.question}</h2>

            ${q.audio ? `<audio controls src="${q.audio}"></audio>` : ""}

            <div class="answerGrid">
                ${q.options.map((opt,i)=>`
                    <label class="option">
                        <input type="radio" name="q" value="${i}" ${answers[current]==i?"checked":""}>
                        <div class="optionCard">
                            <div class="badge">${String.fromCharCode(65+i)}</div>
                            ${opt}
                        </div>
                    </label>
                `).join("")}
            </div>
        `;
    }

    if(q.type === "writing"){
        stage.innerHTML = `
            <div class="pill">WRITING</div>
            <h2 class="questionText">${q.question}</h2>
            <textarea id="textAnswer">${answers[current]||""}</textarea>
        `;
    }

    if(q.type === "speaking"){
    stage.innerHTML = `
        <div class="pill">SPEAKING</div>
        <h2 class="questionText">${q.question}</h2>

        <div class="answerBox">
            <div id="recStatus" class="helper">Tap start and speak.</div>

            <div style="margin-top:12px;display:flex;gap:10px;">
                <button class="btn btnPrimary" onclick="startRecording()">Start</button>
                <button class="btn btnMuted" onclick="stopRecording()">Stop</button>
                <button class="btn btnMuted" onclick="resetRecording()">Re-record</button>
            </div>

            <div class="waveShell" style="margin-top:16px;">
                <canvas id="waveCanvas"></canvas>
            </div>

            <audio id="playback" controls style="width:100%;margin-top:14px;display:none;"></audio>
        </div>
    `;
}</h2>
            <button onclick="startRec()">Start Recording</button>
            <button onclick="stopRec()">Stop</button>
            <audio id="playback" controls></audio>
        `;
    }
}

/* =========================
   SAVE ANSWER
========================= */
function saveAnswer(){
    const q = testData.questions[current];

    if(q.type === "reading" || q.type === "listening"){
        const selected = document.querySelector("input[name='q']:checked");
        if(selected) answers[current] = Number(selected.value);
    }

    if(q.type === "writing"){
        answers[current] = document.getElementById("textAnswer").value;
    }
}

/* =========================
   NAV
========================= */
nextBtn.onclick = ()=>{
    saveAnswer();

    if(current < testData.questions.length-1){
        current++;
        render();
    } else {
        finish();
    }
};

backBtn.onclick = ()=>{
    if(current > 0){
        current--;
        render();
    }
};

/* =========================
   🔥 FIXED SCORING
========================= */
function calculateScore(){
    let score = 0;
    let total = 0;

    testData.questions.forEach((q,i)=>{
        if(q.type === "reading" || q.type === "listening"){
            total++; // count ALL objective questions

            if(answers[i] === q.answer){
                score++;
            }
        }
    });

    const percent = total > 0 ? Math.round((score/total)*100) : 0;

    return { score, total, percent };
}

/* =========================
   FINISH
========================= */
function finish(){
    const result = calculateScore();

    stage.innerHTML = `
        <div class="pill">COMPLETED</div>
        <h2>Placement complete</h2>

        <div class="resultBox">
            <strong>Objective Score:</strong> ${result.score} / ${result.total}<br>
            <strong>Objective Percent:</strong> ${result.percent}%
        </div>
    `;

    nextBtn.style.display = "none";
    backBtn.style.display = "none";
}

/* =========================
   SPEAKING RECORDER
========================= */

let mediaRecorder;
let audioChunks = [];
let analyser, audioCtx, source, animationId;

async function startRecording(){
    const status = document.getElementById("recStatus");
    status.innerText = "Recording...";

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioCtx = new AudioContext();
    source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    drawWave();

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        const player = document.getElementById("playback");
        player.src = url;
        player.style.display = "block";

        status.innerText = "Recording saved. You can replay or re-record.";
    };

    mediaRecorder.start();
}

function stopRecording(){
    if(mediaRecorder){
        mediaRecorder.stop();
        cancelAnimationFrame(animationId);
    }
}

function resetRecording(){
    const player = document.getElementById("playback");
    player.src = "";
    player.style.display = "none";

    document.getElementById("recStatus").innerText = "Tap start and speak.";
}

/* =========================
   WAVE ANIMATION
========================= */
function drawWave(){
    const canvas = document.getElementById("waveCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = 90;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    function draw(){
        animationId = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = "#eef4ff";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#4f8cff";

        ctx.beginPath();

        let sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for(let i=0;i<bufferLength;i++){
            let v = dataArray[i] / 128.0;
            let y = v * canvas.height / 2;

            if(i === 0){
                ctx.moveTo(x,y);
            } else {
                ctx.lineTo(x,y);
            }

            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
    }

    draw();
}

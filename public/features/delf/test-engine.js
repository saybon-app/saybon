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

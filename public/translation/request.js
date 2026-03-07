let selectedPlan=null

document.getElementById("standardCard").onclick=()=>{
selectedPlan="standard"
document.getElementById("continueBtn").style.display="block"
}

document.getElementById("expressCard").onclick=()=>{
selectedPlan="express"
document.getElementById("continueBtn").style.display="block"
}

document.getElementById("continueBtn").onclick=()=>{

const words=parseInt(
document.getElementById("wordCount")
.innerText.replace(/\D/g,'')
)

window.location.href =
"/translation/job.html?plan="+selectedPlan+"&words="+words

}

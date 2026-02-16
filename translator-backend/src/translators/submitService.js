module.exports = function submit(jobId, translatorId, text){

return {

jobId,

translatorId,

text,

time: Date.now()

}

}

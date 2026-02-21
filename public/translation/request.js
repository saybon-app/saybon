<script>

async function uploadFile(){

const fileInput=document.getElementById("file");

const file=fileInput.files[0];

const formData=new FormData();

formData.append("file",file);

const response=await fetch(

"https://saybon-backend.onrender.com/api/quote",

{
method:"POST",
body:formData
}

);

const data=await response.json();

console.log(data);

}

</script>

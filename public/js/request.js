
function getTimelineStandard(words){

if(words<=300)return "1 � 3 hours";

if(words<=1000)return "3 � 6 hours";

if(words<=3000)return "6 � 12 hours";

if(words<=6000)return "12 � 24 hours";

if(words<=10000)return "24 � 48 hours";

if(words<=20000)return "2 � 4 days";

return "Custom";

}



function getTimelineExpress(words){

if(words<=300)return "30 � 60 minutes";

if(words<=1000)return "1 � 3 hours";

if(words<=3000)return "3 � 6 hours";

if(words<=6000)return "6 � 12 hours";

if(words<=10000)return "12 � 24 hours";

if(words<=20000)return "24 � 48 hours";

return "Custom";

}




function getQuote(){


var file=document.getElementById("fileInput").files[0];

if(!file){alert("Select file");return;}


var reader=new FileReader();


reader.onload=function(e){




var words=e.target.result.split(/\s+/).length;



var standardPrice=(words*0.025).toFixed(2);

var expressPrice=(words*0.05).toFixed(2);


var standardTime=getTimelineStandard(words);

var expressTime=getTimelineExpress(words);



document.getElementById("quoteArea").innerHTML=

<p> words</p>


<div class="quote-option standardQuote"

onclick="goPay('standard',,'',)">


Standard � public\css\request.css{standardPrice}

<br>



</div>



<div class="quote-option-option expressQuote"

onclick="goPay('express',,'',)">

Express � public\css\request.css{expressPrice}

<br>



</div>

;



};



reader.readAsText(file);



}



function goPay(type,price,time,words){


window.location.href=

/translation/payment.html?

type=

&price=

&time=

&words=;


}
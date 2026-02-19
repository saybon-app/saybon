const API_URL = "https://saybon-backend.onrender.com/request";



async function requestTranslation(file, serviceType = "standard")
{

    try
    {

        if (!file)
        {

            alert("Please select a file");

            return;

        }



        const formData = new FormData();

        formData.append("file", file);

        formData.append("serviceType", serviceType);



        const response = await fetch(API_URL,
        {

            method: "POST",

            body: formData

        });



        const data = await response.json();



        if (!response.ok)
        {

            alert(data.message || "Request failed");

            return;

        }



        displayPricing(data);



    }
    catch (error)
    {

        console.log(error);

        alert("Server error");

    }

}





function displayPricing(data)
{

    document.getElementById("wordCount").innerText =
        data.words;


    document.getElementById("standardPrice").innerText =
        "$" + data.standardPrice;


    document.getElementById("expressPrice").innerText =
        "$" + data.expressPrice;



    document.getElementById("pricingSection").style.display =
        "block";

}





document
.getElementById("fileInput")
.addEventListener("change", function()
{

    const file = this.files[0];

    requestTranslation(file);

});

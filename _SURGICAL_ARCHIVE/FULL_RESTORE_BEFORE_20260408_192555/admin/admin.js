async function loadOrders(){


const response=await fetch(

"https://saybon-backend.onrender.com/admin/orders"

);


const data=await response.json();


const table=

document.querySelector("#ordersTable tbody");


data.orders.forEach(order=>{


const row=document.createElement("tr");


row.innerHTML=`

<td>${order.email}</td>

<td>${order.filename}</td>

<td>${order.words}</td>

<td>$${order.price}</td>

<td>${order.status}</td>

<td>

<a href="${order.fileUrl}" target="_blank">

Download

</a>

</td>

`;


table.appendChild(row);


});


}


loadOrders();

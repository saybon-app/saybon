const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();


async function createOrder(data){

await db.collection("translationOrders").add({

email:data.email,

words:data.words,

plan:data.plan,

amount:data.amount,

currency:data.currency,

status:"paid",

created:new Date()

});

}

module.exports = createOrder;


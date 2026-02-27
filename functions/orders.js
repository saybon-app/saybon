
const admin=require("firebase-admin")

admin.initializeApp()

module.exports=async(order)=>{

await admin.firestore()

.collection("translationOrders")

.add({

email:order.email,

words:order.words,

plan:order.plan,

amount:order.amount,

provider:order.provider,

status:"paid",

created:new Date()

})

}

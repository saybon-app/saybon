const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const Stripe = require('stripe');

admin.initializeApp();

const db = admin.firestore();

const app = express();
app.use(express.json());

const stripe = new Stripe(functions.config().stripe.secret);

app.post('/pay/stripe', async (req, res) => {

try {

const { email, words, plan, amount } = req.body;

const session = await stripe.checkout.sessions.create({

payment_method_types: ['card'],

mode: 'payment',

customer_email: email,

line_items: [
{
price_data: {
currency: 'usd',
product_data: {
name: 'SayBon Translation'
},
unit_amount: Math.round(amount * 100)
},
quantity: 1
}
],

success_url:
'https://saybonapp.com/translation/success.html',

cancel_url:
'https://saybonapp.com/translation/payment.html'

});


await db.collection('translationOrders').add({

email,
words,
plan,
amount,
provider: 'stripe',
status: 'paid',
created: new Date()

});


res.json({
url: session.url
});

}

catch(e){

console.log(e);
res.status(500).send('error');

}

});



app.post('/pay/paystack', async (req, res) => {

try {

const { email, words, plan, amount } = req.body;

await db.collection('translationOrders').add({

email,
words,
plan,
amount,
provider: 'paystack',
status: 'paid',
created: new Date()

});

res.json({
url:
'https://saybonapp.com/translation/success.html'
});

}

catch(e){

res.status(500).send('error');

}

});


exports.api = functions.https.onRequest(app);
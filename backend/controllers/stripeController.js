import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();


/*
========================================
INIT STRIPE
========================================
*/

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



/*
========================================
CREATE STRIPE SESSION
========================================
*/

export const createStripeSession = async (req, res) => {

    try {

        const { amount, type, currency } = req.body;


        /*
        ================================
        VALIDATION
        ================================
        */

        if (!amount) {

            return res.status(400).json({

                success: false,

                message: "Amount required"

            });

        }



        /*
        ================================
        FORMAT
        ================================
        */

        const formattedAmount = Math.round(Number(amount) * 100);


        const selectedCurrency = currency
            ? currency.toLowerCase()
            : "usd";



        /*
        ================================
        CREATE SESSION
        ================================
        */

        const session = await stripe.checkout.sessions.create({

            mode: "payment",

            payment_method_types: [

                "card"

            ],


            line_items: [

                {

                    price_data: {

                        currency: selectedCurrency,


                        product_data: {

                            name:

                                "SayBon Translation (" +

                                type +

                                ")"

                        },


                        unit_amount: formattedAmount

                    },


                    quantity: 1

                }

            ],



            success_url:

                "https://saybonapp.com/success.html",



            cancel_url:

                "https://saybonapp.com/translation/payment.html"

        });



        /*
        ================================
        RETURN URL
        ================================
        */

        res.json({

            success: true,

            url: session.url

        });

    }



    catch (error) {


        console.log(error);


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
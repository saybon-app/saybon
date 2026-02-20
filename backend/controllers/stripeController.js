import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {

    console.error("❌ STRIPE_SECRET_KEY missing from .env");

    process.exit(1);

}

const stripe = new Stripe(stripeSecretKey);


export const createStripeSession = async (req, res) => {

    try {

        const { amount } = req.body;

        if (!amount) {

            return res.status(400).json({
                success: false,
                message: "Amount required"
            });

        }

        const session = await stripe.checkout.sessions.create({

            payment_method_types: ["card"],

            mode: "payment",

            line_items: [

                {

                    price_data: {

                        currency: "usd",

                        product_data: {

                            name: "SayBon Translation"

                        },

                        unit_amount: amount

                    },

                    quantity: 1

                }

            ],

            success_url: "https://saybonapp.com/success",

            cancel_url: "https://saybonapp.com/cancel"

        });


        res.json({

            success: true,

            url: session.url

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Stripe error"

        });

    }

};

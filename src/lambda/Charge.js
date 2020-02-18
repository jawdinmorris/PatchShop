const dotenv = require('dotenv');
dotenv.config();
const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET); // add your secret key here

exports.handler = (event, context, callback) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return callback(null, {
            statusCode: 405,
            body: 'Method Not Allowed'
        });
    }

    const data = JSON.parse(event.body);

    if (!data.token || parseInt(data.amount) < 1) {
        return callback(null, {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Some required fields were not supplied.',
            }),
        });
    }

    stripe.charges
        .create({
            amount: parseInt(data.amount),
            currency: 'aud',
            description: 'This is the new test',
            source: data.token,
            metadata: {
                full_name: data.name,
                email: data.email,
                billing_address: data.billing_address,
                items_purchased: data.items_purchased
            }
        })
        .then(({
            status
        }) => {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    status
                }),
            });
        })
        .catch(err => {
            return callback(null, {
                statusCode: 400,
                body: JSON.stringify({
                    message: `Error: ${err.message}`,
                }),
            });
        });
};
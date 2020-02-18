import React, { useState } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';
import './CheckoutForm.css';

function CheckoutForm({ stripe, totalCost, itemsInCart }) {
    const [status, setStatus] = useState('default');

    const submit = async e => {
        e.preventDefault();

        setStatus('submitting');

        try {
            let setName = document.getElementById("fullName").value;
            let setEmail = document.getElementById("emailAddress").value;
            let setBillingAddress = document.getElementById("streetOne").value + " " +
                document.getElementById("streetTwo").value + " " +
                document.getElementById("city").value + " " +
                document.getElementById("state").value + " " +
                document.getElementById("postCode").value;
            let itemsArray = ""
            itemsInCart.map(item => (itemsArray = itemsArray + item.title + " X " + item.quantity + ", "));
            let { token } = await stripe.createToken({ name: setName });

            let testBody = JSON.stringify({
                amount: totalCost * 100,
                token: token.id,
                email: setEmail,
                name: setName,
                billing_address: setBillingAddress,
                items_purchased: itemsArray
            });
            console.log(testBody);



            let response = await fetch('/.netlify/functions/charge', {
                method: 'POST',
                body: JSON.stringify({
                    amount: totalCost * 100,
                    token: token.id,
                    email: setEmail,
                    name: setName,
                    billing_address: setBillingAddress,
                    items_purchased: itemsArray
                }),
            });

            if (response.ok) {
                setStatus('complete');
            } else {
                throw new Error('Network response was not ok.');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    if (status === 'complete') {
        return <div className="CheckoutForm-complete">Payment successful! You will receive an email shortly requesting your address and advising delivery date.</div>;
    }

    return (
        <form className="CheckoutForm" onSubmit={submit}>
            <h4>Would you like to complete the purchase?</h4>
            <CardElement />
            <label className='StripeLabelLabel'>
                Name:
            <input
                    id="fullName"
                    className="StripeLabel"
                    type="text"
                    placeholder="John Smith"
                />
            </label>
            <label
                className='StripeLabelLabel'
            >
                Email:
            <input
                    id="emailAddress"
                    className="StripeLabel"
                    type="text"
                    placeholder="johhsmith@tardis.com"
                />
            </label>
            <label
                className='StripeLabelLabel'
            >
                Street Address 1:
            <input
                    id="streetOne"
                    className="StripeLabel"
                    type="text"
                    placeholder="1 ABC Lane"
                />
            </label>
            <label
                className='StripeLabelLabel'
            >
                Street Address 2:
            <input
                    id="streetTwo"
                    className="StripeLabel"
                    type="text"
                    placeholder=""
                />
            </label>
            <label
                className='StripeLabelLabel'
            >
                City:
            <input
                    id="city"
                    className="StripeLabel"
                    type="text"
                    placeholder="Villetowns"
                />
            </label>
            <label
                className='StripeLabelLabel'
            >
                State:
            <input
                    id="state"
                    className="StripeLabel"
                    type="text"
                    placeholder="ACT"
                />
            </label>
            <label
                className='StripeLabelLabel'
            >
                Post Code:
            <input
                    id="postCode"
                    className="StripeLabel"
                    type="text"
                    placeholder="1234"
                />
            </label>
            <button
                className="CheckoutForm-button"
                type="submit"
                disabled={status === 'submitting'}
            >
                {status === 'submitting' ? 'Submitting' : 'Submit Order'}
            </button>
            {status === 'error' && (
                <div className="CheckoutForm-error">Something went wrong.</div>
            )}
        </form>
    );
}

export default injectStripe(CheckoutForm);
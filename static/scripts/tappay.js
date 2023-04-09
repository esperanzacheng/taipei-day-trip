TPDirect.setupSDK(126968, "app_NT7RusBZrRieGDPQ0KRdJlOYX10FXZqeJRM25KPTCplfUml1LwJu0OCYN2hl", 'sandbox');

let fields = {
    number: {
        element: document.getElementById('card-number'),
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: document.getElementById('card-ccv'),
        placeholder: 'ccv'
    }
}

TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray'
        },
        // style focus state
        ':focus': {
            'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },

    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})

TPDirect.card.onUpdate(function (update) {
    update.canGetPrime === true
    let submitButton = document.getElementById("checkout-button");
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        submitButton.setAttribute('disabled', true)
    }
})

const checkoutButton = document.getElementById("checkout-button");
checkoutButton.addEventListener("click", onSubmit);

function onSubmit(event) {
    event.preventDefault()

    // Get TapPay Fields  status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // Check can getPrime
    if (tappayStatus.canGetPrime === false) {
        console.log('can not get prime')
        return
    }

    // check user's input
    checkInputAndSubmit();
}

function checkInputAndSubmit() {
    let url = '/api/orders';
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const phone = document.getElementById("contact-phone").value;
    if (name && email && phone) {
        // get prime
        TPDirect.card.getPrime((result) => {
            if (result.status !== 0) {
                console.log('get prime error ' + result.msg)
                return
            }
            // create order and charge fee
            fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "prime": result.card.prime,
                    "order": {
                        "price": attraction["price"],
                        "trip": {"attraction": attraction["attraction"]},
                        "date": attraction["date"],
                        "time": attraction["time"]
                    },
                    "contact": {
                        "name": name,
                        "email": email,
                        "phone": phone
                    }
                })
            })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                const checkoutAlert = document.getElementById("checkout-alert");
                const inputAlert = document.getElementById("input-alert");
                const formatAlert = document.getElementById("input-format-alert");
                if (data["data"]) {
                    window.location = `/thankyou?number=${data["data"]["number"]}`;
                } else if (data["message"] == "Provided email is not an email address" || data["message"] == "Provided phone is not a phone number") {
                    formatAlert.style.display = "block";
                    checkoutAlert.style.display = "none";
                    inputAlert.style.display = "none";
                } else {
                    checkoutAlert.style.display = "block";
                    formatAlert.style.display = "none";
                    inputAlert.style.display = "none";
                }
            })
            .catch((error) => {
                return error;
            })
        })
    } else {
        const inputAlert = document.getElementById("input-alert");
        const checkoutAlert = document.getElementById("checkout-alert");
        const formatAlert = document.getElementById("input-format-alert");
        inputAlert.style.display = "block";
        checkoutAlert.style.display = "none";
        formatAlert.style.display = "none";
    }
}
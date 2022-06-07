
var modalSuccess = {
    Title: "Payment success",
    Message: "You have successfully made a purchase via paypal",
    Type: "modal-success",
    Icon: "fas fa-check",
    Button: "btn-success"
}
var modalError = {
    Title: "Payment error",
    Message: "An error occured before your transaction finished, try another attempt to complete your purchase",
    Type: "modal-danger",
    Icon: "fas fa-ban",
    Button: "btn-danger"
}

const getApiBaseUrl = async () => {
    const response = await fetchConfig();
    const config = await response.json();
    let app_urls = (location.hostname === "localhost") ? "dev_urls" : "prod_urls";
    const app_url = config[app_urls];
    const apiBaseUrl = app_url.api_url;
    return apiBaseUrl;
};

async function ShowPayPalButton() {

    const apiBaseUrl = await getApiBaseUrl();

    setTimeout(function () {

        paypal.Button.render({
            env: 'sandbox', // Or 'production'
            // Set up the payment:
            // 1. Add a payment callback

            payment: function (data, actions) {
                // 2. Make a request to your server
                var cartDetail = GetFromLocalStorege("CartDetail");
                var token = GetFromLocalStorege("authToken");
                var authorization = `Bearer ${token}`;
                return actions.request.post(apiBaseUrl + '/api/paypal/createpayment/', {
                    "orderId": "noid",
                    "cartDetail": cartDetail
                },
                    {
                        "headers": {
                            "Authorization": authorization
                        }
                    })
                    .then(function (res) {
                        return res.id;
                    });
            },
            // Execute the payment:
            // 1. Add an onAuthorize callback
            onAuthorize: function (data, actions) {
                // 2. Make a request to your server
                var cartDetail = GetFromLocalStorege("CartDetail");
                var token = GetFromLocalStorege("authToken");
                var authorization = `Bearer ${token}`;
                return actions.request.post(apiBaseUrl + '/api/paypal/executepayment/', {
                    "orderId": data.orderID,
                    "cartDetail": cartDetail
                },
                    {
                        "headers": {
                            "Authorization": authorization
                        }
                    })
                    .then(function (res) {
                        if (res.status === "success") {
                            removeBuyingItemsFromCart();
                            showModalDialog(JSON.stringify(modalSuccess));
                        } else {
                            showModalDialog(JSON.stringify(modalError));
                        }
                    });
            }
        }, '#paypal-button');


    }, 1000);

};
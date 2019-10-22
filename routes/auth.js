const express = require('express');
router = express.Router();
BigCommerce = require('node-bigcommerce');
const https = require('https');

const bigCommerce = new BigCommerce({
    clientId: 'ne9vzqqdj8x8rxni55z6j2c361zlfdd',
    secret: 'e05b823ba6560820a8f77a451f214dba3a77534e5feb295de826b8ae7ee17924',
    callback: 'https://48732815.ngrok.io/auth',
    responseType: 'json'
});

router.get('/', (req, res, next) => {
    var db = req.db;
    var websiteKey;
    var accessToken;
    var webhookID;
    var myPromise = function (websiteKey, accessToken,webhookID) {
        return new Promise(function (resolve, reject) {
            //do something, fetch something....
            //you guessed it, mongo queries go here.
            db.collection('usercollection').update({ "websiteKey": websiteKey }, {
                $set: {
                    "publicKey": "",
                    "secretKey": "",
                    "websiteKey": websiteKey,
                    "accessToken": accessToken,
                    "webhookID": webhookID
                }
            }, { upsert: true })
                .then(function (res) {
                    resolve(res);
                    console.log("xxx");
                })
            //I can continue to process my result inside my promise
            if (false) { reject('aasdasdas'); }

        });
    }
    bigCommerce.authorize(req.query)
        .then(function (data) {

            console.log(data['user']['username']);
            var contextArray = data['context'].split("/");
            console.log(contextArray[1]);
            console.log("+++++++++++++++++++++");

            websiteKey = contextArray[1];
            accessToken = data['access_token'];

            const webhookRegisterData = JSON.stringify({
                scope: "store/order/statusUpdated",
                destination: "https://48732815.ngrok.io/webhooks",
                is_active: true
            })

            const webhookOptions = {
                hostname: 'api.bigcommerce.com',
                path: `/${data['context']}/v2/hooks/`,
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Auth-Token': accessToken,
                    'X-Auth-Client': 'rnocx3o086g0zb0py2d9i9d8v6jxnha'
                }
            }

            const reqWebhook = https.request(webhookOptions, resWebhook => {
                console.log(`statusCode: ${resWebhook.statusCode}`)

                resWebhook.on('data', resData => {
                    process.stdout.write(resData);
                    const resWebhookData = (JSON.parse(resData));
                    console.log(resWebhookData);

                    webhookID = resWebhookData.id

                    console.log('******************************************');
                    console.log(webhookID);

                    myPromise(websiteKey, accessToken, webhookID).then(function (value) {
                        console.log(data);
                        console.log(value);


                        const jQueryScriptData = JSON.stringify({
                            name: "jQuery",
                            description: "This script loads jQuery library to checkout page",
                            html: "<script src='https://code.jquery.com/jquery-3.3.1.min.js' integrity='sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=' crossorigin='anonymous'></script>",
                            auto_uninstall: true,
                            load_method: "default",
                            location: "head",
                            visibility: "checkout",
                            kind: "script_tag"
                        })
                        const checkoutScriptData = JSON.stringify({
                            name: "Validage checkout",
                            description: "Pop-up age validation for checkout",
                            html: "<script src='https://cloud.validage.com/cache/BigCommerce.js' type='text/javascript'></script>",
                            //html: "<script></script>",
                            auto_uninstall: true,
                            load_method: "default",
                            location: "head",
                            visibility: "checkout",
                            kind: "script_tag"
                        })

                        const scriptOptions = {
                            hostname: 'api.bigcommerce.com',
                            path: `/${data['context']}/v3/content/scripts`,
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'X-Auth-Token': accessToken,
                                'X-Auth-Client': 'rnocx3o086g0zb0py2d9i9d8v6jxnha'
                            }
                        }

                        const reqScript2 = https.request(scriptOptions, res => {
                            console.log(`statusCode: ${res.statusCode}`)
                            res.on('data', d => {
                                process.stdout.write(d)
                            })
                        })

                        reqScript2.on('error', error => {
                            console.error(error)
                        })
                        reqScript2.write(jQueryScriptData)
                        reqScript2.end()

                        const reqScript3 = https.request(scriptOptions, res => {
                            console.log(`statusCode: ${res.statusCode}`)

                            res.on('data', d => {
                                process.stdout.write(d)
                            })
                        })

                        reqScript3.on('error', error => {
                            console.error(error)
                        })
                        reqScript3.write(checkoutScriptData)
                        reqScript3.end()


                        res.render('auth', { title: ['Valid', 'Age'] })
                    });

                })
            })

            reqWebhook.on('error', error => {
                console.error(error)
            })
            reqWebhook.write(webhookRegisterData)
            reqWebhook.end()

        })
        .catch(next);
});
module.exports = router;

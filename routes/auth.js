const express = require('express');
router = express.Router();
BigCommerce = require('node-bigcommerce');
const https = require('https');

const bigCommerce = new BigCommerce({
    clientId: 'ne9vzqqdj8x8rxni55z6j2c361zlfdd',
    secret: 'e05b823ba6560820a8f77a451f214dba3a77534e5feb295de826b8ae7ee17924',
    callback: 'https://fc64c7de.ngrok.io/auth',
    responseType: 'json'
});

router.get('/', (req, res, next) => {
    var db = req.db;
    var websiteKey;
    var accessToken;
    var myPromise = function (websiteKey, accessToken) {
        return new Promise(function (resolve, reject) {
            //do something, fetch something....
            //you guessed it, mongo queries go here.
            db.collection('usercollection').update({ "websiteKey": websiteKey }, {
                $set: {
                    "publicKey": "publicKeyy",
                    "secretKey": "secretKey",
                    "websiteKey": websiteKey,
                    "accessToken": accessToken
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
        //.then(data => console.log(data['access_token']))
        .then(function (data) {

            console.log(data['user']['username']);
            var contextArray = data['context'].split("/");
            console.log(contextArray[1]);
            console.log("+++++++++++++++++++++");

            websiteKey = contextArray[1];
            accessToken = data['access_token'];
            myPromise(websiteKey, accessToken).then(function (value) {
                console.log(data);
                console.log(value);
                const webhookRegisterData = JSON.stringify({
                    scope: "store/order/statusUpdated",
                    destination: "https://fc64c7de.ngrok.io/",
                    is_active: true
                })

                const options = {
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

                const req = https.request(options, res => {
                    console.log(`statusCode: ${res.statusCode}`)

                    res.on('data', d => {
                        process.stdout.write(d)
                    })
                })

                req.on('error', error => {
                    console.error(error)
                })
                req.write(webhookRegisterData)
                req.end()

                res.render('auth', { title: ['Valid', 'Age'] })
            });


        })
        //.then(data => )
        .catch(next);
});
module.exports = router;





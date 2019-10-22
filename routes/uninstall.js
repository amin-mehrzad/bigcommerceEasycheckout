const express = require('express'),
    router = express.Router(),
    BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
    secret: 'e05b823ba6560820a8f77a451f214dba3a77534e5feb295de826b8ae7ee17924',
    responseType: 'json'
});
const https = require('https');

router.get('/', (req, next) => {
    try {
       
        // console.log('11******************************************');
        // console.log(req);
        // console.log('22******************************************');
        // console.log(req.query);
        // console.log('33******************************************');



       
    //     var websiteKey = data['store_hash']
        
    //     var db = req.db;
    //     var collection = db.get('usercollection');
    //     console.log('00******************************************');
    //    console.log(websiteKey);
    //     collection.find({ "websiteKey": websiteKey }, {}, function (e, doc) {
    //         var webhookID = doc[0].webhookID;
    //         var accessToken = doc[0].accessToken;

    //         const webhookOptions = {
    //             hostname: 'api.bigcommerce.com',
    //             path: `/stores/${websiteKey}/v2/hooks/${webhookID}`,
    //             method: 'DELETE',
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json',
    //                 'X-Auth-Token': accessToken,
    //                 'X-Auth-Client': 'rnocx3o086g0zb0py2d9i9d8v6jxnha'
    //             }
    //         }

    //         const reqWebhook = https.request(webhookOptions, resWebhook => {
    //             console.log(`statusCode: ${resWebhook.statusCode}`)

    //             resWebhook.on('data', resData => {
    //                 process.stdout.write(resData);
    //                 const resWebhookData = (JSON.parse(resData));
    //                 console.log(resWebhookData);

    //                 webhookID = resWebhookData.id

    //                 console.log('******************************************');
    //                 console.log(webhookID);

    //             })
    //         })

    //         reqWebhook.on('error', error => {
    //             console.error(error)
    //         })
    //        reqWebhook.write()
    //         reqWebhook.end()




    //     })
        const data = bigCommerce.verify(req.query['signed_payload']);
        
        console.log(data);
       // find
    } catch (err) {
        next(err);
    }
});

module.exports = router;
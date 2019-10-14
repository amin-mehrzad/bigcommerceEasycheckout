const express = require('express'),
    router = express.Router(),
    BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
    secret: 'e05b823ba6560820a8f77a451f214dba3a77534e5feb295de826b8ae7ee17924',
    responseType: 'json'
});




router.get('/', (req, res, next) => {
    try {
        const data = bigCommerce.verify(req.query['signed_payload']);


        console.log(data);

        global.websiteKey = data.store_hash;

        // Set our internal DB variable
        var db = req.db;

        // Set our collection
        var collection = db.get('usercollection');

        // Find website record
        collection.find({ websiteKey: global.websiteKey }, {}, function (e, doc) {
            console.log(doc[0]);

            keys = doc[0];

           // console.log(keys.websiteKey);

            // Get values frm DB
            if (typeof keys === 'undefined') {
                var secretKey = '';
                var publicKey = '';
            } else {
                var secretKey = keys.secretKey;
                var publicKey = keys.publicKey;
            }
            res.render('configuration', { title: "Validage Configuration", currentPublicKey: publicKey, currentSecretKey: secretKey, successAlert:"invisible"});

        });



    } catch (err) {
        next(err);
    }
});

module.exports = router;
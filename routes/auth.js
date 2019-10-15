const express = require('express');
router = express.Router();
BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
clientId: 'ne9vzqqdj8x8rxni55z6j2c361zlfdd',
secret: 'e05b823ba6560820a8f77a451f214dba3a77534e5feb295de826b8ae7ee17924',
callback: 'https://fc64c7de.ngrok.io/auth',
responseType: 'json'
});

router.get('/', (req, res, next) => {
    var db = req.db;
    var findKey;
    var myPromise = new Promise(function(resolve, reject) {
            
    
            //do something, fetch something....
            //you guessed it, mongo queries go here.
            db.collection('usercollection').find({"websiteKey": findKey })
            .then(function(res){
                resolve(res);
                console.log("xxx");
            })
            //I can continue to process my result inside my promise
             if(false) {reject('aasdasdas');}

        });

bigCommerce.authorize(req.query)
//.then(data => console.log(data['access_token']))
.then(function(data){
            console.log("asdasdasdasd");
            findKey = "global.websiteKey";
        myPromise.then(function(value){console.log(data);
    console.log(value)});

   
})
.then(data => res.render('auth', { title: 'Validage App Installed Successfully!' }))
.catch(next);
});
module.exports = router;



  
 
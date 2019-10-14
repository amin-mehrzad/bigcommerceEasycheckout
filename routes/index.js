var express = require('express');
var router = express.Router();

/* POST to Add User Service */
router.post('/addKey', function (req, res) {


  console.log(global.websiteKey);

  // Set our internal DB variable
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var secretKey = req.body.secretKey;
  var publicKey = req.body.publicKey;

  // Set our collection
  var collection = db.get('usercollection');

 // var keys = db.usercollection.find({ "websiteKey": global.websiteKey });
  collection.find({ websiteKey: global.websiteKey }, {}, function (e, doc) {
    console.log(doc[0]);

    keys = doc[0];

   // console.log(keys.websiteKey);
   // console.log(keys.publicKey);
   // console.log(typeof keys.websiteKey);

   // if (typeof keys.websiteKey === 'undefined' || ) {
  
      // Submit to the DB
      collection.update({"websiteKey": global.websiteKey },{$set: {
        "publicKey": publicKey,
        "secretKey": secretKey,
        "websiteKey": global.websiteKey                      ////// It Should Replace it if exist  else create it/////
      }},{upsert:true}, function (err, doc) {
        if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.");
          console.log(err);
        }
        else {
          // And forward to success page   
          res.render('configuration', { title: "Validage Configuration", currentPublicKey: publicKey, currentSecretKey: secretKey });
        }
      });
  
    // } else {
    //   res.render('configuration', { title: "Validage Configuration", currentPublicKey: publicKey, currentSecretKey: secretKey });
    // }

});





});




/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET configuration page. */
router.get('/output', function (req, res) {
  var db = req.db;
  var collection = db.get('usercollection');
  collection.find({}, {}, function (e, docs) {
    res.render('outputList', {
      "configuration": docs
    });
    console.log(docs);
  });

});


module.exports = router;

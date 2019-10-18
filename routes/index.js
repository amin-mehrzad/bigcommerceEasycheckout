var express = require('express');
var router = express.Router();
const https = require('https');

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
    const accessToken = keys.accessToken
    // console.log(keys.websiteKey);
    // console.log(keys.publicKey);
    // console.log(typeof keys.websiteKey);

    // if (typeof keys.websiteKey === 'undefined' || ) {

    // Submit to the DB
    collection.update({ "websiteKey": global.websiteKey }, {
      $set: {
        "publicKey": publicKey,
        "secretKey": secretKey,
        "websiteKey": global.websiteKey                      ////// It Should Replace it if exist  else create it/////
      }
    }, { upsert: true }, function (err, doc) {
      if (err) {
        // If it failed, return error
        res.send("There was a problem adding the information to the database.");
        console.log(err);
      }
      else {
        //Register Age verification Popup Script
        const popupScriptData = JSON.stringify({
          name: "Validage Pop-up",
          description: "Pop-up age verification for enter website",
          html: `<script src='https://cloud.validage.com/cache/${publicKey}.js' type='text/javascript'></script>`,
          auto_uninstall: true,
          load_method: "default",
          location: "head",
          visibility: "all_pages",
          kind: "script_tag"
        })
        const scriptOptions = {
          hostname: 'api.bigcommerce.com',
          path: `/stores/${global.websiteKey}/v3/content/scripts`,
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': accessToken,
            'X-Auth-Client': 'rnocx3o086g0zb0py2d9i9d8v6jxnha'
          }
        }

        const reqScript1 = https.request(scriptOptions, res => {
          console.log(`statusCode: ${res.statusCode}`)

          res.on('data', d => {
            process.stdout.write(d)
          })
        })

        reqScript1.on('error', error => {
          console.error(error)
        })
        reqScript1.write(popupScriptData)
        reqScript1.end()

        // And forward to success page   
        res.render('configuration', { title: "Validage Configuration", currentPublicKey: publicKey, currentSecretKey: secretKey, successAlert: "visible" });
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

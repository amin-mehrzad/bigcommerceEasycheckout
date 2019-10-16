var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//mongoDB
var monk = require('monk');
var db = monk('0.tcp.ngrok.io:19249/validage');

var auth = require('./routes/auth');
var load = require('./routes/load');
var uninstall = require('./routes/uninstall');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// Make our db accessible to our router
app.use(function (req, res, next) {
  req.db = db;
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use('/auth', auth);
app.use('/load', load);
app.use('/uninstall', uninstall);


var findStoreRecord = function (websiteKey) {
  return new Promise(function (resolve, reject) {
    //do something, fetch something....
    //you guessed it, mongo queries go here.
    db.collection('usercollection').find({ "websiteKey": websiteKey })
      .then(function (res) {
        resolve(res);
        // console.log("xxx");
      })
    //I can continue to process my result inside my promise
    if (false) { reject('aasdasdas'); }

  });
}





const https = require('https')





app.post('/addKey', function (req, res) {
  console.log('----------------------------------------------------------------------');
  console.log(req.body);
});


app.post('/', function (req, res) {
  console.log('----------------------------------------------------------------------');
  console.log(req.body);
  var orderid = req.body.data.id;
  var orderProducer = req.body.producer;
  splitedOrderProducer = orderProducer.split("/");
  var websiteKey = splitedOrderProducer[1];
  console.log(websiteKey);

  findStoreRecord(websiteKey).then(function (websiteData) {
    console.log(websiteData[0].accessToken);

    const orderOptions = {
      hostname: 'api.bigcommerce.com',
      path: `/${orderProducer}/v2/orders/${orderid}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': websiteData[0].accessToken,
        'X-Auth-Client': 'rnocx3o086g0zb0py2d9i9d8v6jxnha'
      }
    }
    const reqOrder = https.request(orderOptions, resp => {
      console.log(`statusCode: ${resp.statusCode}`)

      resp.on('data', d => {
        process.stdout.write(d)

        const orderData = JSON.parse(d);
        console.log(orderData)


        var cartToken = orderData.cart_id;
        var date = orderData.date_created;
        var totalPrice = orderData.total_inc_tax;
        var orderID = orderData.id;
        var orderStatus = orderData.status;
        var orderShippingAPI = orderData.shipping_addresses.resource

        console.log(orderShippingAPI);

        const shippingAddressOption = {
          hostname: 'api.bigcommerce.com',
          path: `/${orderProducer}/v2${orderShippingAPI}`,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': websiteData[0].accessToken,
            'X-Auth-Client': 'rnocx3o086g0zb0py2d9i9d8v6jxnha'
          }
        }
        const reqShippingAdd = https.request(shippingAddressOption, respo => {
          console.log(`statusCode: ${respo.statusCode}`)

          respo.on('data', shippingData => {
            process.stdout.write(shippingData)

            const shippingAddress = JSON.parse(shippingData);
            console.log(orderData.billing_address)


            const validageData = JSON.stringify({
              order: {
                order_number: orderID,
                order_status: orderStatus,
                order_date: date,
                order_total: totalPrice,
                order_data: orderData,
                order_billing: orderData.billing_address,
                order_shipping: shippingAddress[0]
              },

              session_id: cartToken,
              website_version: "BigCommerce",
              website_key: websiteData[0].publicKey
            })

            const validageOptions = {
              hostname: 'cloud.validage.com',
              path: '/person/easycheck_bigcommerce',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'authorization':`Bearer ${websiteData[0].secretKey}`
              }
            }

            const reqValidage = https.request(validageOptions, resp => {
              console.log(`statusCode: ${resp.statusCode}`)

              resp.on('data', d => {
                // resObj = JSON.parse(d);
                // code=resObj.code;
                // cyaCode=resObj.cya_code;
                // message=resObj.message;
                // cyaStatus=resObj.cya_status;
                // cyaMessage=resObj.cya_message;

                // state = d.order_status; //tag
                // status = d.order_message; //note

                process.stdout.write(d)


              })
            })
            reqValidage.on('error', error => {
              console.error(error)
            })


            reqValidage.write(validageData)
            reqValidage.end()



          })
        })
        reqShippingAdd.on('error', error => {
          console.error(error)
        })


        //reqOrder.write()
        reqShippingAdd.end()

      })
    })
    reqOrder.on('error', error => {
      console.error(error)
    })


    //reqOrder.write()
    reqOrder.end()








  });

});









// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

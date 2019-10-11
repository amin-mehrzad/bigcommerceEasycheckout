var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//mongoDB
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');

var auth = require('./routes/auth');
var load = require('./routes/load');
var uninstall = require('./routes/uninstall');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use('/auth', auth);
app.use('/load', load);
app.use('/uninstall', uninstall);





// var orderid;
var orderProducer;




// if(typeof orderid !== 'undefined' || orderid !== null){
//   console.log('------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!----------------'); 

// app.get(`https://api.bigcommerce.com/${orderProducer}/v2/orders/${orderid}`, function (req, res) {
//   console.log(req);
// });
// }



const https = require('https')

const data = JSON.stringify({
  scope: "store/order/statusUpdated",
  destination: "https://409e4de0.ngrok.io/",
  is_active: true
})

const options = {
  hostname: 'api.bigcommerce.com',
  path: '/stores/dvaj2lzwfc/v2/hooks/',
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Auth-Token': 'sfbv9bokthgc9t7wnuzwgfet6n6x63z',
    'X-Auth-Client': 'rnocx3o086g0zb0py2d9i9d8v6jxnha'
  }
}








app.post('*', function (req, res) {
  console.log('----------------------------------------------------------------------');
  console.log(req.body);
  var orderid = req.body.data.id;
  var orderProducer = req.body.producer;
  console.log(orderProducer);
  const orderOptions = {
    hostname: 'api.bigcommerce.com',
    path: `/${orderProducer}/v2/orders/${orderid}`,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': 'sfbv9bokthgc9t7wnuzwgfet6n6x63z',
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

      const validageData = JSON.stringify({
        order: {
          id: orderID,
          tags: "hold",
          note: "Pending veification",
          created_at: date,
          total_price: totalPrice,
          order_data: orderData
        },
  
        session_id: cartToken,
        website_version: "BigCommerce"
      })
  
      const validageOptions = {
        hostname: 'cloud.validage.com',
        path: '/person/easycheck_bigcommerce',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
  reqOrder.on('error', error => {
    console.error(error)
  })


  //reqOrder.write()
  reqOrder.end()

});


const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})


req.write(data)
req.end()





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

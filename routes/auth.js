const express = require('express');
router = express.Router();
BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
clientId: 'ne9vzqqdj8x8rxni55z6j2c361zlfdd',
secret: 'e05b823ba6560820a8f77a451f214dba3a77534e5feb295de826b8ae7ee17924',
callback: 'https://409e4de0.ngrok.io/auth',
responseType: 'json'
});

router.get('/', (req, res, next) => {
bigCommerce.authorize(req.query)
.then(data => console.log(data))
.then(data => res.render('auth', { title: 'Authorized!' })
.catch(err));
});
module.exports = router;
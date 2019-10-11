const express = require('express'),
router = express.Router(),
BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
secret: 'e05b823ba6560820a8f77a451f214dba3a77534e5feb295de826b8ae7ee17924',
responseType: 'json'
});

router.get('/', (req, next) => {
try {
const data = bigCommerce.verify(req.query['signed_payload']);
console.log(data);
} catch (err) {
next(err);
}
});

module.exports = router;
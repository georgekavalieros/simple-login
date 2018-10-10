const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.session.destroy(function(err) {
        if(err) throw err;
        res.render('index', {});
    });
});

module.exports = router;

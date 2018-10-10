const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');

const router = express.Router();

let url = "mongodb://localhost:27017/";

let code = Math.floor((Math.random() * 1000000)).toString();
code = bcrypt.hashSync(code, 10);
code = Buffer.from(code, 'utf8').toString('hex');
let sess;

/* GET login page. */
router.get('/', function(req, res, next) {
    res.render('login', {
        msg: ''
    });
});

router.post('/', function (req, res, next) {
    sess = req.session;

    mongoClient.connect(url, function (err, db) {
        let dbo = db.db('PandaDb');
        dbo.collection("users").findOne({username: req.body.Username}, function (err, result) {
            if(err) throw err;
            if(result.username === req.body.Username && bcrypt.compareSync(req.body.Password, result.password)) {

                /** Setting SESSION parameters */
                sess.secret = code;
                sess.cookie = {
                    secure: true
                };
                sess.email = result.email;
                sess.username = result.username;

                res.redirect('/profile');

            }else {
                res.render('login', {
                    msg: 'invalid username or password.'
                });
            }
        });


    });
});

module.exports = router;
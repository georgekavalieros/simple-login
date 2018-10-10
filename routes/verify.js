const userSettings = require('./register');
const express = require('express');
const mongoClient = require('mongodb').MongoClient;

let router = express.Router();

let url = "mongodb://localhost:27017/";

/** GET verification page. */
router.get('/:Id', function(req, res, next) {
    if(req.params.Id===userSettings.userSettings.id) {
        mongoClient.connect(url, function (err, db) {
            let dbo = db.db('PandaDb');
            dbo.collection("users").insertOne({username: userSettings.userSettings.username, password: userSettings.userSettings.password, email: userSettings.userSettings.email});
            res.render('verify', {
                msg: 'Email verified successfully'
            });
        });
    }else {
        res.render('verify', {
            msg: 'Error in Email verification'
        });
    }
});

module.exports = router;
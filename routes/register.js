const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const request = require('request');
const nodemailer = require("nodemailer");

/**reCAPTCHA secret key*/
var secretKey = "6Lf-GSMTAAAAAO5Lvtd7mWPiDXnnl0tG4ZQK-ZK1";

var router = express.Router();

var url = "mongodb://localhost:27017/";

const transporter  = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "PandaEyesBot@gmail.com",
        pass: "Iamabot123!"
    }
});

/** GET register page. */
router.get('/', function(req, res, next) {
    res.render('register', {
        msg: '',
        usrmsg: '',
        emailmsg: '',
        code: ''
    });
});

/** POST data from the registration form */
router.post('/', function (req, res, next) {
    mongoClient.connect(url, function (err, db) {
        let dbo = db.db('PandaDb');

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.Password, salt);


       dbo.collection("users").findOne({username: req.body.Username}, async function (err, result) {
            if(err) throw err;

            console.log(result);
           /** Checks if username doesn't exist(==undefined)*/
           if(result===null) {

               /** Requires to select reCAPTCHA */
               if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
                   res.render('register', {
                       msg: 'Please select reCAPTCHA',
                       usrmsg: '',
                       emailmsg: '',
                       code: ''
                   });
               }

               /**  Checks for reCAPTCHA verification*/
               let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
               request(verificationUrl, function(err, res2, body) {
                   body = JSON.parse(body);
                   if(body.success !== undefined && !body.success) {
                       res.render('register', {
                           msg: "Failed reCAPTCHA verification.",
                           usrmsg: '',
                           emailmsg: '',
                           code: ''
                       });
                   }
               });

               /**
                *  EMAIL VERIFICATION
                *  */
               let code = Math.floor((Math.random() * 1000000)).toString();
               code = bcrypt.hashSync(code, 10);
               code = Buffer.from(code, 'utf8').toString('hex');
               let link = req.protocol+'://'+req.get('host')+'/verify/'+code;


               /** Setting the Email options */
               let mailOptions = {
                   from: 'PandaEyesBot@gmail.com',
                   to: req.body.Email,
                   subject: 'Email verification',
                   html: 'Greetings <b>'
                   + req.body.Username
                   + '</b>,<br> To verify your Email please click on the link below: <br><a href="'
                   + link
                   + '">'
                   + link
                   + '</a>'
               };

               /** Sending the Email with a verification code */
               transporter.sendMail(mailOptions, function(err, info) {
                   if(err) throw err;
               });

               /** Used at verify.js*/
               module.exports.userSettings =  {username: req.body.Username, password: hash, email: req.body.Email, id:  code};
               res.render('register', {
                   msg: '',
                   usrmsg: '',
                   code: '',
                   emailmsg: 'Please go to your email to validate your email address'
               });

           } else {
               res.render('register', {
                   usrmsg: 'Username already exists.',
                   msg: '',
                   emailmsg: '',
                   code: ''
               });
           }
        });
    });
});

module.exports = router;

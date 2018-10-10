const express = require('express');
const mongoClient = require('mongodb').MongoClient;

const router = express.Router();

let url = "mongodb://localhost:27017/";
let sess;

var Router = function(io) {

    /* GET profile page. */
    router.get('/', function(req, res, next) {
        sess = req.session;
        if(sess.username === undefined) {
            res.redirect('/');
        }else {
            mongoClient.connect(url, function(err, db) {
                let dbo = db.db('PandaDb');
                dbo.collection("users").findOne({username: sess.username}, function (err, result) {
                    dbo.collection("users").update({username: sess.username}, {$set:{session: sess}});
                    res.render('profile', {
                        msg: sess.username
                    });
                });
            });
        }
    });

    // socket.io events
    io.on( "connection", function( socket ) {
        console.log( "A user connected" );
        socket.on('msg', function(msg) {
            let date = new Date();
            date = ' (' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ')';
            socket.emit('user',sess.username + date);
            socket.emit('show',msg);
        });

        socket.on('disconnect', function (data) {
            console.log('user disconnected');
        });
    });

    return router;

};

module.exports = Router;


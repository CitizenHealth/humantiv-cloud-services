const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const request = require('request');
const buildFunctions = require('./build');

admin.initializeApp(functions.config().firebase);

//Endpoint for specified 'authURL'
exports.humanAPITokenExchange = functions.https.onRequest((req, res) => {

    console.log(`humanAPITokenExchange = ${JSON.stringify(req.body)}`);
    var sessionTokenObject = req.body;
    sessionTokenObject.clientSecret = '1de96f660418ba961d6f2de259f01aaed5da3445';
  
    request({
      method: 'POST',
      uri: 'https://user.humanapi.co/v1/connect/tokens',
      json: sessionTokenObject
    }, (err, resp, body) => {
        if(err) {
            console.log(`error = ${err}`);
            return res.send(422);
        }
  
         //Use these values to determine which user launched Connect
        console.log("clientId ="+ body.clientId);
  
        /* Human API credentials. 
        Save these with the user model in your system. */
        console.log("humanId = " + body.humanId);
        console.log("accessToken = "+ body.accessToken);
        console.log("publicToken = "+ body.publicToken);
  
  
        //Send back publicToken to app
        var responseJSON = {publicToken: body.publicToken};
  
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send(JSON.stringify(responseJSON));
      });
  });

exports.buildSlackNotification = functions.https.onRequest((req, res) => {
    console.log(`buildSlackNotification = ${JSON.stringify(req.body)}`);
 
    buildFunctions.slackNotification(req,res);
});

// Webhook for Nevercode to send a Slack notification when a 
// Humantiv app build is succesful
const request = require('request');

exports.humanAPIHandshake = function(req, res, database, callback) {
    
    var sessionTokenObject = req.body;
    sessionTokenObject.clientSecret = '1de96f660418ba961d6f2de259f01aaed5da3445';
    
    request({
        method: 'POST',
        uri: 'https://user.humanapi.co/v1/connect/tokens',
        json: sessionTokenObject
    }, (err, resp, body) => {
        if(err) {
            console.log(`error = ${err}`);
            callback(false);
            return;
        }

        //Use these values to determine which user launched Connect
        console.log("clientId ="+ body.clientId);

        /* Human API credentials. 
        Save these with the user model in your system. */
        console.log("humanId = " + body.humanId);
        console.log("accessToken = "+ body.accessToken);
        console.log("publicToken = "+ body.publicToken);


        // Write the 
        database.ref('humanapi/' + body.publicToken)
        .set({
            humanId: body.humanId,
            accessToken: body.accessToken
        })
        .then(() => {
            console.log("humanapi write succeeded");
            return 1;
        })
        .catch((error) => {
            console.log(`humanapi error: ${error}`);
            return 0;
        });

        //Send back publicToken to app
        var responseJSON = {
            humanId: body.humanId,
            accessToken: body.accessToken,
            publicToken: body.publicToken
        };

//        console.log("Response = "+ responseJSON);
        callback(true, responseJSON);
        return;
    });
}
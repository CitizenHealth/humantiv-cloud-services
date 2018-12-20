// Webhook for Nevercode to send a Slack notification when a 
// Humantiv app build is succesful
const admin = require('firebase-admin');
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
            //Send back publicToken to app
            var responseJSON = {
              humanId: body.humanId,
              accessToken: body.accessToken,
              publicToken: body.publicToken
            };
            callback(true, responseJSON);
            return 1;
        })
        .catch((error) => {
            console.log(`humanapi error: ${error}`);
            callback(false, error);
            return 0;
        });
//        console.log("Response = "+ responseJSON);
    });
}

exports.humanAPINotification = function(req, res, database, callback) {
    
  var humanApiObj = req.body[0];

  // Get a database reference to our posts
  var db = admin.database();
  var ref = db.ref("users");

  console.log(`Human Id = ${humanApiObj.humanId}`);

  ref.child('users').orderByChild('humanapi').equalTo(humanApiObj.humanId).on("value", (snapshot) => {
    console.log(snapshot.val());
    snapshot.forEach((data) => {
        console.log(data.key);
    });
  });

  // ref.child("humanapi").child("height").on("value", function(stegosaurusHeightSnapshot) {
  //   var favoriteDinoHeight = stegosaurusHeightSnapshot.val();
  
  //   var queryRef = ref.orderByChild("height").endAt(favoriteDinoHeight).limitToLast(2)
  //   queryRef.on("value", function(querySnapshot) {
  //     if (querySnapshot.numChildren() === 2) {
  //       // Data is ordered by increasing height, so we want the first entry
  //       querySnapshot.forEach(function(dinoSnapshot) {
  //         console.log("The dinosaur just shorter than the stegasaurus is " + dinoSnapshot.key);
  
  //         // Returning true means that we will only loop through the forEach() one time
  //         return true;
  //       });
  //     } else {
  //       console.log("The stegosaurus is the shortest dino");
  //     }
  //   });
  // });
  callback(true, {});
  return;
}

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

exports.humanAPINotification = (req, res, database) => {
  // {
  //   "updatedAt": "2019-02-23T06:41:48.559Z",
  //   "humanId": "04a8bb904d32fc8a226ab97fb0249fb2",
  //   "endpoint": "https://api.humanapi.co/v1/human/activities/summaries",
  //   "type": "activitysummary",
  //   "model": "activitysummary",
  //   "action": "updated",
  //   "objectId": "5c6fa7b4cc22010100b14f22"
  // }
  const db = admin.database();
  const ref = db.ref('users');

  const humanId = (req.humanId) ? req.humanId : null;
  const action = (req.action) ? req.action : null;
  const objectId = (req.objectId) ? req.objectId : null;
  const updatedAt = (req.humanId) ? req.updatedAt : null;
  const type = (req.type) ? req.type : null;
  const model = (req.model) ? req.model : null;

	return new Promise ( (resolve, reject) => {

    console.log(`humanId: ${humanId}`);
    console.log(`action: ${action}`);
    console.log(`objectId: ${objectId}`);
    console.log(`updatedAt: ${updatedAt}`);
    console.log(`type: ${type}`);
    console.log(`model: ${model}`);

    ref.orderByChild('humanapi/human_id').equalTo(humanId).once('value')
    .then( snapshot => {
      let arrayObj = convertMeditFromObjectToArray(snapshot.val());
      let promises = [];

      // Get the list of device notification tokens.
      for (var index = 0; index < arrayObj.length; index++) {
//        console.log(`FCM ${JSON.stringify(arrayObj[index], null, 2)}`);
        let item = arrayObj[index];
        let fcms = Object.keys(item.fcm);         

//        console.log(`FCM Token is ${JSON.stringify(fcms, null, 2)}`);

        
        // Send a message to the device corresponding to the provided
        // registration token.
        for (var key in fcms) {
          const fcm = fcms[key];
          var payload = {
            data: {
              update: "true"
            },
            token: fcm
          };
//          console.log(`Payload is ${JSON.stringify(payload, null, 2)}`);
          promises.push(admin.messaging().send(payload));                
        }
      }
      return Promise.all(promises);
    })
    .then( responses => {
      // See the MessagingDevicesResponse reference documentation for
      // the contents of response.
      console.log('Successfully sent message:', responses);
            
      resolve("Success");
      return;
    })
    .catch( error => {
      console.log('Failed to sent message:', error);

      reject(error);    
    });
	});
}

convertMeditFromObjectToArray = (obj) => {

  let arrayOfObjs = [];
  
  if (obj) {
    arrayOfObjs = Object.keys(obj).map((key) => {
      return {
        api: obj[key].humanapi, 
        fcm: (obj[key].messaging && obj[key].messaging.fcm) ? obj[key].messaging.fcm : {}, 
        uid: key
      }
    });
    
  }
  console.log(`arrayOfObjs: ${JSON.stringify(arrayOfObjs, null, 2)}`);

  return arrayOfObjs;
}

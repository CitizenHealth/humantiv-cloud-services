const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
const request = require('request');
const config = require('./config');
const buildFunctions = require('./modules/build');
const humanFunctions = require('./modules/humanapi');
const emailFunctions = require('./modules/email');
const meditFunctions = require('./modules/medit');
const healthscoreFunctions = require('./modules/healthscore');
const noticationFunctions = require('./modules/notifications');



admin.initializeApp(functions.config().firebase);

// Human API
exports.humanAPITokenExchange = functions.https.onRequest((req, res) => {

    console.log(`humanAPITokenExchange = ${JSON.stringify(req.body)}`);

    humanFunctions.humanAPIHandshake(req, res, admin.database(), (success,responseJSON) => {
        res.setHeader('Content-Type', 'application/json');
        if (success) {
            res.status(201).send(JSON.stringify(responseJSON));
        } else {
            res.status(400);
        }
    })  
});

// Build Notification
exports.buildSlackNotification = functions.https.onRequest((req, res) => {
    console.log(`buildSlackNotification = ${JSON.stringify(req.body)}`);
 
    buildFunctions.slackNotification(req,res);
});

// Email Notifications
exports.sendWelcomeEmail = functions.auth.user().onCreate((event) => {
    console.log(`welcomeEmail = ${JSON.stringify(event)}`);
 
    emailFunctions.welcomeEmail(event, () => {
        console.log(`Welcome email sent`);
        return 1;
    });
});

exports.sendGoodbyeEmail = functions.auth.user().onDelete((event) => {
    console.log(`goodbyeEmail = ${JSON.stringify(event)}`);
 
    emailFunctions.goodbyeEmail(event, () => {
        console.log(`Goodbye email sent`);
        return 1;
    });
});

// Medits Management
exports.sendInitialMedits = functions.auth.user().onCreate((event) => {
    console.log(`sendInitialMedits = ${JSON.stringify(event)}`);
 
    meditFunctions.giveInitialMedits(event, admin.database(), () => {
        console.log(`Sent 200 medits to ${event.data.email}`);
        return 1;
    });
});

// Health Score Management
exports.setInitialHealthScore = functions.auth.user().onCreate((event) => {
    console.log(`setInitialHealthScore = ${JSON.stringify(event)}`);
 
    healthscoreFunctions.setInitialHealthScore(event, admin.database(), () => {
        console.log(`Set health score of 50 to ${event.data.email}`);
        return 1;
    });
});

// Notification
exports.sendMeditsNotification = functions.database.ref('/users/{user_id}/wallet/medits').onWrite((event) => {
    const userId = event.params.user_id;
    const meditsAmount = event.data.val();

     // If un-follow we exit the function.
    if (meditsAmount < 0) {
      return console.log('No medits minted');
    }
    console.log('We have a new medits minted:', meditsAmount, 'for user:', userId);
  
    // Get the list of device notification tokens.
    const getDeviceTokensPromise = admin.database().ref(`/users/${userId}/messaging/fcm`).once('value');
    
    return Promise.all([getDeviceTokensPromise]).then((results) => {
      const tokensSnapshot = results[0];
      console.log(`FCM Token is ${JSON.stringify(tokensSnapshot)}`);
      // Check if there are any device tokens.

      // Notification details.
      const payload = {
        notification: {
          title: 'You just earned new Medits!',
          body: `You have now ${meditsAmount} medits in your wallet.`,
          icon: 'https://firebasestorage.googleapis.com/v0/b/health-score-6740b.appspot.com/o/notification%2Fmedits.png?alt=media&token=93860fa7-8921-4b5e-80f5-be056e2be873',
        },
      };
  
      // Send notifications.
      return admin.messaging().sendToDevice(tokensSnapshot.val(), payload);
    });
    // .then((response) => {
    //     console.log(`Response ${JSON.stringify(response)}`);
    //     // For each message check if there was an error.
    //   const tokensToRemove = [];
    //   response.results.forEach((result, index) => {
    //     const error = result.error;
    //     if (error) {
    //       console.error('Failure sending notification to', tokensSnapshot.val(), error);
    //       // Cleanup the tokens who are not registered anymore.
    //       if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
    //         tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
    //       }
    //     }
    //   });
    //   return Promise.all(tokensToRemove);
    // });
  });
  

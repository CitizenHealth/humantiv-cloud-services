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
const notificationFunctions = require('./modules/notifications');



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

// New User Defaults
exports.initializeAccount = functions.auth.user().onCreate((event) => {
  console.log(`initializeAccount = ${JSON.stringify(event)}`);

  initAccountFunctions.initializeAccount(event, admin.database(), () => {
      console.log(`Set default data to ${event.data.email}`);
      return 1;
  });
});

// Notification
// **Medits
exports.sendMeditsNotification = functions.database.ref('/users/{user_id}/wallet/medits').onWrite((event) => {
    const meditsAmount = event.data.val();

    notificationFunctions.meditsNotifications(event, admin, (param) => {
        console.log(`Param ${param}`);
        console.log(`Total new medits is ${event.data.val()}`);
        return 1;
    });
  });
 
// **Score
exports.sendScoreNotification = functions.database.ref('/users/{user_id}/health/score').onWrite((event) => {
    const scoreAmount = event.data.val();

    notificationFunctions.scoreNotifications(event, admin, (param) => {
        console.log(`Param ${param}`);
        console.log(`New Health Score is ${event.data.val()}`);
        return 1;
    });
  });


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
const initAccountFunctions = require('./modules/account');
const leaderboardFunctions = require('./modules/leaderboard');
const adminAPIFunctions = require('./modules/adminapi');

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

exports.humanAPINotification = functions.https.onRequest((req, res) => {

  console.log(`humanAPINotification = ${JSON.stringify(req.body)}`);

  humanFunctions.humanAPINotification(req, res, admin.database(), (success,responseJSON) => {
      res.setHeader('Content-Type', 'application/json');
      if (success) {
          res.status(200).send(JSON.stringify(responseJSON));
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
        console.log(`Set health score of 0 to ${event.data.email}`);
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
exports.sendMeditsNotification = functions.database.ref('/users/{user_id}/wallet/medits').onWrite((change, context) => {
	let meditsAmount = 0;
	
	// context: {
//   "eventType": "google.firebase.database.ref.write",
//   "params": {
//     "user_id": "3uJs38ucT7WKK53raqTSKXmcXf92"
//   },
//   "resource": {
//     "service": "firebaseio.com",
//     "name": "projects/_/instances/health-score-6740b/refs/users/3uJs38ucT7WKK53raqTSKXmcXf92/wallet/medits"
//   },
//   "timestamp": "2019-02-02T05:16:34.511Z",
//   "eventId": "FEvi8Jf7ifB3cYfMXObvzPW9spg=",
//   "authType": "ADMIN"
// }
	if (change.before.exists()) {
		meditsAmount = change.after.val() - change.before.val() ;
	}
	console.log(`sendMeditsNotification:  meditsAmount: ${meditsAmount}`);

	return notificationFunctions.meditsNotifications(meditsAmount, admin, context.params.user_id);
});

// **Score
exports.sendScoreNotification = functions.database.ref('/users/{user_id}/health/score').onWrite((event) => {
	const scoreAmount = event.data.val();

	// *** DISABLED FOR NOW *** 

	// notificationFunctions.scoreNotifications(event, admin, (param) => {
	//     console.log(`Param ${param}`);
	//     console.log(`New Health Score is ${event.data.val()}`);
	//     return 1;
	// });
	return 1;
});

// Calculate the Medit leaderboard
exports.calculateLeaderboard = functions.database.ref('/users/{user_id}/wallet/medits').onWrite((event,context) => {

    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const userId = context.params.user_id;
    let medit = 0;
    let change = "same";
    if (event.before.exists()) {
        medit = event.after.val();
        change = (event.after.val()>event.before.val()) ? "up" : "down";
	}


    leaderboardFunctions.calculateLeaderboard(userId, change, medit)
    .then(results => {
        console.log(`Result: ${JSON.stringify(results, null, 2)}`);
        return;
    })
    .catch(error => {
        console.log(error);
    });

	return 1;
});

// Calculate the Medit leaderboard
exports.adminAPIGetLeaderboard = functions.https.onRequest((req, res) => {
    console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

    const number = (req.body.number) ? req.body.number : -1;
    const type = (req.body.type) ? req.body.type : "";

    adminAPIFunctions.adminAPIGetLeaderboard(number, type)
    .then(results => {
        console.log(`Leaderboard: ${JSON.stringify(results, null, 2)}`);
        res.status(200).send(JSON.stringify(results, null, 2));
        return;
    })
    .catch(error => {
        console.log(error);
        res.status(400).send(error);
    });	
});

// Calculate the Medit leaderboard
exports.adminAPIGetScoreTable = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  const number = (req.body.number) ? req.body.number : -1;
  const type = (req.body.type) ? req.body.type : "";

  adminAPIFunctions.adminAPIGetScoreTable(number, type)
  .then(results => {
      console.log(`Score Table: ${JSON.stringify(results, null, 2)}`);
      res.status(200).send(JSON.stringify(results, null, 2));
      return;
  })
  .catch(error => {
      console.log(error);
      res.status(400).send(error);
  });	
});

exports.adminAPISetLeaderboard = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  adminAPIFunctions.adminAPISetLeaderboard(req)
  .then(results => {
      console.log(`Result: ${JSON.stringify(results, null, 2)}`);
      res.status(200).send(JSON.stringify(results, null, 2));
      return;
  })
  .catch(error => {
      console.log(error);
      res.status(400).send(error);
  });
});

exports.adminAPISetScoreTable = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  adminAPIFunctions.adminAPISetScoreTable(req)
  .then(results => {
      console.log(`Result: ${JSON.stringify(results, null, 2)}`);
      res.status(200).send(JSON.stringify(results, null, 2));
      return;
  })
  .catch(error => {
      console.log(error);
      res.status(400).send(error);
  });
});

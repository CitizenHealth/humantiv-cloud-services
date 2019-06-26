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

    console.log(`humanAPITokenExchange = ${JSON.stringify(req.body, null, 2)}`);

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

  console.log(`humanAPINotification = ${JSON.stringify(req.body, null, 2)}`);

  req.body.map( item => {
    console.log(`humanAPINotification = ${JSON.stringify(req.body, null, 2)}`);
    humanFunctions.humanAPINotification(item, res, admin.database(), (success,responseJSON) => {
      res.setHeader('Content-Type', 'application/json');
      if (success) {
          res.status(200).send(JSON.stringify(responseJSON));
      } else {
          res.status(400);
      }
    })
  })
    
});

// Build Notification
exports.buildSlackNotification = functions.https.onRequest((req, res) => {
    console.log(`buildSlackNotification = ${JSON.stringify(req.body)}`);
 
    buildFunctions.slackNotification(req,res);
});

// Email Notifications
exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    console.log(`welcomeEmail = ${JSON.stringify(user,null,2)}`);
 
    emailFunctions.welcomeEmail(user)
    .then(result => {
      console.log(`Welcome email sent to ${result}`);
      return 1;
    })
    .catch( error=> {
      console.log(`Welcome email failed: ${error}`);
    });
});

exports.sendGoodbyeEmail = functions.auth.user().onDelete((user) => {
    console.log(`goodbyeEmail = ${JSON.stringify(user)}`);
 
    emailFunctions.goodbyeEmail(user, () => {
        console.log(`Goodbye email sent`);
        return 1;
    });
});

// Medits Management
exports.sendInitialMedits = functions.auth.user().onCreate((user) => {
    console.log(`sendInitialMedits = ${JSON.stringify(user)}`);
 
    meditFunctions.giveInitialMedits(user, admin.database(), (error) => {
      if (!error) {
        console.log(`Sent 200 medits to ${user.email}`);
      } else {
        console.log(`Error sending 200 Medits to ${user.email}: ${error}`);
      }
      
      return 1;
    });
});

// Health Score Management
exports.setInitialHealthScore = functions.auth.user().onCreate((user) => {
    console.log(`setInitialHealthScore = ${JSON.stringify(user)}`);
 
    healthscoreFunctions.setInitialHealthScore(user, admin.database(), (error) => {
      if (!error) {
        console.log(`Set health score to 50 for ${user.email}`);
      } else {
        console.log(`Error setting health score to 50 for ${user.email}: ${error}`);
      }     
        return 1;
    });
});

// New User Defaults
exports.initializeAccount = functions.auth.user().onCreate((user) => {
  console.log(`initializeAccount = ${JSON.stringify(user)}`);

    initAccountFunctions.initializeAccount(user, admin.database(), (error) => {
      if (!error) {
        console.log(`Set default data to ${user.email}`);
      } else {
        console.log(`Error setting data for ${user.email}: ${error}`);
      }
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
  if (meditsAmount === 0) {
    return 1;
  }
	return notificationFunctions.meditsNotifications(meditsAmount, admin, context.params.user_id);
});

// **Score
exports.sendScoreNotification = functions.database.ref('/users/{user_id}/health/score').onWrite((change, context) => {
  
  if (change.before.exists()) {
		 if (change.after.val() >= 70 && change.before.val() < 70) {
      console.log(`Score Up: ${change.before.val()} to ${change.after.val()} for user ${context.params.user_id}`)
     } else if (change.after.val() < 70 && change.before.val() >= 70) {
      console.log(`Score Down: ${change.before.val()} to ${change.after.val()} for user ${context.params.user_id}`)
     }
	}

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
    let medit = event.after.val();
    let change = "same";
    if (event.before.exists()) {
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
exports.anonymousLeaderboardUser = functions.database.ref('/users/{user_id}/profile/anonymous_leaderboard').onWrite((event,context) => {

  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const userId = context.params.user_id;
  let anonymous = event.after.val();

  leaderboardFunctions.anonymousLeaderboardUser(userId, anonymous)
  .then(results => {
      console.log(`Result: ${JSON.stringify(results, null, 2)}`);
      return;
  })
  .catch(error => {
      console.log(error);
  });

  return 1;
});

// Admin API: Return the user sshare count
exports.adminAPIGetShares = functions.https.onRequest((req, res) => {
    console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

    const number = (req.body.number) ? req.body.number : -1;

    adminAPIFunctions.adminAPIGetShares(number)
    .then(results => {
        res.status(200).send(JSON.stringify(results, null, 2));
        return;
    })
    .catch(error => {
        console.log(error);
        res.status(400).send(error);
    });	
});

// Admin API: Return leaderboard
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

// Admin API: Return the score table
exports.adminAPIGetScoreTable = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  const number = (req.body.number) ? req.body.number : -1;

  adminAPIFunctions.adminAPIGetScoreTable(number)
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

// Admin API: Sets the Medit leaderboard
exports.adminAPISetLeaderboard = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  adminAPIFunctions.adminAPISetLeaderboard()
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

exports.adminAPISetMedit = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  adminAPIFunctions.adminAPISetMedit((req.body.medit !== undefined)  ? req.body.medit : -1)
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

exports.adminAPISetTestDatabase = functions.https.onRequest((req, res) => {
  adminAPIFunctions.adminAPISetTestDatabase()
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

exports.adminAPIDeleteTestDatabase = functions.https.onRequest((req, res) => {
  adminAPIFunctions.adminAPIDeleteTestDatabase()
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

exports.adminAPIDeleteUser = functions.https.onRequest((req, res) => {
  const email = req.body.email;
  
  if (!email) {
    res.status(400).send(new Error("Missing user email."));
  }
  
  adminAPIFunctions.adminAPIDeleteUser(email)
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

exports.adminAPIVerifyUser = functions.https.onRequest((req, res) => {
  const email = req.body.email;
  
  if (!email) {
    res.status(400).send(new Error("Missing user email."));
  }
  
  adminAPIFunctions.adminAPIVerifyUser(email)
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

exports.adminGetNumberUsers = functions.https.onRequest((req, res) => {
  adminAPIFunctions.adminGetNumberUsers()
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

// Admin API: Set total Medit stat
exports.adminSetTotalMeditStat = functions.https.onRequest((req, res) => {
  adminAPIFunctions.adminSetTotalMeditStat()
  .then(results => {
      console.log(`Total Medit = ${results}`);
      res.status(200).send(JSON.stringify(results, null, 2));
      return;
  })
  .catch(error => {
      console.log(error);
      res.status(400).send(error);
  });
});

// Admin API: Set total Medit stat
exports.adminSetTotalBetaMeditStat = functions.https.onRequest((req, res) => {
  adminAPIFunctions.adminSetTotalBetaMeditStat()
  .then(results => {
      console.log(`Total Beta Medit = ${results}`);
      res.status(200).send(JSON.stringify(results, null, 2));
      return;
  })
  .catch(error => {
      console.log(error);
      res.status(400).send(error);
  });
});

exports.adminGetDeviceStats = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  adminAPIFunctions.adminGetDeviceStats()
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

exports.adminGetSourcesStats = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  adminAPIFunctions.adminGetSourcesStats()
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

exports.adminGetJourneyStats = functions.https.onRequest((req, res) => {
  console.log(`Req: ${JSON.stringify(req.body, null, 2)}`);

  adminAPIFunctions.adminGetJourneyStats()
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
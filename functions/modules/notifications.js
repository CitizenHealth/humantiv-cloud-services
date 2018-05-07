
exports.meditsNotifications = function(event, admin) {

    const userId = event.params.user_id;
    const meditsAmount = event.data.val();

     // If un-follow we exit the function.
    if (meditsAmount < 0) {
      return console.log('No medits minted');
    }
    console.log('We have a new medits minted:', meditsAmount, 'for user:', userId);
  
    // Get the list of device notification tokens.
    const getDeviceTokensPromise = admin.database().ref(`/users/${userId}/messaging/fcm`).once('value');
    var tokensSnapshot;
    var tokens = [];
    return Promise.all([getDeviceTokensPromise])
    .then((results) => {
      tokensSnapshot = results[0];
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
      for (var key in tokensSnapshot.val()) {
          const fcm = tokensSnapshot.val()[key];
          console.log(`Token is ${fcm}`);
          tokens.push(fcm);         
      }
      return admin.messaging().sendToDevice(tokens, payload);
    })
    .then((response) => {
      console.log(`Response ${JSON.stringify(response)}`);
      // For each message check if there was an error.
      const tokensToRemove = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', tokensSnapshot.val(), error);
          // Cleanup the tokens who are not registered anymore.
          if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
            tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
          }
        }
      });
      return Promise.all(tokensToRemove);
    });
}

exports.scoreNotifications = function(event, admin) {

    const userId = event.params.user_id;
    const scoreValue = event.data.val();

     // If un-follow we exit the function.
    if (scoreValue < 0 || scoreValue > 100) {
      return console.log('Bad Score');
    }
    console.log('We have a new score:', scoreValue, 'for user:', userId);
  
    // Get the list of device notification tokens.
    const getDeviceTokensPromise = admin.database().ref(`/users/${userId}/messaging/fcm`).once('value');
    var tokensSnapshot;
    var tokens = [];
    return Promise.all([getDeviceTokensPromise])
    .then((results) => {
      tokensSnapshot = results[0];
      console.log(`FCM Token is ${JSON.stringify(tokensSnapshot)}`);
      // Check if there are any device tokens.

      // Notification details.
      const payload = {
        notification: {
          title: 'Congratulations!',
          body: `Your health score is now ${scoreValue}.`,
          icon: 'https://firebasestorage.googleapis.com/v0/b/health-score-6740b.appspot.com/o/notification%2Fmedits.png?alt=media&token=93860fa7-8921-4b5e-80f5-be056e2be873',
        },
      };
  
      // Send notifications.
      for (var key in tokensSnapshot.val()) {
          const fcm = tokensSnapshot.val()[key];
          console.log(`Token is ${fcm}`);
          tokens.push(fcm);         
      }
      return admin.messaging().sendToDevice(tokens, payload);
    })
    .then((response) => {
      console.log(`Response ${JSON.stringify(response)}`);
      // For each message check if there was an error.
      const tokensToRemove = [];
      response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
          console.error('Failure sending notification to', tokensSnapshot.val(), error);
          // Cleanup the tokens who are not registered anymore.
          if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/registration-token-not-registered') {
            tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
          }
        }
      });
      return Promise.all(tokensToRemove);
    });
}


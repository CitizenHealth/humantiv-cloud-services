// Function setting an initial score to a new user
const INITIAL_WEIGHT_UNITS = "lbs";
const INITIAL_HEIGHT_UNITS = "inches";
const INITIAL_DISTANCE_UNITS = "feet";

const INITIAL_GOAL_NOTIFICATIONS = "feet";
const INITIAL_VOTES_NOTIFICATIONS = "feet";
const INITIAL_WALLET_NOTIFICATIONS = "feet";

exports.initializeAccount = function(event, database, callback) {
    const user = event.data; // The Firebase user.

    const id = user.uid; // The id of the user.

    // Write the 
    database.ref('users/' + id + '/profile')
    .set({
        weight_unit: INITIAL_WEIGHT_UNITS,
        height_unit: INITIAL_HEIGHT_UNITS,
        distance_unit: INITIAL_DISTANCE_UNITS,
        goal_notification: true,
        votes_notification: true,
        wallet_notification: true
    })
    .then(() => {
        console.log("account initialized successfully");
        return 1;
    })
    .catch((error) => {
        console.log(`account initialization error: ${error}`);
        return 0;
    });   
}
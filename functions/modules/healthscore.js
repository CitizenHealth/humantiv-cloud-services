// Function setting an initial score to a new user
const INITIAL_SCORE = 50;

exports.setInitialHealthScore = function(user, database, callback) {
    const id = user.uid; // The id of the user.

    // Write the initial health score
    let itemObj = {};
    itemObj[Math.round((new Date()).getTime() / 1000)] = INITIAL_SCORE
    database.ref('users/' + id + '/health/score')
    .set(itemObj)
    .then(() => {
        console.log("score set successfully");
        return callback(null);
    })
    .catch((error) => {
        console.log(`score error: ${error}`);
        return callback(error);
    });   
}
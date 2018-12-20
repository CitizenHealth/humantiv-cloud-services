// Function setting an initial score to a new user
const INITIAL_SCORE = 0;

exports.setInitialHealthScore = function(event, database, callback) {
    const user = event.data; // The Firebase user.

    const id = user.uid; // The id of the user.

    // Write the initial health score

    let itemObj = {};
    itemObj[Math.round((new Date()).getTime() / 1000)] = INITIAL_SCORE
    database.ref('users/' + id + '/health/score')
    .set(itemObj)
    .then(() => {
        console.log("score set successfully");
        return 1;
    })
    .catch((error) => {
        console.log(`score error: ${error}`);
        return 0;
    });   
}
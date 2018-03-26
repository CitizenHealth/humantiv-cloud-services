// Function setting an initial score to a new user
const INITIAL_MEDITS = 200;

exports.setInitialHealthScore = function(event, database, callback) {
    const user = event.data; // The Firebase user.

    const id = user.uid; // The id of the user.

    // Write the 
    database.ref('users/' + id + '/health')
    .set({
        score: '50'
    })
    .then(() => {
        console.log("score set successfully");
        return 1;
    })
    .catch((error) => {
        console.log(`score error: ${error}`);
        return 0;
    });   
}
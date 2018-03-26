// Function sending initial medits and MDX to a new user
const INITIAL_MEDITS = 200;

exports.giveInitialMedits = function(event, database, callback) {
    const user = event.data; // The Firebase user.

    const id = user.uid; // The id of the user.

    // Write the 
    database.ref('users/' + id + '/wallet')
    .set({
        medits: '200',
        mdx: '1000'
    })
    .then(() => {
        console.log("medits added successfully");
        return 1;
    })
    .catch((error) => {
        console.log(`medits error: ${error}`);
        return 0;
    });   
}
// Function sending initial medits and MDX to a new user
const INITIAL_MEDITS = 200;
const INITIAL_MDX = 0;

exports.giveInitialMedits = function(event, database, callback) {
    const user = event.data; // The Firebase user.

    const id = user.uid; // The id of the user.

    // Write the 
    database.ref('users/' + id + '/wallet')
    .set({
        medits: INITIAL_MEDITS,
        mdx: INITIAL_MDX
    })
    .then(() => {
        console.log("medit added successfully");
        return 1;
    })
    .catch((error) => {
        console.log(`medit error: ${error}`);
        return 0;
    });  
    
    // Write medits to the feed
    const currentUnixTime = Math.floor(new Date() / 1000);
    database.ref(`users/${id}/feed/stories/${currentUnixTime}`)
    .set({
        preposition: "",
        time: currentUnixTime,
        title: "You've earned",
        type: "medits",
        value: `${INITIAL_MEDITS} Medit`
    })
    .then(() => {
        console.log("Added medit generation to the feed");
        return 1;
    })
    .catch((error) => {
        console.log(`Feed generation: ${error}`);
        return 0;
    });  
    
    // Write medex to the feed
    // database.ref(`users/${id}/feed/stories/${currentUnixTime + 1}`)
    // .set({
    //     preposition: "",
    //     time: currentUnixTime + 1,
    //     title: "You've received",
    //     type: "medex",
    //     value: `${INITIAL_MDX} Medex`
    // })
    // .then(() => {
    //     console.log("Added medex generation to the feed");
    //     return 1;
    // })
    // .catch((error) => {
    //     console.log(`Feed generation: ${error}`);
    //     return 0;
    // });   

}
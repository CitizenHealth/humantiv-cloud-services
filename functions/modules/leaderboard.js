const admin = require('firebase-admin');

exports.calculateLeaderboard = (userId, change, medit) => {
	const db = admin.database();
	const auth = admin.auth();

	return new Promise ( (resolve, reject) => {
		auth.getUser(userId)
		.then( user => {
			return db.ref(`/leaderboard/${userId}`).set({
				name: (user.displayName) ? user.displayName : "",
				email: user.email,
				medit : medit,
				image : (user.photoURL) ? user.photoURL : "",
				change: change
			});
		})
		.then( response => {
			console.log(`Snapshot: ${JSON.stringify(response, null, 2)}`)
			resolve(JSON.stringify(response, null, 2));
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
};

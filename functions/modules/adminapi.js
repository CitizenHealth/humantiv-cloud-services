const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.adminAPISetLeaderboard =  (req) => {
	const auth = admin.auth();
		
	return new Promise ( (resolve, reject) => {
		var promisesArray = [];
		var userArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				userArray.push(userRecord);
				promisesArray.push(helperGetUserMedits(userRecord.uid));				 
			})
			return Promise.all(promisesArray);
		})
		.then( results => {
			console.log(`results: ${results}`);

			for (var i = 0; i < results.length; i++) {
				helperAddUserToLeaderboard(userArray[i], results[i])
			}
			resolve("Success");
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
};

exports.adminAPIGetLeaderboard = (number, type) => {
	const db = admin.database();
	const database = (type) ? `leaderboard-${type}` : `leaderboard`;

	console.log(`Database: ${database}`)
	return new Promise ( (resolve, reject) => {
		
		const ref = (number >= 0) ? db.ref(database).orderByChild('medit').limitToLast(number)
															: db.ref(database).orderByChild('medit')

		ref.once('value')
		.then( snapshot => {
			let leaderboard = [];
			snapshot.forEach(userInfo => {
				var uInfo = userInfo.val();
				uInfo.uid = userInfo.key;
				leaderboard.push(uInfo);
			});
			resolve(leaderboard.reverse());
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
};

exports.adminAPIGetScoreTable = (number, type) => {
	const db = admin.database();
	const database = (type) ? `scoretable-${type}` : `scoretable`;

	console.log(`Database: ${database}`)
	return new Promise ( (resolve, reject) => {
		
		const ref = (number >= 0) ? db.ref(database).orderByChild('score').limitToLast(number)
															: db.ref(database).orderByChild('score')

		ref.once('value')
		.then( snapshot => {
			let leaderboard = [];
			snapshot.forEach(userInfo => {
				var uInfo = userInfo.val();
				uInfo.uid = userInfo.key;
				leaderboard.push(uInfo);
			});
			resolve(leaderboard.reverse());
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
};

helperGetUserMedits = (uid) => {
	const db = admin.database();

	const ref = db.ref(`users/${uid}/wallet/medits`);

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			console.log(`User: ${uid} - ${snapshot.val()}`);
			resolve(snapshot.val());
			return;
		})
		.catch ( error => {
			reject(error);
		})
	})
}

helperAddUserToLeaderboard = (userRecord, medit) => {
	const db = admin.database();

	db.ref(`/leaderboard-admin/${userRecord.uid}`)
	.set({
		name: (userRecord.displayName) ? userRecord.displayName : "",
		email: userRecord.email,
		medit : medit,
		image : (userRecord.photoURL) ? userRecord.photoURL : "",
		change: ""
	})
	.then( response => {
		return JSON.stringify(response, null, 2);
	})
	.catch ( error => {
		return error;
	})
}
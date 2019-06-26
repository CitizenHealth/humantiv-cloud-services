const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.adminAPIVerifyUser =  (email) => {
	const auth = admin.auth();

	var emailVerified = false;

	return new Promise( (resolve, reject) => {
		// Get the user UID from email
		auth.getUserByEmail(email)
		.then( userRecord => {
			emailVerified = userRecord.emailVerified;
			console.log(`User ${email} is ${(emailVerified) ? '': 'not'} verified`);
			return auth.updateUser(userRecord.uid, {
				emailVerified: true,
			});
		})
		.then((userRecord) => {
			// See the UserRecord reference doc for the contents of userRecord.
			console.log(`User ${email} is ${(emailVerified) ? '': 'not'} verified`);
			console.log('Successfully verified user', userRecord.toJSON());
			resolve(userRecord.toJSON())
			return;
		})
		.catch(error => {
			console.log("Error verifying user:", error);
			reject(error);
		});
	})
};

exports.adminAPISetLeaderboard =  () => {
	const auth = admin.auth();
		
	return new Promise ( (resolve, reject) => {
		var promisesArray = [];
		var userArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				userArray.push(userRecord);
				promisesArray.push(helperGetUserMedits('users', userRecord.uid));				 
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

exports.adminAPIGetShares = (number) => {
	const auth = admin.auth();

	return new Promise ( (resolve, reject) => {
		var promisesArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				promisesArray.push(helperGetUserShares(userRecord));				 
			})
			return Promise.all(promisesArray);
		})
		.then( results => {
			let shares = [];
			for (var i = 0; i < results.length; i++) {
				
				let uInfo = results[i].user;

//				console.log(`uInfo: ${JSON.stringify(uInfo, null, 2)}`)

				let shareUser = {};
				shareUser['share'] = results[i].share;
				shareUser['name'] = (uInfo.displayName ) ? uInfo.displayName : '';
				shareUser['email'] = (uInfo.email) ? uInfo.email : '';
				shareUser['medit'] = results[i].medit
				shareUser['uid'] = uInfo.uid;
				shares.push(shareUser);
			}
			
			resolve(shares.sort(helperCompare('share')).reverse());
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

exports.adminAPIGetScoreTable = (number) => {
	const auth = admin.auth();

	return new Promise ( (resolve, reject) => {
		var promisesArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				promisesArray.push(helperGetUserScores(userRecord));				 
			})
			return Promise.all(promisesArray);
		})
		.then( results => {
			let shares = [];
			for (var i = 0; i < results.length; i++) {
				
				let uInfo = results[i].user;

				let shareUser = {};
				shareUser['score'] = results[i].score;
				shareUser['name'] = (uInfo.displayName ) ? uInfo.displayName : '';
				shareUser['email'] = (uInfo.email) ? uInfo.email : '';
				shareUser['medit'] = results[i].medit
				shareUser['uid'] = uInfo.uid;
				shares.push(shareUser);
			}
			
			resolve(shares.sort(helperCompare('score')).reverse());
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});

};

exports.adminAPISetMedit =  (medit) => {
	const auth = admin.auth();
		
	return new Promise ( (resolve, reject) => {
		var promisesArray = [];
		var userArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				userArray.push(userRecord);
				promisesArray.push(helperGetUserMedits('/users-test', userRecord.uid).medit);				 
			})
			return Promise.all(promisesArray);
		})
		.then( results => {
			console.log(`results: ${results}`);

			for (var i = 0; i < results.length; i++) {
				helperResetMedit(userArray[i], medit)
			}
			resolve("Success");
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
};

exports.adminAPISetTestDatabase = () => {
	const db = admin.database();

	const ref = db.ref(`/users`);

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			return db.ref(`/users-test`)
			.set(snapshot.val())
		})
		.then( response => {
			return resolve(JSON.stringify(response, null, 2));
		})
		.catch ( error => {
			reject(error);
		})
	})
}

exports.adminAPIDeleteTestDatabase = () => {
	const db = admin.database();

	const ref = db.ref(`/users`);

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			return db.ref(`/users-test`)
			.remove()
		})
		.then( response => {
			return resolve(JSON.stringify(response, null, 2));
		})
		.catch ( error => {
			reject(error);
		})
	})
}

exports.adminAPIDeleteUser = (email) => {
	const auth = admin.auth();
	const db = admin.database();

	var uid = ""

	return new Promise( (resolve, reject) => {
		// Get the user UID from email
		admin.auth().getUserByEmail(email)
		.then( userRecord => {
			uid = userRecord.uid;
			console.log("Successfully fetched user data:", uid);
			return db.ref(`/leaderboard/${uid}`)
			.remove()
		})
		.then( response => {
			return db.ref(`/users/${uid}`)
			.remove()
		})
		.then( response => {
			return auth.deleteUser(uid)
		})
		.then( response => {
			return resolve(JSON.stringify(response, null, 2));
		})
		.catch(error => {
			console.log("Error deleting user:", error);
			reject(error);
		});
	})
}

exports.adminGetNumberUsers = () => {
	const auth = admin.auth();
		
	return new Promise ( (resolve, reject) => {
		auth.listUsers()
		.then( listUsersResult => {
			resolve(listUsersResult.users.length);
			return;				 
		})
		.catch ( error => {
			reject(error);
		})
	});
}

exports.adminSetTotalMeditStat = () => {
	const auth = admin.auth();
	const db = admin.database();
	var total = 0;

	return new Promise ( (resolve, reject) => {
		auth.listUsers()
		.then( listUsersResult => {
			var promises = [];
			for ( const userRecord of listUsersResult["users"]) {
				promises.push(helperGetUserMeditCount(userRecord));
			}
			return Promise.all(promises);
		})
		.then( results => {
			total = results.reduce( (total, medit) => total + medit);
			console.log(`${total}`);
			return db.ref(`/stats/medit`)
			.update({
				total: total
			})
		})
		.then( response => {
			resolve(total);
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

exports.adminSetTotalBetaMeditStat = () => {
	const auth = admin.auth();
	const db = admin.database();
	var total = 0;

	return new Promise ( (resolve, reject) => {
		auth.listUsers()
		.then( listUsersResult => {
			var promises = [];
			for ( const userRecord of listUsersResult["users"]) {
				promises.push(helperGetUserBetaMeditCount(userRecord));
			}
			return Promise.all(promises);
		})
		.then( results => {
			total = results.reduce( (total, medit) => total + medit);
			console.log(`${total}`);
			return db.ref(`/stats/medit`)
			.update({
				betaTotal: total
			})
		})
		.then( response => {
			resolve(total);
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

exports.adminGetDeviceStats = () => {
	const auth = admin.auth();

	return new Promise ( (resolve, reject) => {
		var promisesArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				promisesArray.push(helperGetUserDevices(userRecord));				 
			})
			return Promise.all(promisesArray);
		})
		.then( results => {
			let stats = {};

			for (var index = 0; index < results.length; index++) {
				let device = results[index];
				let keys = Object.keys(stats);
				if (keys.includes(device.device)) {
					stats[device.device]++;
				} else {
					stats[device.device] = 1;
				}
			}
			
			resolve(stats);
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

exports.adminGetSourcesStats = () => {
	const auth = admin.auth();

	return new Promise ( (resolve, reject) => {
		var promisesArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				promisesArray.push(helperGetUserDevices(userRecord));				 
			})
			return Promise.all(promisesArray);
		})
		.then( results => {
			let stats = {};

			for (var index = 0; index < results.length; index++) {
				let device = results[index];
				let keys = Object.keys(stats);
				if (keys.includes(device.source)) {
					stats[device.source]++;
				} else {
					stats[device.source] = 1;
				}
			}
			
			resolve(stats);
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

exports.adminGetJourneyStats = () => {
	const auth = admin.auth();

	return new Promise ( (resolve, reject) => {
		var promisesArray = [];

		auth.listUsers()
		.then( listUsersResult => {
			listUsersResult.users.forEach( userRecord => {
				// Get the user data
				promisesArray.push(adminGetJourneyStats(userRecord));				 
			})
			return Promise.all(promisesArray);
		})
		.then( results => {
			let stats = {};

			for (var index = 0; index < results.length; index++) {
				let item = results[index];
				let keys = Object.keys(stats);
				if (keys.includes(item.journey)) {
					stats[item.journey]++;
				} else {
					stats[item.journey] = 1;
				}
			}
			
			resolve(stats);
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

helperGetUserMeditCount = (userRecord) => {
	const db = admin.database();
	const ref = db.ref(`users/${userRecord.uid}/wallet/medits`);

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			resolve(snapshot.val());			
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

helperGetUserBetaMeditCount = (userRecord) => {
	const db = admin.database();
	const ref = db.ref(`users/${userRecord.uid}/wallet/betamedits`);

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			resolve(snapshot.val());			
			return;
		})
		.catch ( error => {
			reject(error);
		})
	});
}

helperGetUserMedits = (database, uid) => {
	const db = admin.database();

	const ref = db.ref(`${database}/${uid}/wallet/medits`);
	const ref2 = db.ref(`${database}/${uid}/profile/anonymous_leaderboard`);
	
	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {			
			return ref2.once('value');
		})
		.then( snapshot2 => {
			// console.log(`User: ${uid} - ${JSON.stringify(snapshot.val(), null, 2)}`);
			resolve({
				medit: snapshot.val(),
				anonymous: snapshot2.val()
			});
			return;
		})
		.catch ( error => {
			reject(error);
		})
	})
}

helperGetUserShares = (userRecord) => {
	const db = admin.database();

	const ref = db.ref(`/users/${userRecord.uid}`).orderByChild('app');

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			let user = snapshot.val();
			let share = (user.share && user.share.app !== undefined) ? user.share.app : 0;
			let medit = (user.wallet && user.wallet.medits !== undefined) ? user.wallet.medits : 0;
			// console.log(`User: ${userRecord.uid} - ${JSON.stringify(user, null, 2)}`);
			resolve({
				user: userRecord,
				share: share,
				medit: medit
			});
			return;
		})
		.catch ( error => {
			reject(error);
		})
	})
}

helperGetUserScores = (userRecord) => {
	const db = admin.database();

	const ref = db.ref(`/users/${userRecord.uid}`).orderByChild('healthscore');

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			let user = snapshot.val();
			let score = (user.health && user.health.score !== undefined && user.health.score.healthscore !== undefined) ? user.health.score.healthscore : 0;
			let medit = (user.wallet && user.wallet.medits !== undefined) ? user.wallet.medits : 0;
			// console.log(`User: ${userRecord.uid} - ${JSON.stringify(user, null, 2)}`);
			resolve({
				user: userRecord,
				score: score,
				medit: medit
			});
			return;
		})
		.catch ( error => {
			reject(error);
		})
	})
}

helperGetUserDevices = (userRecord) => {
	const db = admin.database();

	const ref = db.ref(`/users/${userRecord.uid}/profile`);

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			let user = snapshot.val();
			let device = (user.devices) ? user.devices : "N/A";
			let source = (user.sources ) ? user.sources : "N/A";
			// console.log(`User: ${userRecord.uid} - ${JSON.stringify(user, null, 2)}`);
			resolve({
				user: userRecord,
				device: device,
				source: source
			});
			return;
		})
		.catch ( error => {
			reject(error);
		})
	})
}

adminGetJourneyStats= (userRecord) => {
	const db = admin.database();

	const ref = db.ref(`/users/${userRecord.uid}/profile`);

	return new Promise( (resolve, reject) => {
		ref.once('value')
		.then( snapshot => {
			let user = snapshot.val();
			let journey = (user.journey) ? user.journey : "N/A";
			if (journey === "N/A") {
				console.log(`User N/A: ${userRecord.uid}`);
			}
			resolve({
				user: userRecord,
				journey: journey
			});
			return;
		})
		.catch ( error => {
			reject(error);
		})
	})
}

helperAddUserToLeaderboard = (userRecord, data) => {
	const db = admin.database();

	db.ref(`/leaderboard-admin/${userRecord.uid}`)
	.set({
		name: (userRecord.displayName) ? userRecord.displayName : "",
		email: userRecord.email,
		medit : data.medit,
		image : (userRecord.photoURL) ? userRecord.photoURL : "",
		change: "",
		anonymous: (data.anonymous) ? true : false
	})
	.then( response => {
		return JSON.stringify(response, null, 2);
	})
	.catch ( error => {
		return error;
	})
}

helperResetMedit = (userRecord, medit) => {
	const db = admin.database();

	if (medit >= 0) {
		db.ref(`/users-test/${userRecord.uid}/wallet`)
		.set({
			medex: 0,
			medits: (medit) ? medit : "",
		})
		.then( response => {
			return JSON.stringify(response, null, 2);
		})
		.catch ( error => {
			return error;
		})
	}
	return "Medit is not a valid argument"
}

helperCompare = (property, a, b) => {
	return (a,b) => {
		return a[property] - b[property];
	}
}

helperAddMeditStat = (stat) => {
	const db = admin.database();

	db.ref(`/stats/medit`)
	.set({
		total: (stat) ? stat : "",
	})
	.then( response => {
		return JSON.stringify(response, null, 2);
	})
	.catch ( error => {
		return error;
	})
}
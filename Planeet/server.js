// server.js

//#region Settings
var filename;
var bodyParser = require('body-parser');
var crypto = require('crypto');
var fs = require('fs');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

const formData = require('express-form-data');

var options = {
	uploadDir: './assets/uploadedFiles/',
	autoClean: true
};

const express = require('express');
const moment = require('moment');
const nodemailer = require('nodemailer');
var newUrlImage;
var dir;

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded());

// parse data with connect-multiparty.
app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream
app.use(formData.stream());
// union the body and the files
app.use(formData.union());

////////////////////////////////////////////////////
//mail things
async function mailVerification(email, token) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true,
		auth: {
			user: '', // generated ethereal user
			pass: '' // generated ethereal password
		}
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Planeet | mail verification" <planeetofficial@gmail.com>', // sender address
		to: email, // list of receivers
		subject: 'Verificate mail | Planeet', // Subject line
		text: 'Verification link: http://localhost:1984/verificatemail.html?token=' + token, // plain text body
		html:
			'<b>Verification link: <a href="http://localhost:1984/verificatemail.html?token=' +
			token +
			'">ClickHere</a></b>' // html body
	});

	console.log('Message sent: %s', info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	// console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
async function changepassword(email, token) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: '', // generated ethereal user
			pass: '' // generated ethereal password
		}
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Planeet | Request reset password" <planeetofficial@gmail.com>', // sender address
		to: email, // list of receivers
		subject: 'Reset password | Planeet', // Subject line
		text: 'Reset password link: http://localhost:1984/requestpassword.html?token=' + token, // plain text body
		html:
			'<b>Reset password link: <a href="http://localhost:1984/requestpassword.html?token=' +
			token +
			'">ClickHere</a></b>' // html body
	});

	console.log('Message sent: %s', info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
////////////////////////////////////////////////////

const PORT = (process.env.PORT = 1984);

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var o_id;
var url = 'mongodb://localhost:27017/';

//--------------------------------------------------------------

//-- DATABASES LISTS
var databaseSocial = 'databaseSocial';
var databaseChat = 'databaseChat';

//--------------------------------------------------------------

//-- COLLECTIONS LISTS
//- Collections social
var collectionUtenti = 'users';
var userInfo = 'userInfo';
var posts = 'post';
var follower = 'followers';

//- Collections chat
var allChats = 'allChats';

//--------------------------------------------------------------

//-- CREAZIONE INDEX -------------------------------------------
MongoClient.connect(url + databaseSocial, function(err, db) {
	if (err) throw err;
	console.log('Database social created!');
	db.close();
});

MongoClient.connect(url + databaseChat, function(err, db) {
	if (err) throw err;
	console.log('Database chat created!');
	db.close();
});

MongoClient.connect(url, function(err, db) {
	var dbo = db.db(databaseSocial);
	dbo.collection(collectionUtenti).createIndex({ token: 1 }, { unique: true, background: true, name: 'tokenUnique' });
});
//--------------------------------------------------------------
//#endregion

//#region useFullMethods
function randomString(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
//#endregion

//#region Follower

//----- FOLLOWER -----------------------------------------------------------------

// /db/FollowUnfollowCheck --> FollowCheck(id, account, callback)
// RES --> U[...] / F[...]
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Follow) end]
app.post('/db/FollowUnfollowCheck', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		var queryFollow = { username: req.body.idUser, account: '' };
		var queryGetId = { username: req.body.Followed };
		var idSeguito;

		dbo.collection(collectionUtenti).findOne(queryGetId, function(errFind, resultFind) {
			if (errFind) res.send('err Find'); //throw errFind;
			if (resultFind != null) {
				idSeguito = resultFind._id;
				queryFollow.account = idSeguito.toString();

				dbo.collection(follower).findOne(queryFollow, function(errFollow, resultFollow) {
					if (errFollow) res.send('error Follow'); //throw errFollow;
					if (resultFollow != null) {
						res.send('U|' + queryFollow.username + '|' + queryFollow.account);
					} else {
						res.send('F|' + queryFollow.username + '|' + queryFollow.account);
					}
					db.close();
				});
			}
			db.close();
		});
	});
});

// /db/FollowUser --> followUser(username, account, callback)
// RES --> F
//     --> error [error (Connection) end]
//     --> error [error (Insert) end]
app.post('/db/FollowUser', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		var query = { username: req.body.username, account: req.body.account };

		dbo.collection(follower).insertOne(query, function(errInsert, resInsert) {
			if (errInsert) res.send('error Insert'); // throw errInsert;
			console.log(req.body.username + '|Follow|' + req.body.account);
			res.send('F');
			db.close();
		});
	});
});

// /db/unfollowUser --> unfollowUser(username, account, callback)
// RES --> U
//     --> error [error (Connection) end]
//     --> error [error (Delete) end]
app.post('/db/unfollowUser', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		var query = { username: req.body.username, account: req.body.account };

		dbo.collection(follower).deleteOne(query, function(errDelete, objDelete) {
			if (errDelete) res.send('error Delete'); // throw errDelete;
			console.log(req.body.username + '|Unfollow|' + req.body.account);
			res.send('U');
			db.close();
		});
	});
});

// /db/ArrayFollower --> getFollowerArray(username, callback)
// RES --> U
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/ArrayFollower', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		dbo.collection(follower).find({ username: req.body.username }).toArray(function(errFind, resultFind) {
			if (errFind) res.send('error Find'); // throw errFind;
			res.send(resultFind);
		});
	});
});

//--------------------------------------------------------------------------------

//#endregion

//#region Account

//----- ACCOUNT -----------------------------------------------------------------

// /db/registerUtente --> register(mail, password, rePassword, securityQuestion, username, securityAnswere, callback)
// RES --> Register[...] / E
//     --> error [error (Connection) end]
//     --> error [error (errFind1) end]
//     --> error [error (errFind2) end]
//     --> error [error (not same password) end]
app.post('/db/registerUtente', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);
		if (req.body.Password == req.body.rePassword) {
			dbo
				.collection(collectionUtenti)
				.findOne({ $or: [ { username: req.body.username }, { mail: req.body.mail } ] }, function(
					errFind1,
					resultFind1
				) {
					if (errFind1) res.send('error errFind1'); //throw errFind1
					if (resultFind1 != null) {
						console.log('Error: same mail or username[' + req.body.mail + ':' + req.body.username + ']');
						res.send('E');
					} else {
						var tokenRegister = randomString(50);

						var myobj = {
							username: req.body.username,
							mail: req.body.mail,
							password: crypto.createHash('sha256').update(req.body.Password).digest('hex'),
							securitysecurityQuestion: req.body.securityQuestion,
							securitysecurityAnswere: req.body.securityAnswere,
							validation: false,
							token: tokenRegister,
							endToken: moment().add(7, 'd').toDate(),
							firstLogin: true
						};

						dbo.collection(collectionUtenti).insertOne(myobj, function(errFind2, resultFind2) {
							if (errFind2) res.send('error errFind2'); //throw errFind2;

							mailVerification(req.body.mail, tokenRegister);

							console.log(
								'Register: account registrato[' + req.body.mail + ':' + req.body.username + ']'
							);
							res.send(
								'Register: account registrato[' +
									req.body.mail +
									':' +
									req.body.username +
									']' +
									myobj._id
							);
							db.close();
						});
					}
				});
		} else {
			console.log('Eerror not same password ' + req.body.Password + ' - ' + req.body.rePassword);
			res.send('error not same password');
		}
	});
});

// /db/validateAccount --> validateAccount(token, callback)
// RES --> TG[...]
//     --> error [error (Connection) end]
//     --> error [error (errFind) end]
//     --> error [error (Update) end]
//     --> error [error (timeouttoken) end]
app.post('/db/validateAccount', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		dbo.collection(collectionUtenti).findOne({ token: req.body.token }, function(errFind, resultFind) {
			if (resultFind != null) {
				if (errFind) res.send('error errFind'); //throw errFind;
				if (resultFind.endToken.getTime() > moment().toDate().getTime()) {
					console.log('VerificateTime: tokenIsOk');
					var newtoken = randomString(50);
					var myquery = { token: req.body.token };
					var newvalues = {
						$set: {
							_id: resultFind._id,
							mail: resultFind.mail,
							password: resultFind.password,
							token: newtoken,
							endToken: moment().add(5, 'h').toDate(),
							validation: true
						}
					};
					dbo.collection(collectionUtenti).updateOne(myquery, newvalues, function(errUpdate, res) {
						if (errUpdate) res.send('error Update'); //throw errUpdate;
						console.log('Validation:validazione effettuata --> ' + resultFind.username);
						db.close();
					});

					res.send('TG:' + newtoken);
				} else {
					console.log('error timeouttoken');
					res.send('error timeouttoken');
				}
				console.log('validateUser:' + resultFind.mail);
				db.close();
			}
		});
	});
});

// /db/loginUtente --> loginAccount(username, password, callback)
// RES --> FTG[...] / TG[...]
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (FsDirAccount) end]
//     --> error [error (Update) end]
//     --> error [error (password non valida) end]
//     --> error [error (Account non verificato) end]
//     --> error [error (mail non trovata) end]
app.post('/db/loginUtente', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);
		var query = { username: req.body.username };
		dbo.collection(collectionUtenti).findOne(query, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); // throw errFind;
			if (resultFind != null) {
				if (resultFind.validation) {
					if (resultFind.password == crypto.createHash('sha256').update(req.body.Password).digest('hex')) {
						var token = randomString(50);
						var newvalues = { $set: { token: token, endToken: moment().add(4, 'h').toDate() } };

						if (resultFind.firstLogin) {
							var dir = 'assets/uploadedFiles/' + req.body.username;
							var dirAccount = 'assets/uploadedFiles/' + req.body.username + '/account';

							fs.mkdir(dir, function() {
								fs.mkdir(dirAccount, function() {
									fs.copyFile(
										'assets/uploadedFiles/Default/userPicture.png',
										'assets/uploadedFiles/' + req.body.username + '/account/profilePicture.png',
										(errFsDirAccount) => {
											if (errFsDirAccount) res.send('error FsDirAccount'); // throw errFsDirAccount;
										}
									);
								});
							});

							dbo
								.collection(collectionUtenti)
								.updateOne({ username: req.body.username }, newvalues, function(errUpdate, resUpdate) {
									if (errUpdate) res.send('error Update'); // throw errUpdate;
									console.log(
										'First Log-in:' +
											resultFind.username +
											' | ' +
											token +
											' | ' +
											moment(newvalues.endToken).format('h:m:ss:SSS')
									);
									db.close();
								});
							console.log('FTG:' + token + '-' + resultFind._id);
							res.send('FTG:' + token + '-' + resultFind._id);
						} else {
							dbo
								.collection(collectionUtenti)
								.updateOne({ username: req.body.username }, newvalues, function(errUpdate2, res) {
									if (errUpdate2) res.send('error Update2'); // throw errUpdate;
									console.log(
										'Log-in:' +
											resultFind.username +
											' | ' +
											token +
											' | ' +
											moment(newvalues.endToken).format('h:m:ss:SSS')
									);
									db.close();
								});
							console.log('TG:' + token + '-' + resultFind._id);
							res.send('TG:' + token + '-' + resultFind._id);
						}
					} else {
						//password non corretta
						console.log('error password non valida');
						res.send('error password non valida');
					}
				} else {
					console.log('error Account non verificato');
					res.send('error Account non verificato');
				}
			} else {
				console.log('error mail non trovata');
				res.send('error mail non trovata');
			}
			db.close();
		});
	});
});

// /db/upgradetoken--> upgradeToken(userID, callback)
// RES --> tokenChange[...]
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
//     --> error [error (timeouttoken) end]
//     --> error [error (not found token) end]
app.post('/db/upgradetoken', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);

		o_id = new ObjectId(req.body.userID);
		var queryUser = { id: o_id };

		dbo.collection(collectionUtenti).findOne(queryUser, function(errFind, resultFind) {
			if (resultFind != null) {
				var newtoken = randomString(50);
				if (errFind) res.send('error Find'); //throw errFind;
				if (resultFind.endToken.getTime() > resultFind.token.getTime()) {
					var newvalues = { $set: { token: newtoken, endToken: moment().add(5, 'h').toDate() } };
					dbo
						.collection(collectionUtenti)
						.updateOne({ username: req.body.username }, newvalues, function(errUpdate, resUpdate) {
							if (errUpdate) res.send('error Update'); //throw errUpdate;
							db.close();
						});
					res.send('tokenChange:' + newtoken);
				} else {
					console.log('error timeouttoken');
					res.send('error timeouttoken');
				}
			} else {
				res.send('error not found token');
			}
		});
	});
});

// /db/checktoken --> checktoken(username, token, callback)
// RES --> S / TG[...]
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
//     --> error [error (not found) end]
app.post('/db/checktoken', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);
		dbo
			.collection(collectionUtenti)
			.findOne({ username: req.body.username, token: req.body.token }, function(errFindOne, resultFind) {
				if (errFindOne) res.send('error Find'); //throw errFindOne
				if (resultFind != null) {
					var newtoken = randomString(50);
					if (err) throw err;
					if (resultFind.endToken.getTime() < moment().toDate().getTime()) {
						res.send('S:scaduto');
					} else {
						var newvalues = { $set: { token: newtoken, endToken: moment().add(5, 'h').toDate() } };
						dbo
							.collection(collectionUtenti)
							.updateOne({ username: req.body.username }, newvalues, function(errUpdate, resUpdate) {
								if (errUpdate) res.send('error Update'); //throw errUpdate;
								db.close();
							});
						res.send('TG:' + newtoken);
						console.log('TG: changetoken');
					}
				} else {
					res.send('Error not found');
				}
			});
	});
});

// '/db/addInformation' --> addInformation(id, username, name, surname, birthDay, sentimental, musics, films, bio, callback)
// RES --> Info[..]
//     --> error [error (Connection) end]
//     --> error [error (FindUserInfo) end]
//     --> error [error (Insert) end]
//     --> error [error (InvalidData) end]
//     --> error [error (Update) end]
app.post('/db/addInformation', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);
		dbo.collection(userInfo).findOne({ username: req.body.username }, function(errFindUserInfo, resultFind) {
			if (errFindUserInfo) res.send('error FindUserInfo'); //throw errFindUserInfo;
			if (resultFind == null) {
				var myobj = {
					id: req.body.id,
					name: req.body.name,
					surname: req.body.surname,
					birthDay: req.body.birthDay,
					sentimental: req.body.sentimental,
					musics: req.body.musics,
					films: req.body.films,
					bio: req.body.bio
				};
				dbo.collection(userInfo).insertOne(myobj, function(errInsert, resInsert) {
					if (errInsert) res.send('error Insert'); //throw errInsert;
					console.log('Info: from[' + req.body.username + ']');
					res.send('Info: from[' + req.body.username + ']');
					db.close();
				});
			} else {
				res.send('Error invalid Data');
			}
		});
		dbo
			.collection(collectionUtenti)
			.findOne({ username: req.body.username }, function(errFindCollectionUtenti, resultFindCollectionUtenti) {
				if (errFindCollectionUtenti) res.send('error FindCollectionUtenti'); //throw errFindCollectionUtenti;
				if (resultFindCollectionUtenti != null) {
					var newvalues = { $set: { firstLogin: false } };
					dbo
						.collection(collectionUtenti)
						.updateOne({ username: req.body.username }, newvalues, function(errUpdate, resUpdate) {
							if (errUpdate) res.send('error Update'); // throw errUpdate;
							db.close();
						});
				} else {
					res.send('Error invalid Data');
				}
			});
	});
});

// /db/getUser --> getUser(token, callback)
// RES --> GetUser[...] [data changed correct end]
//     --> error [error (Find) end]
//     --> error [error (Connection) end]
app.post('/db/getUser', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		dbo.collection(collectionUtenti).findOne({ token: req.body.token }, function(errFind, result) {
			console.log(req.body.token);
			if (errFind) res.send('error Find'); //throw errConnection
			if (result != null) {
				console.log('GetUser: from|' + result.username + '|' + result._id);
				res.send('GetUser: from|' + result.username + '|' + result._id);
				db.close();
			} else {
				res.send('Error: invalid data');
			}
		});
	});
});

// /db/checkLogin --> checkLogin(username, token, callback)
// RES --> Y / N [...]
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
app.post('/db/checkLogin', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		dbo
			.collection(collectionUtenti)
			.findOne({ token: req.body.token, username: req.body.username, firstLogin: false }, function(
				errFind,
				resultFind
			) {
				if (errFind) res.send('error Find'); // throw errFind;
				if (resultFind != null) {
					if (resultFind.endToken.getTime() < moment().toDate().getTime()) {
						res.send('N checkLogin');
						db.close();
					} else {
						var newtoken = randomString(50);

						var newvalues = { $set: { token: newtoken, endToken: moment().add(5, 'h').toDate() } };
						dbo
							.collection(collectionUtenti)
							.updateOne({ username: req.body.username }, newvalues, function(errUpdate, resUpdate) {
								if (errUpdate) res.send('error Update'); //throw errUpdate;
								db.close();
							});

						res.send('Y checkLogin: true|' + newtoken);
						db.close();
					}
				} else {
					res.send('N checkLogin');
					db.close();
				}
			});
	});
});

// /db/updateFilmArray --> updateFilm(id, arrayFilm, callback)
// RES --> updated [data changed correct end]
//     --> error [error (Update) end]
//     --> error [error (Connection) end]
app.post('/db/updateFilmArray', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		var myquery = { id: req.body.id };
		var newvalues = { $set: { films: req.body.arrayFilm } };
		dbo.collection(userInfo).updateOne(myquery, newvalues, function(errUpdate, resUpdate) {
			if (errUpdate) throw errUpdate;
			res.send('updated');
			db.close();
		});
	});
});

// /db/updateMusicArray --> updateMusic(id, arrayMusic, callback)
// RES --> updated [data changed correct end]
//     --> error [error (Update) end]
//     --> error [error (Connection) end]
app.post('/db/updateMusicArray', function(req, res) {
	MongoClient.connect(url, function(err, db) {
		if (err) res.send('error Connection'); //throw err;
		var dbo = db.db(databaseSocial);
		var myquery = { id: req.body.id };
		var newvalues = { $set: { musics: req.body.arrayMusic } };
		dbo.collection(userInfo).updateOne(myquery, newvalues, function(errUpdate, resUpdate) {
			if (errUpdate) res.send('error Update'); //throw errUpdate;
			res.send('updated');
			db.close();
		});
	});
});

// /db/checkUpdateUsername --> changeUsername(id, username, newUsername, callback)
// RES -->
//     --> error [error (Connection) end]
//	   --> error [error (errFindNew) end]
//	   --> error [error (Update) end]
//     --> error [error (fsRename) end]
app.post('/db/checkUpdateUsername', function(req, res) {
	MongoClient.connect(url, function(err, db) {
		if (err) res.send('error Connection'); //throw err;
		var dbo = db.db(databaseSocial);
		o_id = new ObjectId(req.body.idUser);

		var oldValue = { _id: o_id };
		var querySearch = { username: req.body.newUsername };
		var newvalues = { $set: { username: req.body.newUsername } };

		console.log(req.body.idUser + ' --> ' + req.body.newUsername);

		dbo.collection(collectionUtenti).findOne(querySearch, function(errFindNew, result) {
			if (errFindNew) res.send('error errFindNew'); //throw errFindNew;
			if (result != null) {
				console.log('NoChange');
				res.send('NoChange');
				db.close();
			} else {
				dbo.collection(collectionUtenti).updateOne(oldValue, newvalues, function(errUpdate, res2) {
					if (errUpdate) res.send('error Update'); //throw errUpdate;
					console.log('OkChange');
					res.send('OkChange');
					fs.rename(
						'assets/uploadedFiles/' + req.body.username,
						'assets/uploadedFiles/' + req.body.newUsername,
						function(errChangeName) {
							if (errChangeName) res.send('error fsRename');
						}
					);
					db.close();
				});
			}
		});
	});
});

// /db/forgotpassword --> forgotPasswod(Password, rePassword, Username, SecurityQuestion, SecurityAnswere, callback);
// RES --> password Reset[...]
//     --> error [error (Connection) end]
//     --> error [error (errFind) end]
//     --> error [error (Update) end]
//     --> error [error (account non verificato) end]
//     --> error [error (account non trovato) end]
//     --> error [error (password not match) end]
app.post('/db/forgotpassword', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		if (req.body.password == req.body.rePassword) {
			var query = {
				username: req.body.username,
				securitysecurityAnswere: req.body.securityAnswere,
				securitysecurityQuestion: req.body.securityQuestion
			};
			dbo.collection(collectionUtenti).findOne(query, function(errFind, result) {
				if (errFind) res.send('error errFind'); //throw errFind;
				if (result != null) {
					if (result.validation) {
						//tutto controllato
						var newvalues = {
							$set: {
								_id: result._id,
								username: result.username,
								password: crypto.createHash('sha256').update(req.body.Password).digest('hex')
							}
						};
						dbo.collection(collectionUtenti).updateOne(query, newvalues, function(errUpdate, res) {
							if (errUpdate) res.send('error Update'); //throw errUpdate;
							console.log('password Reset:' + result.uername + ' | ' + req.body.rePassword);
							db.close();
						});
						res.send('password Reset:' + result.username + ' | ' + req.body.rePassword);
					} else {
						console.log('error account non verificato');
						res.send('error account non verificato');
					}
				} else {
					console.log('error account non trovato');
					res.send('error account non trovato');
				}
				db.close();
			});
		} else {
			console.log('error password not match');
			res.send('error password not match');
		}
	});
});

// /db/Resetpassword --> resetPassword(Password, rePassword, Username, SecurityQuestion, SecurityAnswere, Mail, Token, callback);
// RES --> password Reset[...]
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
//     --> error [error (account not found) end]
//     --> error [error (not same password) end]
app.post('/db/Resetpassword', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		if (req.body.password == req.body.rePassword) {
			dbo.collection(collectionUtenti).findOne({
				username: req.body.username,
				securitysecurityQuestion: req.body.securityQuestion,
				securityAnswer: req.body.securityAnswere,
				mail: req.body.mail,
				token: req.body.token
			}, function(errFind, resultFind) {
				if (errFind) res.send('error Find'); //throw errFind
				if (resultFind != null) {
					var newtoken = randomString(50);
					var newvalues = {
						$set: {
							password: crypto.createHash('sha256').update(req.body.password).digest('hex'),
							token: newtoken
						}
					};

					dbo
						.collection(collectionUtenti)
						.updateOne({ mail: req.body.username }, newvalues, function(errUpdate, resUpdate) {
							if (errUpdate) res.send('error Update'); //throw errUpdate;
							console.log('Reset password:' + resultFind.token + ' | ' + newtoken);
							db.close();
						});
					res.send('OK:' + newtoken);
				} else {
					console.log('error account not found');
					res.send('error account not found');
				}
			});
		} else {
			console.log('error not same password');
			res.send('error not same password');
		}
	});
});

// /db/ResetpasswordRequest --> resetPasswordRequest(username, mail, callback);
// RES --> password[...]
//     --> error [error (Connection) end]
//     --> error [error (reset password request not found) end]
app.post('/db/ResetpasswordRequest', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		dbo
			.collection(collectionUtenti)
			.findOne({ username: req.body.username, mail: req.body.mail }, function(errFind, resultFind) {
				if (resultFind != null) {
					// send mail to the account request
					changepassword(req.body.mail, token);
					console.log('password reset password request send | ' + req.body.username);
					res.send('password reset password request send | ' + req.body.username);
				} else {
					// not found account with securityQuestion, answer, username
					console.log('error reset password request not found | ' + req.body.username);
					res.send('error reset password request not found | ' + req.body.username);
				}
			});
	});
});

// /db/changeBio --> changeBio(id, newBio, callback)
// RES --> OkChange
//     --> error [error (Connection) end]
//     --> error [error (update) end]
app.post('/db/changeBio', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		var query = { id: req.body.idUser };
		var newvalues = { $set: { bio: req.body.bio } };

		dbo.collection(userInfo).updateOne(query, newvalues, function(errUpdate, resUpdate) {
			if (errUpdate) res.send('error update'); //throw errUpdate;
			res.send('OkChange');
			db.close();
		});
	});
});

// /db/changeBirthday --> changeBirthday(id, birthday, callback)
// RES --> OkChange
//     --> error [error (Connection) end]
//     --> error [error (update) end]
app.post('/db/changeBirthday', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		var query = { id: req.body.idUser };
		var newvalues = { $set: { birthDay: req.body.birthday } };

		dbo.collection(userInfo).updateOne(query, newvalues, function(errUpdate, resUpdate) {
			if (errUpdate) res.send('error update'); //throw errUpdate;
			res.send('OkChange');
			db.close();
		});
	});
});

//-------------------------------------------------------------------------------

//#endregion

//#region Posts

//----- POSTS -----------------------------------------------------------------

// /db/setPost --> postSomething(idUser, text, callback)
// RES --> resultInsert.insertedId.toString()
//     --> error [error (Connection) end]
//     --> error [error (Insert) end]
app.post('/db/setPost', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		var myobj = {
			idUser: req.body.idUser.toString(),
			text: req.body.text,
			url: [],
			date: moment().toDate().getTime()
		};
		dbo.collection(posts).insertOne(myobj, function(errInsert, resultInsert) {
			if (errInsert) res.send('error Insert'); //throw errInsert;
			res.send('' + resultInsert.insertedId.toString());
			db.close();
		});
	});
});

// /db/FollowerPosts --> getFollowerPosts(array, numberPagePost, number, callback)
// RES --> resultInsert.insertedId.toString()
//     --> error [error (Connection) end]
//     --> error [error (Insert) end]
app.post('/db/FollowerPosts', function(req, res) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(databaseSocial);
		var offset;
		var limite;
		var initialPost = Math.round(req.body.numberPagePost / 2 * 3);

		if (req.body.number == 0) {
			offset = 0;
			limite = parseInt(initialPost);
		} else {
			offset = initialPost + req.body.numberPagePost * (req.body.number - 1);
			limite = parseInt(req.body.numberPagePost);
		}

		dbo
			.collection(posts)
			.find({ idUser: { $in: req.body.array } })
			.sort({ date: -1 })
			.limit(limite)
			.skip(offset)
			.toArray(function(err, resultONE) {
				res.send(resultONE);
			});
	});
});

// /db/updatePost --> updatePostImage(id, url, callback)
// RES --> resultInsert.insertedId.toString()
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
app.post('/db/updatePost', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);
		o_id = new ObjectId(req.body.id);

		var myquery = { _id: o_id };
		var newvalues = { $set: { url: req.body.url } };
		var arrayUrl = [];

		dbo.collection(posts).findOne(myquery, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			arrayUrl = resultFind.url;
			arrayUrl.push(req.body.url);
			newvalues = { $set: { url: arrayUrl } };

			dbo.collection(posts).updateOne(myquery, newvalues, function(errUpdate, resultUpdate) {
				if (errUpdate) res.send('error Update'); //throw errUpdate;
				res.send('ok campione');
				db.close();
			});

			db.close();
		});
	});
});

// /db/getUsernameFromId --> getUsernameFromID(id, callback)
// RES --> resultInsert.insertedId.toString()
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/getUsernameFromId', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		o_id = ObjectId(req.body.id);
		var query = { _id: o_id };
		dbo.collection(collectionUtenti).findOne(query, { projection: { username: 1 } }, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			if (resultFind != null || resultFind != undefined) {
				res.send(resultFind.username);
			}
			db.close();
		});
	});
});

// /db/getSpecificUserPost --> getSpecificUserPost(id, callback)
// RES --> resultFind
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/getSpecificUserPost', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseSocial);

		var query = { idUser: req.body.id };
		dbo.collection(posts).find(query).sort({ date: -1 }).toArray(function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			res.send(resultFind);
			db.close();
		});
	});
});

//-----------------------------------------------------------------------------

//#endregion

//#region Messages

// /db/sendMessageUser --> sendMsgMethod(fromID, toID, text, callback)
// RES --> msgDocument
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
//     --> error [error (chat not in allChats) end]
app.post('/db/sendMessageUser', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var arrayUsername = [];
		arrayUsername.push(req.body.from);
		arrayUsername.push(req.body.to);
		arrayUsername.sort();

		var query = { user0: arrayUsername[0], user1: arrayUsername[1] };
		var chatCollection = '' + arrayUsername[0] + '|' + arrayUsername[1] + '';
		var newvalues = { $set: { date: moment().toDate() } };
		var msgDocument = {
			from: req.body.from,
			to: req.body.to,
			text: req.body.text,
			url: [],
			readOther: false,
			date: moment().toDate()
		};

		dbo.collection(allChats).findOne(query, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			if (resultFind != null && resultFind != undefined) {
				newvalues.$set['read:' + arrayUsername[0]] = resultFind['read:' + arrayUsername[0]] + 1;
				newvalues.$set['read;' + arrayUsername[1]] = resultFind['read;' + arrayUsername[1]] + 1;

				dbo.collection(allChats).updateOne(query, newvalues, function(errUpdate, resUpdate) {
					if (errUpdate) res.send('error Update'); //throw errUpdate;
					insertMessage(msgDocument, chatCollection, function() {
						res.send(msgDocument);
					});
				});
			} else {
				res.send('error chat not in allChats');
			}
			db.close();
		});
	});
});

// /db/initializeEmptyChat --> initializeEmptyChat(userID, accountID, callback)
// RES --> resultFind
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/initializeEmptyChat', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var arrayUser = [];
		arrayUser.push(req.body.userID);
		arrayUser.push(req.body.accountID);
		arrayUser.sort();

		var collectionName = arrayUser[0] + '|' + arrayUser[1];
		//var query = { readOther: true };
		var query = { $or: [ { readOther: true }, { from: req.body.userID } ] };
		var mysort = { date: 1 };

		dbo.collection(collectionName).find(query).sort(mysort).toArray(function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			res.send(resultFind);
			db.close();
		});
	});
});

// /db/addChatAllChat --> addChat(userID, accountID, callback)
// RES --> resultFind
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Insert) end]
app.post('/db/addChatAllChat', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var arrayUsername = [];
		arrayUsername.push(req.body.userID);
		arrayUsername.push(req.body.accountID);
		arrayUsername.sort();

		var query = { user0: arrayUsername[0], user1: arrayUsername[1] };
		var objInsert = {
			user0: arrayUsername[0],
			user1: arrayUsername[1],
			date: moment().toDate()
		};
		objInsert['read:' + arrayUsername[0]] = 0;
		objInsert['read;' + arrayUsername[1]] = 0;

		dbo.collection(allChats).findOne(query, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			if (resultFind == null || resultFind == undefined) {
				dbo.collection(allChats).insertOne(objInsert, function(errInsert, resInsert) {
					if (errInsert) res.send('error Insert'); //throw errInsert;
					console.log('chat created: ' + arrayUsername[0] + '|' + arrayUsername[1]);
					res.send('chatCreated');
					db.close();
				});
			}
			db.close();
		});
	});
});

// /db/readSingleMessage --> readSingleMessage(userID, accountID, callback)
// RES --> 'messageReaded'
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
app.post('/db/readSingleMessage', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var arrayUsername = [];
		arrayUsername.push(req.body.userID);
		arrayUsername.push(req.body.accountID);
		arrayUsername.sort();

		var query = { user0: arrayUsername[0], user1: arrayUsername[1] };
		var newvalues = { $set: { date: moment().toDate() } };

		dbo.collection(allChats).findOne(query, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;

			if (req.body.userID != arrayUsername[0]) {
				newvalues.$set['read;' + req.body.userID] = resultFind['read;' + req.body.userID] - 1;

				dbo.collection(allChats).updateOne(query, newvalues, function(errUpdate, resUpdate) {
					if (errUpdate) res.send('error Update'); //throw errUpdate;
					res.send('messageReaded');
					dbo.close();
				});
			} else {
				newvalues.$set['read:' + req.body.userID] = resultFind['read:' + req.body.userID] - 1;

				dbo.collection(allChats).updateOne(query, newvalues, function(errUpdate, resUpdate) {
					if (errUpdate) res.send('error Update'); //throw errUpdate;
					res.send('messageReaded');
					dbo.close();
				});
			}
		});
	});
});

// /db/checkMessages --> checkMessages(userID, callback)
// RES --> resultFind
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/checkMessages', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var greatherThan0 = {};
		var greatherThan1 = {};
		greatherThan0['read:' + req.body.userID] = { $gt: -1 };
		greatherThan1['read;' + req.body.userID] = { $gt: -1 };

		var query = { $or: [] };
		query.$or.push(greatherThan0);
		query.$or.push(greatherThan1);

		dbo
			.collection(allChats)
			.find(query, { projection: { _id: 0, date: 0 } })
			.toArray(function(errFind, resultFind) {
				if (errFind) res.send('error Find'); //throw errFind;
				res.send(resultFind);
				db.close();
			});
	});
});

// /db/readChatCollection --> readChatCollection(userID, accountID, callback)
// RES --> resultFind
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/readChatCollection', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var arrayUser = [];
		arrayUser.push(req.body.userID);
		arrayUser.push(req.body.accountID);
		arrayUser.sort();

		var collectionName = arrayUser[0] + '|' + arrayUser[1];

		var query = { to: req.body.userID, readOther: false };

		dbo
			.collection(collectionName)
			.find(query, { projection: { readOther: 0 } })
			.toArray(function(errFind, resultFind) {
				if (errFind) res.send('error Find'); //throw errFind;
				res.send(resultFind);
				db.close();
			});
	});
});

// /db/readMessageID --> readSingleMessageID(userID, accountID, id, callback)
// RES --> 'up'
//     --> error [error (Connection) end]
//     --> error [error (Update) end]
app.post('/db/readMessageID', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		o_id = ObjectId(req.body.id);

		var arrayUser = [];
		arrayUser.push(req.body.userID);
		arrayUser.push(req.body.accountID);
		arrayUser.sort();

		var collectionName = arrayUser[0] + '|' + arrayUser[1];

		var query = { _id: o_id };
		var newvalues = { $set: { readOther: true } };

		dbo.collection(collectionName).updateOne(query, newvalues, function(errUpdate, resUpdate) {
			if (errUpdate) res.send('error Update'); //throw errUpdate;
			res.send('up');
			db.close();
		});
	});
});

// /db/checkInitialChats --> checkInitialChats(userID, callback)
// RES --> arrayReturn
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/checkInitialChats', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var greatherThan0 = {};
		var greatherThan1 = {};
		greatherThan0['read:' + req.body.userID] = { $gt: -1 };
		greatherThan1['read;' + req.body.userID] = { $gt: -1 };

		var query = { $or: [] };
		query.$or.push(greatherThan0);
		query.$or.push(greatherThan1);
		var arrayReturn = [];

		dbo
			.collection(allChats)
			.find(query, { projection: { _id: 0, date: 0 } })
			.toArray(function(errFind, resultFind) {
				if (errFind) res.send('error Find'); //throw errFind;
				for (var i = 0; i < resultFind.length; i++) {
					if (
						resultFind[i]['read:' + req.body.userID] != undefined ||
						resultFind[i]['read:' + req.body.userID] != null
					) {
						if (resultFind[i]['read:' + req.body.userID] > 0) {
							arrayReturn.unshift(resultFind[i]);
						} else {
							arrayReturn.push(resultFind[i]);
						}
					} else {
						if (resultFind[i]['read;' + req.body.userID] > 0) {
							arrayReturn.unshift(resultFind[i]);
						} else {
							arrayReturn.push(resultFind[i]);
						}
					}
					if (i == resultFind.length - 1) {
						res.send(arrayReturn);
						db.close();
					}
				}
			});
	});
});

// /db/readAllChatMessage --> readAllChat(userID, accountID, callback)
// RES --> 'upAll'
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
//     --> error [error (Update) end]
app.post('/db/readAllChatMessage', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var arrayUser = [];
		arrayUser.push(req.body.userID);
		arrayUser.push(req.body.accountID);
		arrayUser.sort();

		var query = { user0: arrayUser[0], user1: arrayUser[1] };
		var newvalues = { $set: { date: moment().toDate() } };

		dbo.collection(allChats).findOne(query, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			if (arrayUser[0] != req.body.userID) {
				newvalues.$set['read;' + req.body.userID] = resultFind['read;' + req.body.userID] - 1;
			} else {
				newvalues.$set['read:' + req.body.userID] = resultFind['read:' + req.body.userID] - 1;
			}

			dbo.collection(allChats).updateOne(query, newvalues, function(errUpdate, resUpdate) {
				if (errUpdate) res.send('error Update'); //throw errUpdate;
				res.send('upAll');
				db.close();
			});
		});
	});
});

// /db/readAllNotifications --> readAllChatNotifications(userID, callback)
// RES --> returnNumber / '0'
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/readAllNotifications', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); //throw errConnection;
		var dbo = db.db(databaseChat);

		var greatherThan0 = {};
		var greatherThan1 = {};

		var query = { $or: [ { date: -1 } ] };
		greatherThan0['read:' + req.body.userID] = { $gt: 0 };
		greatherThan1['read;' + req.body.userID] = { $gt: 0 };
		query.$or.push(greatherThan0);
		query.$or.push(greatherThan1);

		dbo.collection(allChats).find(query).toArray(function(errFind, resultFind) {
			if (errFind) res.send('error Find'); //throw errFind;
			var returnNumber = 0;
			if (resultFind.length != 0) {
				for (var i = 0; i < resultFind.length; i++) {
					if (resultFind[i]['read:' + req.body.userID] != undefined) {
						returnNumber += resultFind[i]['read:' + req.body.userID];
					} else {
						returnNumber += resultFind[i]['read;' + req.body.userID];
					}
					if (i == resultFind.length - 1) {
						res.send(returnNumber.toString());
					}
				}
				db.close();
			} else {
				res.send('0');
				db.close();
			}
		});
	});
});

//#endregion

//#region Images

// /db/uploadImage --> uploadImg(img, callback)
// RES --> ./assets/uploadedFiles/Smistare/[...]
//     --> error [error (copy) end]
app.post('/db/uploadImage', multipartMiddleware, function(req, res) {
	console.log(req);
	filename = req.files.myFile.path.split('\\');
	filename = filename[filename.length - 1];
	console.log('uploaded: ' + filename);
	fs.copyFile(req.files.myFile.path, './assets/uploadedFiles/Smistare/' + filename, (errCopy) => {
		if (errCopy) res.send('error copy'); // throw errCopy;
		res.send('./assets/uploadedFiles/Smistare/' + filename);
	});
});

// /db/saveImage --> saveImage(url, username, type, otherType, photoSpecificName, callback)
// RES --> newUrlImage
//     --> error [error (FirstCopy) end]
//     --> error [error (SecondCopy) end]
//     --> error [error (ThirdCopy) end]
//     --> error [error (FourthCopy) end]
//     --> error [error (FifthCopy) end]
//     --> error [error (SixCop) end]
//     --> error [error (FinalCopy) end]
app.post('/db/saveImage', function(req, res) {
	filename = req.body.url.split('/');
	filename = filename[filename.length - 1];
	dirUser = './assets/uploadedFiles/' + req.body.username + '/';
	dirFolder = './assets/uploadedFiles/' + req.body.username + '/' + req.body.type + '/';
	dirOtherType = './assets/uploadedFiles/' + req.body.username + '/' + req.body.type + '/' + req.body.otherType + '/';

	if (req.body.photoSpecificName != '') {
		newUrlImage = dirOtherType + req.body.photoSpecificName;
	} else {
		newUrlImage = dirOtherType + filename;
	}

	if (req.body.otherType == null) {
		if (!fs.existsSync(dirFolder)) {
			//Cartella specifica non esiste

			if (!fs.existsSync(dirUser)) {
				//La cartella utente non esiste
				fs.mkdirSync(dirUser, 0744);
				fs.mkdirSync(dirFolder, 0744);
				fs.copyFile(req.body.url, newUrlImage, (errFirstCopy) => {
					if (errFirstCopy) res.send('error FirstCopy'); // throw errFirstCopy;
					res.send(newUrlImage);
					fs.unlinkSync(req.body.url);
				});
			} else {
				//La cartella utente esiste
				fs.mkdirSync(dirFolder, 0744);
				fs.copyFile(req.body.url, newUrlImage, (errSecondCopy) => {
					if (errSecondCopy) res.send('error SecondCopy'); // throw errSecondCopy;
					res.send(newUrlImage);
					fs.unlinkSync(req.body.url);
				});
			}
		} else {
			//cartella specifica Esiste
			fs.copyFile(req.body.url, newUrlImage, (errThirdCopy) => {
				if (errThirdCopy) res.send('error ThirdCopy'); //throw errThirdCopy;
				res.send(newUrlImage);
				fs.unlinkSync(req.body.url);
			});
		}
	} else {
		if (!fs.existsSync(dirOtherType)) {
			//SpecificOtherTypeFolder doesen't exists

			//All checks
			if (!fs.existsSync(dirFolder)) {
				//user and folder doesen't exists

				if (!fs.existsSync(dirUser)) {
					//user folder doesen't exists

					fs.mkdirSync(dirUser, 0744); //create Type folder
					fs.mkdirSync(dirFolder, 0744); //create Type folder
					fs.mkdirSync(dirOtherType, 0744); //create otherType folder
					//Place File in the folder
					fs.copyFile(req.body.url, newUrlImage, (errFourthCopy) => {
						if (errFourthCopy) res.send('error FourthCopy'); //throw errFourthCopy;
						res.send(newUrlImage);
						fs.unlinkSync(req.body.url);
					});
				} else {
					//user folder exists

					fs.mkdirSync(dirFolder, 0744); //create Type folder
					fs.mkdirSync(dirOtherType, 0744); //create otherType folder
					//Place File in the folder
					fs.copyFile(req.body.url, newUrlImage, (errFifthCopy) => {
						if (errFifthCopy) res.send('error FifthCopy'); // throw errFifthCopy;
						res.send(newUrlImage);
						fs.unlinkSync(req.body.url);
					});
				}
			} else {
				//user and folder exists

				fs.mkdirSync(dirOtherType, 0744); //create otherType folder
				//Place File in the folder
				fs.copyFile(req.body.url, newUrlImage, (errSixCop) => {
					if (errSixCop) res.send('error SixCop'); // throw errSixCop;
					res.send(newUrlImage);
					fs.unlinkSync(req.body.url);
				});
			}
		} else {
			//SpecificOtherTypeFolder exists

			//Place File in the folder
			fs.copyFile(req.body.url, newUrlImage, (errFinalCopy) => {
				if (errFinalCopy) res.send('error FinalCopy'); //throw errFinalCopy;
				res.send(newUrlImage);
				fs.unlinkSync(req.body.url);
			});
		}
	}
});

//#endregion

//#region General

// /db/getSpecificData --> getSpecificData(idUser, callback)
// RES --> result find user
//     --> error [error (Connection) end]
app.post('/db/getSpecificData', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);

		var query = { id: req.body.idUser };

		dbo.collection(userInfo).findOne(query, function(errFind, result) {
			if (errFind) res.send('error Find'); // throw errFind;
			res.send(result);
		});
	});
});

// /db/getIDFromUsername --> getIDFromUsername(username, callback)
// RES --> id of result find user
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/getIDFromUsername', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);

		var query = { username: req.body.username };

		dbo.collection(collectionUtenti).findOne(query, { projection: { _id: 1 } }, function(errFind, resultFind) {
			if (errFind) res.send('error Find'); // throw errFind;
			if (resultFind != null) {
				res.send(resultFind._id.toString());
			}
			db.close();
		});
	});
});

// /db/findNewChatUser -->  getUsersAddChat(text, callback)
// RES --> arrayOut find
//     --> error [error (Connection) end]
//     --> error [error (Find) end]
app.post('/db/findNewChatUser', function(req, res) {
	MongoClient.connect(url, function(errConnection, db) {
		if (errConnection) res.send('error Connection'); // throw errConnection;
		var dbo = db.db(databaseSocial);
		var arrayOut = [];

		var query = {
			$or: [ { username: new RegExp(req.body.text, 'i') }, { mail: new RegExp(req.body.text, 'i') } ]
		};

		dbo
			.collection(collectionUtenti)
			.find(query, { projection: { username: 1, mail: 1 } })
			.toArray(function(errFind, resultFind) {
				if (errFind) res.send('error Find'); //throw errFind;
				if (resultFind.length != 0) {
					for (var i = 0; i < resultFind.length; i++) {
						if (arrayOut.indexOf(resultFind[i] == -1)) {
							arrayOut.push(resultFind[i]);
						}
					}
				}
				res.send(arrayOut);
				db.close();
			});
	});
});

//#endregion

function insertMessage(msgDocument, chatCollection, callback) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db(databaseChat);

		dbo.collection(chatCollection).insertOne(msgDocument, function(errInsert, resInsert) {
			if (errInsert) throw errInsert;
			callback();
			db.close();
		});
	});
}

app.use(express.static('assets'));
app.listen(PORT, () => {});

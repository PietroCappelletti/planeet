function register(mail, password, rePassword, securityQuestion, username, securityAnswere, callback) {
	$.ajax({
		url: '/db/registerUtente',
		method: 'POST',
		data: {
			username: username,
			mail: mail,
			Password: password,
			rePassword: rePassword,
			securityQuestion: securityQuestion,
			securityAnswere: securityAnswere
		},
		success: function(result) {
			return callback(result);
		}
	});
}
function validateAccount(token, callback) {
	$.ajax({
		url: '/db/validateAccount',
		method: 'POST',
		data: { token: token },
		success: function(result) {
			return callback(result);
		}
	});
}
function upgradeToken(userID, callback) {
	$.ajax({
		url: '/db/upgradetoken',
		method: 'POST',
		data: { userID: userID },
		success: function(result) {
			return callback(result);
		}
	});
}
function loginAccount(username, password, callback) {
	$.ajax({
		url: '/db/loginUtente',
		method: 'POST',
		data: { username: username, Password: password },
		success: function(result) {
			return callback(result);
		}
	});
}
function resetpasswordRequest(username, mail, callback) {
	$.ajax({
		url: '/db/ResetpasswordRequest',
		method: 'POST',
		data: { username: username, mail: mail },
		success: function(result) {
			return callback(result);
		}
	});
}
function resetpassword(username, mail, password, rePassword, securityQuestion, securityAnswere, token, callback) {
	$.ajax({
		url: '/db/Resetpassword',
		method: 'POST',
		data: {
			username: username,
			mail: mail,
			Password: password,
			rePassword: rePassword,
			securityQuestion: securityQuestion,
			securityAnswere: securityAnswere,
			token: token
		},
		success: function(result) {
			return callback(result);
		}
	});
}
function checktoken(username, token, callback) {
	$.ajax({
		url: '/db/checktoken',
		method: 'POST',
		data: { username: username, token: token },
		success: function(result) {
			return callback(result);
		}
	});
}
function addInformation(id, username, name, surname, birthDay, sentimental, musics, films, bio, callback) {
	$.ajax({
		url: '/db/addInformation',
		method: 'POST',
		data: {
			id: id,
			username: username,
			name: name,
			surname: surname,
			birthDay: birthDay,
			sentimental: sentimental,
			musics: musics,
			films: films,
			bio: bio
		},
		success: function(result) {
			return callback(result);
		}
	});
}
function getUser(token, callback) {
	$.ajax({
		url: '/db/getUser',
		method: 'POST',
		data: { token: token },
		success: function(result) {
			return callback(result);
		}
	});
}
function checkLogin(username, token, callback) {
	$.ajax({
		url: '/db/checkLogin',
		method: 'POST',
		data: { token: token, username: username },
		success: function(result) {
			return callback(result);
		}
	});
}
function FollowCheck(id, account, callback) {
	$.ajax({
		url: '/db/FollowUnfollowCheck',
		method: 'POST',
		data: { idUser: id.toString(), Followed: account.toString() },
		success: function(result) {
			return callback(result);
		}
	});
}
function followUser(username, account, callback) {
	$.ajax({
		url: '/db/FollowUser',
		method: 'POST',
		data: { username: username.toString(), account: account.toString() },
		success: function(result) {
			return callback(result);
		}
	});
}
function unfollowUser(username, account, callback) {
	$.ajax({
		url: '/db/unfollowUser',
		method: 'POST',
		data: { username: username.toString(), account: account.toString() },
		success: function(result) {
			return callback(result);
		}
	});
}
function getFollowerArray(username, callback) {
	$.ajax({
		url: '/db/ArrayFollower',
		method: 'POST',
		data: { username: username },
		success: function(result) {
			return callback(result);
		}
	});
}
function getFollowerPosts(array, numberPagePost, number, callback) {
	$.ajax({
		url: '/db/FollowerPosts',
		method: 'POST',
		data: { array: array, numberPagePost: numberPagePost, number: number },
		success: function(result) {
			return callback(result);
		}
	});
}
function changeUsername(id, username, newUsername, callback) {
	$.ajax({
		url: '/db/checkUpdateUsername',
		method: 'POST',
		data: { idUser: id, username: username, newUsername: newUsername },
		success: function(result) {
			return callback(result);
		}
	});
}
function getSpecificData(idUser, callback) {
	$.ajax({
		url: '/db/getSpecificData',
		method: 'POST',
		data: { idUser: idUser },
		success: function(result) {
			return callback(result);
		}
	});
}
function changeBio(id, newBio, callback) {
	$.ajax({
		url: '/db/changeBio',
		method: 'POST',
		data: { idUser: id, bio: newBio },
		success: function(result) {
			return callback(result);
		}
	});
}
function getUsernameFromID(id, callback) {
	$.ajax({
		url: '/db/getUsernameFromId',
		method: 'POST',
		data: { id: id },
		success: function(result) {
			return callback(result);
		}
	});
}
function getIDFromUsername(username, callback) {
	$.ajax({
		url: '/db/getIDFromUsername',
		method: 'POST',
		data: { username: username },
		success: function(result) {
			return callback(result);
		}
	});
}
function updateFilm(id, arrayFilm, callback) {
	$.ajax({
		url: '/db/updateFilmArray',
		method: 'POST',
		data: { id: id, arrayFilm: arrayFilm },
		success: function(result) {
			return callback(result);
		}
	});
}
function updateMusic(id, arrayMusic, callback) {
	$.ajax({
		url: '/db/updateMusicArray',
		method: 'POST',
		data: { id: id, arrayMusic: arrayMusic },
		success: function(result) {
			return callback(result);
		}
	});
}
function changeBirthday(id, birthday, callback) {
	$.ajax({
		url: '/db/changeBirthday',
		method: 'POST',
		data: { idUser: id, birthday: birthday },
		success: function(result) {
			return callback(result);
		}
	});
}

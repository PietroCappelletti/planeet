function readSingleMessage(userID, accountID, callback) {
	$.ajax({
		url: '/db/readSingleMessage',
		method: 'POST',
		data: { userID: userID, accountID: accountID },
		success: function(result) {
			return callback(result);
		}
	});
}
function checkMessages(userID, callback) {
	$.ajax({
		url: '/db/checkMessages',
		method: 'POST',
		data: { userID: userID },
		success: function(result) {
			return callback(result);
		}
	});
}
function readChatCollection(userID, accountID, callback) {
	$.ajax({
		url: '/db/readChatCollection',
		method: 'POST',
		data: { userID: userID, accountID: accountID },
		success: function(result) {
			return callback(result);
		}
	});
}
function readSingleMessageID(userID, accountID, id, callback) {
	$.ajax({
		url: '/db/readMessageID',
		method: 'POST',
		data: { userID: userID, accountID: accountID, id: id },
		success: function(result) {
			return callback(result);
		}
	});
}
function checkInitialChats(userID, callback) {
	$.ajax({
		url: '/db/checkInitialChats',
		method: 'POST',
		data: { userID: userID },
		success: function(result) {
			return callback(result);
		}
	});
}
function readAllChat(userID, accountID, callback) {
	$.ajax({
		url: '/db/readAllChatMessage',
		method: 'POST',
		data: { userID: userID, accountID: accountID },
		success: function(result) {
			return callback(result);
		}
	});
}
function readAllChatNotifications(userID, callback) {
	$.ajax({
		url: '/db/readAllNotifications',
		method: 'POST',
		data: { userID: userID },
		success: function(result) {
			return callback(result);
		}
	});
}
function initializeEmptyChat(userID, accountID, callback) {
	$.ajax({
		url: '/db/initializeEmptyChat',
		method: 'POST',
		data: { userID: userID, accountID: accountID },
		success: function(result) {
			return callback(result);
		}
	});
}
function sendMsgMethod(fromID, toID, text, callback) {
	if (fromID != toID){
		$.ajax({
			url: '/db/sendMessageUser',
			method: 'POST',
			data: { from: fromID, to: toID, text: text },
			success: function(result) {
				return callback(result);
			}
		});
	}
}
function addChat(userID, accountID, callback) {
	$.ajax({
		url: '/db/addChatAllChat',
		method: 'POST',
		data: { userID: userID, accountID: accountID },
		success: function(result) {
			return callback(result);
		}
	});
}
function getUsersAddChat(text, callback) {
	$.ajax({
		url: '/db/findNewChatUser',
		method: 'POST',
		data: { text: text },
		success: function(result) {
			return callback(result);
		}
	});
}

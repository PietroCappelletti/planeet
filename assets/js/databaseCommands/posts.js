function postSomething(idUser, text, callback) {
	$.ajax({
		url: '/db/setPost',
		method: 'POST',
		data: { text: text, idUser: idUser },
		success: function(result) {
			return callback(result);
		}
	});
}
function updatePostImage(id, url, callback) {
	$.ajax({
		url: '/db/updatePost',
		method: 'POST',
		data: { id: id, url: url },
		success: function(result) {
			return callback(result);
		}
	});
}
function getSpecificUserPost(id, callback) {
	$.ajax({
		url: '/db/getSpecificUserPost',
		method: 'POST',
		data: { id: id },
		success: function(result) {
			return callback(result);
		}
	});
}

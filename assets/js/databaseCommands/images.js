function uploadImg(img, callback) {
	$.ajax({
		url: '/db/uploadImage',
		method: 'POST',
		processData: false, // important
		contentType: false, // important
		data: img,
		success: function(result) {
			return callback(result);
		}
	});
}
function saveImage(url, username, type, otherType, photoSpecificName, callback) {
	console.log('saveImg');
	$.ajax({
		url: '/db/saveImage',
		method: 'POST',
		data: { url: url, username: username, type: type, otherType: otherType, photoSpecificName: photoSpecificName },
		success: function(result) {
			return callback(result);
		}
	});
}

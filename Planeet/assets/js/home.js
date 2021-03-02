var username;

$(document).ready(function() {
	var userToken = localStorage.getItem('User');
	getUser(userToken, function(res) {
		username = res.split('|')[1];
		localStorage.setItem('id', res.split('|')[2]);
		$(document).attr('title', NameSocial + ' | ' + username + ' info');
	});

	$('.sendInformation').click(function() {
		var filmCheck = document.getElementsByName('favorite_film');
		var musicCheck = document.getElementsByName('favorite_music');
		var filmString = [];
		var musicString = [];

		for (var i = 0; i < filmCheck.length; i++) {
			if (filmCheck[i].checked) {
				filmString.push(filmCheck[i].value);
			}
		}

		for (var i = 0; i < musicCheck.length; i++) {
			if (musicCheck[i].checked) {
				musicString.push(musicCheck[i].value);
			}
		}

		console.log(
			username +
				' - ' +
				$('.name').val() +
				' - ' +
				$('.surname').val() +
				' - ' +
				$('.birthDay').val() +
				' - ' +
				$('.sentimentalState').val() +
				' - ' +
				musicString +
				' - ' +
				filmString
		);
		addInformation(
			localStorage.getItem('id'),
			username,
			$('.name').val(),
			$('.surname').val(),
			$('.birthDay').val(),
			$('.sentimentalState').val(),
			musicString,
			filmString,
			$('.description').val(),
			function(res) {
				console.log(res);
				window.location.replace('../main.html');
				/*FollowCheck(localStorage.getItem('id'), username, function(res1) {
					console.log(res1);
					res1 = res1.split('|');
					if (res1[0] != 'U') {
						followUser(res1[1], res1[2], function(resFollowUser) {
							window.location.replace('../main.html');
						});
					} else {
						unfollowUser(res1[1], res1[2], function(resUnfollowUser) {
							window.location.replace('../main.html');
						});
					}
				});*/
			}
		);
	});
});

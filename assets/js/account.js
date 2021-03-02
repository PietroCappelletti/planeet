var username;
var number = 1;
var accountOf = getUrlVars()['username'];
var urlImage;
var arrayFilm;
var arrayMusic;

$(document).ready(function() {
	$('.clickInputImagesProfile').hide();
	$('.clickInputDateBirthday').hide();

	$('.inputUser').prop('disabled', true);
	$('.inputDate').prop('disabled', true);

	var userToken = localStorage.getItem('User');
	getUser(userToken, function(res) {
		username = res.split('|')[1];
		if (username == accountOf) {
			window.location.replace('editAccount.html');
		} else {
			$(document).attr('title', NameSocial + ' | ' + accountOf);
			checkLogin(username, userToken, function(res) {
				if (res[0] == 'N') {
					localStorage.removeItem('User');
					window.location.replace('http://localhost:1984/');
				} else {
					localStorage.setItem('User', res.split('|')[1]);
				}
			});
		}

		urlImage = '/uploadedFiles/' + accountOf + '/account/profilePicture.png';
		$('.profilePictureDiv').css('background-image', 'url(' + urlImage + ')');

		window.onscroll = function() {
			scrollFunction();
		};

		getIDFromUsername(accountOf, function(resGetID) {
			$('.followButton').click(function() {
				FollowCheck(localStorage.getItem('id'), accountOf, function(resCheckIfFollow) {
					if (resCheckIfFollow[0] != 'U') {
						followUser(localStorage.getItem('id'), resGetID, function() {
							location.reload();
						});
					} else {
						unfollowUser(localStorage.getItem('id'), resGetID, function() {
							location.reload();
						});
					}
				});
			});
			FollowCheck(localStorage.getItem('id'), accountOf, function(resCheckIfFollow) {
				if (resCheckIfFollow[0] != 'U') {
					$('.followButton').removeClass('unfollow');
					$('.followButton').text('follow');
				} else {
					$('.followButton').addClass('unfollow');
					$('.followButton').text('unfollow');
				}
			});
			getSpecificData(resGetID, function(resGetSpecificData) {
				$('.inputUser').val(accountOf);
				$('.realName').text(resGetSpecificData.name + ' ' + resGetSpecificData.surname);
				$('.birthDayInputText').text(resGetSpecificData.birthDay);
				$('.sentimentalState').text(resGetSpecificData.sentimental);
				$('.bio').text(resGetSpecificData.bio);

				arrayFilm = resGetSpecificData.films;
				arrayMusic = resGetSpecificData.musics;

				for (var i = 0; i < resGetSpecificData.musics.length; i++) {
					$('.listMusicPref').append('<li>' + resGetSpecificData.musics[i] + '</li>');
				}
				for (let i = 0; i < resGetSpecificData.films.length; i++) {
					$('.listFilmPref').append('<li>' + resGetSpecificData.films[i] + '</li>');
				}
			});
			getSpecificUserPost(resGetID, function(resGetSpecificUserPost) {
				for (var i = 0; i < resGetSpecificUserPost.length; i++) {
					stringPost(resGetSpecificUserPost[i], 'personal');
				}
			});
		});
	});

	$('.Bacheca').click(function() {
		window.location.replace('main.html');
	});

	$('.backToMain').click(function() {
		window.location.replace('../main.html');
	});
});

function scrollFunction() {
	if (document.body.scrollTop > 702 * (number + 1) || document.documentElement.scrollTop > 702 * (number + 1)) {
		//alert("load: " + number);
		getDefiniteUser(number, accountOf);
		number++;
	}
}
function getDefiniteUser(number, user) {
	getDefiniteUserPosts(number, user, function(res) {
		for (var i = 0; i < res.length; ++i) {
			$('.posts').append(stringPost(res[i]));
		}
	});
}
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
}
function stringPost(post, typePost) {
	getUsernameFromID(post.idUser, function(resUsername) {
		var s = '<div class = "post" id="' + post._id + '">';

		s +=
			'<a href = "../account.html?username=' +
			resUsername +
			'"><h5 class = "username">' +
			resUsername +
			'</h5></a>';

		s += '<h4 class = "username">' + post.text + '</h4>';

		if (post.url.length != 0) {
			if (post.url.length == 1) {
				urlPost = post.url[0].split('/assets/');
				s += '<div class = "postImage">' + '<div class = "imgList"></div>';
			} else {
				s +=
					'<div class = "postImage">' +
					'<div class = "imgList"></div>' +
					'<div class = "controllerButtons">' +
					'<div class = "LeftButton" onclick="leftButton(\'' +
					post._id +
					"','" +
					post.url.length +
					'\')"><</div>' +
					'<div class = "rightButton" onclick="rightButton(\'' +
					post._id +
					"', '" +
					post.url.length +
					'\')">></div>' +
					'</div>' +
					'</div>';
			}
		}

		s += '<h7 class = "data">' + moment(post.date).format('DD/mm hh:mm') + '</h7>';

		if (typePost != 'personal') {
			$('.FollowedPosts .posts').append(s);

			$('.FollowedPosts .posts')
				.children('#' + post._id)
				.children('.postImage')
				.children('.imgList')
				.css('background-image', 'url(/uploadedFiles/' + accountOf + '/post/' + post._id + '/0.jpg)');
		} else {
			$('.personalPosts').append(s);

			$('.personalPosts')
				.children('#' + post._id)
				.children('.postImage')
				.children('.imgList')
				.css('background-image', 'url(/uploadedFiles/' + accountOf + '/post/' + post._id + '/0.jpg)');
		}

		return s;
	});
}
function removeFilm(film) {
	var index = arrayFilm.indexOf(film);
	arrayFilm.splice(index, 1);
	console.log(arrayFilm);

	updateFilm(localStorage.getItem('id'), arrayFilm, function(resEditFilm) {
		if (resEditFilm == 'updated') {
			window.location.reload();
		}
	});
}
function removeMusic(music) {
	var index = arrayMusic.indexOf(music);
	arrayMusic.splice(index, 1);
	console.log(arrayMusic);

	updateMusic(localStorage.getItem('id'), arrayMusic, function(resEditMusic) {
		window.location.reload();
	});
}
function stringPersonalPost(post) {
	getUsernameFromID(post.idUser, function(resUsername) {
		var s = '<div class = "post" id="' + post._id + '">';

		s +=
			'<a href = "../account.html?username=' +
			resUsername +
			'"><h5 class = "username">' +
			resUsername +
			'</h5></a>';

		s += '<h4 class = "username">' + post.text + '</h4>';

		if (post.url.length != 0) {
			if (post.url.length == 1) {
				urlPost = post.url[0].split('/assets/');
				s += '<div class = "postImage">' + '<div class = "imgList"></div>';
			} else {
				s +=
					'<div class = "postImage">' +
					'<div class = "imgList"></div>' +
					'<div class = "controllerButtons">' +
					'<div class = "LeftButton" onclick="leftButton(\'' +
					post._id +
					"','" +
					post.url.length +
					'\')"><</div>' +
					'<div class = "rightButton" onclick="rightButton(\'' +
					post._id +
					"', '" +
					post.url.length +
					'\')">></div>' +
					'</div>' +
					'</div>';
			}
		}

		s += '<h7 class = "data">' + moment(post.date).format('DD/mm hh:mm') + '</h7>';

		$('.personalPosts').append(s);

		$('.personalPosts')
			.children('#' + post._id)
			.children('.postImage')
			.children('.imgList')
			.css('background-image', 'url(/uploadedFiles/' + username + '/post/' + post._id + '/0.jpg)');

		return s;
	});
}
function rightButton(idPost, length) {
	var nomeFile = $('.personalPosts')
		.children('#' + idPost)
		.children('.postImage')
		.children('.imgList')
		.css('background-image')
		.split('/');
	nomeFile = nomeFile[nomeFile.length - 1].split('.')[0];

	if (
		ImageExist('/uploadedFiles/' + accountOf + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg') ||
		ImageExist('/uploadedFiles/' + accountOf + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.png')
	) {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css(
				'background-image',
				'url(/uploadedFiles/' + accountOf + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg)'
			);
	} else {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css('background-image', 'url(/uploadedFiles/' + accountOf + '/post/' + idPost + '/0.jpg)');
	}
}
function leftButton(idPost, length) {
	var nomeFile = $('.personalPosts')
		.children('#' + idPost)
		.children('.postImage')
		.children('.imgList')
		.css('background-image')
		.split('/');
	nomeFile = nomeFile[nomeFile.length - 1].split('.')[0];

	if (
		ImageExist('/uploadedFiles/' + accountOf + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg') ||
		ImageExist('/uploadedFiles/' + accountOf + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.png')
	) {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css(
				'background-image',
				'url(/uploadedFiles/' + accountOf + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg)'
			);
	} else {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css(
				'background-image',
				'url(/uploadedFiles/' + accountOf + '/post/' + idPost + '/' + (length - 1) + '.jpg)'
			);
	}
}
function ImageExist(url) {
	var img = new Image();
	img.src = url;
	return img.height != 0;
}

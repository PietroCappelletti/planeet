var username;
var number = 1;
var accountOf = getUrlVars()['username'];
var urlImage;
var arrayFilm;
var arrayMusic;

$(document).ready(function() {
	$('.clickInputImagesProfile').hide();
	$('.clickInputDateBirthday').hide();
	$('.realInputBirthday').hide();

	$('.saveEdit').hide();
	$('.inputUser').prop('disabled', true);
	$('.bio').prop('disabled', true);

	var userToken = localStorage.getItem('User');
	getUser(userToken, function(res) {
		username = res.split('|')[1];
		$(document).attr('title', NameSocial + ' | ' + username);
		checkLogin(username, userToken, function(res) {
			if (res[0] == 'N') {
				//localStorage.removeItem('User');
				//window.location.replace('http://localhost:1984/');
			} else {
				localStorage.setItem('User', res.split('|')[1]);
			}
		});

		urlImage = '/uploadedFiles/' + username + '/account/profilePicture.png';
		$('.profilePictureDiv').css('background-image', 'url(' + urlImage + ')');

		window.onscroll = function() {
			scrollFunction();
		};

		$('.editAccountButton').click(function() {
			$('.saveEdit').show();
			$('.realInputBirthday').show();
			$('.birthDayInputText').hide();
			$('.realInputBirthday').css('background-color', '#2e2f38');
			$('.inputUser').prop('disabled', false);
			$('.bio').prop('disabled', false);
			$('.bio').css('background-color', '#2e2f38');
			$('.inputUser').css('background-color', '#2e2f38');
		});
		$('.saveEdit').click(function() {
			changeUsername(res.split('|')[2], username, $('.inputUser').val(), function(resChangeUser) {
				if (resChangeUser != 'NoChange') {
					changeBio(localStorage.getItem('id'), $('.bio').val(), function(resChangeBio) {
						changeBirthday(
							localStorage.getItem('id'),
							moment($('.realInputBirthday').val()).format('YYYY-MM-DD'),
							function(resChangeBirthday) {
								location.reload();
							}
						);
					});
				} else {
					location.reload();
				}
			});
		});

		getSpecificData(localStorage.getItem('id'), function(resGetSpecificData) {
			$('.inputUser').val(username);
			$('.realName').text(resGetSpecificData.name + ' ' + resGetSpecificData.surname);
			$('.birthDayInputText').text(resGetSpecificData.birthDay);
			$('.sentimentalState').text(resGetSpecificData.sentimental);
			$('.bio').val(resGetSpecificData.bio);
			$('.realInputBirthday').val(resGetSpecificData.birthDay);

			arrayFilm = resGetSpecificData.films;
			arrayMusic = resGetSpecificData.musics;

			for (var i = 0; i < resGetSpecificData.musics.length; i++) {
				$('.listMusicPref').append(
					'<li ondblclick = "removeMusic(\'' +
						resGetSpecificData.musics[i] +
						'\')">' +
						resGetSpecificData.musics[i] +
						'</li>'
				);
			}
			for (let i = 0; i < resGetSpecificData.films.length; i++) {
				$('.listFilmPref').append(
					'<li ondblclick = "removeFilm(\'' +
						resGetSpecificData.films[i] +
						'\')">' +
						resGetSpecificData.films[i] +
						'</li>'
				);
			}
		});

		getSpecificUserPost(res.split('|')[2], function(resGetSpecificUserPost) {
			for (var i = 0; i < resGetSpecificUserPost.length; i++) {
				stringPersonalPost(resGetSpecificUserPost[i]);
			}
		});
	});

	$('.Bacheca').click(function() {
		window.location.replace('main.html');
	});

	$('.uploadPicturePicture').click(function(e) {
		e.preventDefault();
		$('.clickInputImagesProfile').click();
	});

	$('.listMusicPrefer li').dblclick(function() {
		alert('The paragraph was double-clicked');
	});

	$('.listFilmPrefer li').dblclick(function() {
		alert('The paragraph was double-clicked');
	});

	$('.clickInputImagesProfile').change(function(e) {
		file = e.target.files[0];
		data = new FormData();
		data.append('myFile', file);
		console.log(file.type.split('/')[1]);
		uploadImg(data, function(res3) {
			saveImage(res3, username, 'account', null, 'profilePicture.png', function(res4) {
				location.reload();
			});
		});
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
			$('.personalPosts').append(stringPersonalPost(res[i]));
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
function followUser() {
	FollowUnfollow(username, accountOf, function(res) {
		window.location.reload();
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
		ImageExist('/uploadedFiles/' + username + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg') ||
		ImageExist('/uploadedFiles/' + username + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.png')
	) {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css(
				'background-image',
				'url(/uploadedFiles/' + username + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg)'
			);
	} else {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css('background-image', 'url(/uploadedFiles/' + username + '/post/' + idPost + '/0.jpg)');
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
		ImageExist('/uploadedFiles/' + username + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg') ||
		ImageExist('/uploadedFiles/' + username + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.png')
	) {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css(
				'background-image',
				'url(/uploadedFiles/' + username + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg)'
			);
	} else {
		$('.personalPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css(
				'background-image',
				'url(/uploadedFiles/' + username + '/post/' + idPost + '/' + (length - 1) + '.jpg)'
			);
	}
}
function ImageExist(url) {
	var img = new Image();
	img.src = url;
	return img.height != 0;
}

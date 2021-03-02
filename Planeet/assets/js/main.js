var numberPagePost = $(window).height() / 95;
var username;
var number = 1;
var arrayFollower = [];
var arrayImages = [];
var arrayimagesUrl = [];
var tid;
var data;
var file;
var urlPost;
var z = 0;
var reloadPageLoadImage;
var startLoadMessage = false;

var chatFocus;

$(document).ready(function() {
	$('.clickInputImagesProfile').hide();
	$('.clickInputImagesPost').hide();
	$('.listChatUl').children('li').children('.notificheSingleChat').hide();
	$('.notificheChat').hide();
	$('.saveUpdates ').hide();
	$('.numNotifiche').hide();

	$('.notificheSingleChat').css('left', $('.listChats').width() - 10);
	$('.toggleMessage').css('width', $('.listChats').width() - 10 + 'px');
	$('.toggleMessage').css('height', $('.listChats').width() - 10 + 'px');
	$('.toggleMessage').css('left', $('.listChats').width() * -1 + 'px');

	$(window).bind('resize', function() {
		$('.notificheSingleChat').css('left', $('.listChats').width() - 10);
		$('.toggleMessage').css('width', $('.listChats').width() - 10 + 'px');
		$('.toggleMessage').css('height', $('.listChats').width() - 10 + 'px');
		$('.toggleMessage').css('left', $('.listChats').width() * -1 + 'px');
	});

	var userToken = localStorage.getItem('User');
	getUser(userToken, function(res) {
		username = res.split('|')[1];
		localStorage.setItem('id', res.split('|')[2]);

		$('.accountPicture').attr('src', '/uploadedFiles/' + username + '/account/profilePicture.png');
		$('.usernameInput').prop('disabled', true);
		$('.usernameInput').val(username);
		$('.bioProfile').prop('disabled', true);

		$('.bioProfile').text('This is a shish');

		$(document).attr('title', NameSocial + ' | ' + username);

		checkLogin(username, userToken, function(res) {
			if (res[0] == 'N') {
				localStorage.removeItem('User');
				window.location.replace('http://localhost:1984/');
			} else {
				localStorage.setItem('User', res.split('|')[1]);
			}
		});

		getSpecificUserPost(res.split('|')[2], function(resGetSpecificUserPost) {
			for (var i = 0; i < resGetSpecificUserPost.length; i++) {
				stringPost(resGetSpecificUserPost[i], 'personal');
			}
		});

		$(window).resize(function() {
			$('.notificheSingleChat').css('left', $('.listChats').width() - 10);
		});

		getSpecificData(res.split('|')[2], function(resGetSpecificData) {
			$('.bioProfile').val(resGetSpecificData.bio);
		});

		getFollowerArray(res.split('|')[2], function(res) {
			for (var i = 0; i < res.length; i++) {
				arrayFollower.push(res[i].account);
			}
			number + 1;
			getFollowerPosts(arrayFollower, 0, numberPagePost, function(resFollowerPosts) {
				for (var i = 0; i < resFollowerPosts.length; i++) {
					stringPost(resFollowerPosts[i], 'follower');
				}
			});
		});

		$('.inputAddNewChat').on('input', function(e) {
			if ($('.inputAddNewChat').val().length > 2) {
				getUsersAddChat($('.inputAddNewChat').val(), function(resGetUsersAddChat) {
					if (resGetUsersAddChat.length != 0) {
						$('.listAddNewChat').text('');
						for (var i = 0; i < resGetUsersAddChat.length; i++) {
							var t =
								'<li onClick="addNewChatAllChat(\'' +
								resGetUsersAddChat[i].username +
								'\')"><div class = "rightListAdd"><img src = "uploadedFiles/' +
								resGetUsersAddChat[i].username +
								'/account/profilePicture.png">' +
								'</div><div class = "leftListAdd">' +
								'<h1>' +
								resGetUsersAddChat[i].username +
								'</h1><p>' +
								resGetUsersAddChat[i].mail +
								'</p>' +
								'</div></li>';
							if (resGetUsersAddChat[i].username != username) {
								$('.listAddNewChat').append(t);
							}
						}
					} else {
					}
				});
			} else {
				$('.listAddNewChat').text('');
			}
		});

		$('.searchUsers').on('input', function(e) {
			if ($('.searchUsers').val().length > 2) {
				getUsersAddChat($('.searchUsers').val(), function(resGetUsersAddChat) {
					if (resGetUsersAddChat.length != 0) {
						$('.outputSearch').text('');
						for (var i = 0; i < resGetUsersAddChat.length; i++) {
							var t =
								'<a  href = "../account.html?username=' +
								resGetUsersAddChat[i].username +
								'"><li><div class = "rightListAdd"><img src = "uploadedFiles/' +
								resGetUsersAddChat[i].username +
								'/account/profilePicture.png">' +
								'</div><div class = "leftListAdd">' +
								'<h1>' +
								resGetUsersAddChat[i].username +
								'</h1><p>' +
								resGetUsersAddChat[i].mail +
								'</p>' +
								'</div></li></a>';
							$('.outputSearch').append(t);
						}
					} else {
					}
				});
			} else {
				$('.outputSearch').text('');
			}
		});

		$('.changeUsernameButton').click(function() {
			$('.usernameInput').prop('disabled', false);
			$('.bioProfile').prop('disabled', false);
			$('.saveUpdates ').show();
		});

		$('.usernameInput').keyup(function(e) {
			if (e.keyCode == 13) {
				$('.saveUpdates ').hide();
				changeUsername(res.split('|')[2], username, $('.usernameInput').val(), function(resChangeUser) {
					if (resChangeUser == 'NoChange') {
						$('.usernameInput').prop('disabled', true);
						changeBio(res.split('|')[2], $('.bioProfile').val(), function(resChangeBio) {
							location.reload();
						});
					} else {
						changeBio(res.split('|')[2], $('.bioProfile').val(), function(resChangeBio) {
							location.reload();
						});
					}
				});
			}
		});

		$('.saveUpdates ').click(function() {
			changeUsername(res.split('|')[2], username, $('.usernameInput').val(), function(resChangeUser) {
				if (resChangeUser == 'NoChange') {
					$('.usernameInput').prop('disabled', true);
					changeBio(res.split('|')[2], $('.bioProfile').val(), function(resChangeBio) {
						location.reload();
					});
				} else {
					changeBio(res.split('|')[2], $('.bioProfile').val(), function(resChangeBio) {
						location.reload();
					});
				}
			});
		});

		$('.removeImageUploaded').click(function() {
			arrayImages = [];
			$('.numberImageUploaded').text('no images uploaded');
		});

		$('.clickInputImagesProfile').change(function(e) {
			file = e.target.files[0];
			data = new FormData();
			data.append('myFile', file);
			uploadImg(data, function(res3) {
				saveImage(res3, username, 'account', null, 'profilePicture.png', function(res4) {
					location.reload();
				});
			});
		});

		$('.clickInputImagesPost').change(function(e) {
			file = $('.clickInputImagesPost')[0].files[0];
			data = new FormData();
			data.append('myFile', file);
			arrayImages.push(data);
		});

		$('.postButton').click(function() {
			postSomething(localStorage.getItem('id'), $('.postInput').val(), function(res9) {
				$('.postInput').val('');

				if (arrayImages.length == 0) {
					window.location.reload();
				} else {
					reloadPageLoadImage = 0;
					loadImageToPost(res9, 0);
				}
			});
		});

		$('.uploadImageProfilePicture').click(function(e) {
			e.preventDefault();
			$('.clickInputImagesProfile').click();
		});

		$('.uploadPostButton').click(function(e) {
			e.preventDefault();
			$('.clickInputImagesPost').click();
		});

		$('.toggleMessage').click(function() {
			if (($('.listChats').width() - $('.listChats').width() - 10) / 2 < 0) {
				var margin = ($('.listChats').width() - $('.listChats').width() - 10) / 2 * -1;
			} else {
				var margin = $('.listChats').width() - $('.listChats').width() - 10;
			}

			focusChatInList('addNewChat');
			$('.messageBox').toggleClass('activeMsg');

			$('.toggleMessage').css('left', $('.listChats').width() * -1 + 'px');
			$('.activeMsg .toggleMessage').css('left', margin + 'px');
		});

		$('.readSingleChatTest').click(function() {
			getIDFromUsername('PietroCappelletti', function(getID) {
				readChatCollection(localStorage.getItem('id'), getID, function(resReadChat) {});
			});
		});

		$('.readMessageID').click(function() {
			getIDFromUsername('PietroCappelletti', function(getID) {
				readSingleMessageID(localStorage.getItem('id'), getID, '5eb433ab82699f2080390ef7', function(
					resReadID
				) {});
			});
		});

		$('.logOut').click(function() {
			localStorage.clear();
			window.location.reload();
		});

		var bool = true;

		checkInitialChats(localStorage.getItem('id'), function(resCheckInitialMessages) {
			checkMessageLoop(resCheckInitialMessages, 0);
			$('.notificheSingleChat').css('left', $('.listChats').width() - 10);
		});

		//------------------------------------------------------------
		window.setInterval(function() {
			checkMessages(localStorage.getItem('id'), function(resCheckMessage) {
				checkMessageLoop(resCheckMessage, 0);
			});

			chatFocus = $('.listChatUl').children('.focus').attr('id');

			if (chatFocus != undefined) {
				getIDFromUsername(chatFocus, function(getID) {
					if (startLoadMessage) {
						readChatCollection(localStorage.getItem('id'), getID, function(resReadChat) {
							for (var i = 0; i < resReadChat.length; i++) {
								appendMsg(resReadChat[i]);

								readSingleMessageID(localStorage.getItem('id'), getID, resReadChat[i]._id, function(
									resReadID
								) {
									readAllChat(localStorage.getItem('id'), getID, function(resReadAllChat) {});
								});
							}
						});
					}
				});
			}
		}, 1000);
		window.setInterval(function() { 
			readAllChatNotifications(localStorage.getItem('id'), function(resReadNotification) {
				if (resReadNotification == 0) {
					$('.numNotifiche').hide();
				} else {
					$('.numNotifiche').show();
					if ($('.numNotifiche').text() != resReadNotification.toString()) {
						$('.numNotifiche').text(resReadNotification);
					}
				}
			});
		}, 3000);
		//------------------------------------------------------------

		window.onscroll = function() {
			//scrollFunction();
		};

		//$('#-addNewChat').css('line-height', $('.messageBox').height() + 'px');
	});

	$('.messageButton').mouseover(function() {
		setTimeout(function() {
			$('.messageButton').text('Message');
		}, 300);

		$('.messageButton').width('80px');
		$('.messageButton').css('font-size', '16px');
	});
	$('.messageButton').mouseout(function() {
		$('.messageButton').text('M');
		$('.messageButton').width('30px');
		$('.messageButton').css('font-size', '16px');
	});
	$('.messageButton').click(function() {
		window.location.replace('chats.html');
	});
});

var numNotifiche;

function checkMessageLoop(arrayMessage, num) {
	arrayMessage.forEach(function(item, index, object) {
		if (item.user0 == item.user1) {
			object.splice(index, 1);
		}
	});
	if (arrayMessage.length != 0) {
		if (num <= arrayMessage.length - 1) {
			if (arrayMessage[num]['user0'] == localStorage.getItem('id')) {
				numNotifiche = arrayMessage[num]['read:' + localStorage.getItem('id')];
				getUsernameFromID(arrayMessage[num]['user1'].toString() + '', function(resGetUsername) {
					$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
					if ($('#' + resGetUsername).length) {
						if (
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').text() !=
							numNotifiche
						) {
							if (numNotifiche == 0) {
								$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
							} else {
								$('.listChatUl')
									.children('#' + resGetUsername)
									.closest('ul')
									.children('.addNewChat')
									.after($('.listChatUl').children('#' + resGetUsername));
								$('.listChatUl')
									.children('#' + resGetUsername)
									.children('.notificheSingleChat')
									.text(numNotifiche);
								//$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').show();
							}
						}

						if (numNotifiche == 0) {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
						} else {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').show();
						}
						//Repeat call to finish the array
						checkMessageLoop(arrayMessage, num + 1);
					} else {
						if (resGetUsername != username) {
							$('.listChatUl').append(
								'<li id = "' +
									resGetUsername +
									'" onClick = "focusChatInList(\'' +
									resGetUsername +
									'\')"><h1>' +
									resGetUsername +
									'</h1><div class = "notificheSingleChat">0</div></li>'
							);
						}
						
						if (
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').text() !=
							numNotifiche
						) {
							if (numNotifiche == 0) {
								$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
							} else {
								$('.listChatUl')
									.children('#' + resGetUsername)
									.closest('ul')
									.children('.addNewChat')
									.after($('.listChatUl').children('#' + resGetUsername));
								$('.listChatUl')
									.children('#' + resGetUsername)
									.children('.notificheSingleChat')
									.text(numNotifiche);
								$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').show();
							}
						}

						if (numNotifiche == 0) {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
						} else {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').show();
						}

						//Repeat call to finish the array
						checkMessageLoop(arrayMessage, num + 1);
					}
				});
			} else {
				numNotifiche = arrayMessage[num]['read;' + localStorage.getItem('id')];
				getUsernameFromID(arrayMessage[num]['user0'].toString() + '', function(resGetUsername) {
					if ($('#' + resGetUsername).length) {
						$('.listChatUl')
							.children('#' + resGetUsername)
							.children('.notificheSingleChat')
							.text(numNotifiche);

						if (numNotifiche == 0) {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
						} else {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').show();
						}
						//Repeat call to finish the array
						checkMessageLoop(arrayMessage, num + 1);
					} else {
						$('.listChatUl').append(
							'<li id = "' +
								resGetUsername +
								'" onClick = "focusChatInList(\'' +
								resGetUsername +
								'\')"><h1>' +
								resGetUsername +
								'</h1><div class = "notificheSingleChat"></div></li>'
						);
						if (numNotifiche != 0) {
							/*$('.listChatUl')
								.children('#' + resGetUsername)
								.children('.notificheSingleChat')
								.text(numNotifiche);*/
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').show();
						} else {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
						}

						if (numNotifiche == 0) {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').hide();
						} else {
							$('.listChatUl').children('#' + resGetUsername).children('.notificheSingleChat').show();
						}
						//Repeat call to finish the array
						checkMessageLoop(arrayMessage, num + 1);
					}
				});
			}
		}
	}
	$('.notificheSingleChat').css('left', $('.listChats').width() - 10);
}

function focusChatInList(id) {
	$('.listChatUl').children('li').removeClass('focus');
	$('.listChatUl').children('#' + id).addClass('focus');
	if ($('#-' + id).length) {
		//Nascondi / remove focus from other divs
		$('.openChats').children('.singleChatOpen').hide();
		$('.openChats').children('.singleChatOpen').removeClass('focus');
		//focus singleChatOpen con id - + accountScelto
		$('#-' + id).show();
		$('#-' + id).addClass('focus');
		if ($('.openChats').children('#-' + id).children('.appendMsgChat').text() == '') {
			getIDFromUsername(id, function(getIDFromUsernameInitialLoad) {
				initializeEmptyChat(localStorage.getItem('id'), getIDFromUsernameInitialLoad, function(
					resInitializeChat
				) {
					if (resInitializeChat.length != 0) {
						for (var i = 0; i < resInitializeChat.length; i++) {
							appendMsg(resInitializeChat[i]);
							if (i == resInitializeChat.length - 1) {
								startLoadMessage = true;
							}
						}
					} else {
						startLoadMessage = true;
					}
				});
			});
		}
	} else {
		//Nascondi / remove focus from other divs
		$('.openChats').children('.singleChatOpen').hide();
		$('.openChats').children('.singleChatOpen').removeClass('focus');
		//crea singleChatOpen
		$('.openChats').append(
			'<div class = "singleChatOpen focus" id = "-' +
				id +
				'">' +
				'<div class = "appendMsgChat"></div>' +
				'<div class = "sendMsgControl">' +
				'<input type = "text" class = "textMsg">' +
				'<div class = "sendMsgButton" onClick="sendMsg(\'' +
				id +
				'\')">Send</div>' +
				'</div>' +
				'</div>'
		);
		$('#-' + id).show();
		if ($('.openChats').children('#-' + id).children('.appendMsgChat').text() == '') {
			getIDFromUsername(id, function(getIDFromUsernameInitialLoad) {
				initializeEmptyChat(localStorage.getItem('id'), getIDFromUsernameInitialLoad, function(
					resInitializeChat
				) {
					if (resInitializeChat.length != 0) {
						for (var i = 0; i < resInitializeChat.length; i++) {
							appendMsg(resInitializeChat[i]);
							if (i == resInitializeChat.length - 1) {
								startLoadMessage = true;
							}
						}
					} else {
						startLoadMessage = true;
					}
				});
			});
		}
	}
}

function loadImageToPost(idPost, number) {
	//alert(number);
	uploadImg(arrayImages[number], function(res0) {
		saveImage(res0, username, 'post', idPost, number + '.jpg', function(res10) {
			updatePostImage(idPost, res10, function(res11) {
				//alert(number + ' - ' + res10);
				reloadPageLoadImage++;
				if (reloadPageLoadImage == arrayImages.length) {
					window.location.reload();
				} else {
					loadImageToPost(idPost, number + 1);
				}
			});
		});
	});
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
					"'," +
					post.url.length +
					", '" +
					resUsername +
					'\')"><</div>' +
					'<div class = "rightButton" onclick="rightButton(\'' +
					post._id +
					"'," +
					post.url.length +
					", '" +
					resUsername +
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
				.css('background-image', 'url(/uploadedFiles/' + resUsername + '/post/' + post._id + '/0.jpg)');
		} else {
			$('.myPosts').append(s);

			$('.myPosts')
				.children('#' + post._id)
				.children('.postImage')
				.children('.imgList')
				.css('background-image', 'url(/uploadedFiles/' + resUsername + '/post/' + post._id + '/0.jpg)');
		}

		return s;
	});
}

function rightButton(idPost, length, usernamePost) {
	if (usernamePost != username) {
		var nomeFile = $('.posts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css('background-image')
			.split('/');
		nomeFile = nomeFile[nomeFile.length - 1].split('.')[0];

		if (
			ImageExist(
				'/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg'
			) ||
			ImageExist('/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.png')
		) {
			$('.posts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css(
					'background-image',
					'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg)'
				);
		} else {
			$('.posts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css('background-image', 'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/0.jpg)');
		}
	} else {
		var nomeFile = $('.myPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css('background-image')
			.split('/');
		nomeFile = nomeFile[nomeFile.length - 1].split('.')[0];

		if (
			ImageExist(
				'/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg'
			) ||
			ImageExist('/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.png')
		) {
			$('.myPosts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css(
					'background-image',
					'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) + 1) + '.jpg)'
				);
		} else {
			$('.myPosts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css('background-image', 'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/0.jpg)');
		}
	}
}

function leftButton(idPost, length, usernamePost) {
	if (usernamePost != username) {
		var nomeFile = $('.posts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css('background-image')
			.split('/');
		nomeFile = nomeFile[nomeFile.length - 1].split('.')[0];

		if (
			ImageExist(
				'/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg'
			) ||
			ImageExist('/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.png')
		) {
			$('.posts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css(
					'background-image',
					'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg)'
				);
		} else {
			$('.posts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css(
					'background-image',
					'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (length - 1) + '.jpg)'
				);
		}
	} else {
		var nomeFile = $('.myPosts')
			.children('#' + idPost)
			.children('.postImage')
			.children('.imgList')
			.css('background-image')
			.split('/');
		nomeFile = nomeFile[nomeFile.length - 1].split('.')[0];

		if (
			ImageExist(
				'/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg'
			) ||
			ImageExist('/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.png')
		) {
			$('.myPosts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css(
					'background-image',
					'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (parseInt(nomeFile) - 1) + '.jpg)'
				);
		} else {
			$('.myPosts')
				.children('#' + idPost)
				.children('.postImage')
				.children('.imgList')
				.css(
					'background-image',
					'url(/uploadedFiles/' + usernamePost + '/post/' + idPost + '/' + (length - 1) + '.jpg)'
				);
		}
	}
}

function ImageExist(url) {
	var img = new Image();
	img.src = url;
	return img.height != 0;
}

function addChatMain(accountUser) {
	getIDFromUsername(accountUser, function(getID) {
		addChat(localStorage.getItem('id'), getID, function(resAddChat) {});
	});
}

function sendMsg(id) {
	var text = $('.textMsg').val();
	var userId = localStorage.getItem('id');
	getIDFromUsername(id, function(getID) {
		sendMsgMethod(userId, getID, text, function(resSendMsg) {
			appendMsg(resSendMsg);
			readAllChat(localStorage.getItem('id'), getID, function(resReadAllChat) {});
			$('.textMsg').val('');
		});
	});
}

function readMsg(id) {
	getIDFromUsername(id, function(getID) {
		readSingleMessage(localStorage.getItem('id'), getID, function(resReadMsg) {});
	});
}

function appendMsg(msg) {
	if (msg.from != localStorage.getItem('id')) {
		getUsernameFromID(msg.from, function(getUserIDChat) {
			var t =
				'<div class = "containerMsg">' +
				'<div class = "otherMsg">' +
				'<h1>' +
				getUserIDChat +
				'</h1>' +
				'<p>' +
				msg.text +
				'</p>' +
				'<h2>' +
				moment(msg.data).format('MMMM Do h:mm') +
				'</h2>' +
				'</div>';

			$('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat').append(t);
			/*$('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat').animate(
				{
					scrollTop: $('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat')[0].scrollHeight
				},
				200
			);*/
			$('.openChats')
				.children('#-' + getUserIDChat)
				.children('.appendMsgChat')
				.scrollTop($('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat')[0].scrollHeight);
		});
	} else {
		getUsernameFromID(msg.to, function(getUserIDChat) {
			var t =
				'<div class = "containerMsg">' +
				'<div class = "myMsg">' +
				'<h1>' +
				'PietroCappelletti' +
				'</h1>' +
				'<p>' +
				msg.text +
				'</p>' +
				'<h2>' +
				moment(msg.data).format('MMMM Do h:mm') +
				'</h2>' +
				'</div>';

			$('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat').append(t);
			/*$('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat').animate(
				{
					scrollTop: $('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat')[0].scrollHeight
				},
				200
			);*/
			$('.openChats')
				.children('#-' + getUserIDChat)
				.children('.appendMsgChat')
				.scrollTop($('.openChats').children('#-' + getUserIDChat).children('.appendMsgChat')[0].scrollHeight);
		});
	}
}

function addNewChatAllChat(account) {
	getIDFromUsername(account, function(resGetID) {
		addChat(localStorage.getItem('id'), resGetID, function(resAddChat) {
			$('.listAddNewChat').text('');
		});
	});
}

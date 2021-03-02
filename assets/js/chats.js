var username;
var focusId;
var caricaMessaggi = true;
var p = 0;
var notificaSound = new Audio('/sounds/chatNot.mp3');

$(document).ready(function() {
	var userToken = localStorage.getItem('User');
	getUser(userToken, function(res) {
		username = res.split('|')[1];
		$(document).attr('title', NameSocial + ' | ' + username);

		checkLogin(username, userToken, function(res) {
			if (res[0] == 'N') {
				localStorage.removeItem('User');
				window.location.replace('http://localhost:1984/');
			} else {
				localStorage.setItem('User', res.split('|')[1]);
			}
		});

		loadInitialChatsServer(username, function(resLoadInitialChats) {
			//readInitialLoad(username, function(resReadinitialLoad) {});
			for (var i = 0; i < resLoadInitialChats.length; i++) {
				generateChatInChats(resLoadInitialChats[i]);
			}

			window.setInterval(function() {
				readAllChat();
				focusId = $('.chats').children('.focus').attr('id');
				if (focusId != undefined && focusId != 'newChats') {
					readSingleChat(focusId);
				}
			}, 100);
		});

		$('.searchInput').on('input', function() {
			if ($('.searchInput').val().length > 2) {
				cercaUtenteChat($('.searchInput').val(), function(resSearch) {
					$('.listUsersChats').text('');
					for (var j = 0; j < resSearch.length; j++) {
						$('.listUsersChats').append(
							'<li onclick="addChatFunction(\'' +
								resSearch[j].username +
								'\')"><h1>' +
								resSearch[j].username +
								'</h1><p>' +
								resSearch[j].mail +
								'</p></li>'
						);
					}
				});
			}
		});

		$('.backHome').click(function() {
			window.location.replace('../main.html');
		});
	});
});

function generateChatInChats(account) {
	$('.chats').append(
		'<div class = "singleChat" id = "' +
			account +
			'" onClick="focusChatOpen(\'' +
			account +
			'\')">' +
			account +
			'<div class = "notificationSingleChat"></div></div>'
	);
	$('.notificationSingleChat').css('left', $('.chats').width() - 10);
	$('#' + account).children('.notificationSingleChat').hide();
}
function focusChatOpen(account) {
	caricaMessaggi = true;
	if (!$('#' + account + '-').length) {
		//#region class/hide/show
		$('.chats .singleChat').removeClass('focus');
		$('#' + account).addClass('focus');
		$('#' + account).children('.notificationSingleChat').hide();
		$('#' + account + '-').addClass('focus');
		$('#' + account + '-').show();

		$('.openChats .singleChat').hide();
		$('.openChats .singleChat').removeClass('focus');
		$('.openChats').append(
			'<div class = "singleChat" id = "' + account + '-">' + '<div class = "centerVertically"></div></div>'
		);

		//#endregion

		//#region generaChatOpenChat
		if (!$('#' + account + '-').children('.titleChat').length) {
			var s =
				'<div class = "titleChat"><img src = "/uploadedFiles/' +
				account +
				'/account/profilePicture.png"><h1>' +
				account +
				'</h1></div>';
			s += '<div class = "appendMsg"></div>';
			s += '<div class = "messageControlBar">';
			s += '<input class = "messageText" placeholder="message here">';
			s += '<div class = "sendMsgButton" onClick = "sendMsgButton(\'' + account + '\')">></div>';
			s += '</div>';
			s += '<div class = "buttonController"></div>';
			$('#' + account + '-').children('.centerVertically').append(s);
		}
		//#endregion
	} else {
		$('.chats .singleChat').removeClass('focus');
		$('#' + account).addClass('focus');
		$('#' + account).children('.notificationSingleChat').hide();
		$('.openChats .singleChat').hide();
		$('.openChats .singleChat').removeClass('focus');
		$('#' + account + '-').addClass('focus');
		$('#' + account + '-').show();
	}
	readNotificationChat(username, account, function(resReadNotificationChat) {});
}
function readAllChat() {
	thersMessages(username, function(resThersMessages) {
		if (resThersMessages.length != 0) {
			for (var i = 0; i < resThersMessages.length; i++) {
				if (resThersMessages[i].user0 != username) {
					if ($('#' + resThersMessages[i].user0).length) {
						if ($('#' + resThersMessages[i].user0).hasClass('focus')) {
						} else {
							$('#' + resThersMessages[i].user0).children('.notificationSingleChat').show();
							if (
								$('#' + resThersMessages[i].user0).children('.notificationSingleChat').text() !=
								resThersMessages[i]['read' + username].toString()
							) {
								notificaSound.play();
								$('#' + resThersMessages[i].user0 + '-').attr('read', 'true');
								$('#' + resThersMessages[i].user0)
									.children('.notificationSingleChat')
									.text(resThersMessages[i]['read' + username]);
							}
						}
					} else {
						generateChatInChats(resThersMessages[i].user0);
						if (resThersMessages[i]['read' + username] != 1) {
							$('#' + resThersMessages[i].user0)
								.children('.notificationSingleChat')
								.text(parseInt(resThersMessages[i]['read' + username] - 1).toString());
						}
						parseInt(resThersMessages[i]['read' + username] - 1);
						$('#' + resThersMessages[i].user0).children('.notificationSingleChat').show();
					}
				} else {
					if ($('#' + resThersMessages[i].user1).length) {
						if ($('#' + resThersMessages[i].user1).hasClass('focus')) {
						} else {
							$('#' + resThersMessages[i].user1).children('.notificationSingleChat').show();
							if (
								$('#' + resThersMessages[i].user1).children('.notificationSingleChat').text() !=
								resThersMessages[i]['read' + username].toString()
							) {
								notificaSound.play();
								$('#' + resThersMessages[i].user1 + '-').attr('read', 'true');
								$('#' + resThersMessages[i].user1)
									.children('.notificationSingleChat')
									.text(resThersMessages[i]['read' + username]);
							}
						}
					} else {
						generateChatInChats(resThersMessages[i].user1);
						if (resThersMessages[i]['read' + username] != 1) {
							$('#' + resThersMessages[i].user1)
								.children('.notificationSingleChat')
								.text(parseInt(resThersMessages[i]['read' + username] - 1).toString());
						}
						$('#' + resThersMessages[i].user1).children('.notificationSingleChat').show();
					}
				}
			}
		}
	});
}
function readSingleChat(account) {
	if ($('#' + account + '-').children('.centerVertically').children('.appendMsg').html() == '' && caricaMessaggi) {
		caricaMessaggiFunction(account);
		caricaMessaggi = false;
		readSingleChat(account);
	} else {
		read(username, account, function(resNewMessage) {
			//console.log('readMessaggi');
			if (resNewMessage != '') {
				for (var j = 0; j < resNewMessage.length; j++) {
					if (resNewMessage[j].from != username) {
						if ($('#' + account + '-').attr('read') != 'true') {
							notificaSound.play();
						}
					}
					if ($('#' + account + '-').children('.centerVertically').children('.appendMsg').length) {
						appendMessage(account, resNewMessage[j]);
					} else {
						appendMessage(account, resNewMessage[j]);
					}
				}
			}
		});
	}
}
function appendMessage(account, message) {
	if (!$('#' + message._id).length) {
		if (message.from == username) {
			readNotificationChat(username, message.to, function(resReadNotificationChat) {});
			var k = '<div class="messageChatId" id = "' + message._id + '"><div class = "widthMessage my">';
		} else {
			readNotificationChat(username, message.from, function(resReadNotificationChat) {});
			var k = '<div class="messageChatId" id = "' + message._id + '"><div class = "widthMessage other">';
		}
		k += '<h1>' + message.from + '</h1>';
		k += '<p>' + message.text + '</p>';
		k += '<h2>' + moment(message.date).format('MMMM Do, h:mm') + '</h2>';
		k += '<div></div>';

		$('#' + account + '-').children('.centerVertically').children('.appendMsg').append(k);
		$('#' + account + '-').children('.centerVertically').children('.appendMsg').animate(
			{
				scrollTop: $('#' + account + '-').children('.centerVertically').children('.appendMsg').height() + 10000
			},
			1000
		);
	}
}
function sendMsgButton(account) {
	sendMessage(
		username,
		account,
		$('#' + account + '-')
			.children('.centerVertically')
			.children('.messageControlBar')
			.children('.messageText')
			.val(),
		function(resSendMessager) {}
	);
	$('#' + account + '-')
		.children('.centerVertically')
		.children('.messageControlBar')
		.children('.messageText')
		.val('');
}
function caricaMessaggiFunction(account) {
	//console.log('caricaMessaggi');
	$('#' + account + '-').children('.centerVertically').children('.appendMsg').text('');
	caricaMessaggiChat(username, account, function(resCaricaMessaggiChat) {
		for (var i = 0; i < resCaricaMessaggiChat.length; i++) {
			appendMessage(account, resCaricaMessaggiChat[i]);
		}
	});
}
function addChatFunction(account) {
	addChatMessage(username, account, function(resAddChatMessage) {});
}

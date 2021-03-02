$(document).ready(function() {
	$(document).attr('title', NameSocial + ' | Home');
	var smooth = [ $('a.smooth'), 100, 750 ];
	smooth[0].click(function() {
		$('html, body').animate(
			{
				scrollTop: $('[id="' + $.attr(this, 'href').substr(1) + '"]').offset().top - smooth[1]
			},
			smooth[2]
		);
		return false;
	});

	//register an account
	$('.registerButton').click(function() {
		var mail = $('.mailRegister').val();
		var password = $('.passwordRegister').val();
		var rePassword = $('.rePasswordRegister').val();
		var securityQuestion = $('.securitysecurityQuestion').val();
		var securityAnswere = $('.securitysecurityAnswere').val();
		var username = $('.usernameRegister').val();
		if (username.indexOf('|') == -1) {
			register(mail, password, rePassword, securityQuestion, username, securityAnswere, function(
				securityAnswere
			) {
				$('.output').text(securityAnswere);
			});
		} else {
			$('.output').text('Username non valido, cambiare username');
			alert('Username non valido, cambiare username');
			console.log('Username non valido, cambiare username');
		}
		$('.mailRegister').val('');
		$('.passwordRegister').val('');
		$('.rePasswordRegister').val('');
		$('.securitysecurityQuestion').val('');
		$('.securitysecurityAnswere').val('');
		$('.usernameRegister').val('');
	});
	//login to an account
	$('.loginButton').click(function() {
		loginFunction();
	});

	$('.passwordLogin').keyup(function(e) {
		if (e.keyCode == 13) {
			loginFunction();
		}
	});
	$('.usernameLogin').keyup(function(e) {
		if (e.keyCode == 13) {
			$('.passwordLogin').focus();
		}
	});

	$('.checktoken').click(function() {
		var username = $('.usernameLogin').val();
		var token = localStorage.getItem('User');
		checktoken(username, token, function(result) {
			result = result.split(':');
			if (result[0].substr(0, 2) == 'TG') {
				localStorage.setItem('User', result[1]);
			} else {
				localStorage.removeItem('User');
				window.location.replace('../index.html');
			}
		});
	});

	$('.forgotpassword').click(function() {
		var username = prompt('pls enter your username', 'username');
		var mail = prompt('pls enter your mail', 'mail');
		resetpasswordRequest(username, mail, function(result) {
			console.log(result);
		});
	});
});

function loginFunction() {
	var password = $('.passwordLogin').val();
	var username = $('.usernameLogin').val();
	//res.send('FTG:' + token + '|' + result._id);
	loginAccount(username, password, function(securityAnswere) {
		if (securityAnswere == 'error Account non verificato') {
			alert('account non verificato');
			console.log('account non verificato');
		} else {
			securityAnswere = securityAnswere.split('-');
			if (securityAnswere[0].substr(0, 2) == 'TG') {
				var lenght = securityAnswere[0].lenght;
				var token = securityAnswere[0].substr(3, lenght);
				localStorage.setItem('User', token);
				localStorage.setItem('id', securityAnswere[1]);
				window.location.replace('../main.html');
			} else if (securityAnswere[0].substr(0, 2) == 'FT') {
				var lenght = securityAnswere[0].lenght;
				var token = securityAnswere[0].substr(4, lenght);
				localStorage.setItem('User', token);
				localStorage.setItem('id', securityAnswere[1]);
				window.location.replace('../home.html');
			}
		}
		$('.passwordLogin').val('');
		$('.usernameLogin').val('');
	});
}

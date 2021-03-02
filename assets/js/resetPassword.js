$(document).ready(function(){
    $(".resetButton").click(function(){
        var username = $('.username').val();
        var securityQuestion = $('.securitysecurityQuestion').val();
        var securityAnswere = $('.securitysecurityAnswere').val();
        var password = $('.password').val();
        var rePassword = $('.rePassword').val();
        //var mail = 
        //var token = 

        if (password == rePassword){
            resetpassword(username, mail, password, rePassword, securityQuestion, securityAnswere, token, function(result){
                $(".output").text(result);
            });
        } else {
            $(".output").text("password not match");
        }
    })
});
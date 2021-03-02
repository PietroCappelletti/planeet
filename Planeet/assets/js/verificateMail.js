$(document).ready(function(){
    validateAccount(getArgument('token'), function(result){
      console.log(result);
      result = result.split(':');
      if(result[0].substr(0,2) == 'TG'){        
        localStorage.setItem('User', result);
      } else {
        localStorage.removeItem('User');
      }
    });
  });
function getArgument(argument) {
    url = window.location.href;
    temp = (url.split("?"))[1];
    temp = temp.split("&");
    for (var item in temp) {
      if (temp[item].split("=")[0] == argument) {
        return temp[item].split("=")[1];
      }
    }
}
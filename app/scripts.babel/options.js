'use strict';


document.addEventListener('DOMContentLoaded', function () {
  console.log('\'Allo \'Allo! Option');

  var background = chrome.extension.getBackgroundPage();

  var checkUI = function() {
    console.log('checkUI');

    if (background.isLoggedIn){
      console.log('user is logged in');
      $('#login').hide();
      $('#logout').show();
    } else {
      console.log('user is logged out');
      $('#logout').hide();
      $('#login').show();
    }

  };

  checkUI();

  var login = function(){
    background.login(
        { 'type': 'login_plain',
          'username': $('#username').val(),
          'password': $('#password').val()  },
          function(output) {
            console.log('options.js login-success');
            console.log(output);
            if (output.error && output.message ) {
              $('#login-message').text(output.reason);
            }
            checkUI();
          });
  };

  
  $('#login-form').submit(function(event){
    console.log('login-form');
    event.preventDefault();
    //chrome.runtime.sendMessage({username: 'user', password: 'password', type: this.id});
    login();
  });

});

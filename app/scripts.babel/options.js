'use strict';


document.addEventListener('DOMContentLoaded', function () {
  console.log('\'Allo \'Allo! Option');

  var background = chrome.extension.getBackgroundPage();

  var checkUI = function() {
    console.log('options.js checkUI');

    if (background.isLoggedIn){
      console.log('user is logged in');
      $('#login').hide();
      $('#logout').show();
      $('#email').text(background.currentUser.email);
    } else {
      console.log('user is logged out');
      $('#logout').hide();
      $('#login').show();
    }

  };

  checkUI();

  var login = function(){
    background.doLogin(
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

  var logout = function(){
    console.log('options.js logout ');
    background.doLogout(function(){
      console.log('options.js logout callback');
      checkUI();
    });
  };

  
  $('#login-form').submit(function(event){
    console.log('login-form login');
    event.preventDefault();
    login();
  });
  $('#logout-form').submit(function(event){
    console.log('login-form logout');
    event.preventDefault();
    logout();
  });

});

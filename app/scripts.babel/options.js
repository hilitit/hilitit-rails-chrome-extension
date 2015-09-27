'use strict';


document.addEventListener('DOMContentLoaded', function () {
  console.log('\'Allo \'Allo! Option');

  var background = chrome.extension.getBackgroundPage();

  var checkUI = function() {
    console.log('checkUI');

    if (background.isLoggedIn()){
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
  
  $('#login-form').submit(function(event){
    console.log('login-form');
    chrome.runtime.sendMessage({username: 'user', password: 'password', type: this.id});
    event.preventDefault();
  });

});

'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

console.log('\'Allo \'Allo! Event Page for Browser Action');

var isLoggedIn = function(){
  console.log('isLoggedIn()');
  return false;
};

function makeBaseAuth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  var auth = 'Basic ' + hash;
  console.log( 'Auth: ' +  auth );
  return auth;
}

var login = function(username, password){
  console.log('login: ' + username + ' ' + password);
  $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader ('Authorization', makeBaseAuth(username , password )); 
    },
    url: 'http://hilit.it:8000/users/sign_in.json',
    context: document.body
  }).done(function() {
    console.log('login success');
    $( this ).addClass( 'done' );
    $.ajaxSetup({
      header: {'Authorization' : makeBaseAuth(username,password)} 
    });
  });
};

chrome.runtime.onMessage.addListener(function (request, sender, response) {

  console.log('request');
  console.log(request);
  console.log('sender');
  console.log(sender);
  console.log('response');
  console.log(response);

  console.log('chrome message: '  +  request + ' '  + sender  + ' ' + response  + ' '  + request.type.startsWith('login') + ' ' + isLoggedIn() );

  login('tillawy@me.com','password');


});

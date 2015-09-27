'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

console.log('\'Allo \'Allo! Event Page for Browser Action');

var isLoggedIn = false;

function makeBaseAuth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  var auth = 'Basic ' + hash;
  return auth;
}

var logout = function(req, callback){
  isLoggedIn = false;
}

var login = function(req, callback){
  var username = req.username;
  var password = req.password;
  console.log('login: ' + username + ' ' + password);
  $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader ('Authorization', makeBaseAuth(username , password )); 
    },
    url: 'http://hilit.it:8000/highlights.json',
    context: document.body
  }).done(function(output) {
    console.log('login success');
    console.log(output);
    isLoggedIn = true;
    $( this ).addClass( 'done' );
    $.ajaxSetup({
      header: {'Authorization' : makeBaseAuth(username,password)} 
    });
    callback(output);
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


  login();

});

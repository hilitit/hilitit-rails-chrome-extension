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
  callback();
};

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
  }).fail(function(error){
    console.error( error );
  });
};



// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  console.log('background.js browserAction.onClicked');
  //console.error('background.js browserAction.onClicked');
  chrome.tabs.executeScript({
    code: 'document.body.style.backgroundColor="red"'
  });

  chrome.browserAction.setPopup({ 
    tabId: tab.tabId, 
    popup: 'popup.html' 
  });

});


chrome.runtime.onMessage.addListener(function (request, sender, response) {

  console.log('request');
  console.log(request);
  console.log('sender');
  console.log(sender);
  console.log('response');
  console.log(response);

  console.log('chrome message: '  +  request + ' '  + sender  + ' ' + response  + ' '  + request.type.startsWith('login') + ' ' + isLoggedIn );


});

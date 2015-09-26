'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

console.log('\'Allo \'Allo! Event Page for Browser Action');

var isLoggedIn = function(){
  console.log("isLoggedIn()");
  return false;
};


chrome.runtime.onMessage.addListener(function (request, sender, response) {

  console.log("request");
  console.log(request);
  console.log("sender");
  console.log(sender);
  console.log("response");
  console.log(response);

  console.log('chrome message: '  +  request + " "  + sender  + " " + response  + " "  + request.type.startsWith('login') );


});

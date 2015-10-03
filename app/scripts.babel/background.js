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



chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log('onUpdated: ' +  tabId );
  //console.log( changeInfo );
  //console.log( changeInfo.url );
  //console.log( tab );
  chrome.tabs.get(tabId, function(tab){
     console.log(tab);
  });
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  // how to fetch tab url using activeInfo.tabid
  chrome.tabs.get(activeInfo.tabId, function(tab){
     console.log(tab.url);
  });
});

chrome.tabs.onCreated.addListener(function( tab) {         
  console.log('onCreated: ' + ' ' + tab.tabId + ' ' + tab.url);
  console.log( tab );
});


// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  console.log('background.js browserAction.onClicked');
  //console.error('background.js browserAction.onClicked');
  //chrome.tabs.executeScript({ code: 'document.body.style.backgroundColor="red"' });

  chrome.browserAction.setPopup({ 
    tabId: tab.tabId, 
    popup: 'browser_action.html' 
  });

});


chrome.runtime.onMessage.addListener(function (request, sender, response) {

  console.log('request');
  console.log(request);
  console.log('sender');
  console.log(sender);
  //console.log('response');
  //console.log(response);

  //console.log('chrome message: '  +  request + ' '  + sender  + ' ' + response  + ' '  + request.type.startsWith('login') + ' ' + isLoggedIn );

  if (request.source === 'browser_action.js'){
   chrome.tabs.getSelected(null, function(tab) {
        var tabUrl = tab.url;
        //window.alert(tab.url);
        chrome.tabs.executeScript(tab.ib, { file: 'bower_components/jquery/dist/jquery.min.js' });
        chrome.tabs.executeScript(tab.ib, { file: 'scripts/get-selector.js' });
        chrome.tabs.executeScript(tab.ib, { file: 'scripts/inject.js' });
   });
  }

});

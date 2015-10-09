'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

console.log('\'Allo \'Allo! Event Page for Browser Action');

var isLoggedIn = false;
var currentUser = null;

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


var loadHighlights = function(req, callback){
  var username = req.username;
  var password = req.password;
  console.log('login: ' + username + ' ' + password);
  $.ajax({
    beforeSend: function (xhr) {
      xhr.setRequestHeader ('Authorization', makeBaseAuth(username , password )); 
    },
    url: 'http://hilit.it:9000/highlights.json',
    context: document.body
  }).done(function(output) {
    console.log('login success');
    console.log(output);
    isLoggedIn = true;
    $( this ).addClass( 'done' );
    callback(output);
  }).fail(function(error){
    console.error( error );
  });
};


var login = function(req, callback){
  var username = req.username;
  var password = req.password;
  console.log('login: ' + username + ' ' + password);
  $.ajax({
    method: 'POST',
    beforeSend: function (xhr) {
      xhr.setRequestHeader ('Authorization', makeBaseAuth(username , password )); 
      xhr.setRequestHeader ( 'Accept', 'application/vnd.hilitit.v1' );
    },
    url: 'http://hilit.it:9002/api/sessions',
    context: document.body
  }).done(function(output) {
    console.log('login success');
    console.log(output);
    isLoggedIn = true;

    currentUser = output.user;
    $( this ).addClass( 'done' );
    $.ajaxSetup({
      header: {'Authorization' : makeBaseAuth(username,password)} 
    });
    callback(output.user);
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
  //chrome.tabs.get(activeInfo.tabId, function(tab){
  //   console.log(tab.url);
  //});
});

chrome.tabs.onCreated.addListener(function( tab) {         
  console.log('onCreated: ' + ' ' + tab.tabId + ' ' + tab.url);
  console.log( tab );
});



chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  chrome.pageAction.show(tabId);

  chrome.pageAction.setIcon({'tabId':tabId, 'path':'images/icon-38.png' });
});


// Called when the user clicks on the browser action.
chrome.pageAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  console.log('background.js pageAction.onClicked');
  chrome.pageAction.setIcon({'tabId':tab.tabId, 'path':'images/icon-19.png' });

  chrome.pageAction.show(tab.id);

});


chrome.runtime.onMessage.addListener(function (request, sender, response) {

  console.log('request');
  console.log(request);
  console.log('sender');
  console.log(sender);
  //console.log('response');
  //console.log(response);

  //console.log('chrome message: '  +  request + ' '  + sender  + ' ' + response  + ' '  + request.type.startsWith('login') + ' ' + isLoggedIn );

  if (request.type === 'log'){
    console.log(request.source + ' ,log: ' + request.message);
    response({'asdf': '234234234'});

  }


  if (request.source === 'page_action.js' && request.type === 'query'){
    console.log( 'query' );
    chrome.tabs.query({
      active: true,               // Select active tabs
      lastFocusedWindow: true     // In the current window
    }, function(arrayOfTabs) {
      // Since there can only be one active tab in one active window, 
      //  the array has only one element
      var tab = arrayOfTabs[0];
      // Example:
      var url = tab.url;
      // ... do something with url variable
    console.log( 'url:' );
    console.log( url );
    response({'url': url});
    });
  }
  if (request.source === 'page_action.js' && request.type === 'activate'){
    chrome.tabs.getSelected(null, function(tab) {
      var tabUrl = tab.url;
      //window.alert(tab.id);
/*
      chrome.tabs.executeScript(tab.id, { file: 'bower_components/jquery/dist/jquery.min.js' });
      chrome.tabs.executeScript(tab.id, { file: 'scripts/get-selector.js' });
      chrome.tabs.executeScript(tab.id, { file: 'scripts/inject.js' });
*/
      chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/icon-19.png' });
    });
  }
  console.log('return true'); 
  return true; 
});



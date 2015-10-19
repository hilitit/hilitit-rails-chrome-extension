'use strict';

var SERVER='hilit.it:9002';
var HILITIT_USER='hilit_it_user';
var HILITIT_PASS='hilit_it_pass';
var isLoggedIn = false;
var currentUser = null;

function makeBaseAuth(user, pass) {
  var tok = user + ':' + pass;
  var hash = btoa(tok);
  var auth = 'Basic ' + hash;
  return auth;
}

var doLogin = function(req, callback){
  console.log('login: ' + req.username + ' ' + req.password);
  $.ajax({
    method: 'POST',
    beforeSend: function (xhr) {
      xhr.setRequestHeader ('Authorization', makeBaseAuth(req.username , req.password )); 
      xhr.setRequestHeader ( 'Accept', 'application/vnd.hilitit.v1' );
    },
    url: 'http://' + SERVER + '/api/sessions',
    //context: document.body
  }).done(function(output) {
    console.log('login success');
    console.log(output);
    isLoggedIn = true;
    currentUser = output.user;
    currentUser.username = req.username;
    currentUser.password = req.password;

    var obj= {};
    obj[ HILITIT_USER ] = req.username;
    obj[ HILITIT_PASS ] = req.password;
    chrome.storage.local.set( obj , function(){
      console.log( 'chrome.storage.local.set');
      callback(output.user);
    });
  }).fail(function(error){
      //console.error( error );
      callback(error);
  });
};


chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);

  // No tabs or host permissions needed!
  chrome.storage.local.get([ HILITIT_USER, HILITIT_PASS ], function(items){
    console.log('items');
    console.log(items);
    console.log('username: ' + items[ HILITIT_USER ]);
    console.log('password: ' + items[ HILITIT_PASS ]);
    console.log('isLoggedIn: ' + isLoggedIn);
    if (! isLoggedIn && items [ HILITIT_USER ] && items[ HILITIT_PASS ] ){
      console.log('credentials saved, time to login');
      doLogin( {'username': items[ HILITIT_USER ], 'password' : items[ HILITIT_PASS ] }, function(user){
        console.log('user login success');
      });
    }
    //  Data's been saved boys and girls, go on home
  });



});

console.log('\'Allo \'Allo! Event Page for Browser Action');


var doLogout = function(callback){
  console.log('background.js doLogout');
  chrome.storage.local.remove( [ HILITIT_USER, HILITIT_PASS ] , function(){
    console.log( 'chrome.storage.local.remove: [ HILITIT_USER, HILITIT_PASS ]');
    isLoggedIn = false;
    callback();
  });
};


var queryActiveTab = function(callback){
  console.log( 'queryActiveTab' );
  chrome.tabs.query({
    active: true,               // Select active tabs
    lastFocusedWindow: true     // In the current window
  }, function(arrayOfTabs) {
    var tab = arrayOfTabs[0];
    var url = tab.url;
    console.log( 'url:' );
    console.log( url );
    callback( tab );
  });
};





var loadHighlights = function(url, callback){
  console.log('loadHighlights for url:  ' + url );
  console.log( currentUser.username + ':' + currentUser.password );
  $.ajax({
    url: 'http://' +  SERVER + '/highlights.json',
    beforeSend: function (xhr) {
      xhr.setRequestHeader ('Authorization', makeBaseAuth( currentUser.username , currentUser.password )); 
      xhr.setRequestHeader ( 'Accept', 'application/vnd.hilitit.v1' );
    },
    //context: document.body
  }).done(function(output) {
    //console.log('login success');
    console.log(output);
    //isLoggedIn = true;
    //$( this ).addClass( 'done' );
    callback(output);
  }).fail(function(error){
    console.error( error );
   callback(error);
  });
};

var doHighlight = function(tab, object, callback) {
  chrome.tabs.sendMessage(tab.id, object, function(response) {
    console.log('response + + + + + +');
    console.log(response);
    console.log(callback);
    callback(null);
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


chrome.pageAction.onClicked.addListener(function(tab) {
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



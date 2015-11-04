'use strict';

var SERVER='127.0.0.1:9002';
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
    console.error( 'doLogin error' );
    console.error( error );
    callback(error);
  });
};

var flashPageActionIconForTab = function(tab){
  var colors = ['blue', 'red' , 'clear', 'green' , 'blue', 'red' , 'clear', 'green'];
  var counter = 0;
  var interval = null;
  interval = setInterval(function(){
    chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/Marker-' + colors[counter++] + '-38.png' });
    if (counter === colors.length){
      clearInterval(interval);
    }
  },800);
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

var parseUrl = function(url){
  var parsed = document.createElement('a');
  parsed.href = url;
  return parsed;
};

var isTabAWebPage = function(tab){
  var dic = parseUrl(tab.url);
  return dic.protocol === 'http:' || dic.protocol === 'https:';
};

var isTabHilitable = function(tab,callback){
  var dic = parseUrl(tab.url);
  var isHilitable = dic.protocol === 'http:';
  callback(isHilitable);
};

var queryActiveTab = function(callback){
  console.log( 'queryActiveTab' );
  chrome.tabs.query({
    active: true,               // Select active tabs
    lastFocusedWindow: true     // In the current window
  }, function(arrayOfTabs) {
    var tab = arrayOfTabs[0];
    var url = tab.url;
    console.log( 'background.js queryActiveTab url:' + url );
    callback( tab );
  });
};




var loadHighlight = function(highlightId, callback){

  console.log('loadHighlight for id:  ' + highlightId );
  $.ajax({
    url: 'http://' +  SERVER + '/api/highlights/' + highlightId + '.json',
    beforeSend: function (xhr) {
      if (currentUser) {
        xhr.setRequestHeader ('Authorization', makeBaseAuth( currentUser.username , currentUser.password )); 
      }
      xhr.setRequestHeader ( 'Accept', 'application/vnd.hilitit.v1' );
    },
    //context: document.body
  }).done(function(output) {
    console.log('loadHighlight success ');
    console.log(output);
    callback(output);
  }).fail(function(error){
    console.error('loadHighlight error');
    console.error( error );
   callback(error);
  });
};


var loadHighlights = function(url, callback){
  console.log('loadHighlights for url:  ' + url );
  var parser = document.createElement('a');
  parser.href = url;
  //console.log( currentUser.username + ':' + currentUser.password );
  $.ajax({
    url: 'http://' +  SERVER + '/api/highlights.json?' + '&protocol=' + parser.protocol + '&hostname=' + parser.hostname + '&pathname=' + parser.pathname + '&search=' + parser.search  + '&pathname_hash' + parser.hash ,
    beforeSend: function (xhr) {
      if (currentUser) {
        xhr.setRequestHeader ('Authorization', makeBaseAuth( currentUser.username , currentUser.password )); 
      }
      xhr.setRequestHeader ( 'Accept', 'application/vnd.hilitit.v1' );
    },
    //context: document.body
  }).done(function(output) {
    console.log('loadHighlights success ' + output.length);
    //console.log(output);
    callback(output);
  }).fail(function(error){
    console.error('loadHighlights error:');
    console.error( error );
   callback(error);
  });
};


var showPageOptionsIconForData = function(data ){
  console.log('background.js showPageOptionsIconForData isLoggedIn: ' + isLoggedIn);
  queryActiveTab(function(tab){

    var isWebPage = isTabAWebPage( tab );
    console.log( 'background.js isTabAWebPage: ' + isWebPage );
    if (!isWebPage) {
      chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/Marker-clear-38.png' });
      return;
    }
   

    isTabHilitable(tab, function(isHilitable){
      console.log( 'background.js showPageOptionsIconForData isTabHilitable: ' + isHilitable );
      if (!isHilitable){
        console.log( 'background.js showPageOptionsIconForData !isTabHilitable');
         chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/Marker-stop-38.png' });
         return;
      }
      if (isLoggedIn && data.length > 0){
        console.log( 'background.js showPageOptionsIconForData isTabHilitable,isLoggedIn,data.length > 0');
        //flash green
        flashPageActionIconForTab(tab);
      }
      if (!isLoggedIn && data.length === 0){
        console.log( 'background.js showPageOptionsIconForData isTabHilitable,!isLoggedIn,data.length === 0');
        chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/Marker-clear-38.png' });
      }
      if (!isLoggedIn && data.length > 0){
        console.log( 'background.js showPageOptionsIconForData isTabHilitable,!isLoggedIn,data.length > 0');
        chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/Marker-green-38.png' });
      }
      if (isLoggedIn && data.length === 0){
        console.log( 'background.js showPageOptionsIconForData isTabHilitable,isLoggedIn,data.length === 0');
        chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/Marker-blue-38.png' });
      }
    });
  });
};

var doHighlight = function(tab, object, callback) {
  chrome.tabs.sendMessage(tab.id,{source: 'background.js', type: 'highlight', object: object}, function(response) {
    console.log('response + + + + + +');
    console.log(response);
    console.log(callback);
    callback(null);
  });
};


var createHighlight = function(obj, callback){
  if (!currentUser) {
    callback(new Error({message: 'you need to login'}));
  }
  console.log( 'background.js ' + ' createHighlight' );
  $.ajax({
    method: 'POST',
    data: { highlight : JSON.stringify(obj) },
    //contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    url: 'http://' + SERVER + '/api/highlights.json',
    beforeSend: function (xhr) {
      xhr.setRequestHeader ('Authorization', makeBaseAuth( currentUser.username , currentUser.password )); 
      xhr.setRequestHeader ( 'Accept', 'application/vnd.hilitit.v1' );
    },
    //context: document.body
  }).done(function(output) {
    console.log('createHighlights success');
    console.log(output);
    callback(output);
  }).fail(function(error){
    console.log('createHighlights failed');
    console.error( error );
   callback(error);
  });

};


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log('background.js tabs.onUpdated');
  console.log( changeInfo );
  chrome.tabs.get(tabId, function(tab){
     console.log(tab);
     loadHighlights(tab.url, function(data){
       console.log('background.js tabs.onUpdated loadHighlights.length: ' +  data.length );
       if ( data.length > 0 ){
         //chrome.pageAction.setIcon({'tabId':tabId, 'path':'images/icon-38.png' });
       }
     });
  });

  chrome.pageAction.show(tabId);

});


chrome.tabs.onActivated.addListener(function(activeInfo) {
  // how to fetch tab url using activeInfo.tabid
  console.log( 'background.js onActivated' );
  chrome.tabs.get(activeInfo.tabId, function(tab){
     console.log(tab.url);
  });


});

chrome.tabs.onCreated.addListener(function( tab) {         
  console.log('onCreated: ' + ' ' + tab.tabId + ' ' + tab.url);
  console.log( tab );
});




chrome.pageAction.onClicked.addListener(function(tab) {
  console.log('Turning ' + tab.url + ' red!');
  console.log('background.js pageAction.onClicked');
  //chrome.pageAction.setIcon({'tabId':tab.tabId, 'path':'images/icon-19.png' });

  chrome.pageAction.show(tab.id);

});


chrome.runtime.onMessage.addListener(function (request, sender, response) {

  console.log('background.js incoming message from: ' +  request.source );
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

  if (request.source === 'inject.js' && request.type === 'is_url_hiliteable'){
    loadHighlights(request.object.href,function(data){
      showPageOptionsIconForData( data );
      response({result: data.length > 0});
    });
  }


  if (request.source === 'inject.js' && request.type === 'create'){
    createHighlight( request.object, function(output){
      console.log( 'background.js createHighlight' );
      response( output );
    });
    console.log(request.source + ' ,hilit: ' + request.type);
    console.log();
///
  }

  if (request.source === 'page_action.js' && request.type === 'activate'){
    chrome.tabs.getSelected(null, function(tab) {
      var tabUrl = tab.url;
      chrome.tabs.sendMessage(tab.id,{source: 'background.js', type: 'activate'}, function(response) {
        //chrome.pageAction.setIcon({'tabId':tab.id, 'path':'images/icon-19.png' });
      });
      //window.alert(tab.id);
/*
      chrome.tabs.executeScript(tab.id, { file: 'bower_components/jquery/dist/jquery.min.js' });
      chrome.tabs.executeScript(tab.id, { file: 'scripts/get-selector.js' });
      chrome.tabs.executeScript(tab.id, { file: 'scripts/inject.js' });
*/
    });
  }
  console.log('return true'); 
  return true; 
});



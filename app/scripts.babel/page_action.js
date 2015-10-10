'use strict';


console.log('Allo! Popup 1');
document.addEventListener('DOMContentLoaded', function () {
  //Get Reference to Functions




  var backGround = chrome.extension.getBackgroundPage();
  backGround.queryActiveTab(function(tab){
    console.log( 'query response' );
    backGround.loadHighlights(tab.url,function(data){
      $.each(data, function(key, object){
        console.log(key);
        console.log(object);
        backGround.doHighlight( tab, object ,function(response) {
          console.log('response - - - - - - - ');
          console.log(response);
          chrome.runtime.sendMessage({source: 'page_action.js', type:'log', message: 'response - - - - '});


        });

      });
    });
  });

  $('#activate').change(function(dd){
    console.log('Allo!! ');
    chrome.runtime.sendMessage({source: 'page_action.js',type:'activate'}, function resp(re){
      console.log('Allo!! Popup 2');
    });

  });

  $('#loading').hide();
});


'use strict';


console.log('Allo! Popup 1');
document.addEventListener('DOMContentLoaded', function () {
  //Get Reference to Functions
  var backGround = chrome.extension.getBackgroundPage();
  chrome.runtime.sendMessage({source: 'page_action.js',type:'query'}, function(tab){
      console.log( 'query response' );
      console.log( tab );
  });

  $('#activate').change(function(dd){
    console.log('Allo!! ');
    chrome.runtime.sendMessage({source: 'page_action.js',type:'activate'}, function resp(re){
      console.log('Allo!! Popup 2');
    });

  });

  $('#loading').hide();
});


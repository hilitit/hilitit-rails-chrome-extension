'use strict';

console.log('Allo! Popup 1');

document.addEventListener('DOMContentLoaded', function () {
  //Get Reference to Functions
  var backGround = chrome.extension.getBackgroundPage();

  $('#activate').change(function(dd){
    console.log('Allo!! Popup 2');
    chrome.runtime.sendMessage({source: 'browser_action.js',type:'activate'});
  });
  $('#loading').hide();
});

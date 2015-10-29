'use strict';


console.log('Allo! Popup 1');
document.addEventListener('DOMContentLoaded', function () {
  //Get Reference to Functions




  var backGround = chrome.extension.getBackgroundPage();
  backGround.queryActiveTab(function(tab){
    console.log( 'query response' );

    if (! backGround.isLoggedIn ){
      return; // or use guest user
    }

    backGround.loadHighlights(tab.url,function(data){
      $.each(data, function(key, object){
        //console.log(key);
        //console.log(object);

        var h = $.parseHTML( '<li class="highlight" id="hi-' +  object.id  + '">' + object.id + ' ' +  object.user_id  + '</li>' );
        $( '#highlights-list' ).append(  h );
        $( '#hi-' + object.id).click(function() {
          console.log( 'Handler for .click() called.' );
          backGround.loadHighlight( object.id ,function(object2){
            backGround.doHighlight( tab, object2 ,function(response) {
              console.log('response - - - - - - - ');
              console.log(response);
              chrome.runtime.sendMessage({source: 'page_action.js', type:'log', message: 'response - - - - '});

            });
          });
        });
        /*
        backGround.doHighlight( tab, object ,function(response) {
          console.log('response - - - - - - - ');
          console.log(response);
          chrome.runtime.sendMessage({source: 'page_action.js', type:'log', message: 'response - - - - '});


        });
*/

      });
    });
  });


  if ( backGround.isLoggedIn ){
    $('#not-logged-in').hide();
  }
  $('#go-to-options').click(function() {
    if (chrome.runtime.openOptionsPage) {
      // New way to open options pages, if supported (Chrome 42+).
      chrome.runtime.openOptionsPage();
    } else {
      // Reasonable fallback.
      window.open(chrome.runtime.getURL('options.html'));
    }
  });


  $('#activate').change(function(dd){
    console.log('Allo!! ');
    chrome.runtime.sendMessage({source: 'page_action.js',type:'activate'}, function resp(re){
      console.log('Allo!! Popup 2');
    });

  });

  $('#loading').hide();
});


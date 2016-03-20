'use strict';


console.log('Allo! Popup 1');
document.addEventListener('DOMContentLoaded', function () {
  //Get Reference to Functions


  var backGround = chrome.extension.getBackgroundPage();
  var doLoadHighlights = function(tab){

    backGround.loadHighlights(tab.url,function(data){

      if ( data.length === 0 ){
        if ( backGround.isLoggedIn ){
          $('#message').text('No previous hilits, would you like to be the first?');
          $('#form-activate').show();
        } else {
          console.log('page_action, we have a guest and no previous highlights !');
          $('#message').text('No previous hilits, to create hilits please login first.');
        }
      } else {
        $('#message').text('');
        $('#form-activate').hide();
      }

      $.each(data, function(key, object){
        //console.log(key);
        //console.log(object);

        var h = $.parseHTML( '<li class="highlight" id="hi-' +  object.id  + '">' + object.text.substr(0,20)  + '</li>' );
        $( '#highlights-list' ).append(  h );
        $( '#hi-' + object.id).click(function() {
          if ( object.isHighlighted ){
            return;
          }
          console.log( 'Handler for .click() called.' );
          backGround.loadHighlight( object.id ,function(object2){
            backGround.doHighlight( tab, object2 ,function(response) {
              object.isHighlighted = true;
              console.log('response - - - - - - - ');
              console.log(response);
              chrome.runtime.sendMessage({source: 'page_action.js', type:'log', message: 'response - - - - '});

            });
          });
        });

      });
    });
  };

  backGround.queryActiveTab(function(tab){
    console.log( 'page_action.js queryActiveTab response' );

    backGround.isTabHilitable(tab,function(isHilitable){
      console.log('page_action.js isTabHilitable: ' + isHilitable);
      if (isHilitable){
        doLoadHighlights(tab);
      } else {
        $('#message').text('This page is not hilitable');
        $('#form-activate').hide();
      }
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
    console.log('Allo!! page_action send message activate ');
    chrome.runtime.sendMessage({source: 'page_action.js',type:'activate'}, function resp(re){
      console.log('Allo!! page_action receive response for activate ');
      console.log('Allo!! Popup 2');
      $('#form-activate').hide();
    });

  });

  $('#loading').hide();
});


// this is the code which will be injected into a given page...

(function() {

  // just place a div at top right
  var div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = 0;
  div.style.right = 0;
  div.textContent = 'Injected!';
  document.body.appendChild(div);


  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log( '  inject.js ' );
    console.log( request );
    console.log( sender );
   //if (request.source === 'page_action.js'){
     var el = $('#second > .texto');
     el.append('HEY ');
     //console.log( el );
     //console.log( el.text()  );
     //console.log( el.html() );
     highlight(el, 10,20);
     sendResponse( null );
   //}
  });

  chrome.runtime.sendMessage({source: 'inject.js', type:'log', message: 'message .... '}, function(msg){
    console.log('msg from bacground.js' +  msg );
  });

  chrome.runtime.sendMessage({source: 'inject.js',type:'activate'}, function(msg){
    console.log('msg from bacground.js' +  msg );
  });
  //window.alert('inserted self... giggity');


  var currentSelection = null;

  $('*').mouseup(function(event) {

    var selection;

    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection.createRange();
    }

    if (selection.toString() !== ''){
      event.stopPropagation();

      // console.log(''' + selection.toString() + '' was selected at ' + event.pageX + '/' + event.pageY);
      //var selector = $(this).getPath();
      var selector = $(this).getSelector();
      console.log(selector + ' --> matches ' + $(selector).length + ' element');
      var selRange = selection.getRangeAt(0);
      console.log(selection);

      currentSelection = {
        selector: selector,
        'text': selection.toString() ,
        'href': window.location.href,
        'startOffset': selRange.startOffset,
        'endOffset': selRange.endOffset
      };

      $('#popup').css('left',event.pageX);      // <<< use pageX and pageY
      $('#popup').css('top',event.pageY);
      $('#popup').css('display','inline');
      $('#popup').css('position', 'absolute');  // <<< also make it absolute!

      setTimeout(function(){
        $('#popup').css('display','none');
        $('#hilit-button').text('Hilit');
      }, 2000);

    }

  });
 //$('body').append('Test');
 var highlight = function (element, start, end) { 
console.log( 'highlight ....' );
   var str1 = element.html();
   console.log( 'str:' + str1 );
   var str2 = str1.substr(0, start) +
     ' <span class="hilited"> ' + 
     ' [ ' + 
     str1.substr(start, end - start + 1) +
     '  ] ' +
     ' </span> ' +
     str1.substr(end + 1);
   console.log( str1 );
   element.html( str2 );
 };
/*
 var el = $('#second > .texto');
 el.append('HEY ');
 console.log( el );
 console.log( el.text()  );
 console.log( el.html() );
 highlight(el, 10,20);
*/



})();

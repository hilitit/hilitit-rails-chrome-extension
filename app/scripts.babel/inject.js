// this is the code which will be injected into a given page...

(function() {

/*
  // just place a div at top right
  var div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = 0;
  div.style.right = 0;
  div.textContent = 'Injected!';
  document.body.appendChild(div);
*/

  var hilitCurrentSelection = function()
  {
    console.log('hilit currentSelection ...');
    console.log(currentSelection);

    chrome.runtime.sendMessage({source: 'inject.js',  type: 'create' ,object: currentSelection}, function(response) {
      console.log('hilit.js response');
      console.log(response);
      console.log('time to reload current page hilits from server');
    });
  };

  var injectPopup = function()
  {
    console.log('contentscript.js init');

    var popup = $.parseHTML( '<div style="display:none;width:100px;height:50px;border:3px solid black; background-color: gray;" id="popup"><div style="padding: 5px; width: 90px; height: 40px; background-color: white;" id="hilit-button"  value="hilit">Hilit</div></div>' );
    $( 'body' ).append(  popup );
    $('#hilit-button').click(function(event) {
      console.log('hilit-button clicked !!!');
      $('#hilit-button').text('Hiliting ...');
      hilitCurrentSelection();
    });
  };

  injectPopup();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log( '  inject.js ' );
    console.log( request );
   if (request.source === 'background.js' && request.type === 'highlight'){
     var h = request.object;
     //var el = $('#second > .texto');
     //var el = $( h.selector );
     var el = $(  h.tag_name + ':contains(' + h.text + ')' );
     //el.append('HEY ');
     //console.log( el.text()  );
     //console.log( el.html() );
     //highlight(el, 10,20);
     if (el){
       console.log( 'found element: ' + h.selector + ' ' + el  );
       console.log( el );
       doHighlight(el, h.start_offset, h.end_offset - 1);
     } else {
       console.error('selector: ' + h.selector + ' failed ');
     }
     sendResponse( null );
   }
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
      //console.log(selection);

      var parser = document.createElement('a');
      parser.href = window.location.href;
      currentSelection = {
        'selector': selector,
        'text': selection.toString() ,
        'href': window.location.href,
        'start_offset': selRange.startOffset,
        'end_offset': selRange.endOffset,
        'protocol': parser.protocol, // => "http:"
        'hostname': parser.hostname, // => "example.com"
        'port' : parser.port,     // => "3000"
        'pathname' : parser.pathname, // => "/pathname/"
        'search' : parser.search,   // => "?search=test"
        'hash' : parser.hash,     // => "#hash"
        'tag_name' : $(this).prop('tagName') 
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
 var doHighlight = function (element, start, end) { 
   console.log( 'highlight ....' + 'start: '  + start +  ' end: ' + end);
   var str1 = element.html();
   console.log( 'str:' + str1 );
   var s1 = '<span class="hilited">';
   var s2 = '</span>';
   var str2 = str1.substr(0, start) +
     s1 +
     //' [ ' + 
     str1.substr(start, end - start + 1) +
     //'  ] ' +
     s2 +
     str1.substr(end + 1);
   //console.log( str1 );
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

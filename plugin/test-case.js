
 // test case module
 
 (function() {
	   
      var f = window[F_NAME],
            copy = f.callFunction('copy'),
            assert = f.callFunction('assert'),
            currentWindow = f.getWindow(),
            currentDocument = currentWindow.document;
		
       var publicity = {
              createTestCase: function(name) {
                  alert(name);
              }
       }
       
	   f(publicity).addTo("utility");
 	}
 )();
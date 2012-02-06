
 // createTestCase module
 
 (function() {
	   
       var f = window[F_NAME],
       currentWindow = f.getWindow(),
       currentDocument = currentWindow.document;
		
       var publicity = {
              createTestCase: function(vl) {
                  alert(vl);
              }
       }
       
	   f(publicity).addTo("utility");
 	}
 )();

 // createTestCase module
 
 (function() {
		var f = window[F_NAME],
		currentWindow = f.getWindow(),
		currentDocument = currentWindow.document;
		function	createTestCase(vl) {
			 	 return alert(vl);
		};
		f({createTestCase : createTestCase}).addTo("utility");
 	}
 )();
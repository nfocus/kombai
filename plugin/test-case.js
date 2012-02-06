
 // test case module
 
(function() {
	   
    var f = window[F_NAME],
        copy = f.callFunction('copy'),
        assert = f.callFunction('assert'),
        currentWindow = f.getWindow(),
        currentDocument = currentWindow.document;
		
    var publicity = {
        takeTest: function(name) {
            var testName = name;
            return function(testCase) {
                if (!f(testCase).isObject(true)) return;
                  
                for (var i in testCase) {
                    if (!testCase.hasOwnProperty(i)) continue;
                    
                    try {
                        testCase[i]();
                    } catch(e) {
                    
                    }                    
                }
                
            }
        }
    }
       
	f(publicity).addTo("utility");

})();
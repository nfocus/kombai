
 // test case module
 
(function() {
	   
    var f = window[F_NAME],
        copy = f.callFunction('copy'),
        assert = f.callFunction('assert'),
        currentWindow = f.getWindow(),
        currentDocument = currentWindow.document;
		
    var publicity = {
        takeTest: function(name) {
            var record = {
                testName : name || ""
            };
            
            return function(testCase) {
                if (!f(testCase).isObject(true)) return;
                  
                for (var i in testCase) {
                    if (!testCase.hasOwnProperty(i)) continue;
                    
                    record[i] = {};
                    var test = record[i];
                    var start = 0;
                    try {
                        start = new Date().getTime();
                        testCase[i]();
                    } catch(e) {
                    
                    }
                    test.duration = new Date().getTime() - start;
                }
                
                console.log(record);
            }
        }
    }
       
	f(publicity).addTo("utility");

})();
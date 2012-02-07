
 // test case module
 
(function() {
	   
    var f = window[F_NAME],
        copy = f.callFunction('copy'),
        assert = f.callFunction('assert'),
        currentWindow = f.getWindow(),
        currentDocument = currentWindow.document;
		
    var publicity = {
        
        takeTest: function(testName) {
            
            return function (cases) {
                if (!f(cases).isObject(true)) return;
                var report = {
                    testName : testName || ""
                };
                
                for (var i in cases) {
                    
                    if (!cases.hasOwnProperty(i)) continue;
                    var test = {}, start = 0;
                    f.clearNotify();
                    report[i] = test;
                    
                    try {
                        start = new Date().getTime();
                        cases[i]();
                    } catch(e) {
                        test.result = "test fails because got error.";
                    }
                    
                    test.duration = new Date().getTime() - start;
                    var resultTest = f.getNotifyMessage();
                    var passed = 0;
                    test.detail = {};
                    for (var o = 0; o < resultTest.length; ++o) {
                        if (resultTest[o].result == "pass") passed += 1;
                        test.detail[o] = resultTest[o];
                    }
                   
                    test.result = "success";
                    test.total = resultTest.length;
                    test.passed = passed;
                    test.failed = test.total - test.passed;
                }
                
                return report;
            }
        }
    }
       
	f(publicity).addTo("utility");

})();
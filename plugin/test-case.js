
 // test case module
 
(function() {
	   
    var f = window[F_NAME];
		
    var publicity = {
        
        takeTest: function(testName) {
            
            return function (cases) {
                if (!f(cases).isObject(true)) return;
                var report = {
                    testName : testName || ""
                };
                var test, start, passed, resultTest;
				
                for (var i in cases) {
                    if (!cases.hasOwnProperty(i)) continue;
                    f.clearNotify();
					test = [];
                    report[i] = test;
                    
                    try {
                        start = new Date().getTime();
                        cases[i]();
						test.result = "success";
                    } catch(e) {
                        test.result = "test fails because got error.";
                    }
                    
                    test.duration = new Date().getTime() - start;
                    resultTest = f.getNotifyMessage();
                    passed = 0;
                    test.detail = {};
                    for (var o = 0; o < resultTest.length; ++o) {
                        if (resultTest[o].result == "pass") passed += 1;
                        test.detail[o] = resultTest[o];
                    }
                    
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


// test module;
 
(function() {
	   
    var f = window[F_NAME];
		
    var utility = {
        
        takeTest: function(testName) {
            
            return function (cases) {
                if (!f(cases).isObject(true)) return;
                var report = {
                    testName : testName || ""
                };
                var start, passed, result, detail, duration, resultTest;
				
                for (var i in cases) {
                    if (!cases.hasOwnProperty(i)) continue;
                    f.clearNotify();
					
                    try {
                        start = new Date().getTime();
                        cases[i]();
						result = "success";
                    } catch(e) {
                        result = "test fails because got error";
                    }
					
                    duration = new Date().getTime() - start + " ms";
                    passed = 0;
                    detail = {};
                    resultTest = f.getNotifyMessage();
					for (var o = 0; o < resultTest.length; ++o) {
                        detail[o] = resultTest[o];
						(resultTest[o].result == "pass") && (passed += 1);
                    }
                    
					report[i] = {
						duration: duration,
						passed: passed,
						failed: resultTest.length - passed,
						total: resultTest.length,
						detail: detail
					};
                }
                
                return report;
            };
        }
    }
       
	f(utility).addTo("utility");

})();
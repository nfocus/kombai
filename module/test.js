
function alertct(info) {
	var elm = document.getElementById("info");
	elm.innerHTML += "<br/>" + info;
	elm.className = "border";
} 
 // test case module
 // S-01
(function() {
	   
    var f = window[F_NAME],
        copy = f.callFunction('copy'),
        assert = f.callFunction('assert'),
        currentWindow = f.getWindow(),
        currentDocument = currentWindow.document;
		
    var publicity = {
        createTestCaseS1: function(name) {
        	alertct(name);
        }
    };
       
	f(publicity).addTo("utility");

})();

// S-02

(function() {
	   
    var f = window[F_NAME],
        copy = f.callFunction('copy'),
        assert = f.callFunction('assert'),
        currentWindow = f.getWindow(),
        currentDocument = currentWindow.document;
		
    var publicity = {
		createTestCase : function(name, obj) {
			alertct("Run test case name: " + name);
			return {
				"case1" : function() {
					alertct("case 1");
				},
				"case2" : function() {
					alertct("case 2");
				},
				"case3" : function() {
					alertct("case 3");
				}
			};
		},
		testCase : function(obj) {
			obj.case1();
			obj.case2();
			obj.case3();
		}
	};
	f(publicity).addTo("utility");

})();

(function() {
	   
    var f = window[F_NAME],
        currentWindow = f.getWindow(),
        currentDocument = currentWindow.document;
		
    var publicity = {
		// ham nay chi nhan vao 1 tham so la name thoi;
		// hien tai name khong quan trong;
		createTestCase : function(name) {
			return function(tcases) {
				var infos = {};
				infos.testName = f(name).isString() ? name : "No name";
				if(f(tcases).isObject()){// the tcases must be object.
					var i = 0;
					var allOk = true;
					infos.cases = {};
					for (var it in tcases) {
						try {
							// run the test case i
							//eval ("tcases." + it + "();");
							tcases[it]();
							infos.cases[i] = "The testing case " + i + " success";
						} catch (e) {
							infos.cases[i] = "Failed to testing case " + i + "...";
							allOk = false;
						}
						++i;
					}
					if(allOk) {
						infos.message = "All test case success...";
					} else {
						infos.message = "All test case not success...";
					}
				} else {
					infos.message = "Has not object result input ";
				}
				return infos;
			};
		}
	};
	
	f(publicity).addTo("utility");

})();
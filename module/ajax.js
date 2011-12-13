	
	// ajax module
	(function() {
			
		var f = window[F_NAME],
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;
		
		function isReady(XHR) {
			return (XHR.readyState % 4 == 0);
		}
		
		function isRequest(XHR) {
			return XHR.readyState < 4;
		}
		
		function isComplete(XHR) {
			return XHR.readyState == 4;
		}
		
		function isSuccess(XHR) {
			try {
				return XHR.status == 200;
			} catch(e) {
				return false;
			}
		}
		
		function onProcess(func, xhr) {
			if (func instanceof Function) {
				func.call(xhr);
			} else {
				eval(xhr);
			}
		}
		
		function encode(s) {
			if (s === null || s == undefined) {
				s = "|";
			}
			var l = s.length, a = [];
			for (var i = 0; i < l; ++ i) {
				a.push(s.charCodeAt(i));
			}
			return a.join("");
		};
		
		function createXMLHttpRequest() {
			if (window.ActiveXObject) {
				return new ActiveXObject("Microsoft.XMLHTTP");
			} else {
				return new XMLHttpRequest() || null;
			}
		}
		
		var XMLHTTP = {
			
			sendRequest: function(option) {
				
				var setting = {
					address: null,
					method: "POST",
					async: true,
					data: null,
					delay: 1000,
					retry: 6,
					onAbort: null,
					onFailure: null,
					onRequest: null,
					onSuccess: null
				}
				
				f(option).copyTo(setting);
				
				var xhr = createXMLHttpRequest();
				
				if (isReady(xhr)) {
					if (setting.method.toUpperCase() == "POST") {
						xhr.open(setting.method, setting.address, setting.async);
						xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
						xhr.setRequestHeader("Connection", "close");
						xhr.send(setting.data);
					} else {
						xhr.open(
							setting.method,
							setting.address + "?" + setting.data,
							setting.async
						);
						xhr.send(null);
					}
					onProcess(setting.onRequest, xhr);
				}
				xhr.onreadystatechange = function() {
					if (isComplete(xhr)) {
						onStateChange(xhr);
					}
				}
				
				function onStateChange(XHR) {
					if (isSuccess(XHR)) {
						onProcess(setting.onSuccess, XHR);
					} else {
						if (setting.retry) {
							option.delay += option.delay;
							option.retry -= 1;
							setTimeout(
								function(){
									XMLHTTP.sendRequest(option)
								},
								setting.delay
							);
						} else {
							onProcess(setting.onFailure, XHR);
						}
					}
					delete xhr.onreadystatechange;
				}
				
				return {
					stopRequest: function() {
						onProcess(setting.onAbort, xhr);
						xhr.abort();
						delete xhr.onreadystatechange;
					},
					getHeader: function(name) {
						return xhr.getResponseHeader(name);
					}
				}
			}
		};
	
		f(XMLHTTP).appendModule("utility");
	})();
	
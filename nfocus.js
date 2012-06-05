










	/**
	 * Created by Minh Nguyen (http://vnjs.net);
	 * Version: 1.0;
	 * License: GPL license;
	 * Email: mnx2012@gmail.com;
	 */
	

	var F_NAME = "Focus";

	(function() {
		
		var currentWindow = window, currentDocument = currentWindow.document;
			
		function notExists(obj) {
			return (obj == null || obj == undefined);
		}
		
		function isExists(obj) {
			return !notExists(obj);
		}
		
		var notify = [], number = 0;
		// Check type of object.
		function assert(data) {
			
			return {
				source: data,
				
				filter: function() {},
				
				notExists: function() {
					var src = this.source;
					return !isExists(src);
				},
				
				isExists: function() {
					var src = this.source;
					return isExists(src);
				},
				
				isArray: function() {
					var src = this.source;
					return (isExists(src) && src.constructor == Array);
				},
				
				isBlank: function() {
					var src = this.source;
					return (this.isString() && "" == src.replace(/^\s+|\s+$/g, ""));
				},
				
				isBoolean: function() {
					var src = this.source;
					return (isExists(src) && src.constructor == Boolean);
				},
				
				isElement: function() {
					var src = this.source;
					return (isExists(src) && src.tagName && 1 == src.nodeType);
				},
				
				isEvent: function() {
					var src = this.source;
					return (isExists(src) && (isExists(src.target) || isExists(src.srcElement)));
				},
				
				isFunction: function() {
					var src = this.source;
					return (isExists(src) && src instanceof Function);	
				},
				
				isList: function() {
					var src = this.source;
					return (this.isArray() || this.isObject() && src.length);
				},
				
				isNumber: function() {
					var src = this.source;
					return (isExists(src) && src.constructor == Number);
				},
				
				isObject: function(flag) {
					var src = this.source;
					if (flag) {
						return (isExists(src) && src.constructor == Object);
					}
					return (isExists(src) && "object" === typeof src);
				},
				
				isString: function() {
					var src = this.source;
					return (isExists(src) && "string" === typeof src);
				},
				
				isRegExp: function() {
					var src = this.source;
					return (isExists(src) && src.constructor == RegExp);
				},
				
				isTextNode: function() {
					var src = this.source;
					return (isExists(src) && 3 == src.nodeType);
				},
				
				// using for test case;
				equal: function(expect, message) {
					if (this.source != expect) {
						message != null && notify.push({result: "fail", message: message});
						return false;
					}
					message != null && notify.push({result: "pass"});
					return true;
				},
				
				notEqual: function(expect, message) {
					if (this.source == expect) {
						message != null && notify.push({result: "fail", message: message});
						return false;
					}
					message != null && notify.push({result: "pass"});
					return true;
				},
				
				deepEqual: function(expect, message) {
					if (this.source !== expect) {
						message != null && notify.push({result: "fail", message: message});
						return false;
					}
					message != null && notify.push({result: "pass"});
					return true;
				},
				
				notDeepEqual: function(expect, message) {
					if (this.source === expect) {
						message != null && notify.push({result: "fail", message: message});
						return false;
					}
					message != null && notify.push({result: "pass"});
					return true;
				}
				
			}
		};
		
		
		/*
			example: 
				var a = {
					x: "x",
					y: "y"
				};
				var b = {
					u: "u",
					v: {
						t: "t",
						z: "z"
					}
				};
				var c = function(){};
				copy(a, b).to(c);
		*/
		
		function copy() {
			var arg = arguments, source = null;
			return {
				to: function(target) {
					target = assert(target).isExists() ? target : {};
					for (var i = 0; i < arg.length; ++i) {
						source = arg[i];
						for (var o in source) {
							if (source.hasOwnProperty(o)) {
								if (assert(source[o]).isObject(true)) {
									assert(target[o]).isObject() || (target[o] = {});
									copy(source[o]).to(target[o]);
								} else {
									// override.
									target[o] = source[o];
								}
							}
						}
					}
					return target;
				}
			}
		};
		
		// using for html module;
		function select(selection, context) {
			if (assert(selection).isBlank()) return null;
			var root = context ? context : currentDocument;
			var list = null;
			try {
				list = root.querySelectorAll(selection);
			} catch(e) {}
			
			if (list && list.length) {
				return list;
			} else {
				return null;
			}
		}
		
		// store temporary data;
		var temporary = {
			variable: {},
			object: {},
			number: {},
			list: null,
			method: {
				assert: assert,
				copy: copy,
				select: select
			}
		};
		
		// store class;
		var factory = {};
		// for extend api;
		var extension = {
				common: {
					filter: function(data) {
						return true;
					},
					each: function(func) {
						var data = this.source, length = data.length;
						if (length && !assert(data).isFunction()) {
							for (var i = 0; i < length; ++i) {
								func.call(data[i], i, data);
							}
						}
						return this;
					},
					copyTo: function(target) {
						return copy(this.source).to(target);
					}
				},
				array: {
					filter: function(data) {
						return assert(data).isArray();
					}
				},
				event: {
					filter: function(data) {
						return assert(data).isEvent();
					}
				},
				func: {
					filter: function(data) {
						return assert(data).isFunction();
					}
				},
				html: {
					filter: function(data) {
						if (assert(data).isElement()) {
							temporary.list = [data];
							return true;
						} else if (assert(data).isString()) {
							temporary.list = select(data);
							if (temporary.list) return true;
						}
						return false;
					},
					each: function(func) {
						var data = this.list, length = data.length;
						if (length && !assert(data).isFunction()) {
							for (var i = 0; i < length; ++i) {
								func.call(data[i], i, data);
							}
						}
						return this;
					}
				},
				list: {
					filter: function(data) {
						return assert(data).isList();
					}
				},
				number: {
					filter: function(data) {
						return assert(data).isNumber();
					}
				},
				object: {
					filter: function(data) {
						return assert(data).isObject();
					},
					/*
					 *	append method, properties of an object to exists module;
						example: 
							Focus({a: 'b', c: 'd', d: function(){}}).addTo('utility');
					*/
					addTo: function(module) {
						if (module == "utility") {
							for (var i in this.source) {
								!(i in currentWindow[F_NAME]) && (currentWindow[F_NAME][i] = this.source[i]);
							}
						} else {
							for (var mod in extension) {
								if (mod != mod.replace(module, "")) {
									for (var i in this.source) {
										!(i in extension[mod]) && (extension[mod][i] = this.source[i]);
									}
								}
							}
							// reset all class;
							factory = {};
						}
					},
					//create new module from an object; 
					createModule: function(name) {
						var isExtend = !(name in extension) && assert(this.source).isObject();
						isExtend && (extension[name] = this.source);
					}
				},
				regexp: {
					filter: function(data) {
						return assert(data).isRegExp();
					}
				},
				string: {
					filter: function(data) {
						return assert(data).isString();
					}
				}
		};
		
		var utility = {
			/* 
				using to caching function
				example:
					Focus.storeFunction(function(a, b){alert(a + b)}, "m nguyen");
					Focus.callFunction("m nguyen")("hello ", "Vietnam");
				result:
					alert("hello Vietnam");
			 */
			storeFunction: function(src, id) {
				id = assert(id).isExists() ? id : this.getNumber();
				assert(src).isFunction() && (temporary.method[id] = src);
				return id;
			},
			callFunction: function(name) {
				var func = temporary.method[name];
				if (assert(func).isFunction()) {
					return func;
				}
				return function(){};
			},
			unstoreFunction: function(name) {
				if (assert(temporary.method[name]).isExists()) {
					delete temporary.method[name];
				}
			},
			getNumber: function() {
				return ++ number;
			},
			storeObject: function(src, id) {
				id = assert(id).isExists() ? id : this.getNumber();
				assert(src).isObject() && (temporary.object[id] = src);
				return id;
			},
			callObject: function(id) {
				return temporary.object[id];
			},
			unstoreObject: function(id) {
				delete temporary.object[id];
			},
			getModule: function(module) {
				if (module === 'utility') {
					return utitity;
				}
				return extension[module];
			},
			getSelfName: function() {
				return F_NAME;
			},
			getWindow: function() {
				return currentWindow;
			},
			getDocument: function() {
				return currentWindow.document;
			},
			updateDocument: function(win) {
				currentWindow = win;
				currentDocument = win.document;
			},
			clearNotify: function() {
				notify = [];
				return this;
			},
			getNotifyMessage: function() {
				return notify;
			}
		};
		
		
		
		function finish(data) {
			// just for build string;
			if (!arguments.length) {
				var source = [];
				return function(src) {
					if (assert(src).notExists()) {
						return source.join("");
					} else {
						source.push(src);
					}
					return arguments.callee;
				};
			}
			
			data.filter && data.source && (data = data.source);
			
			var label = [];
			
			for (var i in extension) {
				if (assert(extension[i]["filter"]).isFunction()) {
					extension[i]["filter"](data) && label.push(i);
				}
			}
			
			var clazz = label.join("-");
			
			if (!factory[clazz]) {
				// create new constructure;
				factory[clazz] = function(src) {
					this.source = src;
				};
				// add interface for new class;
				for (var i = 0; i < label.length; ++i) {
					copy(extension[label[i]]).to(factory[clazz]["prototype"]);
				}
				copy(assert({})).to(factory[clazz]["prototype"]);
			}
			
			var cover = new factory[clazz](data);
			temporary.list && (cover.list = temporary.list);
			temporary.list = null;
			return cover;
		};
		
		copy(utility).to(finish);
		
		!F_NAME && (F_NAME = "F");
		
		currentWindow[F_NAME] = finish;
		
	})();
	








	
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
	
		f(XMLHTTP).addTo("utility");
	})();
	








	
	
	// html module;
	(function() {
		
		var f = window[F_NAME],
			copy = f.callFunction('copy'),
			assert = f.callFunction('assert'),
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;
		
		var event = {
			getXY: function(XY) {
				var src = this.source, point = {x: 0, y: 0};
				if (src.clientX !== undefined && src.clientX !== undefined) {
					point = {
						x: src.clientX + currentDocument.body.scrollLeft + currentDocument.documentElement.scrollLeft,
						y: src.clientY + currentDocument.body.scrollTop + currentDocument.documentElement.scrollTop
					}
				} 
				if (XY === "X") {
					return point.x;
				} else if (XY === "Y") {
					return point.y;
				}
				return point;
				
			},
			getX: function() {
				return this.getXY("X");
			},
			getY: function() {
				return this.getXY("Y");
			}
		};
		
		f(event).addTo("event");
		
		var utility = {
			isIE6: function() {
				return (/MSIE 6/).test(navigator.userAgent);
			},
			
			isIE7: function() {
				return (/MSIE 7/).test(navigator.userAgent);
			},
			
			isIE8: function() {
				return (/MSIE 8/).test(navigator.userAgent);
			},
			
			isIE: function() {
				return (/MSIE/).test(navigator.userAgent);
			},
			
			isIPad: function() {
				return (/iPad/).test(navigator.userAgent);
			},
			
			isIPod: function() {
				return (/iPod/).test(navigator.userAgent);
			},
			
			isOpera: function() {
				return (/Opera/).test(navigator.userAgent);
			},
			
			isWebkit: function() {
				return (/Webkit/).test(navigator.userAgent);
			},
			
			isIPhone: function() {
				return (/iPhone/).test(navigator.userAgent);
			},
			
			isFirefox: function() {
				return (/Firefox/).test(navigator.userAgent);
			},
			
			isTouch: function() {  
				try {  
					document.createEvent("TouchEvent");  
				} catch (e) {  
					return false;  
				}
				return true; 
			},
			
			isMobile: function() {
				return isExists(currentWindow.onorientationchange);
			},
			
			isAndroid: function() {
				return (/android/).test(navigator.userAgent);
			},
			
			isBlackBerry: function() {
				return (/BlackBerry/).test(navigator.userAgent);
			},
			
			isBB9700: function() {
				return (/BlackBerry9700/).test(navigator.userAgent);
			},
			
			isBB9800: function() {
				return (/BlackBerry 9800/).test(navigator.userAgent);
			},
			
			getEventSource: function(event) {
				return (event && event.target) ? f(event.target) 
						: currentWindow.event ? f(currentWindow.event.srcElement) : null;
			},
			getPageHeight: function() {
				return currentDocument.body.scrollHeight;
			},
			getPageWidth: function() {
				return currentDocument.body.scrollWidth;
			},
			getScreenHeight: function() {
				return currentWindow.screen.availHeight;
			},
			getScreenWidth: function() {
				return currentWindow.screen.availWidth;
			},
			getViewportHeight: function() {
				if ("innerHeight" in currentWindow) {
					return currentWindow.innerHeight;
				} else if (currentDocument.documentElement && ("clientHeight" in  currentDocument.documentElement)) {
					return  currentDocument.documentElement.clientHeight;
				}
				return currentDocument.body.clientHeight;
			},
			getViewportWidth: function() {
				if ("innerWidth" in currentWindow) {
					return currentWindow.innerWidth;
				} else if (currentDocument.documentElement && ("clientWidth" in  currentDocument.documentElement)) {
					return  currentDocument.documentElement.clientWidth;
				}
				return currentDocument.body.clientWidth;
			},
			addEvent: function(obj, evt) {
				for (var o in evt) {
					if (evt.hasOwnProperty(o)) {
						if (obj.addEventListener) {
							obj.addEventListener(o, evt[o], false);
						} else if (obj.attachEvent) {
							obj.attachEvent("on" + o, evt[o]);
						}
					}
				}
				return f(obj);
			},
			getTime: function() {
				return new Date().getTime();
			},
			createId: function(src) {
				return f()(src || F_NAME)("-")(this.getNumber())("-")(this.getTime())();
			},
			/*
				Focus.createElement({
					id: Focus.getNumber(),
					className: "abc",
					style: {
						border: "1px solid red",
						height: "40px"
					}
				});
			*/
			createElement: function(config) {
				
				var setting = {
					event: null,
					style: null,
					attribute: null,
					
					tagName: "div",
					id: null,
					className: null,
					innerHTML: null
				};
				
				f(config).copyTo(setting);
				
				var newNode = currentDocument.createElement(setting.tagName);
					
				f(setting.event).isObject() && f(newNode).addEvent(setting.event);
				
				f(setting.style).isExists() && f(newNode).setStyle(setting.style);
				
				if (f(setting.attribute).isExists()) {
					for (var o in setting.attribute) {
						if (setting.attribute.hasOwnProperty(o)) {
							newNode.setAttribute(o.toString(), setting.attribute[o]);
						}
					}
				}
				
				f(setting.id).isExists() && (newNode.id = setting.id);
				
				f(setting.innerHTML).isExists() && (newNode.innerHTML = setting.innerHTML);
									
				f(setting.className).isExists() && (newNode.className = setting.className);
				
				return f(newNode);
			},
			loadScript: function(path) {
				var	body = currentDocument.body,
					newScript = null;
				if (assert(body).notExists()) {	
					document.write("<" + "script type='text/javascript' src=" + path + "></" + "script" + ">");
				} else {
					newScript = f.createElement({
						tagName: "script",
						attribute: {
							src: path,
							type: "text/javascript"
						}
					}).appendTo(body);
				}
			}
		};
		
		f(utility).addTo("utility");
		
		var string = {
			upper: function(opt) {
				this.source = this.source.toUpperCase();
				return (opt === true) ? this.source : this;
			},
			lower: function(opt) {
				this.source = this.source.toLowerCase();
				return (opt === true) ? this.source : this;
			},
			trim: function(opt) {
				this.source = this.source.replace(/^\s+|\s+$/g, "");
				return (opt === true) ? this.source : this;
			},
			urlEncode: function(opt) {
				return (opt === true) ? encodeURIComponent(this.source) : this;
			},
			urlDecode: function(opt) {
				return (opt === true) ? decodeURIComponent(this.source) : this;
			},
			toRGB: function(opt) {
				/*
					Convert text color to rgb value.
					example : Focus("green").toColor(true);
					return: rgb(0, 128, 0);
				*/
				var colorName = this.source;
				var table = f.createElement({
					tagName: "table",
					style: {
						display: "none",
						color: colorName
					},
					attribute: {
						bgColor: colorName
					}
				})(),
				value = null,
				match = null;
				currentDocument.body.appendChild(table);
				value = f.isIE() ? table.bgColor : currentWindow.getComputedStyle(table, null).getPropertyValue("color");
				currentDocument.body.removeChild(table);
				match = value.match(/^#(\w{2})(\w{2})(\w{2})/);
				value = !match ? value : "rgb(" + parseInt(match[1], 16) + ", " + parseInt(match[2], 16) + ", " + parseInt(match[3], 16) + ")";
				this.source = value;
				return (opt === true) ? this.source : this;
			},
			typeofStyle: function() {
				var style = this.source;
				switch (style) {
					case "backgroundColor": case "color":
						return "color";
					case "opacity":
						return "opacity";
					case "fontSize": case "height": case "letterSpacing": case "marginBottom": case "marginLeft": case "marginRight": case "marginTop": case "paddingBottom" : case "paddingLeft": case "paddingRight": case "paddingTop": case "width": case "wordSpacing":
						return "dimension";
					case "bottom": case "left": case "right": case "top":
						return "position";
					default:
						return "chaos";
				}
			}
		};
		f(string).addTo("string");
		
		var html = {
			appendTo: function(element) {
				this.each(function() {
					assert(element).isElement() && element.appendChild(this);
				});
				return this;
			},
			hasClass: function(classHass) {
				var isHas = false;
				this.each(function() {
					var classs = this.className.split(" "); 
					for (var i = 0; i < classs.length; ++i) {
						if (classs[i] == classHass) {
							isHas = true;
							break;
						}
					}
				});
				return isHas;
			},
			addClass: function(classAdd) {
				this.each(function() {
					if (this.className != "") {
						this.className += " " + classAdd;
					} else {
						this.className = classAdd;
					}
				});
				return this;
			},
			setClass: function(classSet) {
				this.each(function() {
					this.className = classSet;
				});
				return this;
			},
			removeClass: function(classRemove) {
				this.each(function() {
					if (assert(classRemove).notExists()) {
						this.className = "";
					} else {
						var classs = this.className.split(" ");
						for (var i = 0; i < classs.length; ++i) { 
							if (classs[i] == classRemove) {
								classs[i] = "";
							}
						}
						this.className = classs.join(" ");
					}
				});
				return this;
			},
			getXY: function() {
				var aE = [];
				this.each(function() {
					var x = 0, y = 0, e = this;
					while (e) {
						x += e.offsetLeft;
						y += e.offsetTop;
						e = e.offsetParent;
					}
					aE.push({x: x, y: y});
				});
				if (aE.length == 1) {
					return aE[0];
				}
				return aE;
			},
			getX: function() {
				var aE = [];
				this.each(function() {
					var x = 0, e = this;
					while (e) {
						x += e.offsetLeft;
						e = e.offsetParent;
					}
					aE.push(x);
				});
				if (aE.length == 1) {
					return aE[0];
				}
				return aE;
			},
			getY: function() {
				var aE = [];
				this.each(function() {
					var y = 0, e = this;
					while (e) {
						y += e.offsetTop;
						e = e.offsetParent;
					}
					aE.push(y);
				});
				if (aE.length == 1) {
					return aE[0];
				}
				return aE;
			},
			setAttribute: function(attribute) {
				this.each(function() {
					for (var o in attribute) {
						if (attribute.hasOwnProperty(o)) {
							this.setAttribute(o.toString(), attribute[o]);
						}
					}
				});
				return this;
			},
			removeAttribute: function(attribute) {
				this.each(function() {
					this.removeAttribute(attribute);
				});
				return this;
			},
			addEvent: function(evt) {
				this.each(function() {
					f.addEvent(this, evt);
				});
				return this;
			},
			toggle: function(callback) {
				this.each(function() {
					if (this.style.display == "none") {
						this.style.display = "";
						this.style.visibility = "visible";
					} else {
						this.style.display = "none";
					}
					assert(callback).isFunction() && callback.call(this);
				});
				return this;
			},
			show: function(callback) {
				this.each(function() {
					this.style.display = "block";
					this.style.visibility = "visible";
					assert(callback).isFunction() && callback.call(this);
				});
				return this;
			},
			hide: function(callback) {
				this.each(function() {
					this.style.display = "none";
					assert(callback).isFunction() && callback.call(this);
				});
				return this;
			},
			hidden: function(callback) {
				this.each(function() {
					this.style.visibility = "hidden";
					assert(callback).isFunction() && callback.call(this);
				});
				return this;
			},
			visible: function(callback) {
				this.each(function() {
					this.style.visibility = "visible";
					assert(callback).isFunction() && callback.call(this);
				});
				return this;
			},
			rotate: function(degree) {
			    var deg = 'rotate(' + degree + 'deg)';
			    this.each(function() {
				    this.style.transform = deg;
				    this.style.OTransform = deg;
				    this.style.MozTransform = deg;
				    this.style.KhtmlTransform = deg;
				    this.style.WebkitTransform = deg;
			    });
			    return this;
			},
			submit: function(callback) {
			    this.each(function() {
				    if (this.tagName == "FORM") {
						this.submit();
				    }
				    assert(callback).isFunction() && callback.call(this);
			    });
			    return this;
			},
			addChild: function() {
				var child = null,
					arg = arguments,
					length = arg.length;
				this.each(function() {
					for (var i = 0; i < length; ++ i) {
						child = arg[i];
						if (assert(child).isElement()) {
							this.appendChild(child);
						} else if (assert(child.source).isElement()) {
							// only apply for this library;
							this.appendChild(child.source);
						}
					}	
				});
				return this;
			},
			setHTML: function(html) {
				this.each(function() {
					if (assert(this.value).isExists()) {
						this.value = html;
					} else if (f(this.innerHTML).isExists()) {
						this.innerHTML = html; 
					}
				});
				return this;
			},
			getHTML: function() {
				var aV = [];
				this.each(function() {
					if (assert(this.value).isExists()) {
						aV.push(this.value);
					} else if (assert(this.innerHTML).isExists()) {
						aV.push(this.innerHTML); 
					}
				});
				if (aV.length == 1) {
					return aV[0];
				}
				return aV;
			},
			getHeight: function() {
				var aV = [], height;
				this.each(function() {
					height = (this.height) ? this.height : this.offsetWidth;
					aV.push(height);
				});
				if (aV.length == 1) {
					return aV[0];
				}
				return aV;
			},
			getWidth: function() {
				var aV = [], width;
				this.each(function() {
					width = (this.width) ? this.width : this.offsetWidth;
					aV.push(width);
				});
				if (aV.length == 1) {
					return aV[0];
				}
				return aV;
			},
			getFirstChild: function() {
				var aE = [], firstChild = null;
				this.each(function() {
					firstChild = this.firstChild;
					while (firstChild && firstChild.nodeType != 1) {
						firstChild = firstChild.nextSibling;
					}
					aE.push(firstChild);
				});
				if (aE.length == 1) {
					return f(aE[0]);
				}
				return f(aE);
			},
			getLastChild: function() {
				var aE = [], lastChild = null;
				this.each(function() {
					lastChild = this.lastChild;
					while (lastChild && lastChild.nodeType != 1) {
						lastChild = lastChild.previousSibling;
					}
					aE.push(lastChild);
				});
				if (aE.length == 1) {
					return f(aE[0]);
				}
				return f(aE);
			},
			setOpacity: function(value) {
				(value < 1) && (value = 100 * value);
				this.each(function() {
					(!f.isIE() && (this.style.opacity = value/100))  
					|| (this.style.filter = "alpha(opacity = value)".replace("value", value));
				});
				return this;
			},
			setStyle: function(style) {
				this.each(function() {
					if (assert(style).isString()) {
						this.setAttribute("style", style);
					} else if (assert(style).isObject()) {
						var st = this.style;
						for (var o in style) {
							if (o == "float") {
								st["cssStyle"] = style[o];
								st["styleFloat"] = style[o];
							} else {
								st[o] = style[o];
							}
						}
					}
				});
				return this;
			},
			getStyle: function(property) {
				var aV = [], value, match, type = f(property).typeofStyle();
				this.each(function() {
					if (this.currentStyle && !f.isOpera()) { 
						if (type == "opacity") {
							value = this.currentStyle["filter"];
							match = value.match(/(.*)opacity\s*=\s*(\w+)(.*)/i);
							value = match ? isNaN(parseFloat(match[2])) ? 100 : parseFloat(match[2]) : 100;
						} else { 
							value = this.currentStyle[property];
						}
					} else if (currentDocument.defaultView && currentDocument.defaultView.getComputedStyle) {
						property = property.replace(/[(A-Z)]/g, function(match){return "-" + match.toLowerCase()});
						value = currentDocument.defaultView.getComputedStyle(this, null).getPropertyValue(property);
						value = (type == "opacity") ? 100 * value : value; 
					}
					switch (type) {
						case "color": 
							value = f(value).toRGB(true);
						case "dimension": case "position":
							value = (value == "auto" || value == "normal") ? "0px" : value;
						default:
							value = value;
					}
					aV.push(value);
				});
				if (aV.length == 1) {
					return aV[0];
				}
				return aV;
			},
			removeStyle: function(property) {
				property = property.replace(/[(A-Z)]/g, function(match){return "-" + match.toLowerCase()});
				this.each(function() {
					this.style.removeProperty(property);
				});
				return this;
			}
		};

		f(html).addTo("html");
	})();
	








	
	// dragable module;
	(function() {
	
		var f = window[F_NAME],
			copy = f.callFunction('copy'),
			assert = f.callFunction('assert'),
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;

		function preventEvent(event) {
			var evt = event || currentWindow.event;
			evt.cancelBubble = true;
		}
		
		function ignoreDagDrop(group) {
			if (group && group.length) {
				for (var o = 0; o < group.length; ++o) {
					group[o].onmousedown = function(event) {
						var evt = event || currentWindow.event;
						evt.cancelBubble = true;
					}
				}
			}
		}
					
		var html = {
			setDragable: function(config) {
				this.each(function() {
						var ADN = this;
						var setting = {
							x: 0,
							y: 0,
							proxy: null,
							lockX: false,
							lockY: false,
							onDrag: function() {},
							onMove: function() {},
							onDrop: function() {}
						};
						
						copy(config).to(setting);
						
						var isTouch = false;
						var proxy = setting.proxy || ADN;
						
						function mouseDown(event) {
							var evt = event || currentWindow.event;
							if (evt.touches && evt.touches.length) {
								isTouch = true;
								evt = evt.changedTouches[0];
							}
							setting.onDrag.call(proxy, evt);
							if (!(evt.button == 2 || evt.which == 3)) {
								var position = f(proxy).getStyle("position"),
									left = f(proxy).getStyle("left"),
									top = f(proxy).getStyle("top");
								
								f(proxy).setStyle({position: (position != "absolute") ? "relative" : "absolute"});
								!setting.lockX && f(proxy).setStyle({left: parseFloat(left) ? left : "0px"}); 
								!setting.lockY && f(proxy).setStyle({top: parseFloat(top) ? top : "0px"}); 
								
								setting.x = evt.clientX;
								setting.y = evt.clientY;
								
								if (isTouch) {
									document.ontouchmove = mouseMove;
									document.ontouchend = mouseUp;
								} else {
									document.onmousemove = mouseMove;
									document.onmouseup = mouseUp;
								}
								proxy.onmouseup = mouseUp;
								return false;
							}
						};
						
								
						function mouseMove(event) {
							var evt = event || currentWindow.event;
							(isTouch == true) && (evt = evt.changedTouches[0]);
							!setting.lockX && f(proxy).setStyle({left: parseFloat(proxy.style.left) + (evt.clientX - setting.x) + "px"});
							!setting.lockY && f(proxy).setStyle({top: parseFloat(proxy.style.top) + (evt.clientY - setting.y) + "px"});
							setting.x = evt.clientX;
							setting.y = evt.clientY;
							setting.onMove.call(proxy, evt);
							return false;
						};
						
						function mouseUp(event) {
							var evt = event || currentWindow.event;
							(isTouch == true) && (evt = evt.changedTouches[0]);
							document.onmousemove = null;
							document.ontouchmove = null;
							document.ontouchend = null;
							proxy.onmouseup = null;
							setting.onDrop.call(proxy, evt);
							return false;
						};
						
						ADN.onmousedown = mouseDown;
						ADN.ontouchstart = mouseDown;
						
						var aForm = ADN.getElementsByTagName("form");
						if (aForm && aForm.length) {
							ignoreDagDrop(aForm);
						} else {
							var aInput = ADN.getElementsByTagName("input");
							ignoreDagDrop(aInput);
							var aIframe = ADN.getElementsByTagName("iframe");
							ignoreDagDrop(aIframe);
							var aTextarea = ADN.getElementsByTagName("textarea");
							ignoreDagDrop(aTextarea);
						}
					});
					return this;
			},
			swipe: function(config) {
				this.each(function() {
					var ADN = this;
					var setting = {
						lockX: false,
						lockY: false,
						onStart: function() {},
						onMove: function() {},
						onEnd: function() {}
					}
					copy(config).to(setting);
					var isTouch = false;

					function mouseDown(event) {
						var evt = event || window.event;
						if (evt.touches && evt.touches.length) {
							isTouch = true;
							evt = evt.changedTouches[0];
						}
						if (ADN.isBusy) return false;
						
						setting.onStart.call(ADN, evt);
						if (!(evt.button == 2 || evt.which == 3)) {
							
							setting.x = evt.clientX;
							setting.y = evt.clientY;
							
							if (isTouch) {
								ADN.ontouchmove = mouseMove;
								document.ontouchend = mouseUp;
							} else {
								ADN.onmousemove = mouseMove;
								document.onmouseup = mouseUp;
							}
						}
						return false;
					}
								
					function mouseMove(event) {
						var evt = event || window.event;
						(isTouch == true) && (evt = event.changedTouches[0]);
						// update new position;
						if (ADN.updatePosition == true) {
							ADN.updatePosition = null;
							setting.x = evt.clientX;
							setting.y = evt.clientY;
							return false;
						}
						
						var deltaX = Math.round(setting.x - evt.clientX);
						var deltaY = Math.round(setting.y - evt.clientY);
						var tan = 1;
						if (deltaX != 0) {
							tan = Math.round(Math.abs(deltaY / deltaX));
						}
						var distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
						var direct = null;
						/* direct is 
							0 when move right;
							45 when move top-right;
							90 when move up;
							135 when move top-left;
							180 when move left;
							- 135 when move bottom-left;
							- 90 when move to down;
							- 45 when move to bottom-right;
						*/ 
						if (deltaX < 0 && tan <= 0.5) {
							direct = 0;
						} else if(deltaX < 0 && deltaY > 0 && tan > 0.5 && tan < 2) {
							direct = 45;
						} else if(deltaY > 0 && tan >= 2) {
							direct = 90;
						} else if(deltaX > 0 && deltaY > 0 && tan > 0.5 && tan < 2) {
							direct = 135;
						} else if(deltaX > 0 && tan <= 0.5) {
							direct = 180;
						} else if (deltaX > 0 && deltaY < 0 && tan > 0.5 && tan < 2) {
							direct = -135;
						} else if (deltaY < 0 && tan >= 2) {
							direct = -90;
						} else if (deltaX < 0 && deltaY < 0 && tan > 0.5 && tan < 2) {
							direct = -45;
						}
						
						setting.direct = direct;
						setting.distance = distance;
						setting.onMove.call(ADN, evt, direct, distance);
						return false;
					}
					
					function mouseUp(event) {
						var evt = event || window.event;
						(isTouch == true) && (evt = event.changedTouches[0]);
						ADN.onmousemove = null;
						ADN.ontouchmove = null;
						document.onmouseup = null;
						document.ontouchend = null;
						setting.onEnd.call(ADN, evt, setting.direct, setting.distance);
						return false;
					}
					
					ADN.onmousedown = mouseDown;
					ADN.ontouchstart = mouseDown;
					
					var aForm = ADN.getElementsByTagName("form");
					if (aForm && aForm.length) {
						ignoreDagDrop(aForm);
					} else {
						var aInput = ADN.getElementsByTagName("input");
						ignoreDagDrop(aInput);
						var aIframe = ADN.getElementsByTagName("iframe");
						ignoreDagDrop(aIframe);
						var aTextarea = ADN.getElementsByTagName("textarea");
						ignoreDagDrop(aTextarea);
					}
				});
				
				return this;
			}
		};
		
		f(html).addTo("html");
	})();
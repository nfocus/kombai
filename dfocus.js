








	/**
	 * Created by Minh Nguyen (http://vnjs.net);
	 * Version: 1.0;
	 * License: GPL license;
	 * Email: mnx2012@gmail.com;
	 */
	

	var F_NAME = "Focus";

	(function() {
		
		var currentWindow = window, currentDocument = currentWindow.document;
		
		function isExists(obj) {
			return (obj != null && obj != undefined);
		}
			
		function notExists(obj) {
			return !isExists(obj);
		}
		
		// Check type of object.
		function assert(data) {
			
			return {
			
				source: [data],
				
				isExists: function() {
					var src = this.source[0];
					return isExists(src);
				},
				
				notExists: function() {
					var src = this.source[0];
					return !isExists(src);
				},
				
				isArray: function() {
					var src = this.source[0];
					return (isExists(src) && src.constructor == Array);
				},
				
				isBoolean: function() {
					var src = this.source[0];
					return (isExists(src) && src.constructor == Boolean);
				},
				
				isElement: function() {
					var src = this.source[0];
					return (isExists(src) && src.tagName && 1 == src.nodeType);
				},
				
				isEvent: function() {
					var src = this.source[0];
					return (isExists(src) && (isExists(src.target) || isExists(src.srcElement)));
				},
				
				isFunction: function() {
					var src = this.source[0];
					return (isExists(src) && src instanceof Function);	
				},
				
				isJsObject: function() {
					var src = this.source[0];
					return (isExists(src) && src.constructor == Object);
				},
				
				isList: function() {
					var src = this.source[0];
					return (this.isArray() || this.isObject(src) && src.length);
				},
				
				isNumber: function() {
					var src = this.source[0];
					return (isExists(src) && src.constructor == Number);
				},
				
				isObject: function() {
					var src = this.source[0];
					return (isExists(src) && "object" === typeof src);
				},
				
				isString: function() {
					var src = this.source[0];
					return (isExists(src) && "string" === typeof src);
				},
				
				isBlank: function() {
					var src = this.source[0];
					return (this.isString(src) && "" == src.replace(/^\s+|\s+$/g, ""));
				},
				
				isRegExp: function() {
					var src = this.source[0];
					return (isExists(src) && src.constructor == RegExp);
				},
				
				isTextNode: function() {
					var src = this.source[0];
					return (isExists(src) && 3 == src.nodeType);
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
							if (!Object.prototype[o]) {
								if (assert(source[o]).isJsObject()) {
									assert(target[o]).isJsObject() || (target[o] = {});
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
		
		function select(selection, context) {
			if (assert(selection).isBlank()) return null;
			var root = context ? context : currentDocument;
			var list = null;
			try { list = root.querySelectorAll(selection); } catch(e) {}
			if (list && list.length) {
				return [].slice.call(list, 0);
			} else {
				return null;
			}
		}
		
		// store temporary data;
		var temporary = {
			method: {
				assert: assert,
				copy: copy,
				select: select
			},
			number: {},
			object: {},
			boxnote: {},
			variable: {}
		};
		
		
		// for extend from user;
		var extension = {
				common: {
						filter: function(data) {
							return true;
						},
						copyTo: function(target) {
							return copy(this.source[0]).to(target);
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
							if (assert(data).isString()) {
								if ("querySelectorAll" in currentDocument) {
									var list = select(data);
									if (list) return true;
								}
							} else if (assert(data).isList()) {
								// check list of element;
								var listElement = true;
								for (var i in data) {
									if (data.hasOwnProperty(i)) {
										if (!assert(data[i]).isElement()) {
											listElement = false;
											break;
										}
									}
								}
								return listElement;
							}
							return assert(data).isElement();
						},
						update: function(opt) {
							var list = null;
							if (assert(this.source[0]).isString()) {
								list = select(this.source[0]);
								list && (this.source = list);
							} else if (assert(this.source[0]).isList()) {
								this.source = this.source[0];
							}
							if (opt == true) return this.source;
							return f(this.source);
						},
						select: function(selection) {
							var aE = [], flag = f.getSelfName() + f.getNumber();
							if (assert(selection).notExists()) {
								return this.update(true);
							} else {
								this.update().each(function(e) {
									f(select(selection, e)).each(function(el) {
										// check double push to array;
										if (f(el[flag]).notExists()) {
											aE.push(el);
											el[flag] = 1;
										}
									});
								});
								return f(aE).each(function(e) {
									delete e[flag];
								});
							}
						}
				},
				list: {
						filter: function(data) {
							if ("querySelectorAll" in currentDocument) {
								if (assert(data).isString()) {
									var list = select(data);
									if (list) return true;
								}
							} 
							return assert(data).isList();
						},
						each: function(func) {
							var data = this.source[0], length = data.length, i;
							if (!assert(data).isFunction()) {
								for (i = 0; i < length; ++i) {
									func(data[i], i, data);
								}
							}
							return this;
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
								Focus({a: 'b', c: 'd', d: function(){}}).appendModule('utility');
						*/
						appendModule: function(module) {
							if (module == "utility") {
								for (var i in this.source[0]) {
									!(i in currentWindow[F_NAME])
									&& (currentWindow[F_NAME][i] = this.source[0][i]);
								}
							} else if (module in extension) {
								for (var i in this.source[0]) {
									!(i in extension[module])
									&& (extension[module][i] = this.source[0][i]);
								}
							}
						},
						/*
						 *  create a new module from an object; 
						 */
						createModule: function(name) {
							var isExtend = !(name in extension)
											&& assert(this.source[0]).isJsObject()
							if (isExtend) {
								extension[name] = this.source[0]
							}
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
				using to cache function
				example:
					Focus.storeFunction(function(a, b){alert(a + b)}, "m nguyen");
					Focus.callFunction("m nguyen")("hello ", "Vietnam");
				result:
					alert("hello Vietnam");
			 */
			storeFunction: function(src, id) {
				var id = assert(id).isExists() ? id : this.getNumber();
				assert(src).isFunction() && (temporary.method[id] = src);
				return id;
			},
			callFunction: function(id) {
				var func = temporary.method[id];
				if (assert(func).isFunction()) {
					return func;
				}
			},
			unstoreFunction: function(id) {
				if (assert(temporary.method[id]).isExists()) {
					delete temporary.method[id];
				}
			},
			/*
				return unique number;
			*/
			getNumber: (
				function() {
					var number = 0;
					return function() {
						return ++ number;
					}
				}
			)(),
			storeObject: function(src, id) {
				var id = assert(id).isExists() ? id : this.getNumber();
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
			getSelfName: function() {
				return F_NAME;
			}
		};
		

		function f(data) {
		
			var cover = function(src) {
				var source = cover.source, isString = assert(src).isString() || assert(src).isNumber();
				if (assert(src).notExists()) {
					if (source.length == 1) {
						return source[0];
					}
					return source;
				} else {
					if (assert(source[0]).isString() && isString) {
						source[0] += src;
					} else {
						source.push(src);
					}
				}
				return cover;
			};

			for (var i in extension) {
				if (assert(extension[i]["filter"]).isFunction()) {
					extension[i]["filter"](data) && copy(extension[i]).to(cover);
				}
			}
			return copy(assert(data)).to(cover);
		};
		
		copy(utility).to(f);
		
		!assert(F_NAME).isString() && (F_NAME = "F");
		
		currentWindow[F_NAME] = f;
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
	
		f(XMLHTTP).appendModule("utility");
	})();
	








	
	// html module;
	(function() {
		
		var f = window[F_NAME],
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document,
			assert = f.callFunction('assert'),
			copy = f.callFunction('copy');
		
		var event = {
			getXY: function(XY) {
				var src = this.source[0], point = {x: 0, y: 0};
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
		
		f(event).appendModule("event");
		
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
				return f(src || F_NAME)("-")(this.getNumber())("-")(this.getTime())();
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
		
		f(utility).appendModule("utility");
		
		var string = {
			upper: function(opt) {
				this.source[0] = this.source[0].toUpperCase();
				return (opt === true) ? this.source[0] : this;
			},
			lower: function(opt) {
				this.source[0] = this.source[0].toLowerCase();
				return (opt === true) ? this.source[0] : this;
			},
			trim: function(opt) {
				this.source[0] = this.source[0].replace(/^\s+|\s+$/g, "");
				return (opt === true) ? this.source[0] : this;
			},
			urlEncode: function(opt) {
				return (opt === true) ? encodeURIComponent(this.source[0]) : this;
			},
			urlDecode: function(opt) {
				return (opt === true) ? decodeURIComponent(this.source[0]) : this;
			},
			toRGB: function(opt) {
				/*
					Convert text color to rgb value.
					example : Focus("green").toColor(true);
					return: rgb(0, 128, 0);
				*/
				var colorName = this.source[0];
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
				this.source = [value];
				return (opt === true) ? this.source[0] : this;
			},
			typeofStyle: function() {
				var style = this.source[0];
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
		f(string).appendModule("string");
		
		var html = {
			appendTo: function(element) {
				this.update().each(function(eleNode) {
					f(element).isElement() && element.appendChild(eleNode);
				});
				return this;
			},
			hasClass: function(classHass) {
				var isHas = false;
				this.update().each(function(eleNode) {
					if ((eleNode.className.lastIndexOf(classHass) + 1)) {
						isHas = true;
					}
				});
				return isHas;
			},
			addClass: function(classAdd) {
				this.update().each(function(eleNode) {
					if (eleNode.className != "") {
						eleNode.className = eleNode.className.replace(new RegExp(classAdd, "gi"), "");
						eleNode.className += " " + classAdd;
					} else {
						eleNode.className = classAdd;
					}
				});
				return this;
			},
			setClass: function(classSet) {
				this.update().each(function(e) {
					e.className = classSet;
				});
				return this;
			},
			removeClass: function(classRemove) {
				this.update().each(function(e) {
					if (f(classRemove).notExists()) {
						e.className = "";
					} else {
						e.className = e.className.replace(new RegExp(classRemove, "gi"), "");
					}
				});
				return this;
			},
			getXY: function() {
				var aE = [];
				this.update().each(function(e) {
					var x = 0, y = 0;
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
				this.update().each(function(e) {
					var x = 0;
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
				this.update().each(function(e) {
					var y = 0;
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
				this.update().each(function(eleNode){
					for (var o in attribute) {
						if (attribute.hasOwnProperty(o)) {
							eleNode.setAttribute(o.toString(), attribute[o]);
						}
					}
				});
				return this;
			},
			removeAttribute: function(attribute) {
				this.update().each(function(eleNode){
					eleNode.removeAttribute(attribute);
				});
				return this;
			},
			addEvent: function(evt) {
				this.update().each(function(eleNode){
					f.addEvent(eleNode, evt);
				});
				return this;
			},
			toggle: function(callback) {
				this.update().each(function(eleNode){
					if (eleNode.style.display == "none") {
						eleNode.style.display = "";
						eleNode.style.visibility = "visible";
					} else {
						eleNode.style.display = "none";
					}
					assert(callback).isFunction() && callback.call(eleNode);
				});
				return this;
			},
			show: function(callback) {
				this.update().each(function(eleNode) {
					eleNode.style.display = "block";
					eleNode.style.visibility = "visible";
					assert(callback).isFunction() && callback.call(eleNode);
				});
				return this;
			},
			hide: function(callback) {
				this.update().each(function(eleNode) {
					eleNode.style.display = "none";
					assert(callback).isFunction() && callback.call(eleNode);
				});
				
				return this;
			},
			hidden: function(callback) {
				this.update().each(function(eleNode){
					eleNode.style.visibility = "hidden";
					assert(callback).isFunction() && callback.call(eleNode);
				});
				return this;
			},
			visible: function(callback) {
				this.update().each(function(eleNode){
					eleNode.style.visibility = "visible";
					assert(callback).isFunction() && callback.call(eleNode);
				});
				return this;
			},
			rotate: function(degree) {
			    var deg = 'rotate(' + degree + 'deg)';
			    this.update().each(function(eleNode){
				    eleNode.style.transform = deg;
				    eleNode.style.OTransform = deg;
				    eleNode.style.MozTransform = deg;
				    eleNode.style.KhtmlTransform = deg;
				    eleNode.style.WebkitTransform = deg;
			    });
			    return this;
			},
			submit: function(callback) {
			    this.update().each(function(eleNode){
				    if (eleNode.tagName == "FORM") {
						eleNode.submit();
				    }
				    assert(callback).isFunction() && callback.call(eleNode);
			    });
			    return this;
			},
			addChild: function() {
				var child = null,
					arg = arguments,
					length = arg.length;
				this.update().each(function(eleNode) {
					for (var i = 0; i < length; ++ i) {
						child = arg[i];
						if (f(child).isElement()) {
							eleNode.appendChild(child);
						} else if (f(child.source[0]).isElement()) {
							// only apply for this library;
							eleNode.appendChild(child.source[0]);
						}
					}	
				});
				return this;
			},
			setHTML: function(html) {
				this.update().each(function(eleNode){
					if (f(eleNode.value).isExists()) {
						eleNode.value = html;
					} else if (f(eleNode.innerHTML).isExists()) {
						eleNode.innerHTML = html; 
					}
				});
				return this;
			},
			getHTML: function() {
				var aV = [];
				this.update().each(function(eleNode){
					if (f(eleNode.value).isExists()) {
						aV.push(eleNode.value);
					} else if (f(eleNode.innerHTML).isExists()) {
						aV.push(eleNode.innerHTML); 
					}
				});
				if (aV.length == 1) {
					return aV[0];
				}
				return aV;
			},
			getHeight: function() {
				var aV = [], height;
				this.update().each(function(eleNode){
					height = (eleNode.height) ? eleNode.height : eleNode.offsetWidth;
					aV.push(height);
				});
				if (aV.length == 1) {
					return aV[0];
				}
				return aV;
			},
			getWidth: function() {
				var aV = [], width;
				this.update().each(function(eleNode){
					width = (eleNode.width) ? eleNode.width : eleNode.offsetWidth;
					aV.push(width);
				});
				if (aV.length == 1) {
					return aV[0];
				}
				return aV;
			},
			getFirstChild: function() {
				var aE = [], firstChild = null;
				this.update().each(function(eleNode){
					firstChild = eleNode.firstChild;
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
				this.update().each(function(eleNode){
					lastChild = eleNode.lastChild;
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
				this.update().each(function(eleNode){
					(!f.isIE() && (eleNode.style.opacity = value/100))  
					|| (eleNode.style.filter = "alpha(opacity = value)".replace("value", value));
				});
				return this;
			},
			setStyle: function(style) {
				this.update().each(function(eleNode) {
					if (f(style).isString()) {
						eleNode.setAttribute("style", style);
					} else if (f(style).isObject()) {
						var st = eleNode.style;
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
				this.update().each(function(eleNode) {
					if (eleNode.currentStyle && !f.isOpera()) { 
						if (type == "opacity") {
							value = eleNode.currentStyle["filter"];
							match = value.match(/(.*)opacity\s*=\s*(\w+)(.*)/i);
							value = match ? isNaN(parseFloat(match[2])) ? 100 : parseFloat(match[2]) : 100;
						} else { 
							value = eleNode.currentStyle[property];
						}
					} else if (currentDocument.defaultView && currentDocument.defaultView.getComputedStyle) {
						property = property.replace(/[(A-Z)]/g, function(match){return "-" + match.toLowerCase()});
						value = currentDocument.defaultView.getComputedStyle(eleNode, null).getPropertyValue(property);
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
				this.update().each(function(eleNode) {
					eleNode.style.removeProperty(property);
				});
				return this;
			}
		};
		
		f(html).appendModule("html");
	})();
	








	
	// dragable module;
	(function() {
	
		var f = window[F_NAME],
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document,
			assert = f.callFunction('assert'),
			copy = f.callFunction('copy');

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
				this.update().each(function(el) {
						var ADN = el;
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
			queenMove: function(config) {
				this.update().each(function(el) {
					var ADN = el;
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
		
		f(html).appendModule("html");
	})();








	
	// debug module;
	(function() {
	
		var f = window[F_NAME],
			holdId,
			flag = true,
			temporary = [],
			textareaValue = "";
		
		var currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;
		
		var setting = {
			viewCover: false,
			zIndex: 999,
			align: ["left", "right", "middle"][2]
		},
		style = {
			borderTop: "1px solid #cccccc",
			top: "0px",
			width: "64%",
			margin: "auto",
			padding: "3px",
			color: "white",
			backgroundColor: "black"
		};
		// store child object;
		var childObject = [];			
		
		function discover(o) {
			var node = f.createElement({style:{margin: "10px"}});
			f(o).notExists() &&  (o = 'null');
			if (f(o).isString() || f(o).isNumber()) {
				node.setHTML(o);
			} else {
				var v = o && o.toString ? o.toString() : o, innerHTML = "";
				f(o).isArray() && (v = "[]");
				f(o).isObject() && (v = "{}");
				node.setHTML(
					f("<div style='clear:left; line-height: 18px;'>")
					 ("<div style='color: #9b1a00; overflow: hidden; width: 246px; float: left;'>")
						("<span style='padding-left: 18px;'>source</span>")
					 ("</div>")
					 ("<div style='padding-left: 246px;'><xmp> ")(v)("\n</xmp></div>")
					 ("</div>")()
				);
				try {
					for (var p in o) {
						try {
							v = o[p] != null ? o[p] : '""';
						} catch(e) {
							v = "Can't access !!!";
						}
						if (f(v).isObject()) {
							childObject.push(v);
							innerHTML = f("<div style='width: 246px; overflow: hidden; float: left;'>")
												("<span style='margin-right: 6px;'>[+]</span>")
												("<span style='color: #9b1a00; cursor: pointer;' onclick='")(F_NAME)('.callFunction("viewChild")(this, ')(childObject.length - 1)(")'> ")(p)("</span>")
											("</div>")
											("<div style='margin-left: 246px;'><xmp>Object {...}</xmp></div>")
											("<div style='margin-left: 49px; display: none;'></div>")();
						} else {
							v = v.toString ? v.toString() : v;
							innerHTML = f("<div style='width: 246px; overflow: hidden; float: left;'>")
												("<span style='margin: 0px 12px 0px 8px;'>-</span>")
												("<span style='color: #9b1a00'> ")(p)("</span>")
											("</div>")
											("<div style='margin-left: 246px;'><xmp> ")(v)("\n</xmp></div>")();
						}
						
						node.addChild(
							f.createElement({
								style: "clear:left; line-height: 18px;",
								innerHTML: innerHTML
							})
						);
					}
				} catch(e) {
					node.setHTML("Can't access !!!");
				}
			}
			return node();
		};
		
		var viewChild = f.storeFunction(
			function (clickElement, childId) {
				var parent = clickElement.parentNode.parentNode,
					target = f(parent).getLastChild();
				if (target.getFirstChild().isExists()) {
					target.toggle();
				} else {
					target.addChild(discover(childObject[childId])).show();
				}
			},
			"viewChild"
		);
			
		function removeConsole() {
			if (holdId) {
				var console = currentDocument.getElementById(holdId);
				currentDocument.body.removeChild(console);
				holdId = null;
				childObject = [];
				textareaValue = null;
			}
		}
				
		var publicity = {
		
			viewSource: function(config) {
				f(config).copyTo(setting);
				(setting.align == "left") && f({position: "absolute", left: "0px"}).copyTo(style);
				(setting.align == "right") && f({position: "absolute", right: "0px"}).copyTo(style);
				(setting.align == "middle") && f({position: "relative"}).copyTo(style);
				f({zIndex: setting.zIndex}).copyTo(style);
				
				var src = (setting.viewCover == true) ? this : this.source[0];
				/* Only show one console,
					if want to show more obeject,
						please add them in to an array
							then view this array source.
				*/
				var consoleId = holdId || f.createId();
				
				if (f(holdId).notExists()) {
					holdId = consoleId;
					var container = f.createElement({
						id: consoleId,
						event: {
							"mousedown": function(event) {
								var evt = event || currentWindow.event;
								evt.cancelBubble = true;
							}
						},
						style: {cursor: "default", top: "0px", position: "absolute", fontFamily: "Courier New", left: "0px", width: "100%", fontSize: "12px", height: "0px", zIndex: 999}
					}).appendTo(currentDocument.body);
				} else {
					// Remove content;
					var container = currentDocument.getElementById(consoleId);
					while (container.firstChild) {
						container.removeChild(container.firstChild);
					}
					container = f(container);
				}
				
				var info = f.createElement({
					style: style
				});
				var title = f.createElement({
					innerHTML: f("<div style='float:left;'>")
									("<span>[ + ]</span>")
								("<span style='cursor: pointer;' onclick='" + F_NAME + "(window).viewSource(true);'> window </span>")
								("<span style='cursor: pointer;' onclick='" + F_NAME + "(document).viewSource(true);'> / document </span>")
								("</div>")(),
					style: {padding: "3px 0px 0px 0px", height: "20px"}
				});
				var button = f.createElement({
					style: {textAlign: "right", margin: "0px 0px 0px 200px", cursor: "move"}
				});
				var minimize = f.createElement({
					innerHTML: "--",
					tagName: "span",
					style: {color: "red", fontWeight: "bold", cursor: "pointer", marginRight: "12px"},
					event: {
						mousedown: function(event) {
							var evt = event || currentWindow.event;
							evt.cancelBubble = true;
							resizeConsole();
						}
					}
				});
				
				var close = f.createElement({
					innerHTML: "[X]",
					tagName: "span",
					style: {color: "red", fontWeight: "bold", cursor: "pointer"},
					event: {
						mousedown: function(event) {
							var evt = event || currentWindow.event;
							evt.cancelBubble = true;
							removeConsole();
						}
					}
				});
				var dynamic = f.createElement({
					style: {position: "relative", width: "100%"}
				});
				
				var textarea = f.createElement({
					innerHTML: textareaValue,
					tagName: "textarea",
					style: {height: "43px", width: "100%", overflow: "auto", marginLeft: (function(){return f.isIE() ? "-2px" : "0px"})()}
				});
				var active = f.createElement({
					innerHTML: "eval",
					tagName: "span",
					event: {
						mousedown: function(event) {
							var evt = event || currentWindow.event;
							evt.cancelBubble = true;
							textareaValue = textarea.getHTML();
							textareaValue && eval(textareaValue);
						}
					},
					style: {position: "absolute", bottom: "0px", right: "0px",  padding: "0px 8px", color: "black", border: "2px solid green"}
				});
				var content = f.createElement({
					style: {background: "#848484", borderTop: "2px solid green", height: "300px", width: "100%", overflow: "auto"},
					event: {
						"mousedown": function(event) {
							var evt = event || currentWindow.event;
							evt.cancelBubble = true;
						}
					}
				});

				container.addChild(
					info.addChild(
						title.addChild(button.addChild(minimize, close)),
						dynamic.addChild(textarea, active),
						content
					)
				);
									
				function resizeConsole() {
					if (content.getStyle('display') != "none") {
						content.hide();
						minimize.setHTML("[]");
					} else {
						content.show();
						minimize.setHTML("--");
					}
				}
			
				title.setDragable({proxy: container()});
				content.addChild(discover(src));
				return this;
			},
			log: function(config) {
				var source = this(true) || this(),
					light = "white";
				if (!flag) {
					flag = true;
					light = "black";
				} else {
					flag = false;
				}
				if (f(source).isString() || f(source).isNumber()) {
					temporary.push(
						f("<div style='width: 100%; color: ")(light)("'><span style='margin: 0px 12px 0px 8px;'>-</span>")
							(source)("</div>")()
					);
				} else {
					temporary.push(
						f("<div style='width: 100%; color: ")(light)("'>")
							(discover(source).innerHTML)
							("</div>")()
					);
				}
				f(temporary.join("")).viewSource(config);
				return this;
			},
			clear: function() {
				flag = true;
				temporary = [];
				f("").viewSource();
				return this;
			},
			viewStream: function(config) {
				var storeFunction = [],
					callee = arguments.callee.caller;
				while (callee) {
					storeFunction.unshift(callee.toString());
					callee = callee.arguments.callee.caller;
				}
				f(storeFunction).viewSource(config);
				return this;
			}
		}
		f(publicity).appendModule("common");
	})();









	 
	// Canvas module;
	(function() {
		
		var f = window[F_NAME],
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document,
			assert = f.callFunction('assert'),
			copy = f.callFunction('copy');
		
		var C2 = {
				filter: function(data) {
					// check is context of canvas element;
					return data && assert(data.fillText).isFunction();
				},
				pi: Math.PI.toFixed(3),
				/*
				 * config some attributes for canvas;
				 * strokeStyle, fillStyle, lineWidth, lineCap, lineJoin, miterLimit
				 * globalAlpha, globalCompositeOperation,
				 * shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor
				 * font, textAlign, textBaseline;
				 */
				config: function(config) {
					var canvas = this.source[0];
					copy(config).to(canvas);
					return this;
				},
				strokeStyle: function(color){
					var canvas = this.source[0];
					canvas.strokeStyle = color;
					return this;
				},
				fillStyle: function(color) {
					var canvas = this.source[0];
					canvas.fillStyle = color;
					return this;
				},
				lineWidth: function(thick) {
					var canvas = this.source[0];
					canvas.lineWidth = thick;
					return this;
				},
				lineCap: function(cap) {
					var canvas = this.source[0];
					canvas.lineCap = cap;
					return this;
				},
				lineJoin: function(joinStyle) {
					var canvas = this.source[0];
					canvas.lineJoin = joinStyle;
					return this;
				},
				font: function(name) {
					var canvas = this.source[0];
					canvas.font = name;
					return this;
				},
				textAlign: function(state) {
					var canvas = this.source[0];
					canvas.textAlign = state;
					return this;
				},
				textBaseline: function(line) {
					var canvas = this.source[0];
					canvas.textBaseline = line;
					return this;
				},
				globalAlpha: function(opacity) {
					var canvas = this.source[0];
					canvas.globalAlpha = opacity;
					return this;
				},
				compositeOperation: function(method) {
					var canvas = this.source[0];
					canvas.globalCompositeOperation = method;
					return this;
				},
				shadowBlur: function(width) {
					var canvas = this.source[0];
					canvas.shadowBlur = width;
					return this;
				},
				shadowColor: function(color) {
					var canvas = this.source[0];
					canvas.shadowColor = color;
					return this;
				},
				shadowOffset: function(offset) {
					var canvas = this.source[0];
					assert(offset.x) && (canvas.shadowOffsetX = offset.x);
					assert(offset.y) && (canvas.shadowOffsetY = offset.y);
					return this;
				},
				// transform;
				scale: function(x, y) {
					var canvas = this.source[0];
					canvas.scale(x, y);
					return this;
				},
				rotate: function(angle) {
					var canvas = this.source[0];
					canvas.rotate(angle);
					return this;
				},
				translate: function(x, y) {
					var canvas = this.source[0];
					canvas.translate(x, y);
					return this;
				},
				transform: function(m11, m12, m21, m22, dx, dy){
					var canvas = this.source[0];
					canvas.transform(m11, m12, m21, m22, dx, dy);
					return this;
				},
				setTransform: function(m11, m12, m21, m22, dx, dy) {
					var canvas = this.source[0];
					canvas.setTransform(m11, m12, m21, m22, dx, dy);
					return this;
				},
				drawImage: function() {
					var context = this.source[0];
					context.drawImage.apply(context, arguments);
					return this;
				},
				// working with path;
				beginPath: function() {
					var canvas = this.source[0];
					canvas.beginPath();
					return this;
				},
				moveTo: function(x, y) {
					var canvas = this.source[0];
					canvas.moveTo(x, y);
					return this;
				},
				lineTo: function(x, y) {
					var canvas = this.source[0];
					canvas.lineTo(x, y);
					return this;
				},
				bezierCurveTo: function(controlX1, controlY1, controlX2, controlY2, X, Y) {
					var canvas = this.source[0];
					canvas.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, X, Y);
					return this;
				},
				quadraticCurveTo: function(controlX, controlY, X, Y) {
					var canvas = this.source[0];
					canvas.quadraticCurveTo(controlX, controlY, X, Y);
					return this;
				},
				
				// working with rectangle shape;
				clearRect: function(left, top, width, height) {
					var canvas = this.source[0];
					canvas.clearRect(left, top, width, height);
					return this;
				},
				fillRect: function(left, top, width, height, color) {
					var canvas = this.source[0];
					assert(color) && (canvas.fillStyle = color);
					canvas.fillRect(left, top, width, height);
					return this;
				},
				strokeRect: function(left, top, width, height, thick, color, fillColor) {
					var canvas = this.source[0];
					assert(thick).isExists() && (canvas.lineWidth = thick);	
					assert(color).isExists() && (canvas.strokeStyle = color);
					assert(fillColor).isExists() && (canvas.fillStyle = fillColor);
					canvas.strokeRect(left, top, width, height);
					assert(fillColor).isExists() && canva.fill();
					return this;
				},
				
				// milestone is: [{x: x, y: y}, {x2: x2, y2: y2} ....{xn: xn, yn: yn}];
				fillPath: function(milestone, color) {
					var canvas = this.source[0];
					assert(color).isExists() && (canvas.fillStyle = color);
					canvas.beginPath();
					canvas.moveTo(milestone[0].x, milestone[0].y);
					for (var i = 1; i < milestone.length; ++ i) {
						canvas.lineTo(milestone[i].x, milestone[i].y);
					}
					canvas.closePath();
					canvas.fill();
					return this;
				},
				// milestone is: [{x: x, y: y}, {x2: x2, y2: y2} ....{xn: xn, yn: yn}];
				strokePath: function(milestone, thick, color, fillColor) {
					var canvas = this.source[0];
					assert(thick).isExists() && (canvas.lineWidth = thick);
					assert(color).isExists() && (canvas.strokeStyle = color);
					assert(fillColor).isExists() && (canvas.fillStyle = fillColor);
					canvas.beginPath();
					canvas.moveTo(milestone[0].x, milestone[0].y);
					for (var i = 1; i < milestone.length; ++ i) {
						canvas.lineTo(milestone[i].x, milestone[i].y);
					}
					assert(fillColor).isExists() && canvas.closePath();
					assert(fillColor).isExists() && canvas.fill();
					canvas.stroke();
					return this;
				},
				arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
					var canvas = this.source[0];
					canvas.arc(x, y, radius, startAngle, endAngle, anticlockwise);
					return this;
				},
				fillArc: function(x, y, radius, startAngle, endAngle, anticlockwise, color) {
					var canvas = this.source[0];
					assert(color).isExists() && (canvas.fillStyle = color);
					canvas.beginPath();
					canvas.arc(x, y, radius, startAngle, endAngle, anticlockwise);
					canvas.closePath();
					canvas.fill();
					return this;
				},
				strokeArc: function(x, y, radius, startAngle, endAngle, anticlockwise, thick, color, fillColor) {
					var canvas = this.source[0];
					assert(color).isExists() && (canvas.strokeStyle = color);
					assert(thick).isExists() && (canvas.lineWidth = thick);
					assert(fillColor).isExists() && (canvas.fillStyle = fillColor);
					canvas.beginPath();
					canvas.arc(x, y, radius, startAngle, endAngle, anticlockwise);
					canvas.closePath();
					assert(fillColor).isExists() && canvas.fill();
					canvas.stroke();
					return this;
				},
				circle: function(x, y, radius, color) {
					var canvas = this.source[0];
					canvas.arc(x, y, radius, 0, 2 * this.pi, false);
					return this;
				},
				fillCircle: function(x, y, radius, color) {
					var canvas = this.source[0];
					assert(color).isExists() && (canvas.fillStyle = color);
					canvas.beginPath();
					canvas.arc(x, y, radius, 0, 2 * this.pi, false);
					canvas.closePath();
					canvas.fill();
					return this;
				},
				strokeCircle: function(x, y, radius, thick, color, fillColor) {
					var canvas = this.source[0];
					assert(color).isExists() && (canvas.strokeStyle = color);
					assert(thick).isExists() && (canvas.lineWidth = thick);
					assert(fillColor).isExists() && (canvas.fillStyle = fillColor);
					canvas.beginPath();
					canvas.arc(x, y, radius, 0, 2 * this.pi, false);
					canvas.closePath();
					assert(fillColor).isExists() && canvas.fill();
					canvas.stroke();
					return this;
				},
							
				closePath: function() {
					var canvas = this.source[0];
					canvas.closePath();
					return this;
				},
				stroke: function(config) {
					var canvas = this.source[0];
					assert(config).isJsObject() && copy(config).to(canvas);
					canvas.stroke();
					return this;
				},
				fill: function() {
					var canvas = this.source[0];
					//assert(config).isJsObject() && copy().to(canvas);
					canvas.fill();
					return this;
				},
				save: function(){
					var canvas = this.source[0];
					canvas.save();
					return this;
				},
				restore: function() {
					var canvas = this.source[0];
					canvas.restore();
					return this;
				},

				//gradient;
				createLinearGradient: function(x0, y0, x1, y1) {
					var canvas = this.source[0];
					return copy(this).to(canvas.createLinearGradient(x0, y0, x1, y1));
				},
				createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
					var canvas = this.source[0];
					return copy(this).to(canvas.createRadialGradient(x0, y0, r0, x1, y1, r1));
				},
				addGradientColorStop: function(offset, color) {
					var canvas = this.source[0];
					// offset is range from 0.0 to 1.0;
					canvas.addColorStop && canvas.addColorStop(offset, color);
					return this;
				},
				//create pattern;
				createPattern: function(image, repetition) {
					var canvas = this.source[0];
					return copy(this).to(canvas.createPattern(image, repetition));
				},
				isPointInPath: function(x, y) {
					var canvas = this.source[0];
					return canvas.isPointInPath(x, y);
				}
		};
		
		// create new module;
		f(C2).createModule('canvas');
		
		var extC2 = {
			trapezium: function(opt) {
				var set = {
					x: 0,
					y: 0,
					a: 92,
					b: 92,
					h: 92,
					fillColor: null,
					gradientColor: null,
					/*
					{
						0: "rgba(255, 255, 255, 1)",
						1: "rgba(255, 0, 255, 0)"
						133697470
					},
					*/
					shadowBlur: 0,
					shadowColor: 'transparent',
					rotateDegree: 0
				};
				copy(opt).to(set);
				set.rotateDegree = this.pi * (set.rotateDegree/180);

				var context = this.source[0];
				var gradient = null;
				
				this.save();
				this.translate(set.x, set.y);
				this.rotate(set.rotateDegree);
				
				this.beginPath();
				this.moveTo(-set.b/2, set.h);
				this.lineTo(-set.a/2, 0);
				this.lineTo( set.a/2, 0);
				this.lineTo( set.b/2, set.h);
				this.closePath();

				if (assert(set.gradientColor).isJsObject()) {
					gradient = context.createLinearGradient(set.x, 0, set.x, set.h);
					for (var o in set.gradientColor) {
						if (set.gradientColor.hasOwnProperty(o)) {
							gradient.addColorStop(o, set.gradientColor[o]);
						}
					}
				}
				assert(gradient).isExists() && this.fillStyle(gradient);
				assert(set.fillColor).isExists() && this.fillStyle(set.fillColor);
				this.config({
					shadowBlur: set.shadowBlur,
					shadowColor: set.shadowColor
				});
				this.fill();
				this.restore();
				return this;
			},
			
			spotlight: function(opt) {
				var opc = '', j = 1;
				for (var i = 1; i < 20; ++i) {
					j = (i < 10) ? i : (i < 15) ? 10 : (25 - i);
					opc = "rgba(255, 255, 255, " + (j/200) + ")";
					this.trapezium({
						x: opt.x,
						y: opt.y,
						a: opt.a - (i * 3),
						b: opt.b - (i * 16),
						h: opt.h - (i * 16),
						gradientColor: {
							0: opc,
							1: "rgba(255, 255, 255, 0)"
						},
						shadowBlur: opt.shadowBlur,
						shadowColor: opt.shadowColor,
						rotateDegree: opt.rotateDegree
					});
				}
			}
		}
		
		f(extC2).appendModule('canvas');
		
		var utility = {
			createContextCanvas: function(width, height, target) {
				var setting = {
					width: assert(width).isNumber() ? width : 600,
					height: assert(height).isNumber() ? height : 200,
					target: assert(target).isElement() ? target : currentDocument.body
				};
				
				var zone = f.createElement({
					tagName: "canvas",
					attribute: {
						width: setting.width,
						height: setting.height
					}
				}).appendTo(setting.target);
				
				return f(zone().getContext('2d'));
			},
			selectContextCanvas: function(zone) {
				var zone = assert(zone).isString() ? currentDocument.querySelector(zone) : zone;
				if (zone && zone.getContext) {
					return f(zone.getContext('2d'));
				} 
				return null;
			}
		};
		
		f(utility).appendModule("utility");
	})();








	
	// transition module;
	(function() {
		
		var f = window[F_NAME],
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;
			
		var publicity = {
			transition: {
				0: function(x) {
					return x;
				},
				1: function(x) {
					return x*(2 - x);
				},
				2: function(x) {
					return Math.pow(x, 2);
				},
				3: function(x) {
					return Math.pow(x, 1/2);
				},
				// Elastic effect.
				4: function(x) {
					var t = 1 + 1 + 1/2 + 1/4, a = t*t/2;
					if (x < (2/t)) {
						return -a*x*x + t*1.5*x;
					} else if (x < (2.5/t)) {
						return a*x*x - t*2.25*x + 3.5;
					} else {
						return -a*x*x + t*2.625*x - 2.4375;
					}
				},
				// Bounce effect;
				5: function(x) {
					var t = 1 + 1 + 1/2 + 1/4, a = t*t, b = -2*t;
					// Parabol :  a x^2 + bx +  c = 1.
					if (x < (1/t)) {
						return a*x*x;
					} else if (x < (2/t)) {
						return a*x*x + b*1.5*x + 3;
					} else if (x < (2.5/t)) {
						return a*x*x + b*2.25*x + 6;
					} else {
						return a*x*x + b*2.625*x + 7.875;
					}
				},
				6: function(x) {
					return 0.5 - 0.5*Math.cos(x*Math.PI)
				},
				7: function(x) {
					return 0.5 - 0.5*Math.cos(x*10*Math.PI)
				},
				8: function(x) {
					return x + Math.sin(x*10*Math.PI)/5
				},
				9: function(x) {
					return x + 0.5*(x - 1)*Math.sin((x-1)*10*Math.PI)
				},
				10: function(x) {
					return Math.pow(x, 0.25) + (x/5)*Math.sin(x*20*Math.PI)
				},
				11: function(x) {
					return Math.pow(x, 0.25) + 0.5*(x-1)*Math.sin((x-1)*6*Math.PI)
				}
			}
		};
		f(publicity).createModule("transition");
	})();
	
	
	// tranform module;
	(function() {
			
		var f = window[F_NAME],
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;
		
		function parse(type, value) {
			return {
				"value": type == "color" ? f(value).toRGB(true) : parseFloat(value),
				"unit": type == "color" ? "color" : value.toString().replace(/^[\d\s]|-[\d\s]/g, "")
			};
		}
		
		function split(source, target, divide, unit, transition) {
			var r, g, b, delta, range = [];
			if (unit == "color") {
				source = source.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
				target = target.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
				r = split(parseInt(source[1]), parseInt(target[1]), divide, "", transition);
				g = split(parseInt(source[2]), parseInt(target[2]), divide, "", transition);
				b = split(parseInt(source[3]), parseInt(target[3]), divide, "", transition);
				
				for (var i = 0; i <= divide; ++i) {
					range.push(f("rgb(")(parseInt(r[i]))(", ")(parseInt(g[i]))(", ")(parseInt(b[i]))(")")());
				}
			} else { 
				delta = target - source;
				for (var i = 0; i <= divide; ++i) {
					range.push((source + transition(i / divide) * delta).toFixed(2) + unit);
				}
			}
			return range;
		}
		
		f({split: split}).appendModule("utility");
		
		function revolution(element, name, start, delay) {
			var proxy = element.albus[name],
				divide = proxy.value.length - 1;
			// Remove old register.
			if (element.albus["timer"][name]) {
				clearInterval(element.albus["timer"][name]);
			}
			var revolve = function() {
				var index = Math.ceil((f.getTime() - start)/delay);
				index = (index - divide > 0) ? divide : index;
				if (f(name).typeofStyle() == "opacity") {
					f(element).setOpacity(parseInt(proxy.value[index]));
				} else {
					element.style[name] = proxy.value[index];
				}
				//element.albus.run(element, divide, delay);
				
				if (index == divide) {
					clearInterval(element.albus["timer"][name]);
					delete element.albus["timer"][name];
					delete element.albus[name];
					if (element.albus["timer"].length == 0) {
						// Slowdown for IE.
						setTimeout(function(){element.albus.finish(element)}, 1);
					}
				} 
			}
			element.albus["timer"][name] = setInterval(revolve, delay); 
		}
		
		var publicity = {
				transform: function(r) {
					this.update().each(function(ADN){
						var	styleName = ["background", "backgroundColor", "backgroundImage", "backgroundPosition", "backgroundRepeat", "bottom", "clip", "color", "font", "fontSize", "height", "left", "letterSpacing", "lineHeight", "listStyleImage", "listStylePosition", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "opacity", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "right", "top", "width", "wordSpacing", "zIndex"];
						var setting = {
							start: r.start || function() {},
							on: r.on || function() {},
							end: r.end || function() {},
							delay: r.delay || 12,
							divide: r.divide || 100,
							transition: r.transition || function(x) {return x * (2 - x)}
						};
						// albus is older name of this libraly;
						ADN.albus = ADN.albus ? ADN.albus : {"timer": []};
						ADN.albus.run = setting.on;
						ADN.albus.finish = setting.end;
						var proxy, name, type, from, target, start = f.getTime();
						setting.start();
						
						for (var o in styleName) {
							name = styleName[o];
							if (f(r[name]).isExists()) {
								type = f(name).typeofStyle();
								if (type == "position" && f(ADN).getStyle("position") != "absolute") {
									ADN.style.position = "relative";
								}
								proxy = ADN.albus[name] = {"value": null};
								if (f(r[name]).isArray() && r[name].length > 2) {
									proxy.value = r[name];
								} else if (f(r[name]).isArray() && r[name].length == 2) {
									from = parse(type, r[name][0]);
									target = parse(type, r[name][1]);
								} else {
									from = parse(type, f(ADN).getStyle(name));
									target = parse(type, r[name]);
								}	
								
								proxy.value = proxy.value ? proxy.value : split(from.value, target.value, setting.divide, target.unit, setting.transition);
								
								// Register new transform.
								revolution(ADN, name, start, setting.delay);
							}
						}
					});
					
					//return this object;
					return this;
				}
		};
		
		f(publicity).appendModule("html");
	})();
	

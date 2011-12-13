








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











	/**
	 * Created by Minh Nguyen;
	 * Version: 1.0;
	 * Email: mnx2012@gmail.com;
	 */
	

	var F_NAME = "Focus";

	(function() {
		
		var currentWindow = window, currentDocument = currentWindow.document;
			
		function notExists(obj) {
			return (obj == null);
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
				
				isNodeList: function() {
					var src = isExists(this.source) ? String(this.source.constructor) : "";
					return (src != src.replace("NodeList", ""));
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
				
				// using for test;
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
			append properties of one or more exists object to other object;
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
									// override;
									target[o] = source[o];
								}
							}
						}
					}
					return target;
				}
			}
		};
		
		// for html module;
		function select(selection, context) {
			if (assert(selection).isBlank()) return null;
			var root = context ? context : currentDocument;
			var list = null;
			try {
				list = root.querySelectorAll(selection);
			} catch(e) {}
			
			return (list && list.length) ? list : null;
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
						if (assert(data).isNodeList()) {
							temporary.list = data;
							return true;
						} else if (assert(data).isElement()) {
							temporary.list = [data];
							return true;
						} else if (assert(data).isString()) {
							temporary.list = select(data);
							if (temporary.list) {
								return true;
							}
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
						append methods, properties of an object to exists module;
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
				for caching functions;
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
			getTime: function() {
				return new Date().getTime();
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
			// working with iframe;
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
			//working with test;
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
			
			data && data.source && (data = data.source);
			
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
					// store input object;
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
		
		currentWindow[F_NAME] = finish;
		
	})();
	








	
	// ajax module
	(function() {
			
		var f = window[F_NAME],
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;
		
		function isReady(xhr) {
			return (xhr.readyState % 4 == 0);
		}
		
		function isRequest(xhr) {
			return xhr.readyState < 4;
		}
		
		function isComplete(xhr) {
			return xhr.readyState == 4;
		}
		
		function isSuccess(xhr) {
			try {
				return xhr.status == 200;
			} catch(e) {
				return false;
			}
		}
		
		function onProcess(func, xhr) {
			if (f(func).isFunction()) {
				func.call(xhr);
			} else {
				eval(xhr);
			}
		}
		
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
				
				function onStateChange(x) {
					if (isSuccess(x)) {
						onProcess(setting.onSuccess, x);
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
							onProcess(setting.onFailure, x);
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
			select = f.callFunction('select'),
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
			addEvent: function(element, evt) {
				for (var o in evt) {
					if (evt.hasOwnProperty(o)) {
						if (element.addEventListener) {
							element.addEventListener(o, evt[o], false);
						} else if (element.attachEvent) {
							element.attachEvent("on" + o, evt[o]);
						} else {
							element["on" + o] = evt[o];
						}
					}
				}
				return f(element);
			},
			removeEvent: function(element, evt) {
				for (var o in evt) {
					if (evt.hasOwnProperty(o)) {
						if (element.removeEventListener) {
							element.removeEventListener(o, evt[o]);
						} else if (element.detachEvent) {
							element.detachEvent("on" + o, evt[o]);
						} else {
							element["on" + o] = null;
						}
					}
				}
				return f(element);
			},
			createId: function(src) {
				return f()(src || F_NAME)("-")(this.getNumber())();
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
					id: null,
					tagName: "div",
					className: null,
					innerHTML: null,
					attribute: null
				};
				
				f(config).copyTo(setting);
				
				var newNode = currentDocument.createElement(setting.tagName);
					
				f(setting.event).isObject() && f.addEvent(newNode, setting.event);
				
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
			toRGB: function(opt) {
				/*
					Convert text color to rgb value.
					example : Focus("green").toRGB(true);
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
			encode: function(opt) {
				return (opt === true) ? encodeURIComponent(this.source) : this;
			},
			decode: function(opt) {
				return (opt === true) ? decodeURIComponent(this.source) : this;
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
			select: function(selection) {
				if (!arguments.length) {
					return this.list;
				} else {
					var i = 0, aE = [], list = [];
					// for detect nodelist;
					function NodeList() {};
					aE.constructor = NodeList;
					this.each(function() {
						list = select(selection, this);
						if (list && list.length) {
							for(i = 0; i < list.length; ++i) {
								aE.push(list[i]);
							}
						}
					});
					return f(aE);
				}
			},
			appendTo: function(list) {
				this.each(function() {
					var src = this;
					var i = 0;
					f(list).each(function() {
						if (i > 0) {
							this.appendChild(src.cloneNode(true));
						} else {
							this.appendChild(src);
						}
						++ i;
					});
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
			removeEvent: function(evt) {
				this.each(function() {
					f.removeEvent(this, evt);
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
			remove: function() {
				this.each(function() {
					var parent = this.parentNode;
					parent && parent.removeChild(this); 
				});
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
							// apply for this library;
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

		// let some elements have normal behavior;
		function ignoreDagDrop(ele) {
			f(ele).select("iframe, form, input, textarea")
			.each(function() {
				f.addEvent(this, {
					mousedown: function(event) {
						var evt = event || window.event;
						event.cancelBubble = true;
						evt.stopPropagation();
					},
					touchstart: function(event) {
						var evt = event || window.event;
						event.cancelBubble = true;
						evt.stopPropagation();
					}
				});
			});
		}
		
		var html = {
			drag: function(config) {
				var touch = false;
				var def = {
					sX: 0, //start clientX;
					sY: 0, 
					top: 0,
					left: 0,
					proxy: null,
					lockX: null,
					lockY: null,
					end: function() {},
					move: function() {},
					start: function() {}
				};
				
				this.each(function() {
					var set = copy(config).to(def);
					var ele = set.proxy || this;
					var fele = f(ele);
					
					var posStyle = fele.getStyle("position");
					if (posStyle == "fixed") return;
					posStyle != "absolute" && fele.setStyle({position: "relative"});
					
					function mouseDown(event) {
						var evt = event || window.event;
						evt.stopPropagation();
						if (evt.touches && evt.touches.length) {
							touch = true;
							evt = evt.changedTouches[0];
						}
						set.start.call(ele, evt);
						if (evt.button != 2 && evt.which != 3) {
							var pos = {};
							pos.top = parseInt(ele.style.top) || 0;
							pos.left = parseInt(ele.style.left) || 0;
							
							set.sX = evt.clientX;
							set.sY = evt.clientY;
							set.top = pos.top;
							set.left = pos.left;
		
							fele.setStyle({ top: set.lockY != null ? set.lockY : pos.top + "px" }); 
							fele.setStyle({ left: set.lockX != null ? set.lockX : pos.left + "px" }); 
							
							f.addEvent(currentDocument, { mouseup: mouseUp, touchend: mouseUp });
							f.addEvent(currentDocument, { mousemove: mouseMove, touchmove: mouseMove });
							
						}
					};
					
					function mouseMove(event) {
						var evt = event || window.event;
						!!touch && (evt = evt.changedTouches[0]);
						
						!set.lockY && fele.setStyle({ top: set.top - (set.sY - evt.clientY) + "px" });
						!set.lockX && fele.setStyle({ left: set.left - (set.sX - evt.clientX) + "px" });
						
						var tracker = {
							from : {
								x: set.sX,
								y: set.sY
							},
							to: {
								x: evt.clientX,
								y: evt.clientY
							}
						}
						set.move.call(ele, evt, tracker);
						
						return false;
					}
					
					function mouseUp(event) {
						var evt = event || window.event;
						!!touch && (evt = evt.changedTouches[0]);
						
						var tracker = {
							from : {
								x: set.sX,
								y: set.sY
							},
							to: {
								x: evt.clientX,
								y: evt.clientY
							}
						};
						
						set.end.call(ele, evt, tracker);
						
						f.removeEvent(currentDocument, { mouseup: mouseUp, touchend: mouseUp });
						f.removeEvent(currentDocument, { mousemove: mouseMove, touchmove: mouseMove });
					};
					
					f.addEvent(this, {mousedown: mouseDown});
					
					ignoreDagDrop(this);	
				});
				return this;
			},
			swipe: function(config) {
				var touch = false;
				var def = {
					sX: 0, //start clientX;
					sY: 0, 
					end: function() {},
					move: function() {},
					start: function() {}
				};
				
				this.each(function() {
					var set = copy(config).to(def);
					var ele = this;
					
					function mouseDown(event) {
						var evt = event || window.event;
						evt.stopPropagation();
		
						if (evt.touches && evt.touches.length) {
							touch = true;
							evt = evt.changedTouches[0];
						}
						set.start.call(ele, evt);
						if (evt.button != 2 && evt.which != 3) {
							
							set.sX = evt.clientX;
							set.sY = evt.clientY;
							set.direct = 0;
							set.distance = 0;
							
							f.addEvent(ele, { mousemove: mouseMove, touchmove: mouseMove });
							f.addEvent(currentDocument, { mouseup: mouseUp, touchend: mouseUp });
						}
					};
					
					function mouseMove(event) {
						var evt = event || window.event;
						!!touch && (evt = evt.changedTouches[0]);
						
						var deltaX = (set.sX - evt.clientX) ^ 0;
						var deltaY = (set.sY - evt.clientY) ^ 0;
						var tan = 1;
						deltaX != 0 &&	(tan = Math.abs(deltaY/deltaX) ^ 0);
						var distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
						
						var tracker = {
							from : {
								x: set.sX,
								y: set.sY
							},
							to: {
								x: evt.clientX,
								y: evt.clientY
							}
						};
						var direct = Math.atan(tan);
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
						
						set.direct = direct;
						set.distance = distance;
						set.move.call(ele, evt, direct, distance, tracker);
					}
					
					function mouseUp(event) {
						var evt = event || window.event;
						!!touch && (evt = evt.changedTouches[0]);
						
						var tracker = {
							from : {
								x: set.sX,
								y: set.sY
							},
							to: {
								x: evt.clientX,
								y: evt.clientY
							}
						};
						
						set.end.call(ele, evt, set.direct, set.distance, tracker);
						
						f.removeEvent(ele, { mousemove: mouseMove, touchmove: mouseMove });
						f.removeEvent(currentDocument, { mouseup: mouseUp, touchend: mouseUp });
					}
					
					f.addEvent(ele, {mousedown: mouseDown});
				});
				
				return this;
			}
		};
		
		f(html).addTo("html");
	})();









	 
	// Canvas module;
	(function() {
		
		var f = window[F_NAME],
			copy = f.callFunction('copy'),
			assert = f.callFunction('assert'),
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;
		
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
					var canvas = this.source;
					copy(config).to(canvas);
					return this;
				},
				strokeStyle: function(color){
					var canvas = this.source;
					canvas.strokeStyle = color;
					return this;
				},
				fillStyle: function(color) {
					var canvas = this.source;
					canvas.fillStyle = color;
					return this;
				},
				lineWidth: function(thick) {
					var canvas = this.source;
					canvas.lineWidth = thick;
					return this;
				},
				lineCap: function(cap) {
					var canvas = this.source;
					canvas.lineCap = cap;
					return this;
				},
				lineJoin: function(joinStyle) {
					var canvas = this.source;
					canvas.lineJoin = joinStyle;
					return this;
				},
				font: function(name) {
					var canvas = this.source;
					canvas.font = name;
					return this;
				},
				textAlign: function(state) {
					var canvas = this.source;
					canvas.textAlign = state;
					return this;
				},
				textBaseline: function(line) {
					var canvas = this.source;
					canvas.textBaseline = line;
					return this;
				},
				globalAlpha: function(opacity) {
					var canvas = this.source;
					canvas.globalAlpha = opacity;
					return this;
				},
				compositeOperation: function(method) {
					var canvas = this.source;
					canvas.globalCompositeOperation = method;
					return this;
				},
				shadowBlur: function(width) {
					var canvas = this.source;
					canvas.shadowBlur = width;
					return this;
				},
				shadowColor: function(color) {
					var canvas = this.source;
					canvas.shadowColor = color;
					return this;
				},
				shadowOffset: function(offset) {
					var canvas = this.source;
					assert(offset.x) && (canvas.shadowOffsetX = offset.x);
					assert(offset.y) && (canvas.shadowOffsetY = offset.y);
					return this;
				},
				// transform;
				scale: function(x, y) {
					var canvas = this.source;
					canvas.scale(x, y);
					return this;
				},
				rotate: function(angle) {
					var canvas = this.source;
					canvas.rotate(angle);
					return this;
				},
				translate: function(x, y) {
					var canvas = this.source;
					canvas.translate(x, y);
					return this;
				},
				transform: function(m11, m12, m21, m22, dx, dy){
					var canvas = this.source;
					canvas.transform(m11, m12, m21, m22, dx, dy);
					return this;
				},
				setTransform: function(m11, m12, m21, m22, dx, dy) {
					var canvas = this.source;
					canvas.setTransform(m11, m12, m21, m22, dx, dy);
					return this;
				},
				drawImage: function() {
					var context = this.source;
					context.drawImage.apply(context, arguments);
					return this;
				},
				// working with path;
				beginPath: function() {
					var canvas = this.source;
					canvas.beginPath();
					return this;
				},
				moveTo: function(x, y) {
					var canvas = this.source;
					canvas.moveTo(x, y);
					return this;
				},
				lineTo: function(x, y) {
					var canvas = this.source;
					canvas.lineTo(x, y);
					return this;
				},
				bezierCurveTo: function(controlX1, controlY1, controlX2, controlY2, X, Y) {
					var canvas = this.source;
					canvas.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, X, Y);
					return this;
				},
				quadraticCurveTo: function(controlX, controlY, X, Y) {
					var canvas = this.source;
					canvas.quadraticCurveTo(controlX, controlY, X, Y);
					return this;
				},
				
				// working with rectangle shape;
				clearRect: function(left, top, width, height) {
					var canvas = this.source;
					canvas.clearRect(left, top, width, height);
					return this;
				},
				fillRect: function(left, top, width, height, color) {
					var canvas = this.source;
					assert(color) && (canvas.fillStyle = color);
					canvas.fillRect(left, top, width, height);
					return this;
				},
				strokeRect: function(left, top, width, height, thick, color, fillColor) {
					var canvas = this.source;
					assert(thick).isExists() && (canvas.lineWidth = thick);	
					assert(color).isExists() && (canvas.strokeStyle = color);
					assert(fillColor).isExists() && (canvas.fillStyle = fillColor);
					canvas.strokeRect(left, top, width, height);
					assert(fillColor).isExists() && canva.fill();
					return this;
				},
				
				// milestone is: [{x: x, y: y}, {x2: x2, y2: y2} ....{xn: xn, yn: yn}];
				fillPath: function(milestone, color) {
					var canvas = this.source;
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
					var canvas = this.source;
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
					var canvas = this.source;
					canvas.arc(x, y, radius, startAngle, endAngle, anticlockwise);
					return this;
				},
				fillArc: function(x, y, radius, startAngle, endAngle, anticlockwise, color) {
					var canvas = this.source;
					assert(color).isExists() && (canvas.fillStyle = color);
					canvas.beginPath();
					canvas.arc(x, y, radius, startAngle, endAngle, anticlockwise);
					canvas.closePath();
					canvas.fill();
					return this;
				},
				strokeArc: function(x, y, radius, startAngle, endAngle, anticlockwise, thick, color, fillColor) {
					var canvas = this.source;
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
					var canvas = this.source;
					canvas.arc(x, y, radius, 0, 2 * this.pi, false);
					return this;
				},
				fillCircle: function(x, y, radius, color) {
					var canvas = this.source;
					assert(color).isExists() && (canvas.fillStyle = color);
					canvas.beginPath();
					canvas.arc(x, y, radius, 0, 2 * this.pi, false);
					canvas.closePath();
					canvas.fill();
					return this;
				},
				strokeCircle: function(x, y, radius, thick, color, fillColor) {
					var canvas = this.source;
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
					var canvas = this.source;
					canvas.closePath();
					return this;
				},
				stroke: function(config) {
					var canvas = this.source;
					assert(config).isObject(true) && copy(config).to(canvas);
					canvas.stroke();
					return this;
				},
				fill: function() {
					var canvas = this.source;
					canvas.fill();
					return this;
				},
				save: function(){
					var canvas = this.source;
					canvas.save();
					return this;
				},
				restore: function() {
					var canvas = this.source;
					canvas.restore();
					return this;
				},

				//gradient;
				createLinearGradient: function(x0, y0, x1, y1) {
					var canvas = this.source;
					return copy(this).to(canvas.createLinearGradient(x0, y0, x1, y1));
				},
				createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
					var canvas = this.source;
					return copy(this).to(canvas.createRadialGradient(x0, y0, r0, x1, y1, r1));
				},
				addGradientColorStop: function(offset, color) {
					var canvas = this.source;
					// offset is range from 0.0 to 1.0;
					canvas.addColorStop && canvas.addColorStop(offset, color);
					return this;
				},
				//create pattern;
				createPattern: function(image, repetition) {
					var canvas = this.source;
					return copy(this).to(canvas.createPattern(image, repetition));
				},
				isPointInPath: function(x, y) {
					var canvas = this.source;
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

				var context = this.source;
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
		
		f(extC2).addTo('canvas');
		
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
		
		f(utility).addTo("utility");
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
		f(publicity).addTo("utility");
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
					range.push(f()("rgb(")(parseInt(r[i]))(", ")(parseInt(g[i]))(", ")(parseInt(b[i]))(")")());
				}
			} else { 
				delta = target - source;
				for (var i = 0; i <= divide; ++i) {
					range.push((source + transition(i / divide) * delta).toFixed(2) + unit);
				}
			}
			return range;
		}
		
		f({split: split}).addTo("utility");
		
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
					this.each(function(){
						var	styleName = ["background", "backgroundColor", "backgroundImage", "backgroundPosition", "backgroundRepeat", "bottom", "clip", "color", "font", "fontSize", "height", "left", "letterSpacing", "lineHeight", "listStyleImage", "listStylePosition", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "opacity", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "right", "top", "width", "wordSpacing", "zIndex"];
						var setting = {
							start: r.start || function() {},
							on: r.on || function() {},
							end: r.end || function() {},
							delay: r.delay || 12,
							divide: r.divide || 100,
							transition: r.transition || function(x) {return x * (2 - x)}
						};
						var ADN = this;
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
		
		f(publicity).addTo("html");
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
			width: "64%",
			height: "300px",
			align: ["left", "right", "middle"][2]
		};
		var style = {
			borderTop: "1px solid #cccccc",
			color: "white",
			top: "0px",
			width: "64%",
			margin: "auto",
			padding: "3px",
			backgroundColor: "black"
		};
		// store child object;
		var childObject = [];			
		
		function discover(o) {
			var node = f.createElement({style:{margin: "28px 17px"}});
			f(o).notExists() &&  (o = 'null');
			if (f(o).isString() || f(o).isNumber()) {
				node.setHTML(o);
			} else {
				var v = o && o.toString ? o.toString() : o, innerHTML = "";
				f(o).isArray() && (v = "[]");
				f(o).isObject() && (v = "{}");
				node.setHTML(
					f()("<div style='clear:left; line-height: 18px;'>")
					 ("<div style='color: #9b1a00; overflow: hidden; width: 324px; float: left;'>")
						("<span style='padding-left: 18px;'>source</span>")
					 ("</div>")
					 ("<div style='padding-left: 324px;'><xmp> ")(v)("\n</xmp></div>")
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
							innerHTML = f()("<div style='width: 324px; overflow: hidden; float: left;'>")
												("<span style='margin-right: 6px;'>[+]</span>")
												("<span style='color: #9b1a00; cursor: pointer;' onclick='")(F_NAME)('.callFunction("viewChild")(this, ')(childObject.length - 1)(")'> ")(p)("</span>")
											("</div>")
											("<div style='margin-left: 324px;'><xmp>Object {...}</xmp></div>")
											("<div style='margin-left: 49px; display: none;'></div>")();
						} else {
							v = v.toString ? v.toString() : v;
							innerHTML = f()("<div style='width: 324px; overflow: hidden; float: left;'>")
												("<span style='margin: 0px 12px 0px 8px;'>-</span>")
												("<span style='color: #9b1a00'> ")(p)("</span>")
											("</div>")
											("<div style='margin-left: 324px;'><xmp> ")(v)("\n</xmp></div>")();
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
			return node;
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
				
		var common = {
		
			viewSource: function(config) {
				f(config).copyTo(setting);
				(setting.align == "left") && f({position: "absolute", left: "0px"}).copyTo(style);
				(setting.align == "right") && f({position: "absolute", right: "0px"}).copyTo(style);
				(setting.align == "middle") && f({position: "relative"}).copyTo(style);
				f({zIndex: setting.zIndex, width: setting.width}).copyTo(style);
				
				var src = (setting.viewCover == true) ?
							this : (this.list && this.list.length) ? this.list : this.source;
				/* 
					only show one console,
					if want to show more obeject just add them in to an array then view this array source;
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
					// remove content;
					var container = currentDocument.getElementById(consoleId);
					while (container.firstChild) {
						container.removeChild(container.firstChild);
					}
					container = f(container);
				}
				
				var info = f.createElement({style: style});
				
				var title = f.createElement({
					innerHTML: f()("<div style='float:left;'>")
									("<span>[+]</span>")
								("<span style='cursor: pointer;' onclick='" + F_NAME + "(window).viewSource(true);'> window </span>")
								("<span style='cursor: pointer;' onclick='" + F_NAME + "(document).viewSource(true);'> | document </span>")
								("<span style='cursor: pointer;' onclick='" + F_NAME + "(document.body).viewSource(true);'> | document.body </span>")
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
					style: {height: "81px", width: "100%", overflow: "auto", marginLeft: "-3px", resize: "none"}
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
					style: {position: "absolute", cursor: "pointer", bottom: "-23px", left: "-3px",  padding: "2px 10px", background: "white", color: "black", border: "2px solid green"}
				});
				
				var content = f.createElement({
					style: {background: "#848484", borderTop: "2px solid black", height: setting.height, width: "100%", overflow: "auto"},
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
				
				title.drag({proxy: container.source});
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
						f()("<div style='width: 100%; color: ")(light)("'><span style='margin: 0px 12px 0px 8px;'>-</span>")
							(source)("</div>")()
					);
				} else {
					temporary.push(
						f()("<div style='width: 100%; color: ")(light)("'>")
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
		f(common).addTo("common");
	})();


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
	
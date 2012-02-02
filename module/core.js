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
		
		var notify = [];
		// Check type of object.
		function assert(data) {
			
			return {
				source: data,
				
				isExists: function() {
					var src = this.source;
					return isExists(src);
				},
				
				notExists: function() {
					var src = this.source;
					return !isExists(src);
				},
				
				isArray: function() {
					var src = this.source;
					return (isExists(src) && src.constructor == Array);
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
				
				isBlank: function() {
					var src = this.source;
					return (this.isString() && "" == src.replace(/^\s+|\s+$/g, ""));
				},
				
				isRegExp: function() {
					var src = this.source;
					return (isExists(src) && src.constructor == RegExp);
				},
				
				isTextNode: function() {
					var src = this.source;
					return (isExists(src) && 3 == src.nodeType);
				},
				
				startTest: function() {
					notify = [];
					return this;
				},
				
				equal: function(expect, message) {
					if (this.source != expect) {
						message != null && notify.push(message);
					}
					return this;
				},
				
				notEqual: function(expect, message) {
					if (this.source == expect) {
						message != null && notify.push(message);
					}
					return this;
				},
				
				deepEqual: function(expect, message) {
					if (this.source !== expect) {
						message != null && notify.push(message);
					}
					return this;
				},
				
				notDeepEqual: function(expect, message) {
					if (this.source === expect) {
						message != null && notify.push(message);
					}
					return this;
				},
				
				finishTest: function(callback) {
					if (callback instanceof Function) {
						callback(notify);
					} else {
						for (var i in notify) {
							alert(notify[i]);
						}
					}
					notify = [];
					return this;
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
		
		function select(selection, context) {
			if (assert(selection).isBlank()) return null;
			var root = context ? context : currentDocument;
			var list = null;
			try {list = root.querySelectorAll(selection);} catch(e) {}
			if (list && list.length) {
				return list;
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
			list: null,
			number: {},
			object: {},
			boxnote: {},
			variable: {}
		};
		
		
		// for extend from user;
		extension = {
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
					},
					mix: function() {
						return this.source.sort();
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
					},
					update: function(opt) {
						console.log(this.list);
					},
					select: function(selection) {
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
						}
					},
					/*
					 *  create a new module from an object; 
					 */
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
				using to cache function
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
			callFunction: function(id) {
				var func = temporary.method[id];
				if (assert(func).isFunction()) {
					return func;
				}
				return function(){};
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
		
		
		function finish(data) {
			
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
			
			var cover = function(){};
			for (var i in extension) {
				if (assert(extension[i]["filter"]).isFunction()) {
					extension[i]["filter"](data) && copy(extension[i]).to(cover);
				}
			}
			assert(temporary.list).isList() && (cover.list = temporary.list);
			return copy(assert(data)).to(cover);
		};
		
		copy(utility).to(finish);
		
		!F_NAME && (F_NAME = "F");
		
		currentWindow[F_NAME] = finish;
		
	})();
	
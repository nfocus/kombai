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
		var notify = [];
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
				},
				
				startTest: function() {
					notify = [];
					return this;
				},
				
				equal: function(expect, message) {
					if (this.source[0] != expect) {
						message != null && notify.push(message);
					}
					return this;
				},
				
				notEqual: function(expect, message) {
					if (this.source[0] == expect) {
						message != null && notify.push(message);
					}
					return this;
				},
				
				deepEqual: function(expect, message) {
					if (this.source[0] !== expect) {
						message != null && notify.push(message);
					}
					return this;
				},
				
				notDeepEqual: function(expect, message) {
					if (this.source[0] === expect) {
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
								if (assert(source[o]).isObject()) {
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
			try { list = root.querySelectorAll(selection); } catch(e) {}
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
					each: function(func) {
						var data = this.source, length = data.length, i;
						if (!assert(data).isFunction()) {
							for (i = 0; i < length; ++i) {
								func.call(data[i], i, data);
							}
						}
						return this;
					},
					copyTo: function(target) {
						return copy.apply(null, this.source).to(target);
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
						return true;
					},
					update: function(opt) {
						return 2;
					},
					select: function(selection) {
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
							Focus({a: 'b', c: 'd', d: function(){}}).appendTo('utility');
					*/
					addTo: function(module) {
						if (module == "utility") {
							for (var i in this.source[0]) {
								!(i in currentWindow[F_NAME]) && (currentWindow[F_NAME][i] = this.source[0][i]);
							}
						} else {
							for (var mod in extension) {
								if (mod != mod.replace(module, "")) {
									for (var i in this.source[0]) {
										!(i in extension[mod]) && (extension[mod][i] = this.source[0][i]);
									}
								}
							}
						}
					},
					/*
					 *  create a new module from an object; 
					 */
					createModule: function(name) {
						var isExtend = !(name in extension) && assert(this.source[0]).isObject();
						isExtend && (extension[name] = this.source[0]);
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
		

		function f(data) {
		
			var cover = function(src) {
				var source = cover.source;
				if (assert(src).notExists()) {
					return source;
				} else {
					source.push(src);
				}
				return cover;
			};
			
			var mod = ["www"];
			
			for (var i in extension) {
				if (assert(extension[i]["filter"]).isFunction()) {
					extension[i]["filter"](data) && mod.push(i);
				}
			}
			
			var newMod = mod.join("-"), modi;
			if (assert(extension[newMod]).notExists()) {
				extension[newMod] = cover;
				for (var i in mod) {
					modi = mod[i];
					extension[modi] && copy(extension[modi]).to(extension[newMod]);
				}
				delete extension[newMod]["filter"];
				copy(assert()).to(extension[newMod]);
			}
			extension[newMod]["source"] = [data];
			return extension[newMod];
		};
		
		copy(utility).to(f);
		
		!assert(F_NAME).isString() && (F_NAME = "F");
		
		currentWindow[F_NAME] = f;
		
	})();
	
	
	
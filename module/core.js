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
	
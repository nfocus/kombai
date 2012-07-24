	
	
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
						}
					}
				}
				return f(element);
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
	
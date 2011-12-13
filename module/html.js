	
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
	
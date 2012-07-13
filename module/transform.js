	
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
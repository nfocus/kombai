	
	// dragable module;
	(function() {
	
		var f = window[F_NAME],
			copy = f.callFunction('copy'),
			assert = f.callFunction('assert'),
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;

		
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
		
		var html = {
			setDragable: function(config) {
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
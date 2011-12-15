	
	// dragable module;
	(function() {
	
		var f = window[F_NAME],
			copy = f.callFunction('copy'),
			assert = f.callFunction('assert'),
			currentWindow = f.getWindow(),
			currentDocument = currentWindow.document;

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
				this.each(function() {
						var ADN = this;
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
			wipe: function(config) {
				this.each(function() {
					var ADN = this;
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
		
		f(html).addTo("html");
	})();
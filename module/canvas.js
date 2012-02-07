
	 
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
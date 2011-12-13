
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
		f(publicity).createModule("transition");
	})();
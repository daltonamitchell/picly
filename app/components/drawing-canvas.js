import Ember from "ember";

export default Ember.Component.extend({
	actions: {
		resizeCanvas: function() {
			// Set up temporary canvas
			var canvas = this.get('canvas');
			var tempCanvas = $(document.createElement('canvas'))[0];
			var tempContext = tempCanvas.getContext('2d');
			tempCanvas.width = canvas.width;
			tempCanvas.height = canvas.height;

			// Copy to temporary canvas
			tempContext.drawImage(canvas, 0, 0);

			// Resize original canvas
			canvas.width = window.innerWidth * 0.9;
			canvas.height = window.innerHeight * 0.9;

			// Copy back to resized canvas
			canvas.getContext('2d')
					.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);

			// Cleanup temp items
			tempContext = null;
			tempCanvas.remove();
		},
		handleMouseMove: function(e) {
			if (this.get('isPainting')) {
				this.send('addClick', e.offsetX, e.offsetY, true);
				this.send('redraw');
			}
		},
		handleMouseDown: function(e) {
			this.set('isPainting', true);
			this.send('addClick', e.offsetX, e.offsetY);
			this.send('redraw');
		},

		handleStart: function(e) {
			e.preventDefault();

			var canvas = this.get('canvas');
			var context = canvas.getContext("2d");
			var touches = e.changedTouches;
			var ongoingTouches = this.get('ongoingTouches');

			for (var i = 0; i < touches.length; i++) {
				ongoingTouches.push( this._copyTouch(touches[i]) );
				context.beginPath();
				context.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
				context.fillStyle = this.get('STROKESTYLE');
				context.fill();
			}
		},
		handleEnd: function(e) {
			e.preventDefault();
			var canvas = this.get('canvas');
			var context = canvas.getContext("2d");
			var touches = e.changedTouches;
			var ongoingTouches = this.get('ongoingTouches');

			for (var i = 0; i < touches.length; i++) {
				var index = this._ongoingTouchIndexById(touches[i].identifier);

				if (index >= 0) {
					context.lineWidth = this.get('LINEWIDTH');
					context.fillStyle = this.get('STROKESTYLE');
					context.strokeStyle = this.get('STROKESTYLE');
					context.lineJoin = this.get('LINEJOIN');
					context.lineCap = this.get('LINECAP');

					context.beginPath();
					context.moveTo(ongoingTouches[index].pageX, ongoingTouches[index].pageY);
					context.lineTo(touches[i].pageX, touches[i].pageY);
					context.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);  // and a square at the end
					ongoingTouches.splice(index, 1);  // remove it; we're done
					context.drawImage(canvas, 0, 0);
				} else {
					console.log("can't figure out which touch to end");
				}
			}
		},
		handleMove: function(e) {
			e.preventDefault();
			var canvas = this.get('canvas');
			var context = canvas.getContext("2d");
			var touches = e.changedTouches;
			var ongoingTouches = this.get('ongoingTouches');

			for (var i = 0; i < touches.length; i++) {
				var index = this._ongoingTouchIndexById(touches[i].identifier);

				if (index >= 0) {
					context.beginPath();
					context.moveTo(ongoingTouches[index].pageX, ongoingTouches[index].pageY);
					context.lineTo(touches[i].pageX, touches[i].pageY);
					context.lineWidth = this.get('LINEWIDTH');
					context.strokeStyle = this.get('STROKESTYLE');
					context.stroke();
					ongoingTouches.splice(index, 1, this._copyTouch(touches[i]));  // swap in the new touch record
				} else {
					console.log("can't figure out which touch to continue");
				}
			}
		},
		handleCancel: function(e) {
			e.preventDefault();
			var touches = e.changedTouches;
			for (var i = 0; i < touches.length; i++) {
				this.get('ongoingTouches').splice(i, 1);  // remove it; we're done
			}
		},

		addClick: function(x, y, dragging) {
			this.get('clickX').push(x);
			this.get('clickY').push(y);
			this.get('clickDrag').push(dragging);
			this.get('clickColor').push( this.get('STROKESTYLE') );
			this.get('clickWeight').push( this.get('LINEWIDTH') );
		},
		redraw: function() {
			var canvas = this.get('canvas');
			var context = canvas.getContext("2d");

			// Create a temp copy
			var tempCanvas = $(document.createElement('canvas'))[0];
			tempCanvas.width = canvas.width;
			tempCanvas.height = canvas.height;
			var tempContext = tempCanvas.getContext('2d');

			// Get click values
			var clickX = this.get('clickX');
			var clickY = this.get('clickY');
			var clickDrag = this.get('clickDrag');
			var clickColor = this.get('clickColor');
			var clickWeight = this.get('clickWeight');

			// Loop through clicks and redraw lines
			for(var i=0; i < clickX.length; i++) {		
				tempContext.beginPath();
				if (clickDrag[i] && i) {
					tempContext.moveTo(clickX[i-1], clickY[i-1]);
				} else {
					tempContext.moveTo(clickX[i]-1, clickY[i]);
				}
				tempContext.lineTo(clickX[i], clickY[i]);
				tempContext.closePath();
				tempContext.strokeStyle = clickColor[i];
				tempContext.lineWidth = clickWeight[i];
				tempContext.stroke();
			}

			// Redraw the main canvas
			context.drawImage(tempCanvas, 0, 0);

			// Clean up temp data
			tempContext = null;
			tempCanvas.remove();
		},
		stopPainting: function() {
			this.set('isPainting', false);
		}
	},

	// Track mouse movement on canvas
	mouseMove: function(e) {
		this.send('handleMouseMove', e);
	},
	mouseDown: function(e) {
		this.send('handleMouseDown', e);
	},
	mouseUp: function() {
		this.send('stopPainting');
	},
	mouseLeave: function() {
		this.send('stopPainting');
	},

	// Track touch events on canvas
	touchStart: function(e) {
		this.send('handleStart', e.originalEvent);
	},
	touchMove: function(e) {
		this.send('handleMove', e.originalEvent);
	},
	touchEnd: function(e) {
		this.send('handleEnd', e.originalEvent);
	},
	touchCancel: function(e) {
		this.send('handleCancel', e.originalEvent);
	},
	touchLeave: function(e) {
		this.send('handleEnd', e.originalEvent);
	},

	// Component settings
	tagName: 'canvas',
	width: 500,
	height: 300,
	attributeBindings: ['width', 'height'],
	classNames: ['shadowed'],

	// Setup Canvas
	canvasWidth: 500,
	clickX: [],
	clickY: [],
	clickDrag: [],
	clickColor: [],
	clickWeight: [],
	isPainting: false,
	ongoingTouches: [],

	// Setup drawing properties
	STROKESTYLE: '#333',
	LINEJOIN: 'round',
	LINECAP: 'round',
	LINEWIDTH: 10,

	// Bind canvas
	canvas: Ember.computed.alias('element'),

	didInsertElement: function() {
		var self = this;

		// Make sure canvas resizes with window resize
		$(window).resize(function() {
			self.send('resizeCanvas');
		});

		// Make sure canvas resizes with orientation change
		$(window).on('orientationchange', function() {
			self.send('resizeCanvas');
		});

		// Expand to current screen size to start
		this.send('resizeCanvas');
	},

	// Additional functions needed for various calculations
	_ongoingTouchIndexById: function(idToFind) {
		var touches = this.get('ongoingTouches');
		for (var i = 0; i < touches.length; i++) {
			var id = touches[i].identifier;

			if (id === idToFind) {
				return i;
			}
		}
		return -1;    // not found
	},
	_copyTouch: function(touch) {
		return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
	},

});
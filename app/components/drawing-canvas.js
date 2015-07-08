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

			this.send('drawImage');
		},
		handleMouseMove: function(e) {
			if (this.get('isPainting')) {
				this.send('addPoint', e.offsetX, e.offsetY, true);
				this.send('redraw');
			}
		},
		handleMouseDown: function(e) {
			this.set('isPainting', true);
			this.send('addPoint', e.offsetX, e.offsetY, false);
			this.send('redraw');
		},

		handleTouchStart: function(e) {
			this.set('isPainting', true);
			this.send('addPoint', e.targetTouches[0].clientX, e.targetTouches[0].clientY, false);
			this.send('redraw');
		},
		handleTouchMove: function(e) {
			if (this.get('isPainting')) {
				this.send('addPoint', e.targetTouches[0].clientX, e.targetTouches[0].clientY, true);
				this.send('redraw');
			}
		},

		addPoint: function(x, y, dragging) {
			this.get('points').push({
				x: x,
				y: y,
				dragging: dragging,
				color: this.get('STROKESTYLE'),
				weight: this.get('LINEWIDTH')
			});
		},
		redraw: function() {
			var canvas = this.get('canvas');
			var context = canvas.getContext("2d");

			context.clearRect(0, 0, canvas.width, canvas.height);

			// Create a temp copy
			var tempCanvas = $(document.createElement('canvas'))[0];
			tempCanvas.width = canvas.width;
			tempCanvas.height = canvas.height;
			var tempContext = tempCanvas.getContext('2d');

			// Get click values
			var points = this.get('points');

			// Loop through clicks and redraw lines
			for (var i=0; i < points.length; i++) {		
				tempContext.beginPath();
				if (points[i].dragging && i) {
					tempContext.moveTo(points[i-1].x, points[i-1].y);
				} else {
					tempContext.moveTo(points[i].x, points[i].y);
				}
				tempContext.lineTo(points[i].x, points[i].y);
				tempContext.closePath();
				tempContext.strokeStyle = points[i].color;
				tempContext.lineWidth = points[i].weight;
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
		},

		// Save the image object to be drawn on the canvas
		saveImage: function(image) {
			this.set('image', image);
			this.send('drawImage');
		},

		// Draw the image on the canvas
		drawImage: function() {
			if ( this.get('image') ) {
				var image = this.get('image');
				var canvas = this.get('canvas');
				var context = canvas.getContext("2d");
				var tempCanvas = $(document.createElement('canvas'))[0];
				var tempContext = tempCanvas.getContext('2d');
				tempCanvas.width = canvas.width;
				tempCanvas.height = canvas.height;

				tempContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
				context.drawImage(tempCanvas, 0, 0);

				tempContext = null;
				tempCanvas.remove();

				this.send('redraw');
			}
		},

		clearCanvas: function() {
			var canvas = this.get('canvas');
			var context = canvas.getContext('2d');

			// Clear the canvas surface
			context.clearRect(0, 0, canvas.width, canvas.height);

			// Clear the image
			this.set('image', null);

			// Clear all stored drawing data
			this.set('points', []);
		},

		// Set a new stroke weight
		changeStrokeWeight: function(value) {
			this.set('LINEWIDTH', value);
		},

		// Change the stroke color
		changeColor: function(color) {
			this.set('STROKESTYLE', color);
		},
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
		this.send('handleTouchStart', e.originalEvent);
	},
	touchMove: function(e) {
		this.send('handleTouchMove', e.originalEvent);
	},
	touchEnd: function() {
		this.send('stopPainting');
	},
	touchCancel: function() {
		this.send('stopPainting');
	},
	touchLeave: function() {
		this.send('stopPainting');
	},

	// Component settings
	tagName: 'canvas',
	width: 500,
	height: 300,
	attributeBindings: ['width', 'height'],
	classNames: ['shadowed'],

	// Setup drawing properties
	points: [],
	isPainting: false,
	STROKESTYLE: '#333',
	LINEJOIN: 'round',
	LINECAP: 'round',
	LINEWIDTH: 10,

	pointsChanged: function() {
		console.log( this.get('points') );
	}.observes('points'),

	// Bind canvas
	canvas: Ember.computed.alias('element'),

	didInsertElement: function() {
		var self = this;

		// Register this component so it can interact with the controller and canvas
		this.set('registered-as', this);

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
});
import Ember from "ember";

export default Ember.Component.extend({
	actions: {
		// Import file and add to canvas
		handleFiles: function(e) {
			var file = e[0];
			var imageType = /^image\//;
			var self = this;

			if (!imageType.test(file.type)) {
				return false;
			}

			var reader = new FileReader();
			reader.onload = function(event) {
				var image = new Image();
				image.src = event.target.result;
				image.onload = self.send('drawImage', image);
			};
			reader.readAsDataURL(file);
			return false;
		},

		// Draw the image on the canvas
		drawImage: function(image) {
			var canvas = $("canvas")[0];
			var context = canvas.getContext("2d");
			var tempCanvas = $(document.createElement('canvas'))[0];
			var tempContext = tempCanvas.getContext('2d');
			tempCanvas.width = canvas.width;
			tempCanvas.height = canvas.height;

			tempContext.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
			context.drawImage(tempCanvas, 0, 0);

			tempContext = null;
			tempCanvas.remove();
		},

		// Set a new stroke weight
		changeStrokeWeight: function(value) {
			LINEWIDTH = value;
		},

		// Change the stroke color
		changeColor: function(color) {
			STROKESTYLE = color;
		},

		// Start over with a clean slate
		clearCanvas: function() {
			var canvas = $("canvas")[0];
			var context = canvas.getContext('2d');

			context.clearRect(0, 0, canvas.width, canvas.height)
		},

		// Save the image and display the gallery
		done: function() {
			// Get the current canvas
			var canvas = $("canvas")[0];
			var context = canvas.getContext('2d');

			// Get a username
			name = prompt('What\'s your name?');

			// Save to image file
			image = canvas.toDataURL('image/png');

			// Format data for transport
			var json = {
				image: image,
				name: name
			}

			// Post image to Couch
			$.ajax({
				method: 'POST',
				url: 'api/json.php',
				data: {data: JSON.stringify(json)}
			})
			.done(function( response ) {
				window.location.replace('gallery.html');
			});
		},

		// Toggles display of the paint options menu
		togglePaintOptions: function() {
			if ( $('#paint-options').is(':visible') ) {
				$('#paint-options').css({
					'display': 'none',
					'right': '0'
				});
			} else {
				$('#paint-options').css({
					'display': 'block',
					'right': '60px'
				});
			}
		}
	},

	tagName: 'ul',
	classNames: ['tools', 'shadowed'],

	didInsertElement: function() {
		var self = this;

		// Handle files when file-input is triggered
		$('#file-input').change(function(e) {
			e.preventDefault();
			self.send('handleFiles', e.target.files);
		});

		// Change color when appropriate square is clicked
		$('.color').click(function(e) {
			e.preventDefault();
			var color = $(e.target).css('background-color');
			self.send('changeColor', color);
			$('.fa-paint-brush').css('color', color);
		});

		// Change stroke weight when button is clicked
		$('.line-weight').click(function(e) {
			e.preventDefault();
			var weight = $(e.target).css('height').replace('px', '');
			self.send('changeStrokeWeight', weight);
		});

		// Open file uploader when camera button is clicked
		$('#upload button').on('click', function (e) {
			if ( $('#file-input') ) {
				$('#file-input').click();
			}
			e.preventDefault(); // prevent navigation to "#"
		});

		// Open paint settings menu
		$('#paint-brush').click(function(e) {
			e.preventDefault();
			self.send('togglePaintOptions');
		});

		// Kill your baby
		$('#trash').click(function(e) {
			e.preventDefault();
			var go = confirm('Are you sure you want to clear the canvas?');
			if (go) self.send('clearCanvas');
		});

		// You're done!
		$('#done').click(function(e) {
			e.preventDefault();
			var go = confirm('Are you done?');
			if (go) self.send('done');
		});
	},
});
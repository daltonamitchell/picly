import Ember from "ember";

export default Ember.Component.extend({
	// Register this component so it can interact with the controller and canvas
	_register: function() {
		this.set('registered-as', this);
	}.on('init'),

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
			reader.onloadend = function(event) {
				var image = new Image();
				image.src = reader.result;
				image.onload = self.get('objectController').get('canvas').send('saveImage', image); // Save the image so it can be used later
			};
			reader.readAsDataURL(file);
			return false;
		},

		// Toggles display of the paint options menu
		togglePaintOptions: function() {
			var currentVisibility = this.get('paintOptionsAreVisible');
			this.set('paintOptionsAreVisible', !currentVisibility);
		}
	},

	// Close paint options while painting
	isPainting: Ember.computed.alias('objectController.canvas.isPainting'),
	paintOptionsAreVisible: false,
	hasBegunPainting: function() {
		if ( this.get('isPainting') && this.get('paintOptionsAreVisible') ) {
			this.send('togglePaintOptions');
		}
	}.observes('isPainting'),

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
			self.get('objectController').get('canvas').send('changeColor', color);
			$('.fa-paint-brush').css('color', color);
		});

		// Change stroke weight when button is clicked
		$('.line-weight').click(function(e) {
			e.preventDefault();
			var weight = $(e.target).css('height').replace('px', '');
			self.get('objectController').get('canvas').send('changeStrokeWeight', weight);
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
			if (go) self.get('objectController').get('canvas').send('clearCanvas');
		});

		// You're done!
		$('#done').click(function(e) {
			e.preventDefault();
			var go = confirm('Are you done?');
			if (go) {
				self.controller.done();
			}
		});
	},
});
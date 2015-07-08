import Ember from "ember";

export default Ember.Controller.extend({
	actions: {
		// Save the image and display the gallery
		done: function() {
			// Get the current canvas
			var canvas = $("canvas")[0];
	
			// Get a username
			var name = prompt('What\'s your name?');

			// Save to image file
			var image = canvas.toDataURL('image/png');

			// Format data for transport
			var json = {
				image: image,
				name: name
			};

			// Post image to Couch
			$.ajax({
				method: 'POST',
				url: 'api/json.php',
				data: {data: JSON.stringify(json)}
			})
			.done(function() {
				window.location.replace('gallery.html');
			});
		},
	},

	canvas: null,
	canvasTools: null,
});
$(document).ready(function() {
	var html;

	// Load docs from Couch
	var url = 'api/json.php';
	$.getJSON(url, function( data ) {
		$.each(data.entries.reverse(), function(key, value) {
			html = "<div class='user-image'><img src='" + value.image + "'><label>Submitted by: " + value.name + "</label></div>";
			$('#gallery').append(html);
		});
	});
});
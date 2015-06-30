$(document).ready(function() {
	var html;

	// Load docs from Couch
	var url = 'https://daltonamitchell.iriscouch.com/pictures/_design/pictures/_view/everything';
	$.getJSON(url, function( data ) {
		$.each(data.rows.reverse(), function(key, val) {
			html = "<div class='user-image'><img src='" + val.value.image + "'><label>Submitted by: " + val.value.name + "</label></div>";

			$('#gallery').append(html);
		});
	});
});
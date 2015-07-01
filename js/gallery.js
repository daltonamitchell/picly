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

// Trigger loading message while waiting for AJAX to resolve
var $loading = $('.loading').hide();
$(document)
	.ajaxStart(function() {
		$loading.show();
	})
	.ajaxStop(function() {
		$loading.hide();
	});
<?php

$data = isset( $_REQUEST['data'] ) ?
	$_REQUEST['data'] :
	null;

if ( $data ) {
	// Convert to PHP object
	$data = json_decode($data);

	// If an image is passed in, save a new image submission
	if ( $data->image ) {
		// Get current data
		$current = getCurrentData();

		// Add this new data
		array_push($current->entries, $data);

		// Save the new data
		$file = fopen('data.json', 'w');
		fwrite($file, json_encode($current));
		fclose($file);

		die( json_encode(['message' => 'Data saved successfully!']) );
	}
}

// Otherwise just return the current contents of the file
$everything = getCurrentData();
die( json_encode($everything) );

// Grabs the current contents of the "database"
function getCurrentData()
{
	$file = file_get_contents('data.json');
	return json_decode($file);
}
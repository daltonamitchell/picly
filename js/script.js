// Setup import button
init();

// Setup Canvas
var canvasWidth;
var clickX = [];
var clickY = [];
var clickDrag = [];
var clickColor = [];
var clickWeight = [];
var paint;
var ongoingTouches = [];

// Setup drawing properties
var STROKESTYLE = '#333';
const LINEJOIN = 'round';
const LINECAP = 'round'
var LINEWIDTH = 10;

// Bind event to screen size changes
function init() {
	canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		ctx = canvas.getContext('2d');

		// Make sure canvas resizes with window resize
		window.addEventListener('resize', resizeCanvas, false);

		// Make sure canvas resizes with orientation change
		window.addEventListener('orientationchange', resizeCanvas, false);

		// Expand to current screen size to start
		resizeCanvas();

		// Track mouse movement on canvas
		canvas.addEventListener('mousemove', function(e) {
			if (paint) {
				addClick(e.offsetX, e.offsetY, true);
				redraw();
			}
		});

		canvas.addEventListener('mousedown', function(e) {
		  var mouseX = e.offsetX;
		  var mouseY = e.offsetY;
				
		  paint = true;
		  addClick(mouseX, mouseY);
		  redraw();
		});

		canvas.addEventListener('mouseup', function(e) {
		  paint = false;
		});

		canvas.addEventListener('mouseleave', function(e) {
		  paint = false;
		});

	  canvas.addEventListener("touchstart", handleStart, false);
	  canvas.addEventListener("touchend", handleEnd, false);
	  canvas.addEventListener("touchcancel", handleCancel, false);
	  canvas.addEventListener("touchleave", handleEnd, false);
	  canvas.addEventListener("touchmove", handleMove, false);

    // Change color when appropriate square is clicked
    $('.color').click(function(e) {
      e.preventDefault();
      var color = $(e.target).css('background-color');
      changeColor( color );
      $('.fa-paint-brush').css('color', color);
    });

    // Change stroke weight when button is clicked
    $('.line-weight').click(function(e) {
      e.preventDefault();
      var weight = $(e.target).css('height').replace('px', '');
      changeStrokeWeight( weight );
    });

    // Open file uploader when camera button is clicked
    $('#upload button').on('click', function (e) {
      if ( $('#file-input') ) {
        $('#file-input').click();
      }
      e.preventDefault(); // prevent navigation to "#"
    });

    $('#paint-brush').click(function(e) {
      e.preventDefault();
      togglePaintOptions();
    });

    $('#trash').click(function(e) {
      e.preventDefault();

      var go = confirm('Are you sure you want to clear the canvas?');

      if (go) clearCanvas();
    });

    $('#done').click(function(e) {
      e.preventDefault();

      var go = confirm('Are you done?');

      if (go) done();
    });
	}
}

// Set a new stroke weight
function changeStrokeWeight(value) {
  LINEWIDTH = value;
}

// Change the stroke color
function changeColor(color) {
  STROKESTYLE = color;
}

// Start over with a clean slate
function clearCanvas() {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height)
}

// Save the image and display the gallery
function done() {
  // Get the current canvas
  var canvas = document.getElementById('canvas');
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
}

// Toggles display of the paint options menu
function togglePaintOptions() {
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

// Change canvas width / height on resize
function resizeCanvas() {
  // Set up temporary canvas
  var temp = makeTempCanvas(canvas);

  // Copy to temporary canvas
  temp.context.drawImage(canvas, 0, 0);
 
  // Resize original canvas
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
 
  // Copy back to resized canvas
  ctx = canvas.getContext('2d');
  ctx.drawImage(temp.canvas, 0, 0, temp.canvas.width, temp.canvas.height, 0, 0, canvas.width, canvas.height);
}

// Import file and add to canvas
function handleFiles(e) {
	var file = e[0];
	var imageType = /^image\//;

	if (!imageType.test(file.type)) {
		return false;
	}

	var reader = new FileReader();
	reader.onload = function(event) {
		var image = new Image();
		image.src = event.target.result;
		image.onload = drawImage(image);
	};
	reader.readAsDataURL(file);
	return false;
}

// Draw the image on the canvas
function drawImage(image) {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var temp = makeTempCanvas(canvas);

	temp.context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height * image.height / image.width);
	context.drawImage(temp.canvas, 0, 0);
}

// Makes a temp canvas to hold the current canvas state
function makeTempCanvas(canvas) {
  var tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCtx = tempCanvas.getContext('2d');

  return {canvas: tempCanvas, context: tempCtx}; 
}

function colorForTouch(touch) {
  var r = touch.identifier % 16;
  var g = Math.floor(touch.identifier / 3) % 16;
  var b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16); // make it a hex digit
  g = g.toString(16); // make it a hex digit
  b = b.toString(16); // make it a hex digit
  var color = "#" + r + g + b;

  return color;
}

function handleCancel(evt) {
  evt.preventDefault();

  var touches = evt.changedTouches;
  
  for (var i = 0; i < touches.length; i++) {
    ongoingTouches.splice(i, 1);  // remove it; we're done
  }
}

function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;
    
    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

function copyTouch(touch) {
  return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function handleStart(evt) {
  evt.preventDefault();

  var el = document.getElementById('canvas');
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;
        
  for (var i = 0; i < touches.length; i++) {

    ongoingTouches.push(copyTouch(touches[i]));
    var color = colorForTouch(touches[i]);
    ctx.beginPath();
    ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
    ctx.fillStyle = STROKESTYLE;
    ctx.fill();

  }
}

function handleMove(evt) {
  evt.preventDefault();
  var el = document.getElementById('canvas');
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var color = colorForTouch(touches[i]);
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {

      ctx.beginPath();

      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);

      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.lineWidth = LINEWIDTH;
      ctx.strokeStyle = STROKESTYLE;
      ctx.stroke();

      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record

    } else {
      console.log("can't figure out which touch to continue");
    }
  }
}

function handleEnd(evt) {
  evt.preventDefault();

  var el = document.getElementById('canvas');
  var ctx = el.getContext("2d");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var color = colorForTouch(touches[i]);
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      ctx.lineWidth = LINEWIDTH;
      ctx.fillStyle = STROKESTYLE;
      ctx.strokeStyle = STROKESTYLE;
      ctx.lineJoin = LINEJOIN;
      ctx.lineCap = LINECAP;

      ctx.beginPath();
      ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
      ctx.lineTo(touches[i].pageX, touches[i].pageY);
      ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);  // and a square at the end
      ongoingTouches.splice(idx, 1);  // remove it; we're done
      ctx.drawImage(el, 0, 0);
    } else {
      console.log("can't figure out which touch to end");
    }
  }
}

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
  clickColor.push(STROKESTYLE);
  clickWeight.push(LINEWIDTH);
}

// Redraws the canvas with new line data
function redraw() {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext("2d");

  var tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  var tempContext = tempCanvas.getContext('2d');

  tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
  
  tempContext.strokeStyle = STROKESTYLE;
  tempContext.lineJoin = LINEJOIN;
  tempContext.lineCap = LINECAP;
  tempContext.lineWidth = LINEWIDTH;
			
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
 
  context.drawImage(tempCanvas, 0, 0);
}
"use strict";

/* Event dispatcher. */

document.onkeydown = function (e) {
	// ... is this necessary in the browsers we're supporting?
	e = e || window.event;
	
	var left_arrow_key = 37;
	var up_arrow_key = 38;
	var right_arrow_key = 39;
	var down_arrow_key = 40;
		
	var delta = 20;

	var position = viewstate.position.map(viewstate.scaler);

	if (e.keyCode == left_arrow_key) {
		position[0] += delta;
	} else if (e.keyCode == up_arrow_key) {
		position[1] += delta;
	} else if (e.keyCode == right_arrow_key) {
		position[0] -= delta;
	} else if (e.keyCode == down_arrow_key) {
		position[1] -= delta;
	}

	viewstate.moveTo( position.map(viewstate.scaler.invert) );
}


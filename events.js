"use strict";

/* Event dispatcher. */

/* Keys */
document.onkeydown = function (e) {
	// ... is this necessary in the browsers we're supporting?
	e = e || window.event;
	
	var left_arrow_key = 37;
	var up_arrow_key = 38;
	var right_arrow_key = 39;
	var down_arrow_key = 40;
		
	var delta = 20;

	var position = viewstate.position;
	var move = true;

	if (e.keyCode == left_arrow_key) {
		position[0] -= delta;
	} else if (e.keyCode == up_arrow_key) {
		position[1] -= delta;
	} else if (e.keyCode == right_arrow_key) {
		position[0] += delta;
	} else if (e.keyCode == down_arrow_key) {
		position[1] += delta;
	} else {
		move = false;
	}

	if (move) viewstate.moveTo( position );
}

/* Mouse wheel */
// from http://www.adomas.org/javascript-mouse-wheel/
function scrollZoom(delta) {
    if (delta < 0) {
	viewstate.zoom(10/9);
    } else {
	viewstate.zoom(9/10);
    }
}

function wheel(event){
	var delta = 0;
	if (!event) event = window.event;
	if (event.wheelDelta) {
		delta = event.wheelDelta/120; 
	} else if (event.detail) {
		delta = -event.detail/3;
	}
	if (delta)
		scrollZoom(delta);
        if (event.preventDefault)
                event.preventDefault();
        event.returnValue = false;
}

if (window.addEventListener)
	window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;

/* Mouse dragging */

document.onmousedown = function ( e ) {
	if (viewstate.mouseData.inUI || viewstate.mouseData.inDropState) return;
    if (viewstate.mouseData.isInObjDrag) {
		// events are getting carelessly passed through; just ignore.
		return true;
    }

    // make sure this is a left click, otherwise pass it through
    if (e.button != 0) return true;

    viewstate.mouseData.isDrag = true;
    viewstate.mouseData.startX = e.clientX;
    viewstate.mouseData.startY = e.clientY;

}

document.onmousemove = function ( e ) {
	if (viewstate.mouseData.inUI) return;
    if (viewstate.mouseData.isInObjDrag) {
	//hmm, the mouse has escaped.
	viewstate.mouseData.objMoveHandler(e);
    } else if (viewstate.mouseData.isDrag) {
	var moveX = -(e.clientX) + (viewstate.mouseData.startX);
	var moveY = -(e.clientY) + (viewstate.mouseData.startY);

	viewstate.move( (moveX), (moveY));

	viewstate.mouseData.startX = e.clientX;
	viewstate.mouseData.startY = e.clientY;
    }
}

document.onmouseup = function ( e ) {
	if (viewstate.mouseData.inUI) return;

	if (viewstate.mouseData.inDropState) {
		viewstate.finishAddingView( [ e.clientX, e.clientY ] );
	} else if (viewstate.mouseData.isInObjDrag) {
		//hmm, the mouse has escaped.
		viewstate.mouseData.objUpHandler(e);
    }
    viewstate.mouseData.isDrag = false;
}

/* Resize */
var onResizeTimer;
window.onresize = function () {
    try { 
	window.clearTimeout(onResizeTimer); 
    } catch (err) {}
    
    onResizeTimer = window.setTimeout( function() {
	viewstate.calculateSize(tril);
	viewstate.children().map( function(child) { child.render() } );
    }, 50 );
}
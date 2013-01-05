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
function scrollZoom(delta, e) {
    // using clientX is wrong, and will break horribly when
    // the svg doesn't take up most of the page.
    // daniel: convert everything into d3 events that attach just to the svg?
    // and if we can't have an event on an svg, make viewstate hold a div.
    if (delta < 0) {
	viewstate.zoom(10/9, [e.clientX, e.clientY]);
    } else {
	viewstate.zoom(9/10, [e.clientX, e.clientY]);
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
	    scrollZoom(delta, event);
        if (event.preventDefault)
                event.preventDefault();
        event.returnValue = false;
}

if (window.addEventListener)
	window.addEventListener('DOMMouseScroll', wheel, false);
window.onmousewheel = document.onmousewheel = wheel;


document.onmouseup = function ( e ) {
    e.stopPropagation();
    
    if (viewstate.mouseData.inDropState) {
	viewstate.finishAddingView( [ e.clientX, e.clientY ] );
    }
};

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

/** Initalise the document when we start. */
jQuery('document').ready(function() {
    var entitySel = jQuery('#entitySel');
    jQuery.each(entities, function(index) {
        entitySel.append(
            jQuery('<option />').val( index ).text( entities[index].name )
        );
    });
		
    window.viewstate = new ViewState(d3.select("body").append("svg"));

    var vo = new ViewObj( openbudget, viewstate, [0,0] );
    vo.period('2011-12');
    vo.render();
});

/** Handler for the period selector
    @param sel The <select> tag.
*/
window['periodChange'] = function(sel) {
    var chosenoption=sel.options[sel.selectedIndex];
    viewstate.children().map(function(obj) {obj.period(chosenoption.value);});
    viewstate.children().map(function(obj) {obj.render();});
};

/** Handler for add entity button */
window['addEntity'] = function() {
    var entitySel = jQuery('#entitySel')[0];
    viewstate.beginAddingView( entities[entitySel.selectedIndex] );
};
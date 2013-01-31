'use strict';

/** Event dispatcher. */

/** custom onkeydown
 * @event
 * @param {Event} e Set to window.event if null
 */
document.onkeydown = function(e) {
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
    if (move) viewstate.moveTo(position);
};


/** Custom onresize 
 * @event
*/
var onResizeTimer;
window.onresize = function() {
    try {
        window.clearTimeout(onResizeTimer);
    } catch (err) {}

    onResizeTimer = window.setTimeout(function() {
        viewstate.calculateSize(tril);
        viewstate.children().map(function(child) { child.render() });
    }, 50);
};

/** Initalise the document when we start. 
 * @event
 */
jQuery('document').ready(function() {
    var entitySel = jQuery('#entitySel');
    jQuery.each(entities, function(index) {
        entitySel.append(
            jQuery('<option />').val(index).text(entities[index].name)
        );
    });

    window.viewstate = new ViewState(d3.select('body').append('svg'));

    var vo = new ViewObj(openbudget, viewstate, [0, 0]);
    vo.period('2011-12');
    vo.render();
});

/** Handler for the period selector
 * @event
 * @param {Object} sel The <select> tag.
 */
window['periodChange'] = function(sel) {
    var chosenoption = sel.options[sel.selectedIndex];
    viewstate.children().map(function(obj) {obj.period(chosenoption.value);});
    viewstate.children().map(function(obj) {obj.render();});
};

/** Handler for add entity button 
 * @event
 */
window['addEntity'] = function() {
    var entitySel = jQuery('#entitySel')[0];
    viewstate.beginAddingView(entities[entitySel.selectedIndex]);
};

'use strict';

/** Event dispatcher. */

/** custom onkeydown
 * @param {Event} e The event. Set to window.event if null.
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

/** Timer to prevent resizing from firing expensive renders() too quickly.
*/
var onResizeTimer;

/** Recalibrate the size and re-render when the window is resized
*/
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
 */
jQuery('document').ready(function() {

    // wire up a bundle of event handlers
    jQuery('#fitToScreen').on('click', fitToScreen);
    jQuery('#initAddEntity').on('click', initAddEntity);
    jQuery('#addEntity').on('click', addEntity);
    jQuery('#cancelAddEntity').on('click', cancelAddEntity);
    jQuery('#initSaveToDisk').on('click', initSaveToDisk);
    jQuery('#saveToDisk').on('click', saveToDisk);
    jQuery('#cancelSaveToDisk').on('click', cancelSaveToDisk);

    // populate the entity list
    var entitySel = jQuery('#entitySel');
    jQuery.each(entities, function(index) {
        entitySel.append(
            jQuery('<option />').val(index).text(entities[index].name)
        );
    });

    // set up the viewstate and initial view object
    window.viewstate = new ViewState(d3.select('body').append('svg'));
    var vo = new ViewObj(openbudget, viewstate, [0, 0]);
    vo.period('2011-12');
    vo.render();
});

/** Handler for the period selector
 * @param {Object} sel The <select> tag.
 */
window['periodChange'] = function(sel) {
    var chosenoption = sel.options[sel.selectedIndex];
    viewstate.children().map(function(obj) {obj.period(chosenoption.value);});
    viewstate.children().map(function(obj) {obj.render();});
};

/** Fit every viewObj currently in the viewstate on to the screen
 */
function fitToScreen() {
    viewstate.centreViewOn(viewstate);
}

/** Begin the entity selection and adding process.
 */
function initAddEntity() {
    jQuery('#addEntityContainer').removeClass('hidden');
}

/** Actually start adding an entity.
 */
function addEntity() {
    jQuery('#entitySel').prop('disabled', true);
    jQuery('#addEntity').addClass('hidden');
    jQuery('#clickToPlaceTxt').removeClass('hidden');
    var entitySel = jQuery('#entitySel')[0];
    viewstate.beginAddingView(entities[entitySel.selectedIndex]);
}

/** Cancel the entity selection and adding process.
 */
function cancelAddEntity() {
    jQuery('#addEntityContainer').addClass('hidden');
    jQuery('#entitySel').prop('disabled', false);
    jQuery('#addEntity').removeClass('hidden');
    jQuery('#clickToPlaceTxt').addClass('hidden');
    viewstate.cancelAddingView();
}

/** The entity adding process has finished (the user has placed an entity).
 */
function hasPlacedEntity() {
    cancelAddEntity();
}

/** Prepare to save the view as an SVG/PNG. */
function initSaveToDisk() {
    jQuery('#saveToDiskForm').removeClass('hidden');
}

/** Save the view as an SVG/PNG. Currently rather hacky. */
function saveToDisk() {

    function htmlEscape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function serialise(a) {
        var str = '<' + a.tagName;
        for (var x = 0; x < a.attributes.length; x++) {
            if (a.attributes[x].nodeName == 'style' ||
                a.attributes[x].nodeName == 'class') {
                continue;
            }
            str += ' ' + a.attributes[x].nodeName + '="' +
                a.attributes[x].nodeValue + '"';
        }
        var css = window.getComputedStyle(a);
        if (css.getPropertyValue('fill'))
            str += ' fill="' + css.getPropertyValue('fill') + '"';
        if (css.getPropertyValue('stroke'))
            str += ' stroke="' + css.getPropertyValue('stroke') + '"';
        if (css.getPropertyValue('opacity'))
            str += ' opacity="' + css.getPropertyValue('opacity') + '"';
        if (css.getPropertyValue('font-face'))
            str += ' font-face="' + css.getPropertyValue('font-face') + '"';
        if (css.getPropertyValue('font-size'))
            str += ' font-size="' + css.getPropertyValue('font-size') + '"';
        if (css.getPropertyValue('text-anchor'))
            str += ' text-anchor="' + css.getPropertyValue('text-anchor') + '"';

        if (a.tagName == 'svg') {
            str += ' width="' + css.getPropertyValue('width') + '"';
            str += ' height="' + css.getPropertyValue('height') + '"';
            str += ' xmlns="http://www.w3.org/2000/svg"';
            // bg color hack
            str += '><rect width="100%" height="100%" fill="';
            var body = document.getElementsByTagName('body')[0];
            var style = window.getComputedStyle(body);
            str += style.getPropertyValue('background-color');
            str += '"></rect';
        }

        str += '>';
        for (var x = 0; x < a.childElementCount; x++) {
            str += serialise(a.childNodes[x]);
        }
        if (a.tagName == 'text') {
            str += htmlEscape(a.textContent);
        }
        str += '</' + a.tagName + '>';
        return str;
    }


    var xml = serialise(viewstate._svg[0][0]);

    jQuery('input[name=data][type=hidden]').val(xml);
    jQuery('input[name=svgstyle][type=hidden]').val(
        viewstate._svg[0][0].getAttribute('style'));

    // update ui
    cancelSaveToDisk();

    // submit form
    saveToDiskForm.submit();
}

/** Cancel saving the view as an SVG/PNG. */
function cancelSaveToDisk() {
     jQuery('#saveToDiskForm').addClass('hidden');
}

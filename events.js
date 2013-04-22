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
    viewstate.resizeToWindow();
  }, 50);
};

/** Stop mobile browsers scrolling the page. */
document.ontouchmove = function(event){
    event.preventDefault();
}

/** Initalise the document when we start.
 */
jQuery('document').ready(function() {

  // wire up a bundle of event handlers
  jQuery('#fitToScreen').on('click', fitToScreen);
  jQuery('#initAddEntity').on('click', initAddEntity);
  jQuery('#addEntity').on('click', addEntityBtn);
  jQuery('#cancelAddEntity').on('click', cancelAddEntity);
  jQuery('#initSaveToDisk').on('click', initSaveToDisk);
  jQuery('#saveToDisk').on('click', saveToDisk);
  jQuery('#cancelSaveToDisk').on('click', cancelSaveToDisk);
  jQuery('#packingSel').on('change', changePacking);
  jQuery('#enclosingCircles').on('change', enclosingCirclesChange);
  jQuery('#nextPeriodBtn').on('click', nextPeriodBtn);
  jQuery('#prevPeriodBtn').on('click', prevPeriodBtn);
  jQuery('#playBtn').on('click', playBtn);
  jQuery('#stopBtn').on('click', stopBtn);

  // populate the entity list
  var entitySel = jQuery('#entitySel');
  jQuery.each(entities, function(index) {
    entitySel.append(
        jQuery('<option />').val(index).text(entities[index].name)
    );
  });

  // ephemeral upload
  jQuery('#ephemeralUploadForm').on('submit', function(e) {
    e.preventDefault();
    jQuery('#clickToPlaceTxt').text('Processing...');
    jQuery(this).ajaxSubmit({
      success: function(d) {
        if ('error' in d) {
          alert('Error:' + d['error']);
          cancelAddEntity();
        } else {
          //console.log(d);
          var sel = jQuery('#periodSel')[0];
          viewstate.beginAddingView(d, sel.options[
              sel.selectedIndex].value);
        }
      },
      error: function(d) {
        alert('An unknown error occured.');
        cancelAddEntity();
      },
      complete: function() {
        jQuery('#clickToPlaceTxt').text('Click to place');
      }
    });
    addEntityUI();
  });

  // set up the viewstate and initial view object
  window.viewstate = new ViewState(d3.select('body').append('svg'));
  var vo = new ViewObj(openbudget, viewstate, [0, 0]);
  vo.period('2011-12');
  vo.render();
});


/** Handler for the period selector
 * @param {Object} sel The <select> tag.
 * @return {Boolean} undefined if sel out of bounds or false.
 */
window['periodChange'] = function(sel) {
  if (sel.selectedIndex < 0 || sel.selectedIndex >= sel.options.length) {
    return;
  }
  var chosenoption = sel.options[sel.selectedIndex];
  viewstate.children().map(function(obj) {
    obj.period(chosenoption.value);
    obj.reposition(true);
    obj.render(true);
  });
  return false;
};


/** Move on to the next period
 * @return {Boolean} false.
 */
function nextPeriodBtn() {
  var sel = jQuery('#periodSel')[0];
  if (sel.selectedIndex < sel.options.length - 1) {
    sel.selectedIndex++;
    window['periodChange'](sel);
  }
  return false;
}


/** Move to the previous period
 * @return {Boolean} false.
 */
function prevPeriodBtn() {
  var sel = jQuery('#periodSel')[0];
  if (sel.selectedIndex > 0) {
    sel.selectedIndex--;
    window['periodChange'](sel);
  }
  return false;
}


/** Timer for playing */
var playtimer;


/** Start playing through the time-periods
 * @return {Boolean} false.
 */
function playBtn() {
  var sel = jQuery('#periodSel')[0];
  sel.selectedIndex = 0;
  window['periodChange'](sel);
  playtimer = window.setInterval(function() {
    var sel = jQuery('#periodSel')[0];
    //console.log(sel.selectedIndex);
    var nextIndex = sel.selectedIndex + 1;
    if (nextIndex == sel.options.length) {
      stopBtn();
    } else {
      sel.selectedIndex = nextIndex;
    }
    window['periodChange'](sel);
  }, 2000);
  return false;
}


/** Stop playing
 * @return {Boolean} false.
 */
function stopBtn() {
  try {
    window.clearInterval(playtimer);
  } catch (e) {}
  return false;
}


/** Update Period Selector with periods of all extant ViewObjs
 */
function updatePeriodSelector() {
  var periods = viewstate.availablePeriods();
  var sel = jQuery('#periodSel');
  var oldOpt = jQuery('option:selected', sel).val();
  var newOpt;
  var found = false;
  sel.empty();
  for (var x in periods) {
    newOpt = jQuery('<option value="' + periods[x] + '">' + periods[x] +
        '</option>');
    if (oldOpt == periods[x]) newOpt.prop('selected', true);
    sel.append(newOpt);

    if (periods[x] == oldOpt) found = true;
  }
  if (!found) {
    newOpt = jQuery('<option value="' + oldOpt + '" disabled="disabled"' +
                        ' selected="selected">' + oldOpt + '</option>');
    sel.append(newOpt);
  }
}


/** Fit every viewObj currently in the viewstate on to the screen
 * @return {Boolean} false.
 */
function fitToScreen() {
  viewstate.centreViewOn(viewstate);
  return false;
}


/** Begin the entity selection and adding process.
 * @return {Boolean} false.
 */
function initAddEntity() {
  jQuery('#addEntityContainer').removeClass('hidden');
  return false;
}


/** Change the UI to indicate that an entity is being added.
 */
function addEntityUI() {
  jQuery('#entitySel').prop('disabled', true);
  jQuery('#addEntity').addClass('hidden');
  jQuery('#clickToPlaceTxt').removeClass('hidden');
  jQuery('#ephemeralUploadFile').prop('disabled', true);
  jQuery('#ephemeralUploadBtn').prop('disabled', true);
}


/** Actually start adding an entity. (Button)
 * @return {Boolean} false.
 */
function addEntityBtn() {
  addEntityUI();
  var entitySel = jQuery('#entitySel')[0];
  var sel = jQuery('#periodSel')[0];
  viewstate.beginAddingView(entities[entitySel.selectedIndex],
      sel.options[sel.selectedIndex].value);
  return false;
}


/** Cancel the entity selection and adding process.
 * @return {Boolean} false.
 */
function cancelAddEntity() {
  jQuery('#addEntityContainer').addClass('hidden');
  jQuery('#entitySel').prop('disabled', false);
  jQuery('#ephemeralUploadFile').prop('disabled', false);
  jQuery('#ephemeralUploadBtn').prop('disabled', false);
  jQuery('#addEntity').removeClass('hidden');
  jQuery('#clickToPlaceTxt').addClass('hidden');
  viewstate.cancelAddingView();
  return false;
}


/** The entity adding process has finished (the user has placed an entity).
 */
function hasPlacedEntity() {
  cancelAddEntity();
  updatePeriodSelector();
}


/** Prepare to save the view as an SVG/PNG.
 */
function initSaveToDisk() {
  jQuery('#saveToDiskForm').removeClass('hidden');
}


/** Save the view as an SVG/PNG. Currently rather hacky.
 * @return {Boolean} false.
 */
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
    if (css.getPropertyValue('stroke-width'))
      str += ' stroke-width="' + css.getPropertyValue('stroke-width') +
          '"';
    if (css.getPropertyValue('opacity'))
      str += ' opacity="' + css.getPropertyValue('opacity') + '"';
    if (css.getPropertyValue('fill-opacity'))
      str += ' fill-opacity="' + css.getPropertyValue('fill-opacity') +
          '"';
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
  // #17 - don't just use saveToDiskForm.submit(), it breaks in older FF
  jQuery('#saveToDiskForm')[0].submit();
  return false;
}


/** Cancel saving the view as an SVG/PNG.
 * @return {Boolean} false.
 */
function cancelSaveToDisk() {
  jQuery('#saveToDiskForm').addClass('hidden');
  return false;
}


/** Change the packing model
 */
function changePacking() {
  window.packing = jQuery('#packingSel option:selected').val();
  //console.log(window.packing);
  viewstate.children().map(function(child) {
    child.reposition();
    child.render();
  });
}


/** default packing model */
window.packing = 'dendritic';


/** Recalculate and display packing efficiency
 */
function recalcPackingEfficiency() {
  var result = viewstate.children().reduce(function(prev, curr) {
    return prev + packingEfficiency(curr);
  }, 0);
  result = result / viewstate.children().length * 100;
  jQuery('#packingEfficiency').text(result.toFixed(2) + '%');
}


/** default enclosing circles choice */
window.enclosingCircles = true;


/** Handle change in enclosed circles checkbox
 */
function enclosingCirclesChange() {
  window.enclosingCircles = jQuery('#enclosingCircles').prop('checked');
  viewstate.children().map(function(child) {
    child.render();
  });
}

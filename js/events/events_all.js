'use strict';

/** Event dispatcher, for both integrated and standalone setups. */

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

/** Initalise.
    @param {string} svgContainerSelector A selector for the svg container where
                      the SVG will be created. You want '#openeconomy'
                      or 'body'.
    @return {ViewState} The viewstate we just created.
 */
function initOpenEconomy(svgContainerSelector) {

  // wire up a bundle of event handlers
  jQuery('#zoomIn').on('click', zoomIn);
  jQuery('#zoomOut').on('click', zoomOut);
  jQuery('#fitToScreen').on('click', fitToScreen);
  jQuery('#zoomRect').on('click', beginZoomRect);
  jQuery('#periodSel').on('change', periodChange);
  jQuery('#nextPeriodBtn').on('click', nextPeriodBtn);
  jQuery('#prevPeriodBtn').on('click', prevPeriodBtn);
  jQuery('#playBtn').on('click', playBtn);
  jQuery('#stopBtn').on('click', stopBtn);
  jQuery('#toggleInfoBox').on('click', toggleInfoBox);

  // set up the viewstate
  var svg = d3.select(svgContainerSelector).append('svg');

  // stop mobile browsers from scrolling TOE stuff
  svg[0][0].ontouchmove = function(event) {
    event.preventDefault();
  };

  return new ViewState(svg);
}


/** Handler for the period selector
 * @return {Boolean} false.
 */
function periodChange() {
  var sel = jQuery('#periodSel')[0];
  if (sel.selectedIndex < 0 || sel.selectedIndex >= sel.options.length) {
    return false;
  }
  var chosenoption = sel.options[sel.selectedIndex];
  viewstate.children().map(function(obj) {
    obj.period(chosenoption.value);
    obj.reposition(true);
    obj.render(true);
  });
  jQuery('#period').text(chosenoption.value);
  viewstate.updateInfobox();

  // make sure that if we were moving off a disabled period, we can't go back.
  jQuery('#periodSel option:disabled').remove();
  return false;
}


/** Move on to the next period
 * @return {Boolean} false.
 */
function nextPeriodBtn() {
  var sel = jQuery('#periodSel')[0];
  if (sel.selectedIndex < sel.options.length - 1) {
    sel.selectedIndex++;
    periodChange();
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
    periodChange();
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
  periodChange();
  playtimer = window.setInterval(function() {
    var sel = jQuery('#periodSel')[0];
    //console.log(sel.selectedIndex);
    var nextIndex = sel.selectedIndex + 1;
    if (nextIndex == sel.options.length) {
      stopBtn();
    } else {
      sel.selectedIndex = nextIndex;
    }
    periodChange();
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
  jQuery('#period').text('n/a');

  if (!periods.length) return;

  // updating the period selector cannot move us off our current year,
  // so if we can't find (and it exists!) stuff it in and sort it.
  for (var x in periods) {
    if (periods[x] == oldOpt) found = true;
  }
  if (!found && !!oldOpt) {
    periods.push(oldOpt);
    periods.sort();
  }

  // create the options
  for (var x in periods) {
    newOpt = jQuery('<option value="' + periods[x] + '">' + periods[x] +
                    '</option>');
    if (oldOpt == periods[x]) newOpt.prop('selected', true);
    if (oldOpt == periods[x] && !found) newOpt.prop('disabled', true);
    sel.append(newOpt);
  }

  // if we've got no old option to select (we're going from nothing)
  // then select the latest period by default.
  if (!oldOpt) {
    jQuery('#periodSel option:last').prop('selected', true);
  }
  jQuery('#period').text(jQuery('#periodSel option:selected').val());
}


/** Zoom in by a fixed increment.
 *  @return {Boolean} false.
 */
function zoomIn() {
  viewstate.zoom(4 / 3, [viewstate.width / 2, viewstate.height / 2]);
  return false;
}


/** Zoom out by a fixed increment.
 *  @return {Boolean} false.
 */
function zoomOut() {
  viewstate.zoom(3 / 4, [viewstate.width / 2, viewstate.height / 2]);
  return false;
}


/** Fit every viewObj currently in the viewstate on to the screen
 * @return {Boolean} false.
 */
function fitToScreen() {
  viewstate.centreViewOn(viewstate);
  return false;
}


/** Toggle the display of the infobox.
 */
function toggleInfoBox() {
  var displayed = (jQuery('#toggleInfoBox').text() != '+');
  jQuery('#infobox').slideToggle();
  jQuery('#toggleInfoBox').html(displayed ? '+' : '&mdash;');
}


/** Create the zoom-to-rectangle event grabber, start grabbing events */
function beginZoomRect() {
  var zoomGrabber = viewstate._svg.append('rect').classed('zoomGrabber', true)
      .attr('x', 0).attr('y', 0)
      .attr('width', viewstate.width).attr('height', viewstate.height);

  var dragHandler = d3.behavior.drag()
      .on('dragstart', function() {
        viewstate._svg.append('rect').classed('zoomRect', true)
            .attr('x', d3.mouse(this)[0]).attr('y', d3.mouse(this)[1]);
      })
      .on('drag', function() {
        var zr = viewstate._svg.select('rect.zoomRect');
        var width = d3.event.x - zr.attr('x');
        var height = d3.event.y - zr.attr('y');
        if (width < 0) {
          return;
        }
        if (height < 0) {
          return;
        }
        zr.attr('width', width).attr('height', height);
      })
      .on('dragend', function() {
        var zr = viewstate._svg.select('rect.zoomRect');

        var x = zr.attr('x') * 1;
        var y = zr.attr('y') * 1;
        var width = zr.attr('width') * 1;
        var height = zr.attr('height') * 1;

        // keep things out of the right tool box
        var vswidth = viewstate.width - 200;
        var vsheight = viewstate.height;

        if (width > 0 && height > 0) {
          var factor;
          if (width / vswidth > height / vsheight) {
            factor = (viewstate.scaler.invert(vswidth / 2)) /
                viewstate.scaler.invert(width / 2);
          } else {
            factor = (viewstate.scaler.invert(vsheight / 2)) /
                viewstate.scaler.invert(height / 2);
          }
          width = viewstate.scaler(viewstate.scaler.invert(width) * factor);
          height = viewstate.scaler(viewstate.scaler.invert(height) * factor);
          viewstate.move([x, y]);
          viewstate.zoom(factor, [0, 0], true);
          viewstate.move([-(vswidth - width) / 2, -(vsheight - height) / 2]);
        }

        zr.remove();
        zoomGrabber.remove();
      });

  zoomGrabber.call(dragHandler);

}


function getEntity(id, success, complete) {
  if (window.precached_data && id in window.precached_data) {
    success(window.precached_data[id]);
    complete();
  } else {
    jQuery.ajax('/entity.json/' + id, {
      success: success,
      complete: complete
    });
  }
}

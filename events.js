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


/** Stop mobile browsers scrolling the page.
 *  @param {Event} event The event we're stopping.
 */
document.ontouchmove = function(event) {
  event.preventDefault();
};


/** Initalise the document when we start.
 */
jQuery('document').ready(function() {

  // wire up a bundle of event handlers
  jQuery('#zoomIn').on('click', zoomIn);
  jQuery('#zoomOut').on('click', zoomOut);
  jQuery('#fitToScreen').on('click', fitToScreen);
  jQuery('#initAddEntity').on('click', initAddEntity);
  jQuery('#addEntity').on('click', addEntityBtn);
  jQuery('#cancelAddEntity').on('click', cancelAddEntity);
  jQuery('#initSaveToDisk').on('click', initSaveToDisk);
  jQuery('#saveToDisk').on('click', saveToDisk);
  jQuery('#cancelSaveToDisk').on('click', cancelSaveToDisk);
  jQuery('#packingSel').on('change', changePacking);
  jQuery('#periodSel').on('change', periodChange);
  jQuery('#nextPeriodBtn').on('click', nextPeriodBtn);
  jQuery('#prevPeriodBtn').on('click', prevPeriodBtn);
  jQuery('#playBtn').on('click', playBtn);
  jQuery('#stopBtn').on('click', stopBtn);
  jQuery('#toggleInfoBox').on('click', toggleInfoBox);
  jQuery('#togglePacking').on('click', togglePacking);
  jQuery('#share').on('click', share);
  jQuery('#fbbtn').on('click', fbShare);
  jQuery('#closeShareBox').on('click', finishSharing);

  // ephemeral upload
  jQuery('#ephemeralUploadForm').on('submit', function(e) {
    e.preventDefault();
    jQuery('#clickToPlaceTxt').text('Processing...');
    jQuery(this).ajaxSubmit({
      success: function(d) {
        //console.log(d);
        var sel = jQuery('#periodSel')[0];
        viewstate.beginAddingView(d, sel.options[sel.selectedIndex].value);
      },
      error: function(d) {
        var resp = JSON.parse(d.responseText);
        if ('error' in resp) {
          alert('Error: ' + resp['error']);
        } else {
          alert('An unknown error occured.');
        }
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
  if (window['initial_state']) {
    jQuery.ajax('/state.json/' + window['initial_state'], {
      success: function(d) {
        viewstate.importState(d);
      },
      error: function(d) {
        var resp = JSON.parse(d.responseText);
        if ('error' in resp) {
          alert('Error: ' + resp['error']);
        } else {
          alert('An unknown error occured. We\'re very sorry. Try reloading?');
        }
      }
    });
  } else {
    jQuery.ajax('/entity.json/' + window['initial_id'], {
      success: function(d) {
        var vo = new ViewObj(d, viewstate, [0, 0]);
        updatePeriodSelector();
        vo.period(jQuery('#periodSel option:selected').val());
        jQuery('#period').text(jQuery('#periodSel option:selected').val());
        vo.render();
      },
      error: function(d) {
        var resp = JSON.parse(d.responseText);
        if ('error' in resp) {
          alert('Error: ' + resp['error']);
        } else {
          alert('An unknown error occured. We\'re very sorry. Try reloading?');
        }
      }
    });
  }

  // prepare FB
  FB.init({appId: 'YOUR_APP_ID', status: true, cookie: true});
});


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


/** Begin the entity selection and adding process.
 * @return {Boolean} false.
 */
function initAddEntity() {
  cancelSaveToDisk();
  jQuery('#addEntityContainer').removeClass('hidden');
  // don't display the upload on iDevices - they can't sensibly upload
  // spreadsheets (except in like iCab? and possibly others but we
  // don't care - none of Safari, Chrome or Opera Mini on my iPhone
  // support it).
  var is_idevice = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);
  if (is_idevice) {
    jQuery('#ephemeralUploadForm').addClass('hidden');
  }
  return false;
}


/** Change the UI to indicate that an entity has been chosen and is
 * now is being added.
 */
function addEntityUI() {
  jQuery('#entitySel').prop('disabled', true);
  jQuery('#addEntity').addClass('hidden');
  jQuery('#clickToPlaceTxt').removeClass('hidden');
}


/** Actually start adding an entity. (Button)
 * @return {Boolean} false.
 */
function addEntityBtn() {
  addEntityUI();
  var entitySel = jQuery('#entitySel')[0];
  if (jQuery('#ephemeralUploadFile').val()) {
    jQuery('#ephemeralUploadForm').trigger('submit');
    return;
  }
  var id = entitySel.options[entitySel.selectedIndex].value;
  jQuery('#clickToPlaceTxt').text('Loading...');
  jQuery.ajax('/entity.json/' + id, {
    success: function(d) {
      var sel = jQuery('#periodSel')[0];
      // if we have a selected period, set that
      // otherwise load its latest period
      var period;
      if (jQuery('#periodSel option:selected').length) {
        period = jQuery('#periodSel option:selected').val();
      } else {
        if ('aggregates' in d) {
          var periods = d['aggregates'][0]['periods'];
        } else {
          var periods = d['item']['periods'];
        }
        periods = Object.keys(periods);
        periods.sort();
        period = periods[periods.length - 1];
      }
      //console.log(period);
      viewstate.beginAddingView(d, period);
    },
    error: function(d) {
      var resp = JSON.parse(d.responseText);
      if ('error' in resp) {
        alert('Error: ' + resp['error']);
      } else {
        alert('An unknown error occured. We\'re very sorry. Try reloading?');
      }
      cancelAddEntity();
    },
    complete: function() {
      jQuery('#clickToPlaceTxt').text('Click to place');
    }
  });
  return false;
}


/** Cancel the entity selection and adding process.
 * @return {Boolean} false.
 */
function cancelAddEntity() {
  jQuery('#addEntityContainer').addClass('hidden');
  jQuery('#entitySel').prop('disabled', false);
  jQuery('#ephemeralUploadForm').trigger('reset');
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
  cancelAddEntity();
  jQuery('#saveToDiskForm').removeClass('hidden');
}


/** Save the view as an SVG/PNG. Currently rather hacky.
 * @return {Boolean} false.
 */
function saveToDisk() {

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


/** Toggle the display of the infobox.
 */
function toggleInfoBox() {
  var displayed = (jQuery('#toggleInfoBox').text() != '+');
  jQuery('#infobox').slideToggle();
  jQuery('#toggleInfoBox').html(displayed ? '+' : '&mdash;');
}


/** Toggle the display of the packing selector.
 */
function togglePacking() {
  var displayed = (jQuery('#togglePacking').text() != '+');
  jQuery('#packing').slideToggle();
  jQuery('#togglePacking').html(displayed ? '+' : '&mdash;');
}


/** Get ready to share the state socially.
 */
function share() {
  var state = viewstate.exportState();
  if (!state) return;
  jQuery.ajax({
    url: '/save_state',
    type: 'POST',
    data: {'state': JSON.stringify(state)},
    success: function(resp) {
      jQuery('#sharebox').removeClass('hidden');
      jQuery('#actionbox').addClass('hidden');
      jQuery('#link').val(resp['url']);
      twttr.widgets.createShareButton(
          resp['url'],
          jQuery('#twttrbtn')[0],
          function() {},
          {
            'hashtags': 'openeconomy',
            'count': 'none',
            'size': 'small',
            'text': 'Seeing financial data like never before',
            'counturl': 'http://openeconomy.org.au'
          });
      jQuery('div.g-plus').attr('data-href', resp['url']);
      gapi.plus.go();

      jQuery('#fbbtn').attr('data-link', resp['url']);
    },
    error: function(e) {
    }
  });
}


/** Special hander for the FB button. It's pretty special. */
function fbShare() {
  var fb_obj = {
    method: 'feed',
    link: jQuery('#fbbtn').attr('data-link'),
    //picture: 'http://fbrell.com/f8.jpg',
    name: 'The Open Economy',
    caption: '',
    description: 'A whole new way to see financial data.'
  };

  var callback = function(response) {
    console.log(response);
    finishSharing();
  };

  FB.ui(fb_obj, callback);
}


/** We're done sharing: clean up. */
function finishSharing() {
  jQuery('#sharebox').addClass('hidden');
  jQuery('#actionbox').removeClass('hidden');
}


/** Recalculate and display packing efficiency
 */
function recalcPackingEfficiency() {
  var result = viewstate.children().reduce(function(prev, curr) {
    return prev + packingEfficiency(curr);
  }, 0);
  result = result / viewstate.children().length * 100;
  jQuery('#packingEfficiency').text(result.toFixed(2) + '%');
}


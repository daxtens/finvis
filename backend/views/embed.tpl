'use strict';

/* Embed an Open Economy view into another website.
   Look for an #openeconomy div and do cleverness with that. */
// JS loading from http://css-tricks.com/snippets/jquery/load-jquery-only-if-not-present/

function doOpenEconomy() {

  function getScript(url, success) {
    var script = document.createElement('script');
    script.src = url;
    var head = document.getElementsByTagName('head')[0],
    done = false;
    
    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function() {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
	done = true;
	// callback function provided as param
	success();

	script.onload = script.onreadystatechange = null;
	head.removeChild(script);	
      };
    };

    head.appendChild(script);
  }

  // Force jQuery
  if (typeof jQuery == 'undefined') {    
    getScript('http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js', hasjQuery);    
  } else {
    hasjQuery();
  };

  // Load up all the necessary assets
  // step 0: write a bunch of HTML into the div
  document.getElementById('openeconomy').innerHTML = '<link rel="stylesheet" href="http://{{hostname}}/css/vis.css" />\
<link rel="stylesheet" href="http://{{hostname}}/css/web.css" />\
<style>\
#openeconomy img.btnimg {\
    /* Override specifically for embedding: give FQDN */\
    background-image: url(http://{{hostname}}/images/icons.png);\
}\
</style>\
<!--[if lt IE 10]>\
<div id="oldBrowserWarning">\
  Hi! You seem to be using Internet Explorer 9 or below. Unfortunately this website only functions on modern, standards-compliant browsers such as:\
  <ul>\
    <li><a href="http://windows.microsoft.com/en-AU/internet-explorer/products/ie/home">Internet Explorer 10</a></li>\
    <li><a href="http://www.google.com/chrome">Google Chrome</a></li>\
    <li><a href="http://www.getfirefox.com/">Mozilla Firefox</a></li>\
    <li><a href="http://www.apple.com/safari/">Safari</a></li>\
    <li><a href="http://www.opera.com/">Opera</a>\
  </ul>\
  Please try again with one of those.<br />\
</div>\
<style type="text/css">\
#rightToolBox {\
  display: none;\
}\
</style>\
<![endif]-->\
    <div id="rightContainer">\
      <div id="rightToolBox">\
        <div class="box" id="viewbox">\
          <p class="rotate">VIEW</p>\
          <a href="#" title="Zoom in" id="zoomIn"><img class="btnimg icon-zoom-in" src="http://{{hostname}}/images/placeholder.png" alt="Zoom in"/></a>\
          <a href="#" title="Zoom out" id="zoomOut"><img class="btnimg icon-zoom-out" src="http://{{hostname}}/images/placeholder.png" alt="Zoom out"/></a><br/>\
          <a href="#" title="Zoom region" id="zoomRect"><img src="http://{{hostname}}/images/placeholder.png" class="btnimg icon-zoom-box" alt="Zoom in on a region"/></a>\
          <a href="#" title="Fit to screen" id="fitToScreen"><img src="http://{{hostname}}/images/placeholder.png" class="btnimg icon-zoom-original" alt="Fit to screen"/></a>\
        </div>\
        <div class="box" id="periodbox">\
          <p class="rotate">TIME</p>\
          <p id="period"></p>\
          <br clear="both">\
          <table style="float:right;">\
            <tr><td><a href="#" id="prevPeriodBtn"><img class="smlbtnimg icon-seek-backwards" alt="Prevous period" src="http://{{hostname}}/images/placeholder.png" /></a></td>\
            <td id="financialYearTxt">FINANCIAL YEAR</td>\
            <td><a href="#" id="nextPeriodBtn"><img class="smlbtnimg icon-seek-forwards" alt="Next period" src="http://{{hostname}}/images/placeholder.png" /></a></td></tr>\
            \
            <tr><td><a href="#" id="playBtn"><img alt="Play" class="smlbtnimg icon-start" src="http://{{hostname}}/images/placeholder.png" /></a></td>\
            <td><select id="periodSel">\
            </select></td>\
            <td><a href="#" id="stopBtn"><img alt="Stop" class="smlbtnimg icon-stop" src="http://{{hostname}}/images/placeholder.png" /></a></td></tr>\
          </table>\
        </div>\
        <div class="box" id="informationbox">\
          <p class="rotate">INFO</p>\
          <p id="toggleInfoBoxContainer">[ <a href="#" id="toggleInfoBox">&mdash;</a> ]</p>\
          <div id="infobox" ontouchstart="javascript:return false;"><h2>Welcome to the Open Economy</h2><p>To start exploring, just click, double-click or right-click on things and see what happens...</div>\
        </div>\
        <div id="actionbox" class="box">  \
          <p id="keyactions" class="tighttop"><a href="http://daxtens.github.io/finvis/" target="_blank">HELP</a> \
        </div>\
      </div>\
    </div>\
    <div id="wedgeMenu" class="contextMenu">\
      <ul>\
        <li id="deleteMenuItem">Delete</li>\
        <li id="centreViewMenuItem">Centre view on</li>\
	<li id="resetMenuItem">Reset</li>\
      </ul>\
    </div>\
    <div id="wedge2Menu" class="contextMenu">\
      <ul>\
        <li id="deleteMenuItem">Delete</li>\
        <li id="centreViewMenuItem">Centre view on</li>\
        <li id="popBothMenuItem">Expand both</li>\
	<li id="resetMenuItem">Reset</li>\
      </ul>\
</div>';

  // step 1: load jQuery plugin
  function hasjQuery() {
    var $ = jQuery;
    getScript('http://{{hostname}}/js/jquery.contextmenu.r2.js', function() {
      jQuery.noConflict();
      loadApp();
    });
  }

  // step 2: load d3 and app js
  function loadApp() {
    getScript("http://d3js.org/d3.v3.min.js", initApp);
    getScript("http://{{hostname}}/js/finvis.js", initApp);
  }

  // step 3 - kick things off
  var scriptsLoaded = 0;
  function initApp() {
    scriptsLoaded++;
    if (scriptsLoaded != 2) return;

    // make sure we're by default at least 425px high
    if (jQuery('#openeconomy').height() < 425) {
      jQuery('#openeconomy').height(425);
    }

    window.viewstate = initOpenEconomy('#openeconomy');
    jQuery.ajax('http://{{hostname}}/state.json/{{ initial_state }}', {
        success: function(d) {
          viewstate.importState(d);
        },
        error: function(d) {
          var resp = JSON.parse(JSON.parse(d.responseText));
          if ('error' in resp) {
            alert('Error: ' + resp['error']);
          } else {
            alert('An unknown error occured. We\'re very sorry. ' +
                  'Try reloading?');
          }
        }
      });
  }
}

doOpenEconomy();
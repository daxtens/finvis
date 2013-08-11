<!DOCTYPE html>
<html>
  <head>
    <title>The Open Economy</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta property="og:title" content="The Open Economy">
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="/js/jquery.contextmenu.r2.js"></script>
    <script type="text/javascript" src="/js/jquery.form.js"></script>
    <script type="text/javascript">jQuery.noConflict();
    </script>
    <script type="text/javascript" src="/js/circles.js"></script>
    <script type="text/javascript" src="/js/util.js"></script>
    <script type="text/javascript" src="/js/parenting.js"></script>
    <script type="text/javascript" src="/js/viewstate.js"></script>
    <script type="text/javascript" src="/js/viewobj.js"></script>
    %if defined('initial_id'):
    <script type="text/javascript">window.initial_id="{{initial_id}}";</script>
    %else:
    <script type="text/javascript">window.initial_state="{{initial_state}}";</script>
    %end
    <script type="text/javascript" src="/js/events/events_all.js"></script>
    <script type="text/javascript" src="/js/events/events_standalone.js"></script>
    <link rel="stylesheet" href="/css/vis.css" />
    <link rel="stylesheet" href="/css/web.css" />
  </head>
  <body>
    <div id="fb-root"></div>
    <div id="headline">
      <a href="http://greensmps.com.au/" target="_blank"><img src="/images/greens-logo.svg" alt="Greens Logo" /></a>
      <a href="http://scott-ludlam.greensmps.org.au/openeconomy">THE AUSTRALIAN GREENS OPEN ECONOMY PROJECT</a>
    </div>
    <!--[if lt IE 10]>
      <div id="oldBrowserWarning">
        Hi! You seem to be using Internet Explorer 9 or below. Unfortunately this website only functions on modern, standards-compliant browsers such as:
        <ul>
          <li><a href="http://windows.microsoft.com/en-AU/internet-explorer/products/ie/home">Internet Explorer 10</a></li>
          <li><a href="http://www.google.com/chrome">Google Chrome</a></li>
          <li><a href="http://www.getfirefox.com/">Mozilla Firefox</a></li>
          <li><a href="http://www.apple.com/safari/">Safari</a></li>
          <li><a href="http://www.opera.com/">Opera</a>
        </ul>
        Please try again with one of those.<br />
      </div>
      <style type="text/css">
      #rightToolBox {
        display: none;
      }
      </style>
    <![endif]-->
    <div id="rightContainer">
      <div id="rightToolBox">
        <div class="box" id="viewbox">
          <p class="rotate">VIEW</p>
          <a href="#" title="Zoom in" id="zoomIn"><img class="btnimg icon-zoom-in" src="/images/placeholder.png" alt="Zoom in"/></a>
          <a href="#" title="Zoom out" id="zoomOut"><img class="btnimg icon-zoom-out" src="/images/placeholder.png" alt="Zoom out"/></a><br/>
          <a href="#" title="Zoom region" id="zoomRect"><img src="/images/placeholder.png" class="btnimg icon-zoom-box" alt="Zoom in on a region"/></a>
          <a href="#" title="Fit to screen" id="fitToScreen"><img src="/images/placeholder.png" class="btnimg icon-zoom-original" alt="Fit to screen"/></a>
        </div>
        <div class="box" id="iobox">
          <p class="rotate">MODELS</p>
          <a href="#" title="Save to disk" id="initSaveToDisk"><img src="/images/placeholder.png" class="btnimg icon-disk" alt="Save to disk"/></a>
          <a href="#" id="initAddEntity"><img src="/images/placeholder.png" class="btnimg icon-disk" alt="Add an entity"/></a><br/>
          <p style="float:right;" class="tighttop">SAVE&nbsp;&nbsp;&nbsp;LOAD&nbsp;</p>
          <br style="clear: right;"/>
          <form id="saveToDiskForm" name="saveToDiskForm" class="hidden" action="/export" method="POST">
          <select name="format">
            <option value="svg">SVG</option>
            <option value="png">PNG</option>
          </select>
          <input name="data" type="hidden"></input>
          <br/>
          <a href="#" id="saveToDisk"><img src="/images/placeholder.png" class="btnimg icon-apply" alt="Save to disk"/></a>
          <a href="#" id="cancelSaveToDisk"><img src="/images/placeholder.png" class="btnimg icon-cancel" alt="Cancel"/></a>
          </form>
          <div id="addEntityContainer" class="hidden">
            Choose an existing entity:<br/>
            <select id="entitySel">
              %for entity in public_entities:
              <option value="{{entity.id}}">{{entity.name}}</option>
              %end
              %for entity in user_entities:
              <option value="{{entity.id}}">{{entity.name}}</option>
              %end
            </select><br/>
            <form id="ephemeralUploadForm" action="/excel_to_json.json"
            enctype="multipart/form-data" method="POST">
            or upload one from Excel:
            <input id="ephemeralUploadFile" type="file" name="excelfile"></input>
            </form>
          <div id="ephemeralOutput" class="hidden"></div>
          <a href="#" id="addEntity"><img src="/images/placeholder.png" class="btnimg icon-apply" alt="Add this entity"/></a>
          <a href="#" id="cancelAddEntity"><img src="/images/placeholder.png" class="btnimg icon-cancel" alt="Cancel"/></a>
          <p id="clickToPlaceTxt" class="hidden">Click to place</p>
          </div>
        </div>
        <div class="box" id="periodbox">
          <p class="rotate">TIME</p>
          <p id="period"></p>
          <br clear="both">
          <table style="float:right;">
            <tr><td><a href="#" id="prevPeriodBtn"><img class="smlbtnimg icon-seek-backwards" alt="Prevous period" src="/images/placeholder.png" /></a></td>
            <td id="financialYearTxt">FINANCIAL YEAR</td>
            <td><a href="#" id="nextPeriodBtn"><img class="smlbtnimg icon-seek-forwards" alt="Next period" src="/images/placeholder.png" /></a></td></tr>
            
            <tr><td><a href="#" id="playBtn"><img alt="Play" class="smlbtnimg icon-start" src="/images/placeholder.png" /></a></td>
            <td><select id="periodSel">
            </select></td>
            <td><a href="#" id="stopBtn"><img alt="Stop" class="smlbtnimg icon-stop" src="/images/placeholder.png" /></a></td></tr>
          </table>
        </div>
        <div class="box" id="informationbox">
          <p class="rotate">INFO</p>
          <p id="toggleInfoBoxContainer">[ <a href="#" id="toggleInfoBox">&mdash;</a> ]</p>
          <div id="infobox" ontouchstart="javascript:return false;"><h2>Welcome to the Open Economy</h2><p>To start exploring, just click, double-click or right-click on things and see what happens...</div>
        </div>
        <div class="box" id="morebox">
          <p class="rotate">MORE</p>
          %if username:
          <p class="tighttop">{{ username }} | <a href="/logout">Log out</a> | [ <a href="#" id="togglePacking">+</a> ]</p>
          %if admin:
          <p>Admin: <a href="/data_admin">Data</a> | <a href="/admin">Users</a></p>
          %else:
          <p><a href="/entities">Manage data</a></p>
          %end
          </p>
          %else:
          <p class="tighttop"><a href="/login">Log in</a> | <a href="/register">Sign up</a> | [ <a href="#" id="togglePacking">+</a> ]</p>
          %end
          
          <div class="hidden" id="packing">
            <p class="tighttop">Packing model:</p>
            <select id="packingSel">
              <option value="oldstyle">Circular</option>
              <option value="dendritic" selected="selected">Dendritic</option>
            </select>
          </div>
        </div>
        <div id="actionbox" class="box">  
          <p id="keyactions" class="tighttop"><a href="http://daxtens.github.io/finvis/" target="_blank">HELP</a> | <a href="#" id="share">SHARE</a></p> 
          <p class="tighttop"><a href="http://daxtens.github.io/finvis/index.html#could_this_possibly_be_more_fun" target="_blank">CONTRIBUTE</a></p>
        </div>
        <div id="sharebox" class="box hidden">
          <input type="text" id="link"></input><br>
          <a href="#" id="fbbtn"><img src="/images/icons/fbshare.png" /></a>
          <span id="twttrbtn"></span>
          <div style="display: inline" class="g-plus" data-action="share" data-annotation="none"></div>
          <br />
          <a href="#" id="closeShareBox">close</a>
        </div>
      </div>
    </div>
    <div id="wedgeMenu" class="contextMenu">
      <ul>
        <li id="deleteMenuItem">Delete</li>
        <li id="centreViewMenuItem">Centre view on</li>
	<li id="resetMenuItem">Reset</li>
      </ul>
    </div>
    <div id="wedge2Menu" class="contextMenu">
      <ul>
        <li id="deleteMenuItem">Delete</li>
        <li id="centreViewMenuItem">Centre view on</li>
        <li id="popBothMenuItem">Expand both</li>
	<li id="resetMenuItem">Reset</li>
      </ul>
    </div>
    <!-- Google+ Share -->
    <script type="text/javascript" src="https://apis.google.com/js/plusone.js">
    {parsetags: 'explicit'}
    </script>
    <!-- Twitter -->
    <script>window.twttr = (function (d,s,id) {
    var t, js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return; js=d.createElement(s); js.id=id;
    js.src="https://platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
    return window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f) } });
    }(document, "script", "twitter-wjs"));</script>
    <!-- FB -->
    <script src='http://connect.facebook.net/en_US/all.js'></script>
	<script type="text/javascript">
		window.precached_data = {}
	</script>
		%for jsonp_path in precached_data:
	<script type="text/javascript" src="{{jsonp_path}}"></script>
		%end
	</script>
  </body>
</html>

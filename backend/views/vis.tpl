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
    <script type="text/javascript">window.initial_id="{{initial_id}}";</script>
    <script type="text/javascript" src="/js/events.js"></script>
    <link rel="stylesheet" href="/css/vis.css" />
    <link rel="stylesheet" href="/css/web.css" />
  </head>
  <body>
    <div id="headline">
      <a href="http://greensmps.com.au/" target="_blank"><img src="/images/greens-logo.svg" alt="Greens Logo" /></a>
      THE AUSTRALIAN GREENS OPEN ECONOMY PROJECT
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
          <a href="#" title="Zoom in" id="zoomIn"><img class="btnimg" src="/images/icons/zoom-in.png" alt="Zoom in"/></a>
          <a href="#" title="Zoom out" id="zoomOut"><img class="btnimg" src="/images/icons/zoom-out.png" alt="Zoom out"/></a><br/>
          <!--<a href="#" title="Zoom region" id="zoomRegion"><img src="/images/icons/zoom-box.png" class="btnimg" alt="Zoom in on a region"/></a><br/>-->
          <a href="#" title="Fit to screen" id="fitToScreen"><img src="/images/icons/zoom-original.png" class="btnimg" alt="Fit to screen"/></a>
        </div>
        <div class="box" id="iobox">
          <p class="rotate">MODELS</p>
          <a href="#" title="Save to disk" id="initSaveToDisk"><img src="/images/icons/document-export.png" class="btnimg" alt="Save to disk"/></a>
          <a href="#" id="initAddEntity"><img src="/images/icons/document-export.png" class="btnimg" alt="Add an entity"/></a><br/>
          <p style="float:right;" class="tighttop">SAVE&nbsp;&nbsp;&nbsp;LOAD&nbsp;</p>
          <br style="clear: right;"/>
          <form id="saveToDiskForm" name="saveToDiskForm" class="hidden" action="/export" method="POST">
          <select name="format">
            <option value="svg">SVG</option>
            <option value="png">PNG</option>
          </select>
          <input name="data" type="hidden"></input>
          <br/>
          <a href="#" id="saveToDisk"><img src="/images/icons/dialog-apply.png" class="btnimg" alt="Save to disk"/></a>
          <a href="#" id="cancelSaveToDisk"><img src="/images/icons/dialog-cancel.png" class="btnimg" alt="Cancel"/></a>
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
            or upload one from Excel:
            <form id="ephemeralUploadForm" action="/excel_to_json.json"
            enctype="multipart/form-data" method="POST">
            <input id="ephemeralUploadFile" type="file" name="excelfile"></input>
            </form>
          <div id="ephemeralOutput" class="hidden"></div>
          <a href="#" id="addEntity"><img src="/images/icons/dialog-apply.png" class="btnimg" alt="Add this entity"/></a>
          <a href="#" id="cancelAddEntity"><img src="/images/icons/dialog-cancel.png" class="btnimg" alt="Cancel"/></a>
          <p id="clickToPlaceTxt" class="hidden">Click to place</p>
          </div>
        </div>
        <div class="box" id="periodbox">
          <p class="rotate">TIME</p>
          <p id="period"></p>
          <br clear="both">
          <table style="float:right;">
            <tr><td><a href="#" id="prevPeriodBtn"><img class="smlbtnimg" alt="Prevous period" src="/images/icons/seek-backward.png" /></a></td>
            <td id="financialYearTxt">FINANCIAL YEAR</td>
            <td><a href="#" id="nextPeriodBtn"><img class="smlbtnimg" alt="Next period" src="/images/icons/seek-forward.png" /></a></td></tr>
            
            <tr><td><a href="#" id="playBtn"><img alt="Play" class="smlbtnimg" src="/images/icons/playback-start.png" /></a></td>
            <td><select id="periodSel">
            </select></td>
            <td><a href="#" id="stopBtn"><img alt="Stop" class="smlbtnimg" src="/images/icons/playback-stop.png" /></a></td></tr>
          </table>
        </div>
        <div class="box" id="morebox">
          <p class="rotate">MORE</p>
          <p class="tighttop">Packing model:</p>
          <select id="packingSel">
            <option value="default">Old-style</option>
            <option value="dendritic" selected="selected">Dendritic</option>
          </select>
          <p><a href="http://daxtens.github.io/finvis/">HELP</a> | <a href="http://daxtens.github.io/finvis/contribute.html">CONTRIBUTE</a></p>
        </div>
        <div class="box" id="informationbox">
          <p class="rotate">INFO</p>
          <p id="toggleInfoBoxContainer">[ <a href="#" id="toggleInfoBox">&mdash;</a> ]</p>
          <div id="infobox" ontouchstart="javascript:return false;"><h2>Welcome to the Open Economy</h2><p>To start exploring, just click, double-click or right-click on things and see what happens...</div>
        </div>
        <div class="box" id="userbox">
          <p class="rotate">TOOLS</p>
          %if username:
          <p class="tighttop">{{ username }}</p>
          <p><a href="/entities">Manage data</a></p>
          %if admin:
          <p>Admin: <a href="/data_admin">Data</a> | <a href="/admin">Users</a></p>
          %end
          <p><a href="/logout">Log out</a></p>
          %else:
          <p class="tighttop"><a href="/login">Log in</a></p>
          <p><a href="/register">Register</a></p>
          %end
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
  </body>
</html>

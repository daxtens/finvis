<!DOCTYPE html>
<html>
  <head>
    <title>The Open Economy</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> 
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
    <!--[if lt IE 9]>
        Hi! You seem to be using Internet Explorer 8 or below. Unfortunately this website only functions on modern, standards-compliant browsers such as:
        <ul>
          <li><a href="http://windows.microsoft.com/en-AU/internet-explorer/products/ie/home">Internet Explorer 9</a></li>
          <li><a href="http://www.google.com/chrome">Google Chrome</a></li>
          <li><a href="http://www.getfirefox.com/">Mozilla Firefox</a></li>
          <li><a href="http://www.apple.com/safari/">Safari</a></li>
          <li><a href="http://www.opera.com/">Opera</a>
        </ul>
        Please try again with one of those.<br />
        <style type="text/css">
          #rightToolBox {
          display: none;
          }
        </style>
        <![endif]-->
    <div id="headline"><img src="/images/greens-logo.svg" alt="Greens Logo" />THE AUSTRALIAN GREENS OPEN ECONOMY PROJECT</div>
    <div id="rightContainer">
      <div id="rightToolBox">
        <a href="#" title="Zoom in" id="zoomIn"><img class="btnimg" src="/images/icons/zoom-in.png" alt="Zoom in"/></a>
        <a href="#" title="Zoom out" id="zoomOut"><img class="btnimg" src="/images/icons/zoom-out.png" alt="Zoom out"/></a><br/>
        <!--<a href="#" title="Zoom region" id="zoomRegion"><img src="/images/icons/zoom-box.png" class="btnimg" alt="Zoom in on a region"/></a><br/>-->
        <a href="#" title="Fit to screen" id="fitToScreen"><img src="/images/icons/zoom-original.png" class="btnimg" alt="Fit to screen"/></a><br/>
        <hr />
        <br style="clear:both; height:0px;"/>
        <a href="#" title="Save to disk" id="initSaveToDisk"><img src="/images/icons/document-export.png" class="btnimg" alt="Save to disk"/></a>
        <a href="#" id="initAddEntity"><img src="/images/icons/list-add.png" class="btnimg" alt="Add an entity"/></a><br/>
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
            <input id="ephemeralUploadFile" type="file" name="excelfile"></input><br>
            <input id="ephemeralUploadBtn" type="submit" value="Upload"></input>
          </form>
          <div id="ephemeralOutput" class="hidden"></div>
          <a href="#" id="addEntity"><img src="/images/icons/dialog-apply.png" class="btnimg" alt="Add this entity"/></a>
          <a href="#" id="cancelAddEntity"><img src="/images/icons/dialog-cancel.png" class="btnimg" alt="Cancel"/></a>
          <p id="clickToPlaceTxt" class="hidden">Click to place</p>
        </div>
        <hr/>
        <br style="clear:both; height:0px;"/>
        <p id="period"></p>
        <br>
        <table style="float:right;">
          <tr><td><a href="#" id="prevPeriodBtn"><img class="smlbtnimg" alt="Prevous period" src="/images/icons/seek-backward.png" /></a></td>
        <td id="financialYearTxt">FINANCIAL YEAR</td>
        <td><a href="#" id="nextPeriodBtn"><img class="smlbtnimg" alt="Next period" src="/images/icons/seek-forward.png" /></a></td></tr>
        
        <tr><td><a href="#" id="playBtn"><img alt="Play" class="smlbtnimg" src="/images/icons/playback-start.png" /></a></td>
        <td><select id="periodSel">
        </select></td>
        <td><a href="#" id="stopBtn"><img alt="Stop" class="smlbtnimg" src="/images/icons/playback-stop.png" /></a></td></tr>
        </table>
        <br style="clear:both;" />
        <hr/>
        <br/>
        <p class="tighttop">Packing model:</p>
        <select id="packingSel">
          <option value="default">Old-style</option>
          <option value="dendritic" selected="selected">Dendritic</option>
        </select>
        <br />
        <hr/>
        <br/>
        <p id="toggleInfoBoxContainer">[ <a href="#" id="toggleInfoBox">&mdash;</a> ]</p>
        <div id="infobox" ontouchstart="javascript:return false;"></div>
        <br style="clear:both;"/>
        <hr/>
        <br/>

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

    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-39755625-1', 'dja.id.au');
      ga('send', 'pageview');

    </script>
  </body>
</html>

<h1>Public Entities</h1>
<ul>
%for entity in public_entities:
     <li>{{entity.name}} - <a href="/index.html/{{entity.id}}">View</a> 
                         - <a href="/download/{{entity.id}}">Download</a></li>
%end
</ul>
<h1>My Entities</h1>
<ul>
% if len(user_entities) == 0:
  <li><i>Currently none.</i></li>
% end
% for entity in user_entities:
    <li>{{entity.name}} - <a href="/index.html/{{entity.id}}">View</a>
                        - <a href="/download/{{entity.id}}">Download</a> 
                        - <a href="/delete/{{entity.id}}">Delete</a>
    </li>
% end
</ul>
<h2>Upload a new entity</h2>
<p><a href="http://daxtens.github.io/finvis/spreadsheet.html">Instructions</a></p>
<form action="/upload" method="POST" enctype="multipart/form-data">
<input id="uploadFile" type="file" name="excelfile"></input><br>
<input id="uploadBtn" type="submit" value="Upload"></input>
</form>
<hr>
<a href="/">Return to the Open Economy.</a>
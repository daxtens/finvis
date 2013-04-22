<h1>Open Economy - Data Administration page</h1>
<h3><a href="/admin">Users</a> | <i>Data</i></h3>

<h2>Public Entities</h2>
<table>
  <thead>
    <tr><th>Name</th><th>Author</th><th>Make Private</th><th>Delete</th></tr>
  </thead><tbody>
    %for entity in public_entities:
    <tr>
      <td>{{entity.name}}</td>
      <td>{{entity.username}}</td>
      <td><a href="/set_public/{{entity.id}}/0">Make Private</a></td>
      <td><a href="/delete/{{entity.id}}">Delete</a></td>
    </tr>
    %end
  </tbody>
</table>

<h2>My Entitites</h2>
%if len(users_entities[me]):
<table>
  <thead>
    <tr><th>Name</th><th>View</th><th>Download</th><th>Visibility</th><th>Delete</th></tr>
  </thead><tbody>
    %for entity in users_entities[me]:
    <tr>
      <td>{{entity.name}}</td>
      <td><a href="/index.html/{{entity.id}}">View</a></td>
      <td><a href="/download/{{entity.id}}">Download</a></td>
      %if entity.public: 
      <td><a href="/set_public/{{entity.id}}/0">Make Private</a></td>
      %else:
      <td><a href="/set_public/{{entity.id}}/1">Make Public</a></td>
      %end
      <td><a href="/delete/{{entity.id}}">Delete</a></td>
    </tr>
    %end
  </tbody>
</table>
%else:
<p><i>Currently none.</i></p>
%end


<h2>User Entities</h2>
<p>Once an entity is made public, users who are not admins lose the ability to modify or delete it.</p>
%printed = 0
%for user in users_entities:
%if len(users_entities[user]) and user != me:
%printed = 1
<h3>{{user}}</h3>
<table>
  <thead>
    <tr><th>Name</th><th>View</th><th>Download</th><th>Visibility</th><th>Delete</th></tr>
  </thead><tbody>
    %for entity in users_entities[user]:
    <tr>
      <td>{{entity.name}}</td>
      <td><a href="/index.html/{{entity.id}}">View</a></td>
      <td><a href="/download/{{entity.id}}">Download</a></td>
      %if entity.public: 
      <td><a href="/set_public/{{entity.id}}/0">Make Private</a></td>
      %else:
      <td><a href="/set_public/{{entity.id}}/1">Make Public</a></td>
      %end
      <td><a href="/delete/{{entity.id}}">Delete</a></td>
    </tr>
    %end
  </tbody>
</table>
%end
%end
%if not printed:
   <p><i>Currently no other users have data.</i></p>
%end
<h2>Upload a new entity</h2>
<p><a href="http://daxtens.github.io/finvis/spreadsheet.html">Instructions</a></p>
<form action="/upload" method="POST" enctype="multipart/form-data">
<input id="uploadFile" type="file" name="excelfile"></input><br>
<input id="uploadBtn" type="submit" value="Upload"></input>
</form>
<hr>
<a href="/">Return to the Open Economy.</a>
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


<h2>User Entities</h2>
Consider making a copy of a user's data and making the copy public, rather than
publicising their data directly. This prevents a user from overwriting or deleting
useful public data.

%for user in users_entities:
%if len(users_entities[user]) and user != me:
<h3>{{user}}</h3>
<table>
  <thead>
    <tr><th>Name</th><th>View</th><th>Download</th><th>Make a copy</th><th>Visibility</th><th>Delete</th></tr>
  </thead><tbody>
    %for entity in users_entities[user]:
    <tr>
      <td>{{entity.name}}</td>
      <td><a href="/index.html/{{entity.id}}">View</a></td>
      <td><a href="/download/{{entity.id}}">Download</a></td>
      <td><a href="/make_copy/{{entity.id}}">Make a copy</a></td>
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

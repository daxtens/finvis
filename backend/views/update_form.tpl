<h2>Update {{name}}</h2>

<strong>Warning: updating an entity will probably mess up saved states that have popped out the entity.</strong>

<p><a href="http://daxtens.github.io/finvis/spreadsheet.html">Instructions</a></p>
<form action="/update/{{id}}" method="POST" enctype="multipart/form-data">
<input id="uploadFile" type="file" name="excelfile"></input><br>
<input id="uploadBtn" type="submit" value="Upload"></input>
</form>

%rebase base_form title='Update {{name}}'

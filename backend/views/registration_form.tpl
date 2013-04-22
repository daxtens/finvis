<h2>Register</h2>
%if error:
<p>Error: {{ error }}</p>
%end
<form action="register" method="post" name="signup">
<label for="username">User name</label>
<input type="text" name="username" value="{{username}}"/>
<br />
<label for="password">Password</label>
<input type="password" name="password" />
<br />
<label for="email_address">Email Address</label>
<input type="text" name="email_address" value="{{email_address}}"/>
<br/><br/>
<button type="submit" > OK </button>
</form>
%rebase base_form title='Register'
<h2>Password reset</h2>
<p id="error">{{error}}</p>
<p>Please enter your details:</p>
<form action="reset_password" method="post" name="password_reset">
<label for="username">User name:</label>
<input type="text" name="username" value=""/>
<br/>
<label for="email_address">Email address:</label>
<input type="text" name="email_address" value=""/>
<br/><br/>
<button type="submit" > OK </button>
</form>
%rebase base_form title='Password reset'

<h2>Login</h2>
<p>Please insert your credentials:</p>
<form action="login" method="post" name="login">
<label for="username">User name:</label>
<input type="text" name="username" /><br/>
<label for="password">Password:</label>
<input type="password" name="password" />

<br/><br/>
<button type="submit" > OK </button>
<br/>
<a href="/reset_password">Forgot your password?</a><br/>
<a href="/register">Register</a><br/>
</form>
%rebase base_form title='Login'

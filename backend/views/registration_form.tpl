<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="content-type">
    <div id="hbox">
      <div class="box">
        <h2>Signup</h2>
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
          <button type="button" class="close"> Cancel </button>
        </form>
        <br />
      </div>
    </div>
    <style>
      div {
      color: #777;
      margin: auto;
      width: 20em;
      text-align: center;
      }
      div#hbox {width: 100%;}
      div#hbox div.box {float: left; width: 33%;}
      input {
      background: #f8f8f8;
      border: 1px solid #777;
      margin: auto;
      }
      input:hover { background: #fefefe}
    </style>

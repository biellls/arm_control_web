<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">

    <title>Log in</title>

    <!-- Bootstrap core CSS -->
    <!--<link href="resources/css/bootstrap.min.css" rel="stylesheet">-->
    <link href="{{ get_url('static', path='vendors/bootstrap/bootstrap.min.css') }}" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="{{ get_url('static', path='resources/css/login.css') }}" rel="stylesheet">
  </head>

  <body>

    <div class="container">

      <form class="form-signin" action="/login" method="post">
        <h2 class="form-signin-heading">Log in</h2>
        <label for="inputUser" class="sr-only">Username</label>
        <input name="username" type="text" id="inputUser" class="form-control" placeholder="username" required autofocus>
        <label for="inputPassword" class="sr-only">Password</label>
        <input name="password" type="password" id="inputPassword" class="form-control" placeholder="password" required>
        <button class="btn btn-lg btn-primary btn-block" type="submit">Log in</button>
      </form>

    </div> <!-- /container -->
  </body>
</html>


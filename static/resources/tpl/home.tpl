<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="../../favicon.ico">

    <title>Arm Control Web</title>
    
    <script src="{{ get_url('static', path='vendors/jQuery/jquery-2.2.3.js') }}"></script>
    <link href="{{ get_url('static', path='vendors/bootstrap/bootstrap.min.css') }}" rel="stylesheet">
    <link href="{{ get_url('static', path='vendors/bootstrap/bootstrap.min.css') }}" rel="stylesheet">
    <style type="text/css" media="screen">
      #editor { 
      position: relative;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      height: 500px;
      }
    </style>
  </head>
  <body>

    <div class="container-fluid">
      <div class="row">
	<div class="col-md-12">
	  <nav class="navbar navbar-default" role="navigation">
	    <div class="navbar-header">
	      
	      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
		<span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
	      </button> <a class="navbar-brand" href="#">Brand</a>
	    </div>
	    
	    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
	      <ul class="nav navbar-nav">
		<li class="active">
		  <a href="#">Link</a>
		</li>
		<li>
		  <a href="#">Link</a>
		</li>
		<li class="dropdown">
		  <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown<strong class="caret"></strong></a>
		  <ul class="dropdown-menu">
		    <li> <a href="#">Action</a> </li>
		    <li> <a href="#">Another action</a> </li>
		    <li> <a href="#">Something else here</a> </li>
		    <li class="divider"> </li>
		    <li> <a href="#">Separated link</a> </li>
		    <li class="divider"> </li>
		    <li> <a href="#">One more separated link</a> </li>
		  </ul>
		</li>
	      </ul>
	      <form class="navbar-form navbar-left" role="search">
	      </form>
	      <ul class="nav navbar-nav navbar-right">
		<li> <a href="#">Link</a> </li>
		<li class="dropdown">
		  <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown<strong class="caret"></strong></a>
		  <ul class="dropdown-menu">
		    <li> <a href="#">Action</a> </li>
		    <li> <a href="#">Another action</a> </li>
		    <li> <a href="#">Something else here</a> </li>
		    <li class="divider"> </li>
		    <li> <a href="#">Separated link</a> </li>
		  </ul>
		</li>
	      </ul>
	    </div>
	    
	  </nav>
	  <div class="row">
	    <div class="col-md-12">
	      <div class="btn-group">
		
		<button class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-arrow-down"></em>
		  Load code
		</button> 
		<button class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-arrow-down"></em>
		  Load points
		</button> 
		<button class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-play"></em> Run
		</button> 
		<button class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-check"></em>
		  Syntax Check
		</button>
	      </div>
	    </div>
	  </div>
          <br>
	  <div class="container">
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">MB4 Editor</h3>
              </div>
              <div class="panel-body">
                <div id="editor">function foo(items) {
                  var x = "All this is syntax highlighted";
                  return x;
                  }</div>
              </div>
            </div>
          </div>
	</div>
      </div>
    </div>

<!-- TODO: Add ace theme switcher -->
    
    
    
    <script src="{{ get_url('static', path='vendors/ace/src/ace.js') }}" type="text/javascript" charset="utf-8"></script>
    <script src="{{ get_url('static', path='resources/js/home.js') }}" type="text/javascript" charset="utf-8"></script>
  </body>
</html>

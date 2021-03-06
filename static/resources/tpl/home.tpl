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
    <script src="{{ get_url('static', path='vendors/bootstrap/bootstrap.js') }}"></script>
    <link href="{{ get_url('static', path='vendors/bootstrap/bootstrap.min.css') }}" rel="stylesheet">
    <!-- TODO: downlaod scripts to local -->
    <script type="text/javascript" src="http://cdn.robotwebtools.org/EventEmitter2/current/eventemitter2.min.js"></script>
    <script type="text/javascript"
            src="http://cdn.robotwebtools.org/roslibjs/current/roslib.min.js"></script>
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

    <div class="container">
      <div class="row">
	<div class="col-md-12">
	  <nav class="navbar navbar-default" role="navigation">
	    <div class="navbar-header">
	      
	      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
		<span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
	      </button> <a class="navbar-brand" href="#">Arm Control Web</a>
	    </div>
	    
	    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
	      <form class="navbar-form navbar-left" role="search"> </form>
	      <ul class="nav navbar-nav navbar-right">
                <li><a href="/logout">Logout</a></li>
              </ul>    
	    </div>
	  </nav>
	  <div class="row">
	    <div class="col-md-10">
	      <div class="btn-group">
		
		<button onclick="uploadProject()" class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-arrow-down"></em>
		  Load project
		</button> 
		<button onclick="runProgram()" class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-play"></em> Run
		</button> 
		<button onclick="saveProgramOrPoints()" class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-floppy-save"></em> Save
		</button> 
		<button onclick="syntaxCheck()" class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-check"></em>
		  Syntax Check
		</button>
		<button onclick="clearSyntaxErrorMessages()" class="btn btn-default" type="button">
		  <em class="glyphicon glyphicon-remove-circle"></em>
		  Clear Syntax Errors
		</button>
	      </div>
                <div class="checkbox"> <label> <input id='checkbox-flycheck' type="checkbox" checked> Auto Syntax Check </label> </div>
	    </div>
	    <div class="col-md-2">
              <h5 id="connectedLabel" style="display:none;">Status: <span class="label label-success">connected</span></h3>
              <h5 style='cursor: pointer' id="disconnectedLabel">Status: <span class="label label-danger">disconnected</span></h3>
            </div>
	  </div>
          <br>
          <ul class="nav nav-tabs" id="tabView">
	    <li class="active"><a data-target="#mb4-editor"
	    data-toggle="tab">MB4 Editor</a></li>
	    <li><a data-target="#points-editor" data-toggle="tab">Points</a></li>
	    <li><a data-target="#robot-control" data-toggle="tab">Robot control</a></li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane active" id="mb4-editor">
              <br>
              <!-- ACE EDITOR -->
	      <div class="container">
                <div class="panel panel-default">
                  <div class="panel-heading">
                    <h3 class="panel-title">MB4 Editor</h3>
                  </div>
                  <div class="panel-body">
                    <div id="editor">SERVO ON</div>
                  </div>
                </div>
                <div class="form-group">
                  <label for="exampleInputFile">MB4 file input</label>
                  <input type="file" id="mb4InputFile">
                  <p class="help-block">Load code from .mb4 file.</p>
                </div>
              </div>
            </div>

            <div class="tab-pane" id="points-editor">
              <br>
              <!-- POINTS EDITOR -->
              <form>
                <div "points-form-group" class="form-group">
                  <div id="inputPointsDiv">
                    <label for="point1">Point 1</label>
                    <div data-toggle="tooltip" data-placement="top" title="Click to set values">
                      <input type="text" class="points form-control"
                             id="point1input" placeholder="Coordenates"
                             data-toggle="modal"
                             data-target="#pointModal" readonly>
                      <btn id="btn-points1" onClick="moveToPoint(this.id)" class="btn btn-default">Move</btn>
                      <div onClick="deletePoint()" class="btn btn-default glyphicon glyphicon-trash"></div>
                    </div>
                  </div>
                  <div onClick="addPoint()" class="btn btn-default glyphicon glyphicon-plus"></div>
                </div>

                <div class="form-group">
                  <label for="exampleInputFile">Points file input</label>
                  <input type="file" id="pointsInputFile">
                  <p class="help-block">Load points from .pos file.</p>
                </div>
              </form>
            </div>

            <div class="tab-pane" id="robot-control">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/wKeyIcon.png') }}" id="wImg">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/aKeyIcon.png') }}" id="aImg">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/sKeyIcon.png') }}" id="sImg">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/dKeyIcon.png') }}" id="dImg">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/spaceKeyIcon.png') }}" id="spaceImg">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/upKeyIcon.png') }}" id="upImg">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/downKeyIcon.png') }}" id="downImg">

              <img style="display:none;" src="{{ get_url('static', path='resources/icons/wKeyIconPressed.png') }}" id="wImgPressed">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/aKeyIconPressed.png') }}" id="aImgPressed">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/sKeyIconPressed.png') }}" id="sImgPressed">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/dKeyIconPressed.png') }}" id="dImgPressed">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/spaceKeyIconPressed.png') }}" id="spaceImgPressed">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/upKeyIconPressed.png') }}" id="upImgPressed">
              <img style="display:none;" src="{{ get_url('static', path='resources/icons/downKeyIconPressed.png') }}" id="downImgPressed">
              <br>
              <!-- Robot control key canvas -->
              <canvas id="keyCanvas" tabindex='1' width="900" height="600" style="border:1px solid #000000;"> </canvas>
            </div>
          </div>
          

	</div>
      </div>
    </div>

    <!-- TODO: Add ace theme switcher -->
    <!-- Modal -->
    <div class="modal fade" id="pointModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="myModalLabel">Add point</h4>
          </div>
          <div class="modal-body">
              <form>
                <div id "point-form-group" class="form-group">
                  <label for="Name">Name</label>
                  <input type="text" class="form-control"
                         id="nameinput" placeholder="Point name">
                </div>
                <div id "point-form-group" class="form-group">
                  <label for="j1">X</label>
                  <input type="number" class="form-control"
                         id="j1input" placeholder="Joint angle">
                </div>
                <div id "point-form-group" class="form-group">
                  <label for="j2">Y</label>
                  <input type="number" class="form-control"
                         id="j2input" placeholder="Joint angle">
                </div>
                <div id "point-form-group" class="form-group">
                  <label for="j3">Z</label>
                  <input type="number" class="form-control"
                         id="j3input" placeholder="Joint angle">
                </div>

                <div id "point-form-group" class="form-group">
                  <label for="j4">Roll</label>
                  <input type="number" class="form-control"
                         id="j4input" placeholder="Joint angle">
                </div>
                <div id "point-form-group" class="form-group">
                  <label for="j5">Pitch</label>
                  <input type="number" class="form-control"
                         id="j5input" placeholder="Joint angle">
                </div>
                <div id "point-form-group" class="form-group">
                  <label for="j6">Yaw</label>
                  <input type="number" class="form-control"
                         id="j6input" placeholder="Joint angle">
                </div>
              </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            <button onclick="importCurrentRobotPosition()" type="button" class="btn btn-primary">Import current robot position</button>
            <button onclick="setInputCoordinates()" type="button" class="btn btn-primary">Add</button>
          </div>
        </div>
      </div>
    </div>

    <script src="{{ get_url('static', path='vendors/ace/src/ace.js') }}" type="text/javascript" charset="utf-8"></script>
    <script src="{{ get_url('static', path='vendors/lexer/lexer.js') }}" type="text/javascript" charset="utf-8"></script>
    <script src="{{ get_url('static', path='resources/js/home.js') }}" type="text/javascript" charset="utf-8"></script>
    <script src="{{ get_url('static', path='resources/js/config.js') }}" type="text/javascript" charset="utf-8"></script>
    <script src="{{ get_url('static', path='resources/js/keyCanvas.js') }}" type="text/javascript" charset="utf-8"></script>
    <script src="{{ get_url('static', path='resources/js/lexical.js') }}" type="text/javascript" charset="utf-8"></script>
    <script src="{{ get_url('static', path='resources/js/syntactical.js') }}" type="text/javascript" charset="utf-8"></script>
  </body>
</html>

var cmdExec;
var editor;


$(document).ready(function(){
    initAce();
    initRoslibjs();
    initBootsrap();
});

function initAce() {
    //Initializae Ace editor
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/solarized_light");
    //editor.getSession().setMode("ace/mode/javascript");
}

function initRoslibjs() {
    var ip = config.rosbridge_server.ip;
    var port = config.rosbridge_server.port;
    //Initialize ROSlibjs
    var ros = new ROSLIB.Ros({
        url: 'ws://' + ip + ':' + port
    });

    ros.on('connection', function() {
        console.log('Connected to websocket server.');
        $('#disconnectedLabel').hide();
        $('#connectedLabel').show();
    });

    ros.on('error', function(error) {
        console.log('Error connecting to websocket server: ', error);
    });

    ros.on('close', function() {
        console.log('Connection to websocket server closed.');
    });

    cmdExec = new ROSLIB.Topic({
        ros : ros,
        name : '/execute_instruction',
        messageType : 'std_msgs/String'
    });
}

var modalCallerId;
function initBootsrap() {
    //Initialize tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    //Initialize modal
    $('#pointModal').on('shown.bs.modal', function (e) {
        $('#myInput').focus();
        modalCallerId = e.relatedTarget.id;
    })

    //File input listeners
    $('#mb4InputFile').change(readProgramFile); 
    $('#pointsInputFile').change(readPointsFile); 
}

function readProgramFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
	  var contents = e.target.result;
          if (f.name.endsWith('.MB4')) {
              editor.setValue(contents);
          } else {
              alert('Please select an .MB4 file');
          }
      }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
  }

function readPointsFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
        r.onload = function(e) {
	    var contents = e.target.result;
            if (f.name.endsWith('.POS')) {
                //Set points
                var pointLines = getLines(contents);
                for (var i in pointLines) {
                    //TODO Set modal vals from input
                    if (pointLines[i] === "")
                        continue;
                    var n = parseInt(i, 10) + 1
                    var id = '#point' + n + 'input';
                    if (n > numPoints) {
                        appendPointInput(n);
                        numPoints++;
                    }
                    $(id).val(pointLines[i]);
                }
            } else {
                alert('Please select a .POS file');
            }
        }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
  }

/*
 * Add new input for point
 */
var numPoints = 1;
function addPoint() {
    numPoints++;
    console.log("Add point");
    appendPointInput(numPoints);
}

function appendPointInput(numPoint) {
    //Build the html for the new point
    var newPointHTML = '<label for="point' + numPoint + '">Point ' + numPoint + '</label>' +
        '<div data-toggle="tooltip" data-placement="top" title="Click to set values">' +
        '<input type="text" class="form-control"' +
        'id="point' + numPoint + 'input" placeholder="Coordenates"' +
        'data-toggle="modal"' +
        'data-target="#pointModal" readonly>' +
        '</div>';
    //Append the generated new point input to the form
    $('#inputPointsDiv').append(newPointHTML);
}

function pointInput() {
    console.log("Point 1 input clicked");
}

function allInputCoordinatesSet() {
    return $('#xinput').val() !== "" &&
        $('#yinput').val() !== "" &&
        $('#zinput').val() !== "" &&
        $('#rhoinput').val() !== "" &&
        $('#thetainput').val() !== "" &&
        $('#psiinput').val() !== "";
}

function setInputCoordinates() {
    if (allInputCoordinatesSet()) {
        console.log("Input coordinates clicked");
        var pname = $('#nameinput').val();
        var j1 = $('#j1input').val();
        var j2 = $('#j2input').val();
        var j3 = $('#j1input').val();
        var j4 = $('#j4input').val();
        var j5 = $('#j5input').val();
        var j6 = $('#j6input').val();
        //Build point definition string
        var pointDef = 'DEF POS ' + pname + '=(' +
            j1 + ',' +
            j2 + ',' +
            j3 + ',' +
            j4 + ',' +
            j5 + ',' +
            j6 + ')(7,0)';
        $('#' + modalCallerId).val(pointDef);
        $('#pointModal').modal('hide');
    } else {
        alert("Please set all input coordinates before pressing add")
    }
}

function runProgram() {
    var message = new ROSLIB.Message({data: '---SINGLE INSTRUCTION---'});
    console.log('Running program');
    cmdExec.publish(message);
    message = new ROSLIB.Message({data: 'SERVO ON'});
    cmdExec.publish(message);
}

function uploadProgram() {
    var text = editor.getValue();
    var lines = getLines(text);
    var message = new ROSLIB.Message({data: '---LOAD PROGRAM BEGIN---'});
    cmdExec.publish(message);

    for (var i in lines) {
        var message = new ROSLIB.Message({data: lines[i]});
        cmdExec.publish(message);
    }
    
    var message = new ROSLIB.Message({data: '---LOAD PROGRAM END---'});
    cmdExec.publish(message);
}

function getLines(text) {
    return text.split('\n').map(
        function(x) {
            return x.trim();
        }
    );
}

/* DEMANAR
 * Afegir line num automaticament ja que utilitzaran labels? Quan obre */
 /* un fitxer tir els nums que duu?
 * Desde host no conecta a rosbridge server
 */

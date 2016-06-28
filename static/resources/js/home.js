var cmdExec;
var editor;
var jointState;
var toolPose;
var modalCallerId;
var requestingJointState = false;


$(document).ready(function(){
    initAce();
    initRoslibjs();
    initBootsrap();
    initKeyCanvas(); 
});

function initAce() {
    //Initializae Ace editor
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/solarized_light");
    //editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().on('change', function () {
        if (document.getElementById("checkbox-flycheck").checked) {
            var errorMessages = analyze_text(editor.getValue());
            editor.getSession().setAnnotations(errorMessages);
        }
    });
}

function clearSyntaxErrorMessages() {
    editor.getSession().clearAnnotations();
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
        $('#connectedLabel').hide();
        $('#disconnectedLabel').show();
    });

    cmdExec = new ROSLIB.Topic({
        ros : ros,
        name : '/execute_instruction',
        messageType : 'std_msgs/String'
    });

    var jointStateListener = new ROSLIB.Topic({
        ros : ros,
        name : '/joint_state',
        messageType : 'std_msgs/String'
    });
    
    jointStateListener.subscribe(receiveJointState);

    var toolPoseListener = new ROSLIB.Topic({
        ros : ros,
        name : '/tool_pose',
        messageType : 'std_msgs/String'
    });
    
    toolPoseListener.subscribe(receiveToolPose);

}

function initBootsrap() {
    //Initialize tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    //Initialize modal
    $('#pointModal').on('shown.bs.modal', function (e) {
        modalCallerId = e.relatedTarget.id;
        setInputCoordenatesFromModalCaller();
        $('#myInput').focus();
    })

    //File input listeners
    $('#mb4InputFile').change(readProgramFile); 
    $('#pointsInputFile').change(readPointsFile); 

    //Disconnect click handler
    $("#disconnectedLabel").click(initRoslibjs);
}

function readProgramFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
	  var contents = e.target.result;
          var pointLines = getLines(contents);
          var processedLines = [];
          if (f.name.endsWith('.MB4')) {
              for (var i in pointLines) {
                  var line = pointLines[i];
                  // Strip line number and extra spaces
                  line = line .replace(/^\d+[ \t]*/i, '');
                      //.replace(/;[^$]*$/i, '')
                      //.trim()
                      //.replace(/[\t ]+/i, ' ');
                  processedLines.push(line);
              }
              editor.setValue(processedLines.join('\n'));
          } else {
              alert('Please select an .MB4 file');
          }
          //if (f.name.endsWith('.MB4')) {
          //    editor.setValue(contents);
          //} else {
          //    alert('Please select an .MB4 file');
          //}
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
        '<input type="text" class="points form-control"' +
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
        var j3 = $('#j3input').val();
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
        if (document.getElementById("checkbox-flycheck").checked) {
            var errorMessages = analyze_text(editor.getValue());
            editor.getSession().setAnnotations(errorMessages);
        }
    } else {
        alert("Please set all input coordinates before pressing add")
    }
}

function setInputCoordenatesFromArray(name, arr) {
    if (name !== null)
        $('#nameinput').val(name);
    $('#j1input').val(arr[0]);
    $('#j2input').val(arr[1]);
    $('#j3input').val(arr[2]);
    $('#j4input').val(arr[3]);
    $('#j5input').val(arr[4]);
    $('#j6input').val(arr[5]);
}

function resetInputCoordenates() {
    setInputCoordenatesFromArray('', ['', '', '', '', '', '']);
}

function setInputCoordenatesFromModalCaller() {
    var text = $('#' + modalCallerId).val();
    var name = $('#' + modalCallerId).val().substr(8).split('=')[0];
    if (text !== '') {
        var inputCoordenates = text.slice(0, -6).split('(')[1].split(',');
        setInputCoordenatesFromArray(name, inputCoordenates);
    } else {
        resetInputCoordenates();
    }
}

function setInputCoordenatesFromJointState(jointState) {
    setPointFromArray(null, jointState);
}

function importCurrentRobotPosition() {
    publishMessage("---REQUEST JOINT STATE---");
    requestingJointState = modalCallerId;
}

function runProgram() {
    var message = new ROSLIB.Message({data: '---RUN PROGRAM---'});
    console.log('Running program');
    cmdExec.publish(message);
}

function uploadProject() {
    deleteFromRobot();
    uploadProgram();
    uploadPoints();
}

function uploadProgram() {
    var text = editor.getValue();
    var lines = getLines(text);
    var message = new ROSLIB.Message({data: '---LOAD PROGRAM BEGIN---'});
    cmdExec.publish(message);

    for (var i in lines) {
        var linenum = (parseInt(i) + 1) * 10;
        var line = lines[i];
        // Remove extra spaces and comments
        line = linenum + ' ' +
            line.replace(/'[^$]*$/i, '')
            .trim()
            .replace(/[\t ]+/i, ' ');
        var message = new ROSLIB.Message({data: line});
        cmdExec.publish(message);
    }
    
    var message = new ROSLIB.Message({data: '---LOAD PROGRAM END---'});
    cmdExec.publish(message);
}

function uploadPoints() {
    var message = new ROSLIB.Message({data: '---LOAD POINTS BEGIN---'});
    cmdExec.publish(message);

    for (var i = 1; i <= numPoints; i++) {
        var point = $('#point' + i + 'input').val();
        var message = new ROSLIB.Message({data: point});
        cmdExec.publish(message);
    }
    
    var message = new ROSLIB.Message({data: '---LOAD POINTS END---'});
    cmdExec.publish(message);
}

function deleteFromRobot() {
    publishMessage('---DELETE---');
}

function getLines(text) {
    return text.split('\n').map(
        function(x) {
            return x.trim();
        }
    );
}

function syntaxCheck() {
    console.log("Starting syntax check");
    var errorMessages = analyze_text(editor.getValue());
    editor.getSession().setAnnotations(errorMessages);
    console.log("Syntax check finished");
}

function publishMessage(msg) {
    var message = new ROSLIB.Message({data: msg});
    cmdExec.publish(message);
}

function getJointState() {
    publishMessage("---REQUEST JOINT STATE---");
}

function receiveToolPose(msg) {
    console.log(msg.data);
}

function unpackJointStateMessage(msg) {
    var data = msg.data;
    var jointState = data.split(',');
    if (jointState.length != 6)
        throw "Invalid joint state message length";
    return jointState;
}

function receiveJointState(msg) {
    console.log(msg.data);
    if (requestingJointState) {
        var jointState = unpackJointStateMessage(msg);
        setPointFromJointState(requestingJointState, jointState);
        requestingJointState = false;
    }
}

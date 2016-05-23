var cmdExec;
var editor;

$(document).ready(function(){
    //Initializae Ace editor
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/solarized_light");
    editor.getSession().setMode("ace/mode/javascript");

    //Initialize ROSlibjs
    var ros = new ROSLIB.Ros({
        url : 'ws://10.0.2.15:9090'
    });

    ros.on('connection', function() {
        console.log('Connected to websocket server.');
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
    //Initialize tabs
    //$('#tabView a:last').tab('show');

    //Initialize tooltips
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    //Initialize modal
    $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').focus()
    })

    //Initialize buttons
    $('#btn-add-point').click(function(e){
        console.log("Hello world!");
    });

    $('#point1input').click(function(e){
        console.log("Point 1 input clicked");
    });

    $('#btn-input-coordinates').click(function(e){
        console.log("Input coordinates clicked");
        var x = $('#xinput').val();
        var y = $('#yinput').val();
        var z = $('#zinput').val();
        var roll = $('#rhoinput').val();
        var pitch = $('#thetainput').val();
        var yaw = $('#psiinput').val();
        $('#point1input').val(x + "-" + y + "-" + z + "-" +
                               roll + "-" + pitch + "-" + yaw);
    });
});

function runProgram() {
    var message = new ROSLIB.Message({data: '---SINGLE INSTRUCTION---'});
    console.log('Running program');
    cmdExec.publish(message);
    message = new ROSLIB.Message({data: 'SERVO ON'});
    cmdExec.publish(message);
}

function getLines(text) {
    return text.split('\n');
}

function uploadProgram() {
    var text = editor.getValue();
    var lines = getLines(text);
    var message = new ROSLIB.Message({data: '---LOAD PROGRAM BEGIN---'});
    cmdExec.publish(message);

    for (var i in lines) {
        var message = new ROSLIB.Message({data: lines[i].trim()});
        cmdExec.publish(message);
    }
    
    var message = new ROSLIB.Message({data: '---LOAD PROGRAM END---'});
    cmdExec.publish(message);
}


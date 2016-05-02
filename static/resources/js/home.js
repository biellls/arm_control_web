$(document).ready(function(){
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/solarized_light");
    editor.getSession().setMode("ace/mode/javascript");

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
});


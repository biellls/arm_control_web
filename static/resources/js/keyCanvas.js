//Keys icons based on Keyboard Key by Arthur Shlain from the Noun Project
var canvas;
var ctx;

var keys = ['w', 'a', 's', 'd'];
var keyPosition = {
    'w': [200, 20],
    'a': [90, 130],
    's': [200, 130],
    'd': [310, 130]
}

var keyImgId = {
    'w': 'wImg',
    'a': 'aImg',
    's': 'sImg',
    'd': 'dImg'
}

var keyPressed = {
    'w': false,
    'a': false,
    's': false,
    'd': false
}

function initKeyCanvas() {
    canvas =document.getElementById("keyCanvas");
    ctx = canvas.getContext("2d");
    canvas.addEventListener( "keydown", doKeyDown, true);
    canvas.addEventListener( "keyup", doKeyUp, true);
    drawKeys();
}

function drawKeys() {
    for (var i in keys) {
        key = keys[i]
        drawKey(key, keyPressed[key]);
    }
}

var lastState = {};
function repaint() {
    if (lastState === {} || stateChanged()) { 
        clearCanvas();
        drawKeys();
    }
    updateLastState();
}

function updateLastState() {
    for (var i in keyPressed)
        lastState[i] = keyPressed[i];
}

function stateChanged() {
    for (var i in keyPressed) {
        if (keyPressed[i] !== lastState[i])
            return true;
    }
    return false;
}

/*
 * Key is w, a, s or d
 */
function drawKey(key, pressed) {
    var imgId = keyImgId[key];
    if (pressed)
        imgId += 'Pressed';
    var img=document.getElementById(imgId);
    var keyPos = keyPosition[key];
    ctx.drawImage(img, keyPos[0], keyPos[1]);
}

function doKeyDown(e) {
    if (e.keyCode == 87) {  // w is pressed
        keyPressed['w'] = true;
        repaint();
    }
}

function doKeyUp(e) {
    if (e.keyCode == 87) {  // w is pressed
        keyPressed['w'] = false;
        repaint();
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

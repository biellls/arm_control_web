//Keys icons based on Keyboard Key by Arthur Shlain from the Noun Project
var canvas;
var ctx;

var keyInfo = {
    'w': {
        'position': [200, 20],
        'keyImgId': 'wImg',
        'keyPressed': false
    },
    'a': {
        'position': [90, 130],
        'keyImgId': 'aImg',
        'keyPressed': false
    },
    's': {
        'position': [200, 130],
        'keyImgId': 'sImg',
        'keyPressed': false
    },
    'd': {
        'position': [310, 130],
        'keyImgId': 'dImg',
        'keyPressed': false
    },
    'space': {
        'position': [70, 400],
        'keyImgId': 'spaceImg',
        'keyPressed': false
    },
    'up': {
        'position': [600, 20],
        'keyImgId': 'upImg',
        'keyPressed': false
    },
    'down': {
        'position': [600, 130],
        'keyImgId': 'downImg',
        'keyPressed': false
    }
}

function initKeyCanvas() {
    canvas =document.getElementById("keyCanvas");
    ctx = canvas.getContext("2d");
    $('#keyCanvas').css('background-color', 'rgba(51, 153, 255, 0.2)');
    canvas.addEventListener( "keydown", doKeyDown, true);
    canvas.addEventListener( "keyup", doKeyUp, true);
    drawKeys();
}

function drawKeys() {
    for (var key in keyInfo) {
        drawKey(key, keyInfo[key]['keyPressed']);
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
    //for (var i in keyPressed)
    //    lastState[i] = keyPressed[i];
    for (var key in keyInfo)
        lastState[key] = keyInfo[key]['keyPressed']
}

function stateChanged() {
    for (var key in keyInfo) {
        if (keyInfo[key]['keyPressed'] !== lastState[key])
            return true;
    }
    return false;
}

/*
 * Key is w, a, s, d, space etc
 */
function drawKey(key, pressed) {
    var imgId = keyInfo[key]['keyImgId'];
    if (pressed)
        imgId += 'Pressed';
    var img=document.getElementById(imgId);
    var keyPos = keyInfo[key]['position'];
    ctx.drawImage(img, keyPos[0], keyPos[1]);
}

function doKeyDown(e) {
    if (e.keyCode == 87) {  // w is pressed
        console.log('h');
        keyInfo['w']['keyPressed'] = true;
    } else if (e.keyCode == 65) {
        keyInfo['a']['keyPressed'] = true;
    } else if (e.keyCode == 83) {
        keyInfo['s']['keyPressed'] = true;
    } else if (e.keyCode == 68) {
        keyInfo['d']['keyPressed'] = true;
    } else if (e.keyCode == 32) {
        keyInfo['space']['keyPressed'] = true;
    } else if (e.keyCode == 38) {
        keyInfo['up']['keyPressed'] = true;
    } else if (e.keyCode == 40) {
        keyInfo['down']['keyPressed'] = true;
    }
    e.preventDefault();
    repaint();
}

function doKeyUp(e) {
    if (e.keyCode == 87) {  // w is pressed
        keyInfo['w']['keyPressed'] = false;
    } else if (e.keyCode == 65) {
        keyInfo['a']['keyPressed'] = false;
    } else if (e.keyCode == 83) {
        keyInfo['s']['keyPressed'] = false;
    } else if (e.keyCode == 68) {
        keyInfo['d']['keyPressed'] = false;
    } else if (e.keyCode == 32) {
        keyInfo['space']['keyPressed'] = false;
    } else if (e.keyCode == 38) {
        keyInfo['up']['keyPressed'] = false;
    } else if (e.keyCode == 40) {
        keyInfo['down']['keyPressed'] = false;
    }
    repaint();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var c, ctx, a, gain, osc;

var keys = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];
var factor = Math.pow(2, 1/12);
var noteName = ["A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab"];
var rootName = "A";
var root = 440 * Math.pow(factor, noteName.indexOf(rootName));
var chromatic = [1,1,1,1,1,1,1,1,1,1,1,1];
var diatonic = [2,1,2,2,2,1,2];
var gypsy = [1,3,1,2,1,3,1];
var sc3 = [1,2,1,4,1,2,1];
var sc4 = [1,2,2,2,2,2,1];
var sc5 = [2,1,1,4,1,1,2];
var sc6 = [1,1,2,4,2,1,1];
var sc7 = [3,1,1,2,1,1,3];
var sc8 = [1,1,3,2,3,1,1];
var sc9 = [2,2,1,2,1,2,2];
var sc10 = [1,1,1,6,1,1,1];

var scale = diatonic;
var rootKey = 'q';
var canvasratio = 0.333;

var pressedKey;
var scaleKeys;
var keyMap;

function init() {
  a = new AudioContext();
  gain = a.createGain();
  gain.connect(a.destination);
  gain.gain.setValueAtTime(0.2, a.currentTime);

  c = document.createElement("canvas");
  ctx = c.getContext("2d");

  document.body.appendChild(c);
  c.width = window.innerWidth*4/5;
  c.height = canvasratio*c.width;

  scaleKeys = getScaleKeys();

  drawKeyboard();

  window.addEventListener("resize", function() {
    c.width = window.innerWidth*4/5;
    c.height = c.width * canvasratio
    drawKeyboard();
  }, false);

  window.addEventListener("keydown", function(e) {
    pressedKey = e.key.toLowerCase();
    if (validKey(pressedKey)) {
      console.log(pressedKey);
      var freq = getFreq(pressedKey);
      osc = a.createOscillator();
      osc.frequency.setValueAtTime(freq, a.currentTime);
      osc.connect(gain);
      osc.start();
      drawKeyboard();
    }
  });
  window.addEventListener("keyup", function(e) {
    if (osc) {
      osc.disconnect();
      osc.stop();
    }
    pressedKey = null;
    drawKeyboard();
  });
}

function getScaleKeys() {
  var arr = [];
  for (var i = 0; i < keys.length; i++) {
    arr = arr.concat(keys[i]);
  }
  console.log(arr);
  var scaleKeys = [];
  var start = arr.indexOf(rootKey);
  scaleKeys.push(arr[start]);
  var pos = 0;
  var i = start + scale[pos];
  for (; i < arr.length;) {
    scaleKeys.push(arr[i]);
    i += scale[pos];
    pos = (pos + 1) % scale.length;
  }
  return scaleKeys;
}

function validKey(key) {
  for (var i = 0; i < keys.length; i++) {
    for (var j = 0; j < keys[i].length; j++) {
      if (key === keys[i][j]) return true;
    }
  }
  return false;
}

function getFreq(key) {
  var semitones = 0;
  for (var i = 0; i < keys.length; i++) {
    for (var j = 0; j < keys[i].length; j++) {
      if (key !== keys[i][j]) semitones += 1;
      else return root * Math.pow(factor, semitones);
    }
  }
}

function drawKeyboard() {
  ctx.fillStyle = "rgb("+Math.floor(Math.random()*256)+", " + Math.floor(Math.random()*256)+ "," +Math.floor(Math.random()*256) +")";
  ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);



  var keySpacing = ctx.canvas.width / 13;
  var keyPadding = 0.2 * keySpacing;
  var keyDim = keySpacing - keyPadding;

  for (var i = 0; i < keys.length; i++) {
    var y = keySpacing * i + keyPadding;
    for (var j = 0; j < keys[i].length; j++) {
      var x = keySpacing * j + keyPadding + i * keySpacing/3;
      ctx.strokeStyle = "rgb(255,255,255)";
      ctx.lineWidth = 2;
      if (keys[i][j] === pressedKey) {
        ctx.fillStyle = "rgb(0,255,255)";
      } else if (scaleKeys.includes(keys[i][j])) {
        ctx.fillStyle = "rgb(255,0,0)";
      } else {
        ctx.fillStyle = "rgb(0,0,0)";
      }
      ctx.fillRect(x,y, keyDim, keyDim);
      //ctx.stroke();
      //ctx.fill();
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.textBaseline = "top";
      ctx.font = keyDim/4 + "px arial";
      ctx.fillText(keys[i][j].toUpperCase(), x + keyDim/4, y + keyDim/4);
    }
  }
}

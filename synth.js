  
var c, ctx, a, gain, osc;

var keys = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';',
  'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.',
];
var factor = Math.pow(2, 1/12);
var noteNames = ["A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab"];
var rootName = "A";
var rootKey = 'f';
var rootFreq = 440 * Math.pow(factor, noteNames.indexOf(rootName));

var chromatic = [1,1,1,1,1,1,1,1,1,1,1];
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

var scales = {
  chromatic: chromatic,
  diatonic: diatonic,
  gypsy: gypsy,
  sc3: sc3,
  sc4: sc4,
  sc5: sc5,
  sc6: sc6,
  sc7: sc7,
  sc8: sc8,
  sc9: sc9,
  sc10: sc10
};

var scale = scales.chromatic;
var canvasratio = 0.333;

var keySounds = {};
var pressedKeys = {};

function init() {

  c = document.createElement("canvas");
  ctx = c.getContext("2d");

  document.body.appendChild(c);
  c.width = window.innerWidth*4/5;
  c.height = canvasratio*c.width;

  scaleKeys = getScaleKeys();
  setScale();

  drawKeyboard();

  window.addEventListener("resize", function() {
    setSize();
    drawKeyboard();
  }, false);

  window.addEventListener("keydown", function(e) {
    let key = e.key.toLowerCase();

    if (pressedKeys[key]) return;
    if (validKey(key)) {
      startSound(key);
      
      drawKeyboard();
    }
  });
  window.addEventListener("keyup", function(e) {
    let key = e.key.toLowerCase();
    stopSound(key);

    drawKeyboard();
  });
  document.getElementById("scale-selector").addEventListener("input", (e) => {
    stopAllSounds();
    setScale();
    drawKeyboard();
  });
  window.addEventListener("blur", function(e) {
    stopAllSounds();

  });
}

function startSound(key) {
  pressedKeys[key] = true;

  let freq = getFreq(key);
  var sineWave = new Pizzicato.Sound({ 
    source: 'wave', 
    options: {
        frequency: freq
    }
  });

  sineWave.play();
  keySounds[key] = sineWave;
}
function stopSound(key) {
  let sound = keySounds[key];
  if (sound) sound.stop();
  keySounds[key] = null;
  pressedKeys[key] = null;
}
function stopAllSounds() {
  for (let key in keySounds) {
    stopSound(key)
  }
}

function setScale() {
  let scale_selector = document.getElementById("scale-selector");
  scale = scales[scale_selector.value];
}
function setSize() {
  c.width = window.innerWidth*4/5;
  c.height = c.width * canvasratio;
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
      if (key === keys[i]) return true;
  }
  return false;
}

function distFromRootKey(key) {
  let rootKeyIndex = -1
  let keyIndex = -1
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === rootKey) rootKeyIndex = i;
    if (keys[i] === key) keyIndex = i;
  }
  return keyIndex - rootKeyIndex;
}

function getFreq(key) {
  let dist = distFromRootKey(key);
  let semitones = 0;

  const stepDirection = dist < 0 ? -1 : 1;
  for (let i = 0; i < stepDirection * dist; i++) {
    semitones += stepDirection * scale[mod(stepDirection * i, scale.length)]; // use correct modulus
  }
  return rootFreq * Math.pow(factor, semitones);
}

function getNoteName(key) {
  let dist = distFromRootKey(key);

  const stepDirection = dist < 0 ? -1 : 1;
  let noteSteps = 0;
  for (let i = 0; i < stepDirection * dist; i++) {
      noteSteps += stepDirection * scale[mod(stepDirection * i, scale.length)]; // use correct modulus
  }
  let rootNamePosition = noteNames.indexOf(rootName);
  return noteNames[mod(rootNamePosition + noteSteps, noteNames.length)] // use correct modulus
}

const backgroundColor = "rgb("+Math.floor(Math.random()*256)+", " + Math.floor(Math.random()*256)+ "," + Math.floor(Math.random()*256) +")";
function drawKeyboard() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

  const keySpacing = ctx.canvas.width / 13;
  const keyPadding = 0.2 * keySpacing;
  const keyDim = keySpacing - keyPadding;

  let y = keyPadding;
  let horiCount = 0;
  let vertCount = 0;
  for (var i = 0; i < keys.length; i++) {
      var x = keySpacing * horiCount + keyPadding + vertCount * keySpacing/3;
      ctx.strokeStyle = "rgb(255,255,255)";
      ctx.lineWidth = 2;
      if (pressedKeys[keys[i]]) {
        ctx.fillStyle = "rgb(0,255,255)";
      } else {
        ctx.fillStyle = "rgb(0,0,0)";
      }
      ctx.fillRect(x, y, keyDim, keyDim);
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.textBaseline = "top";
      ctx.font = keyDim/4 + "px arial";
      ctx.fillText(getNoteName(keys[i]), x + keyDim/4, y + keyDim/4);
      horiCount++;
      if (keys[i] === 'p' || keys[i] === ';' || keys[i] === '.') {
        y += keySpacing;
        horiCount = 0;
        vertCount++;
      }
  }
}

function mod(a, b) {
  return ((a % b) + b) % b;
}
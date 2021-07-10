  
let canvas, ctx;

const keys = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'',
  'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'
];
const factor = Math.pow(2, 1/12);
const noteNames = ["A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab"];
let rootName = "A";
let rootKey = 'f';
let AFreq = 440;

const chromatic = [1,1,1,1,1,1,1,1,1,1,1];
const diatonic = [2,1,2,2,2,1,2];
const gypsy = [1,3,1,2,1,3,1];
const sc3 = [1,2,1,4,1,2,1];
const sc4 = [1,2,2,2,2,2,1];
const sc5 = [2,1,1,4,1,1,2];
const sc6 = [1,1,2,4,2,1,1];
const sc7 = [3,1,1,2,1,1,3];
const sc8 = [1,1,3,2,3,1,1];
const sc9 = [2,2,1,2,1,2,2];
const sc10 = [1,1,1,6,1,1,1];

const scales = {
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

let scale = scales.chromatic;
let canvasratio = 0.333;

let keySounds = {};
let pressedKeys = {};
let volume, attack, release;

function init() {
  c = document.createElement("canvas");
  ctx = c.getContext("2d");
  document.body.appendChild(c);

  setSize();
  setRoot();
  setScale();
  setEffects();

  drawKeyboard();

  window.addEventListener("resize", function() {
    setSize();
    drawKeyboard();
  }, false);

  window.addEventListener("keydown", function(e) {
    let key = e.key.toLowerCase();

    if (key === '\'' || key === '/') e.preventDefault();

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
  document.getElementById("root-select").addEventListener("input", (e) => {
    document.activeElement.blur()
    stopAllSounds();
    setRoot();
    drawKeyboard();
  });
  document.getElementById("scale-select").addEventListener("input", (e) => {
    document.activeElement.blur()
    stopAllSounds();
    setScale();
    drawKeyboard();
  });
  document.getElementById("value-volume").addEventListener("input", (e) => {
    stopAllSounds();
    setEffects();
    drawKeyboard();
  });
  document.getElementById("value-attack").addEventListener("input", (e) => {
    stopAllSounds();
    setEffects();
    drawKeyboard();
  });
  document.getElementById("value-release").addEventListener("input", (e) => {
    stopAllSounds();
    setEffects();
    drawKeyboard();
  });
  window.addEventListener("blur", function(e) {
    stopAllSounds();

  });
}

// sound generation and management

function startSound(key) {
  pressedKeys[key] = true;

  let freq = getFreq(key);
  let sineWave = new Pizzicato.Sound({ 
    source: 'wave', 
    options: {
        frequency: freq,
        volume: Number(volume),
        attack: Number(attack),
        release: Number(release)
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

// some logic

function setScale() {
  let scale_select = document.getElementById("scale-select");
  scale = scales[scale_select.value];
}

function setRoot() {
  let rootSelect = document.getElementById("root-select");
  rootName = noteNames[rootSelect.value];
}

function setEffects() {
  volume = document.querySelector("#value-volume").value;
  attack = document.querySelector("#value-attack").value;
  release = document.querySelector("#value-release").value;

  document.querySelector("#volume-display").innerHTML = volume;
  document.querySelector("#attack-display").innerHTML = attack;
  document.querySelector("#release-display").innerHTML = release;
}

function validKey(key) {
  for (let i = 0; i < keys.length; i++) {
      if (key === keys[i]) return true;
  }
  return false;
}

// key distance
function distFromRootKey(key) {
  let rootKeyIndex = -1
  let keyIndex = -1
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === rootKey) rootKeyIndex = i;
    if (keys[i] === key) keyIndex = i;
  }
  return keyIndex - rootKeyIndex;
}

// note distance
function rootDistFromANote() {
  return noteNames.indexOf(rootName);
}

function getFreq(key) {
  let dist = distFromRootKey(key);
  let semitones = rootDistFromANote();
  if (dist < 0) for (let i = -1; i >= dist; i--) semitones -= scale[mod(i, scale.length)]
  else for (let i = 0; i < dist; i++) semitones += scale[mod(i, scale.length)];
  return AFreq * Math.pow(factor, semitones);
}

function getNoteName(key) {
  let dist = distFromRootKey(key);
  let noteSteps = 0;

  const stepDirection = dist < 0 ? -1 : 1;
  if (dist < 0) for (let i = -1; i >= dist; i--) noteSteps -= scale[mod(i, scale.length)];
  else for (let i = 0; i < dist; i++) noteSteps += scale[mod(i, scale.length)];
  let rootPosition = rootDistFromANote();
  return noteNames[mod(rootPosition + noteSteps, noteNames.length)] 
}

// render stuff

function setSize() {
  c.width = window.innerWidth*4/5;
  c.height = c.width * canvasratio;
}

const backgroundColor = "rgb("+Math.floor(Math.random()*256)+", " + Math.floor(Math.random()*256)+ "," + Math.floor(Math.random()*256) +")";
function drawKeyboard() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

  const keySpacing = ctx.canvas.width / 13;
  const keyPadding = 0.2 * keySpacing;
  const keyDim = keySpacing - keyPadding;

  let horiCount = 0;
  let vertCount = 0;
  for (let i = 0; i < keys.length; i++) {
      let x = keySpacing * horiCount + keyPadding + vertCount * keySpacing/3;
      let y = keyPadding + keySpacing * vertCount;
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
      if (keys[i] === ']' || keys[i] === '\'' ) {
        horiCount = 0;
        vertCount++;
      }
  }
}

// utils

function mod(a, b) {
  return ((a % b) + b) % b;
}

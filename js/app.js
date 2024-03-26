let alreadySetup = false;
let device;
let ctx;
let response;
let patcher;
let inconsolata;

// preload fonts
function preload() {
  inconsolata = loadFont('assets/Inconsolata.otf');
}

//your p5 stuffs
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.touchStarted(myTouchStarted);
  initialSetup();
  
  background(0);
  textAlign(CENTER, CENTER);
  textFont(inconsolata);
  textSize(96);
  fill('white');
  text("Touch to Start", windowWidth/2, windowHeight/2);
}

function draw() {
  if(alreadySetup == false){
    return;
  }
  device.parametersById.get("myVal").value = parseFloat(mouseX)/width;
  let bg = device.parametersById.get("outputBG").value;
  console.log(device.parametersById.get("outputBG").value);
  background(Math.floor(bg)*255);

  textAlign(CENTER, CENTER);
  textFont(inconsolata);
  textSize(196);
  fill('white');
  text("Listen", windowWidth/2, 98);
  fill('black');
  text("Speak", windowWidth/2, windowHeight-98);
}

function mousePressed() {
  print("mouse press detected.");

  if (alreadySetup) return;

  alreadySetup = true;
  ctx.resume();
  print("async");
	console.log("made it to run!");

  setupAudio();
}
function myTouchStarted() {
  print("touch started");
 
  if (alreadySetup) return;
  alreadySetup = true;
  ctx.resume();
  print("async");
	console.log("made it to run!");

  setupAudio();
}

async function initialSetup()
{
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  response = await fetch("export/patch.export.json");
  patcher = await response.json();
  
  device = await RNBO.createDevice({
    context: ctx,
    patcher
  });
}
async function setupAudio() 
{
  try {
    // Access user's microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log(stream);
    // Create Media Stream source
    const source = ctx.createMediaStreamSource(stream);
    console.log(source);
    // Connect source to RNBO Device
    source.connect(device.node);
    
    // Connect RNBO Device to destination output
    device.node.connect(ctx.destination);
    
  } catch (err) {
    console.log(err);
  }
}
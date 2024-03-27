let alreadySetup = false;
let device;
let ctx;
let response;
let patcher;
let inconsolata;
let bg;
let metro;
let record = true;
let count = 0;
let perFrame;

// preload fonts
function preload() {
  inconsolata = loadFont('assets/Inconsolata.otf');
}

//your p5 stuffs
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.touchStarted(myTouchStarted);
  initialSetup();

  metro = device.parametersById.get("metro").value;
  console.log("metro");
  console.log(metro);
  perFrame = 1000 / frameRate();

  device.parametersById.get("up").value = parseFloat(255);
  device.parametersById.get("down").value = parseFloat(0);

  device.parameterChangeEvent.subscribe((param) => {
    let id = param.id;
    console.log(id);
    if(id == "outputBG") {
      console.log(param.value);
    }
  });
  
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

  // device.parametersById.get("myVal").value = parseFloat(mouseX)/width;

  if(record){
    count += perFrame;
    if(count >= metro){
      record = false;
    }
  } else{
    count -= perFrame;
    if(count <= 0){
      record = true;
    }
  }
  background(Math.floor(count / metro * 255));

  bg = device.parametersById.get("outputBG").value;
  //console.log(device.parametersById.get("test").value);
  //console.log(bg);
  //background(Math.floor(bg)*255);

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
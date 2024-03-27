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
let globalCount = 0;
let perFrame;
let transition = 3000;
let connected = false;
let img;

// preload fonts
function preload() {
  inconsolata = loadFont('assets/Inconsolata.otf');
  img = loadImage('assets/squiggle2.png');
}

//your p5 stuffs
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.touchStarted(myTouchStarted);
  initialSetup().then(
    function(value) {
      metro = device.parametersById.get("metro").value;
      console.log("metro");
      console.log(metro);

      device.parametersById.get("up").value = parseFloat(255);
      device.parametersById.get("down").value = parseFloat(0);

      device.parameterChangeEvent.subscribe((param) => {
        let id = param.id;
        console.log(id);
        if(id == "outputBG") {
          console.log(param.value);
        }
      });
    },
    function(error) {
      console.log("error");
    }
  );

  perFrame = 1000.0 / frameRate();
  // console.log("frame rate", frameRate());
  // console.log("frame increment", perFrame);
  
  background(0);
  textAlign(CENTER, CENTER);
  textFont(inconsolata);
  textSize(96);
  fill('white');
  text("Touch to Start", windowWidth/2, windowHeight/2);
}

function draw() {
  if(alreadySetup == false || connected == false){
    return;
  }

  //metro = device.parametersById.get("metro").value;
  //console.log("metro");
  //console.log(metro);
  metro = 8000;
  
  perFrame = 1000.0 / frameRate();

  // device.parametersById.get("myVal").value = parseFloat(mouseX)/width;

  if(record){
    globalCount += perFrame;
    if(globalCount >= metro){
      record = false;
    }

    if(count <= transition && globalCount >= metro-transition){
      count += perFrame;
    }
  } else{
    globalCount -= perFrame;
    if(globalCount <= 0){
      record = true;
    }

    if(count >= 0 && globalCount <= transition){
      count -= perFrame;
    }
  }
  background(Math.floor(count / transition * 255));

  bg = device.parametersById.get("outputBG").value;
  //console.log(device.parametersById.get("test").value);
  //console.log(bg);
  //background(Math.floor(bg)*255);

  let inputAmp = device.parametersById.get("inputAmp").value;
  image(img, windowWidth/2, windowHeight/2);
  img.resize(windowWidth/2,0);
  img.resize(img.width*inputAmp,0);

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
  connected = true;
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
(async () => {
  
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const response = await fetch("export/patch.export.json");
  const patcher = await response.json();
  let setup = false;
  
  const device = await RNBO.createDevice({
    context: ctx,
    patcher
  });
  
  const run = async () => {
    if (setup) return;
    setup = true;
    ctx.resume();

	console.log("made it to run!")
    try {
	
	
		
      // Access user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log(stream)
      // Create Media Stream source
      const source = ctx.createMediaStreamSource(stream);
      console.log(source)
      // Connect source to RNBO Device
      source.connect(device.node);
      
      // Connect RNBO Device to destination output
      device.node.connect(ctx.destination);
      
    } catch (err) {
      console.log(err);
    }
  };
  
  const onGainChange = (e) => device.parametersById.get(e.currentTarget.name).normalizedValue = parseFloat(e.currentTarget.value);
  
  document.querySelector("#start").onclick = run;
  document.querySelector("#gain").onchange = onGainChange;
})();
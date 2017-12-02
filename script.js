// Fetch and instantiate our wasm module
fetch("rust.wasm").then(response =>
  response.arrayBuffer()
).then(bytes =>
  WebAssembly.instantiate(bytes, { env: {} })
).then(results => {
  console.log("got instance");
  console.log(results);
  let module = {};
  let mod = results.instance;
  module.update  = mod.exports.update;
  module.alloc   = mod.exports.alloc;
  module.dealloc = mod.exports.dealloc;
  module.fill    = mod.exports.fill;

  console.log(module);
  var canvas = document.getElementById('screen');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    width = 50;
    height = 50;
    let byteSize = width * height * 4;
    buffer = module.alloc( byteSize );
    console.log("allocated buffer: "+buffer);

    image = ctx.getImageData(0, 0, width, height)
    data = image.data
    module.fill(buffer, width*height, 0);
    console.log(image)
    console.log("filled buffer")
    //var sub = module.HEAP8.subarray(buffer, buffer + width * height * 4);
    //console.log(sub);
    var usub = new Uint8Array(buffer);
    console.log(usub);
    data.set(usub);
    console.log(data)
    console.log(image.data)
    //data.set(module.HEAP8.subarray(0, width * height * 4));
    console.log("set image data")

    ctx.putImageData(image, 0, 0)
    console.log("put image data")


    var canvas2 = document.getElementById('screenLarge');

    if (canvas2.getContext) {
      var ctx2 = canvas2.getContext('2d');
      ctx2.scale(500/50, 500/50);
      ctx2.drawImage(canvas, 0, 0);
    }
    //free(buffer)
  }

  var start = null;
  //const fill  = module.cwrap('fill2', 'void', ['number', 'number', 'number'])
  function step(timestamp) {
    var progress;
    if (start === null) start = timestamp;
    progress = timestamp - start;
    if (progress > 100) {
      module.fill(buffer, width*height, timestamp / 100);
      var sub = module.HEAP8.subarray(buffer, buffer + width * height * 4);
      var usub = new Uint8Array(sub);
      data.set(usub);
      ctx.putImageData(image, 0, 0)
      ctx2.drawImage(canvas, 0, 0);
      start = timestamp
    }
    //if (progress < 2000) {
    window.requestAnimationFrame(step);
    //}
  }

  step();

});

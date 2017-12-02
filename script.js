/*
  function imports() {
    const res = resources();
    var ctx = canvas.getContext("2d");
    function clear_screen() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function draw_player(x, y, angle) {
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.translate(0, -8);
      ctx.drawImage(res.player, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "black";
      //ctx.fillRect(x - 17, y - 12, 4, 4);
    }
    function draw_enemy(x, y) {
      ctx.drawImage(res.enemy, x - 10, y - 10);
    }
    function draw_bullet(x, y) {
      ctx.drawImage(res.bullet, x - 3, y - 3);
    }
    function draw_particle(x, y, radius) {
      ctx.drawImage(res.particle, x - radius, y - radius, 2 * radius, 2 * radius);
    }
    function draw_score(x) {
      ctx.fillStyle = "orange";
      ctx.textBaseline = "top";
      ctx.font = "20px sans-serif";
      ctx.fillText('Score: ' + x, 10, 10)
    }
// The real loading and running of our wasm starts here
    let imports = { clear_screen, draw_player, draw_enemy, draw_bullet, draw_particle, draw_score };
    imports.Math_atan = Math.atan;
    imports.sin = Math.sin;
    imports.cos = Math.cos;
    return imports;
  }
  */






// Fetch and instantiate our wasm module
fetch("rust.wasm").then(response =>
  response.arrayBuffer()
).then(bytes =>
  WebAssembly.instantiate(bytes, { env: { cos: Math.cos } })
).then(results => {
  console.log("got instance");
  console.log(results);
  console.log(results.instance.exports);
  let module = {};
  let mod = results.instance;
  module.update  = mod.exports.update;
  module.alloc   = mod.exports.alloc;
  module.dealloc = mod.exports.dealloc;
  module.fill    = mod.exports.fill;

  var width  = 500;
  var height = 500;
  var canvas2_width = 500;
  var canvas2_height = 500;
  let byteSize = width * height * 4;
  var pointer = module.alloc( byteSize );
  var buffer = new Uint8Array(mod.exports.memory.buffer, pointer, byteSize);




  console.log(module);
  var canvas = document.getElementById('screen');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    var pointer = module.alloc( byteSize );
    var buffer = new Uint8Array(mod.exports.memory.buffer, pointer, byteSize);

    image = ctx.getImageData(0, 0, width, height)
    data = image.data
    module.fill(pointer, width*height, 0);
    console.log(image)
    console.log("filled buffer")

    var usub = new Uint8ClampedArray(mod.exports.memory.buffer, pointer, byteSize);
    console.log("usub: ");
    var img = new ImageData(usub, width, height);

    console.log(usub);
    data.set(usub);
    console.log(data)
    console.log(image.data)
    console.log("set image data")

    ctx.putImageData(image, 0, 0)
    console.log("put image data")

    var start = null;
    function step(timestamp) {
      var progress;
      if (start === null) start = timestamp;
      progress = timestamp - start;
      if (progress > 100) {
        module.fill(pointer, width*height, timestamp);

        ctx.putImageData(img, 0, 0)
        start = timestamp
      }
      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

});

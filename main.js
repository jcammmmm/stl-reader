const fs = require("fs");

const filepath = "/Users/juan.florez/Downloads/cube.stl";

// taken from https://stackoverflow.com/questions/15808151/how-to-read-binary-file-byte-by-byte-using-javascript
fs.open(filepath, 'r', function(err, fd) {
  if (err)
    throw err;
  var buffer = Buffer.alloc(1);
  while (true)
  {   
    var num = fs.readSync(fd, buffer, 0, 1, null);
    if (num === 0)
      break;
    console.log('byte read', buffer[0], String.fromCharCode(buffer[0]));
  }
});
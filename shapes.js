function buildRectangle(x0, y0, width, height) {
  return [
    x0,          y0,
    x0 + width,  y0,
    x0 + width,  y0 + height,
    x0 + width,  y0 + height,
    x0        ,  y0 + height,
    x0        ,  y0,
  ]
}

function buildF(x0, y0, sz, fr) {
  let f = [];
  f = f.concat(buildRectangle(x0,      y0,      sz, sz*fr));
  f = f.concat(buildRectangle(sz,   sz*fr, sz*fr/3, -sz));
  f = f.concat(buildRectangle(sz, sz*fr/2, sz*fr/4, -sz));
  return f;
}

function build3dTriangle(sz) {
  return [
    0,     0,   0,
    0,    sz,   0,
    sz/2, sz,   0,
  ];
}
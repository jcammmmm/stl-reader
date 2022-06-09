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

/**
 * 
 * @param {integer} axis the perpedicular plane to draw.
 * @param {float} a x0 starting point
 * @param {flaot} b y0 starting point
 * @param {float} c z0 starting point
 * @param {float} w width
 * @param {float} h height
 * @returns plain rectangle coordinates perpendicular to axis
 */
function buildOrto3dRectangle(axis, a, b, c, w, h) {
  if (axis == 2) // z
    return [
      a,         b,     c,
      a + w,     b,     c,
      a + w, b + h,     c,
      a + w, b + h,     c,
      a,     b + h,     c,
      a,         b,     c
    ]
  if (axis == 1) // y
    return [
      a,     b,         c,     
      a + w, b,         c,     
      a + w, b,     c + h,     
      a + w, b,     c + h,     
      a,     b,     c + h,     
      a,     b,         c,         
    ]
  if (axis == 0) // x
    return [
      a,     b,         c,
      a,     b + w,     c,
      a,     b + w, c + h,
      a,     b + w, c + h,
      a,     b,     c + h,
      a,     b,         c,     
    ]
}

function colorRectangle(r, g, b) {
  return [
    r, g, b,
    r, g, b,
    r, g, b,
    r, g, b,
    r, g, b,
    r, g, b,
  ]
}

/**
 * @param {float} a lower-left corner x coord.
 * @param {float} b lower-left corner y coord.
 * @param {float} s (size) trace anchor.
 * @param {float} f (factor) factor lenght of s.
 * @returns an array that contains two array. The first describes the
 * shape, the second the colors.
 */
function buildOrto3dF(a, b, s, f) {
  let F = []; // shape
  let c = []; // colors
  // front F
  F = F.concat(buildOrto3dRectangle(2, 0, 0, 0, s, s*f));
  c = c.concat(colorRectangle(0, 0, 0));
  F = F.concat(buildOrto3dRectangle(2, s, s*f, 0, s*f/2, -s));
  c = c.concat(colorRectangle(0, 0, 0));
  F = F.concat(buildOrto3dRectangle(2, s, s*f/2, 0, s*f/3, s));
  c = c.concat(colorRectangle(0, 0, 0));
  // back F
  F = F.concat(buildOrto3dRectangle(2, 0, 0, -s, s, s*f));
  c = c.concat(colorRectangle(0, 0, 1));
  F = F.concat(buildOrto3dRectangle(2, s, s*f, -s, s*f/2, -s));
  c = c.concat(colorRectangle(0, 0, 1));
  F = F.concat(buildOrto3dRectangle(2, s, s*f/2, -s, s*f/3, s));
  c = c.concat(colorRectangle(0, 0, 1));
  // green
  F = F.concat(buildOrto3dRectangle(0, 0, 0, 0, s*f, -s));
  c = c.concat(colorRectangle(0, 1, 0));
  // cyan - upper
  F = F.concat(buildOrto3dRectangle(1, 0, s*f, 0, s*f/2 + s, -s));
  c = c.concat(colorRectangle(0, 1, 1));
  // red
  F = F.concat(buildOrto3dRectangle(0, s*f/2 + s, s*f, 0, -s, -s));
  c = c.concat(colorRectangle(1, 0, 0));
  // cyan
  F = F.concat(buildOrto3dRectangle(1, s, s*f - s, 0, s*f/2, -s));
  c = c.concat(colorRectangle(0, 1, 1));
  // magenta
  F = F.concat(buildOrto3dRectangle(0, s, s*f - s, 0, -s*f + 2*s + s*f/2, -s));
  c = c.concat(colorRectangle(1, 0, 1));
  // yellow
  F = F.concat(buildOrto3dRectangle(1, s, s + s*f/2, 0, s*f/3, -s));  
  c = c.concat(colorRectangle(1, 1, 0));
  // grey
  F = F.concat(buildOrto3dRectangle(0, s*f/3 + s, s*f/2 + s, 0, -s, -s));
  c = c.concat(colorRectangle(0.5, 0.5, 0.5));
  // purple
  F = F.concat(buildOrto3dRectangle(1, s, s*f/2, 0, s*f/3, -s));  
  c = c.concat(colorRectangle(0.5, 0.5, 1));
  // oliva
  F = F.concat(buildOrto3dRectangle(0, s, 0, 0, s*f/2, -s));  
  c = c.concat(colorRectangle(0.2, 0.3, 0.1));
  // bronze oxide
  F = F.concat(buildOrto3dRectangle(1, 0, 0, 0, s, -s));  
  c = c.concat(colorRectangle(0.5, 0.8, 0.7));

  return {
    geom: F,
    color: c
  }
}
// Builds the final logo SVGs from the traced geometry in traced.json.
//
// The traced loops are raw pixel contours. They are smoothed into cubic
// Béziers with a Catmull-Rom -> Bezier conversion, and the interior holes
// (the P counter) are punched with fill-rule="evenodd".
const fs = require('fs');
const path = require('path');

const ASSETS = 'D:/项目评估系统/co-ai-portal/ai-eval-portal/assets';
const EXPL = 'D:/项目评估系统/co-ai-portal/ai-eval-portal/brand-exploration';

const T = JSON.parse(fs.readFileSync(path.join(EXPL, 'traced.json'), 'utf8'));
const NAVY = '#12143C';
const xml = s => '<?xml version="1.0" encoding="UTF-8"?>\n' + s;

// ---- Catmull-Rom -> cubic Bezier smoothing ----
function smooth(pts, tension = 1) {
  if (pts.length < 3) return '';
  const p = pts.map(([x, y]) => [x, y]);
  let d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n];
    const p1 = p[i];
    const p2 = p[(i + 1) % n];
    const p3 = p[(i + 2) % n];
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
    d += 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d + 'Z';
}

// ---- build one path from all loops (evenodd punches the counter) ----
function buildPath(tension) {
  return T.loops.map(l => smooth(l, tension)).join(' ');
}

// ---- colour ramp from the sampled stops ----
const ramp = T.stops
  .filter(s => s.offset <= 0.70)          // drop the washed-out tail stop
  .map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
  .join('');

// The reference runs along a diagonal; map the gradient onto that axis.
const [bx0, by0, bx1, by1] = T.bbox;
const defs = `
  <linearGradient id="gLogo" gradientUnits="userSpaceOnUse" x1="${bx0}" y1="${by1}" x2="${bx1}" y2="${by0}">
    ${ramp}
    <stop offset="1" stop-color="#F435AB"/>
  </linearGradient>`;

const D = buildPath(1);
const D2 = buildPath(0.85);   // a slightly tighter variant for the small icon

const svg = (d, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx0} ${by0} ${bx1 - bx0} ${by1 - by0}" width="300" height="${Math.round(300 * (by1 - by0) / (bx1 - bx0))}"${extra}>
${defs}
  <path d="${d}" fill="url(#gLogo)" fill-rule="evenodd"/>
</svg>
`;

fs.writeFileSync(path.join(ASSETS, 'brand-mark.svg'), xml(svg(D)), 'utf8');
fs.writeFileSync(path.join(ASSETS, 'icon.svg'), xml(svg(D)), 'utf8');
fs.writeFileSync(path.join(ASSETS, 'favicon.svg'), xml(svg(D2)), 'utf8');

fs.writeFileSync(path.join(ASSETS, 'brand-mark-mono.svg'), xml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx0} ${by0} ${bx1 - bx0} ${by1 - by0}" width="300" height="${Math.round(300 * (by1 - by0) / (bx1 - bx0))}">
  <path d="${D}" fill="${NAVY}" fill-rule="evenodd"/>
</svg>\n`), 'utf8');

fs.writeFileSync(path.join(ASSETS, 'brand-mark-white.svg'), xml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx0} ${by0} ${bx1 - bx0} ${by1 - by0}" width="300" height="${Math.round(300 * (by1 - by0) / (bx1 - bx0))}">
  <path d="${D}" fill="#FFFFFF" fill-rule="evenodd"/>
</svg>\n`), 'utf8');

fs.writeFileSync(path.join(ASSETS, 'favicon-mono.svg'), xml(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bx0} ${by0} ${bx1 - bx0} ${by1 - by0}" width="300" height="${Math.round(300 * (by1 - by0) / (bx1 - bx0))}">
  <path d="${D2}" fill="${NAVY}" fill-rule="evenodd"/>
</svg>\n`), 'utf8');

for (const [src, dst] of [['brand-mark.svg','jp-mark.svg'],['brand-mark-mono.svg','jp-mark-mono.svg'],['brand-mark-white.svg','jp-mark-white.svg']]) {
  fs.writeFileSync(path.join(EXPL, dst), fs.readFileSync(path.join(ASSETS, src)));
}

// preview sheet comparing reference and trace
fs.writeFileSync(path.join(EXPL, '_side.html'), `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:24px;background:#fff;font-family:Arial,sans-serif}
h3{font:700 13px Arial;color:#12143C;margin:0 0 10px}
.r{display:flex;align-items:center;gap:24px;margin-bottom:14px}
.lab{font:700 11px Arial;color:#8A8C9E;width:110px}
img{display:block}
</style></head><body>
<h3>REFERENCE (raster)</h3>
<div class="r"><span class="lab">source</span><img src="_ref.jpg" width="420"></div>
<h3>TRACE (vector)</h3>
<div class="r"><span class="lab">brand-mark</span><img src="/assets/brand-mark.svg" width="420"></div>
<div class="r"><span class="lab">mono</span><img src="/assets/brand-mark-mono.svg" width="420"></div>
<div class="r"><span class="lab">on dark</span><span style="background:#12143C;padding:10px"><img src="/assets/brand-mark.svg" width="420"></span></div>
</body></html>`, 'utf8');

console.log('built from trace | path chars:', D.length, '| bbox:', T.bbox.join(','));

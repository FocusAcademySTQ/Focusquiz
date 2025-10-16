/* =======================================================
   Focus Academy · Generadors de Matemàtiques (mòduls externs)
   Arxiu: math.js
   ======================================================= */

(function(root){
  'use strict';

  const clamp = root.clamp || ((x, a, b) => Math.max(a, Math.min(b, x)));
  const rng = root.rng || ((a, b) => Math.floor(Math.random() * (b - a + 1)) + a);
  const choice = root.choice || ((arr) => arr[Math.floor(Math.random() * arr.length)]);
  const gcd = root.gcd || ((a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const temp = y;
      y = x % y;
      x = temp;
    }
    return x || 1;
  });
  const normFrac = root.normFrac || ((n, d) => {
    if (d === 0) return [NaN, 0];
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return [n / g, d / g];
  });

/* ===================== GENERADORS ===================== */

/* ===== Sistema de nivells 1..4 ===== */

// Rang bàsic per aritmètica (i altres que el facin servir)
function levelRange(level){
  const L = clamp(level,1,4);
  // màxims aproximats de l’operand: 1→20, 2→50, 3→120, 4→200
  const maxes = [0, 20, 50, 120, 200];
  const max = maxes[L];
  return [-Math.floor(max/3), max]; // si allowNeg=false ja es talla a 0..max
}

/* ===== Aritmètica ===== */

function genArith(level, opts={}){
  const allowNeg = !!opts.allowNeg;
  const tri = !!opts.tri;
  const ops = (opts.ops && opts.ops.length)? opts.ops : ['+','-','×','÷'];
  const [mn, mx] = levelRange(level);
  const low = allowNeg ? mn : 0;

  function makeDivisible(xmin, xmax, lvl=1){
    const L = clamp(lvl,1,4);
    const maxDiv = [0,14,20,30,40][L]; // divisor més gran a nivells alts
    const y = rng(2, maxDiv);
    const mult = rng(2, 8 + 4*L);      // fa el dividend més gran
    const prod = y * mult;
    return [prod, y];
  }

  const a = rng(low, mx), b = rng(low, mx);
  const op = choice(ops);

  let text, ans;

  if(tri){
    let c = rng(low, mx);
    let expOp1 = op;
    let expOp2 = choice(ops);
    let x=a, y=b, z=c;
    if(expOp1==='÷'){ [x,y] = makeDivisible(low, mx, level); }
    if(expOp2==='÷'){ [y,z] = makeDivisible(low, mx, level); }
    text = `${x} ${expOp1} ${y} ${expOp2} ${z} = ?`;
    ans = evalArith(x, expOp1, y);
    ans = evalArith(ans, expOp2, z);
  } else {
    let x=a, y=b, expOp = op;
    if(expOp==='÷'){ [x,y] = makeDivisible(low, mx, level); }
    text = `${x} ${expOp} ${y} = ?`;
    ans = evalArith(x, expOp, y);
  }

  return { type:'arith', text, answer: ans };
}

function evalArith(x, op, y){
  switch(op){
    case '+': return x + y;
    case '-': return x - y;
    case '×': return x * y;
    case '÷': return x / y;
  }
  return NaN;
}

/* ===== FRACCIONS ===== */

function addFrac(a,b){ return normFrac(a[0]*b[1] + b[0]*a[1], a[1]*b[1]); }
function subFrac(a,b){ return normFrac(a[0]*b[1] - b[0]*a[1], a[1]*b[1]); }
function mulFrac(a,b){ return normFrac(a[0]*b[0], a[1]*b[1]); }
function divFrac(a,b){ return normFrac(a[0]*b[1], a[1]*b[0]); }

function svgGridFraction(cols, rows, filled){
  const w=300, h=160, pad=10;
  const pad2 = pad*2;
  const cellW = (w - pad2)/cols, cellH = (h - pad2)/rows;
  const total = cols*rows;
  filled = Math.max(0, Math.min(filled, total));
  let rects = '', k=0;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x = pad + c*cellW;
      const y = pad + r*cellH;
      const isFilled = (k < filled);
      rects += `<rect x="${x}" y="${y}" width="${cellW-2}" height="${cellH-2}" rx="6" ry="6"
        fill="${isFilled? 'url(#fillGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2">
        <animate attributeName="opacity" values="0;1" dur=".35s" begin="${0.02*k}s" fill="freeze"/></rect>`;
      k++;
    }
  }
  return `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Parts ombrejades d'una fracció"><defs>
    <linearGradient id="fillGrad" x1="0" x2="1">
      <stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#7dd3fc"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="#f9fafb" rx="14" ry="14" />
  ${rects}
  </svg>`;
}

function svgBarFraction(segments, filled){
  const w=300, h=80, pad=12, pad2=pad*2;
  const segW = (w - pad2)/segments, segH = h - pad2;
  let rects = '';
  for(let i=0;i<segments;i++){
    const x = pad + i*segW;
    const isFilled = i < filled;
    rects += `<rect x="${x}" y="${pad}" width="${segW-4}" height="${segH}" rx="10" ry="10"
      fill="${isFilled? 'url(#barGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2">
      <animate attributeName="height" from="0" to="${segH}" dur=".4s" begin="${0.02*i}s" fill="freeze"/>
    </rect>`;
  }
  return `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Barra segmentada per fraccions"><defs>
    <linearGradient id="barGrad" x1="0" x2="1">
      <stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#a7f3d0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="#f9fafb" rx="14" ry="14" />
  ${rects}
  </svg>`;
}

function svgPieFraction(segments, filled){
  const size=170, pad=8;
  const cx=size/2, cy=size/2, R=size/2 - pad;
  const tau = Math.PI*2;
  function arcPath(cx,cy,r,startAngle,endAngle){
    const x1 = cx + r*Math.cos(startAngle), y1 = cy + r*Math.sin(startAngle);
    const x2 = cx + r*Math.cos(endAngle),   y2 = cy + r*Math.sin(endAngle);
    const large = (endAngle - startAngle) > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }
  const step = tau/segments;
  let paths = '';
  for(let i=0;i<segments;i++){
    const a0 = -Math.PI/2 + i*step;
    const a1 = a0 + step;
    const isFilled = i < filled;
    paths += `<path d="${arcPath(cx,cy,R,a0,a1)}" fill="${isFilled? 'url(#pieGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2">
      <animate attributeName="opacity" from="0" to="1" dur=".35s" begin="${0.02*i}s" fill="freeze"/></path>`;
  }
  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Pastís segmentat per fraccions" style="display:block;margin:auto"><defs>
    <linearGradient id="pieGrad" x1="0" x2="1">
      <stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#a7f3d0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="#f9fafc" rx="16" ry="16" />
  ${paths}
  </svg>`;
}

function genFracIdentify(level, opts={}){
  const shapes = ['grid','bar','pie'];
  const shape = choice(shapes);
  let total, k, html;
  if(shape==='grid'){
    const presets = (opts.mixedGrids!==false)
      ? [[2,3],[3,4],[2,5],[4,4],[3,5],[5,5],[4,5]]
      : [[3,4]];
    const [cols, rows] = choice(presets);
    total = cols*rows;
    k = rng(1, total-1);
    html = svgGridFraction(cols, rows, k);
  } else if(shape==='bar'){
    total = rng(4, 10);
    k = rng(1, total-1);
    html = svgBarFraction(total, k);
  } else {
    total = rng(5, 12);
    k = rng(1, total-1);
    html = svgPieFraction(total, k);
  }
  const [sn, sd] = normFrac(k, total);
  return { type:'frac-identify', text:`Identifica la fracció representada`, html, answer: `${sn}/${sd}` };
}

function genFracArithmetic(level, opts={}){
  const a = rng(1, 9), b = rng(2, 10);
  const c = rng(1, 9), d = rng(2, 10);
  const A = normFrac(a, b), B = normFrac(c, d);
  const op = choice(['+','−','×','÷']);
  let res;
  if(op==='+') res = addFrac(A,B);
  else if(op==='−') res = subFrac(A,B);
  else if(op==='×') res = mulFrac(A,B);
  else res = divFrac(A,B);
  return { type:'frac-arith', text:`Calcula: ${A[0]}/${A[1]} ${op} ${B[0]}/${B[1]} = ? (fracció)`, answer: `${res[0]}/${res[1]}` };
}

function genFracSimplify(level, opts={}){
  let n = rng(2, 30), d = rng(2, 30); if(n===d) d++;
  const [sn, sd] = normFrac(n, d);
  if(sn===n && sd===d){ // força a tenir simplificació
    const n2 = n+1, d2 = d+2;
    n = n2; d = d2;
  }
  const [fn, fd] = normFrac(n, d);
  return { type:'frac-simplify', text:`Simplifica: ${n}/${d}`, answer: `${fn}/${fd}` };
}

function genFractions(level, opts={}){
  const sub = opts.sub || 'identify';
  if(sub==='identify') return genFracIdentify(level, opts);
  if(sub==='arith')    return genFracArithmetic(level, opts);
  return genFracSimplify(level, opts);
}

/* ===== Coordenades cartesianes ===== */

const QUADRANTS = ['QI','QII','QIII','QIV'];

function coordRange(level){
  const L = clamp(level,1,4);
  return [0, 5, 7, 10, 12][L];
}

function quadrantSigns(q){
  switch(q){
    case 'QI': return [1, 1];
    case 'QII': return [-1, 1];
    case 'QIII': return [-1, -1];
    case 'QIV': return [1, -1];
  }
  return [1,1];
}

function quadrantLabel(q){
  return {
    QI: 'Quadrant I',
    QII: 'Quadrant II',
    QIII: 'Quadrant III',
    QIV: 'Quadrant IV'
  }[q] || 'Quadrant I';
}

function randomPointInQuadrant(quadrant, range){
  const [sx, sy] = quadrantSigns(quadrant);
  const absX = rng(1, range);
  const absY = rng(1, range);
  return { x: sx * absX, y: sy * absY };
}

function planeSVG(points, range){
  const axisRange = Math.max(range, 4);
  const size = 320;
  const pad = 48;
  const center = size / 2;
  const step = (size - pad * 2) / (axisRange * 2 || 1);
  const toX = (x)=> center + x * step;
  const toY = (y)=> center - y * step;

  let grid = '';
  for(let i=-axisRange; i<=axisRange; i++){
    if(i===0) continue;
    const pos = center + i * step;
    const dist = Math.abs(i);
    const cls = dist===axisRange ? 'line-grid boundary' : 'line-grid';
    grid += `<line x1="${pad}" y1="${pos}" x2="${size-pad}" y2="${pos}" class="${cls}"/>`;
    grid += `<line x1="${pos}" y1="${pad}" x2="${pos}" y2="${size-pad}" class="${cls}"/>`;
  }

  const ticks = [];
  const tickMarks = [];
  for(let i=-axisRange; i<=axisRange; i++){
    if(i===0) continue;
    const x = toX(i), y = toY(i);
    ticks.push(`<text x="${x}" y="${center + 28}" class="axis-label axis-label-x" text-anchor="middle">${i}</text>`);
    ticks.push(`<text x="${center - 24}" y="${y}" class="axis-label axis-label-y" text-anchor="end">${i}</text>`);
    tickMarks.push(`<line x1="${x}" y1="${center - 8}" x2="${x}" y2="${center + 8}" class="axis-tick"/>`);
    tickMarks.push(`<line x1="${center - 8}" y1="${y}" x2="${center + 8}" y2="${y}" class="axis-tick"/>`);
  }

  const pointSvg = points.map((pt, idx)=>{
    const px = toX(pt.x);
    const py = toY(pt.y);
    const label = pt.label || String.fromCharCode(65 + idx);
    const labelDx = pt.x >= 0 ? 14 : -14;
    const anchor = pt.x >= 0 ? 'start' : 'end';
    return `
      <g class="point">
        <circle cx="${px}" cy="${py}" r="6" />
        <text x="${px + labelDx}" y="${py - 10}" text-anchor="${anchor}" class="point-label">${label}</text>
      </g>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Pla de coordenades" class="coord-plane">
      <style>
        .coord-plane{max-width:340px;display:block;margin:0 auto;background:#f8fafc;border-radius:18px;padding:6px;font-family:'Inter',system-ui,sans-serif}
        .coord-plane .line-grid{stroke:#cbd5e1;stroke-width:1}
        .coord-plane .line-grid.boundary{stroke:#94a3b8;stroke-width:1.2}
        .coord-plane .axis-tick{stroke:#475569;stroke-width:1.2}
        .coord-plane .axis-line{stroke:#0f172a;stroke-width:2.1}
        .coord-plane .axis-label{fill:#0f172a;font-size:14px;font-weight:600;paint-order:stroke;stroke:#ffffff;stroke-width:3px;stroke-linejoin:round;dominant-baseline:middle}
        .coord-plane .axis-label-x{dominant-baseline:hanging}
        .coord-plane .axis-label-y{dominant-baseline:middle}
        .coord-plane .point circle{fill:url(#gradPoint);stroke:#1e293b;stroke-width:1.3}
        .coord-plane .point-label{fill:#0f172a;font-size:13px}
      </style>
      <defs>
        <radialGradient id="gradPoint" cx="35%" cy="35%" r="75%">
          <stop offset="0" stop-color="#bae6fd"/>
          <stop offset="1" stop-color="#60a5fa"/>
        </radialGradient>
        <marker id="arrow-x" orient="auto" markerWidth="10" markerHeight="10" refX="8" refY="5"><path d="M0,0 L10,5 L0,10 Z" fill="#0f172a"/></marker>
        <marker id="arrow-y" orient="auto" markerWidth="10" markerHeight="10" refX="8" refY="5"><path d="M0,0 L10,5 L0,10 Z" fill="#0f172a"/></marker>
      </defs>
      <rect x="4" y="4" width="${size-8}" height="${size-8}" rx="16" ry="16" fill="#ffffff" stroke="#e2e8f0"/>
      ${grid}
      <line x1="${pad}" y1="${center}" x2="${size-pad}" y2="${center}" class="axis-line" marker-end="url(#arrow-x)"/>
      <line x1="${center}" y1="${size-pad}" x2="${center}" y2="${pad}" class="axis-line" marker-end="url(#arrow-y)"/>
      ${ticks.join('')}
      ${tickMarks.join('')}
      <circle cx="${center}" cy="${center}" r="3" fill="#0f172a"/>
      ${pointSvg}
    </svg>`;
}

function genCoordRead(level){
  const range = coordRange(level);
  const quadrant = choice(QUADRANTS);
  const point = randomPointInQuadrant(quadrant, range);
  const label = choice(['P','Q','R','S','T']);
  const html = planeSVG([{ x: point.x, y: point.y, label }], range);
  return {
    type:'coord-read',
    text:`Observa el pla i escriu les coordenades del punt ${label} (format (x,y)).`,
    html,
    answer:`(${point.x},${point.y})`
  };
}

function genCoordQuadrant(level){
  const range = coordRange(level);
  const quadrant = choice(QUADRANTS);
  const point = randomPointInQuadrant(quadrant, range);
  return {
    type:'coord-quadrant',
    text:`En quin quadrant es troba el punt (${point.x}, ${point.y})? Escriu QI, QII, QIII o QIV.`,
    answer: quadrant
  };
}

function genCoordBuild(level){
  const range = coordRange(level);
  const quadrant = choice(QUADRANTS);
  const [sx, sy] = quadrantSigns(quadrant);
  const absX = rng(1, range);
  const absY = rng(1, range);
  return {
    type:'coord-build',
    text:`Col·loca un punt al ${quadrantLabel(quadrant)} amb |x| = ${absX} i |y| = ${absY}. Escriu les coordenades correctes (format (x,y)).`,
    answer:`(${sx*absX},${sy*absY})`
  };
}

function genCoordinates(level, opts={}){
  // Temporalment només exposem preguntes de lectura de coordenades.
  if(opts && Array.isArray(opts.types) && opts.types.includes('read')){
    return genCoordRead(level);
  }
  return genCoordRead(level);
}

/* ====== GEOMETRIA ====== */

const labelText = (x,y,text)=> `<text class="svg-label" x="${x}" y="${y}">${text}</text>`;

let circleFigId = 0;
let polyFigId = 0;
let compositeFigId = 0;

function dimLineOutside(x1,y1,x2,y2,text,offset=16, orient='h'){
  if(orient==='h'){
    const yy = Math.max(y1,y2)+offset;
    return `
      <line x1="${x1}" y1="${yy}" x2="${x2}" y2="${yy}" stroke="#64748b" stroke-dasharray="4 3"/>
      ${labelText((x1+x2)/2, yy-4, text)}
    `;
  } else {
    const xx = Math.min(x1,x2)-offset;
    return `
      <line x1="${xx}" y1="${y1}" x2="${xx}" y2="${y2}" stroke="#64748b" stroke-dasharray="4 3"/>
      ${labelText(xx+4, (y1+y2)/2, text)}
    `;
  }
}

function svgRectFig(b,h,units){
  const W=360,H=230,p=14, rx=16;
  const x=90, y=50, w=200, hh=110;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rectangle"><defs>
    <linearGradient id="rectGrad" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="${rx}" ry="${rx}" fill="#f8fafc" />
  <rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="url(#rectGrad)" stroke="#64748b">
    <animate attributeName="opacity" from="0" to="1" dur=".3s" fill="freeze"/>
  </rect>
  ${dimLineOutside(x, y+hh, x+w, y+hh, `base = ${b} ${units}`, 20, 'h')}
  ${dimLineOutside(x, y, x, y+hh, `alçada = ${h} ${units}`, 24, 'v')}
  </svg>`;
}

function svgTriFig(b,h,units){
  const W=360,H=240,p=14, rx=16;
  const A=[80,180], B=[280,180], C=[180,70];
  const Hx=180, Hy=180;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Triangle"><defs>
    <linearGradient id="triGrad" x1="0" x2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="${rx}" ry="${rx}" fill="#f8fafc" />
  <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}" fill="url(#triGrad)" stroke="#64748b"/>
  <line x1="${C[0]}" y1="${C[1]}" x2="${Hx}" y2="${Hy}" stroke="#1f2937" stroke-dasharray="3 3"/>
  ${labelText(Hx+6, (C[1]+Hy)/2, `altura = ${h} ${units}`)}
  ${dimLineOutside(A[0], B[1], B[0], B[1], `base = ${b} ${units}`, 18, 'h')}
  </svg>`;
}

function svgCircleFig(measureText){
  const size = 320;
  const pad = 28;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const R = size / 2 - pad - 14;
  const id = `circ${++circleFigId}`;
  const isDiameter = /diàmetre/i.test(measureText);
  const angle = -Math.PI / 3.5;
  const tipX = cx + R * Math.cos(angle);
  const tipY = cy + R * Math.sin(angle);
  const pointerX = isDiameter ? cx + R * 0.45 : (cx + tipX) / 2;
  const pointerY = isDiameter ? cy : (cy + tipY) / 2;
  const labelWidth = Math.max(128, Math.min(220, measureText.length * 6.4));
  const labelHeight = 32;
  const bubbleX = clamp(pointerX - labelWidth / 2, 18, size - labelWidth - 18);
  const bubbleY = clamp(cy - R - labelHeight - 18, 14, size - labelHeight - 18);
  const pointerTargetX = clamp(pointerX, bubbleX + 16, bubbleX + labelWidth - 16);
  const pointer = `<line x1="${pointerX}" y1="${pointerY}" x2="${pointerTargetX}" y2="${bubbleY + labelHeight}" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 4"/>`;
  const formulaText = isDiameter ? 'Perímetre = π · d' : 'Àrea = π · r²';

  const measurementElements = isDiameter
    ? `
      <line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="url(#circStroke${id})" stroke-width="3" marker-start="url(#circArrowStart${id})" marker-end="url(#circArrowEnd${id})"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="#1e293b" stroke="#ffffff" stroke-width="1.6"/>
    `
    : `
      <line x1="${cx}" y1="${cy}" x2="${tipX}" y2="${tipY}" stroke="url(#circStroke${id})" stroke-width="3" marker-end="url(#circArrowEnd${id})"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="#1e293b" stroke="#ffffff" stroke-width="1.6"/>
      <path d="M${cx + 16},${cy} A16,16 0 0 1 ${cx},${cy - 16}" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/>
    `;

  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Cercle" style="display:block;margin:auto"><defs>
      <radialGradient id="circGrad${id}" cx="40%" cy="35%" r="70%">
        <stop offset="0" stop-color="#f8fafc"/>
        <stop offset="1" stop-color="#c7d2fe"/>
      </radialGradient>
      <linearGradient id="circStroke${id}" x1="0" x2="1">
        <stop offset="0" stop-color="#6366f1"/>
        <stop offset="1" stop-color="#0ea5e9"/>
      </linearGradient>
      <marker id="circArrowEnd${id}" orient="auto" markerWidth="10" markerHeight="10" refX="8" refY="5">
        <path d="M0,0 L10,5 L0,10 Z" fill="#2563eb"/>
      </marker>
      <marker id="circArrowStart${id}" orient="auto" markerWidth="10" markerHeight="10" refX="2" refY="5">
        <path d="M10,0 L0,5 L10,10 Z" fill="#2563eb"/>
      </marker>
    </defs>
    <rect x="0" y="0" width="${size}" height="${size}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2" rx="26" ry="26" />
    <circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="none" stroke="#e0e7ff" stroke-width="2.2" stroke-dasharray="6 8" />
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#circGrad${id})" stroke="#475569" stroke-width="1.4" />
    <circle cx="${cx}" cy="${cy}" r="${R - 18}" fill="rgba(255,255,255,.35)" stroke="none"/>
    ${measurementElements}
    ${pointer}
    <g transform="translate(${bubbleX}, ${bubbleY})">
      <rect width="${labelWidth}" height="${labelHeight}" rx="14" ry="14" fill="#ffffff" stroke="#cbd5f5" stroke-width="1.2"/>
      <text class="svg-label" x="${labelWidth / 2}" y="${labelHeight / 2 + 4}" text-anchor="middle">${measureText}</text>
    </g>
    <text class="svg-label" x="${cx}" y="${size - 14}" text-anchor="middle">${formulaText}</text>
  </svg>`;
}

function svgPolyFig(n, c, units){
  const size = 340;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const R = size / 2 - 46;
  const id = `poly${++polyFigId}`;
  const pts = Array.from({length:n}, (_,i)=>{
    const ang = -Math.PI / 2 + i * (2 * Math.PI / n);
    const x = cx + R * Math.cos(ang);
    const y = cy + R * Math.sin(ang);
    return [x, y];
  });
  const pointStr = pts.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [p1, p2] = [pts[0], pts[1]];
  const midX = (p1[0] + p2[0]) / 2;
  const midY = (p1[1] + p2[1]) / 2;
  const measureText = `costat = ${c} ${units}`;
  const labelWidth = Math.max(140, Math.min(220, measureText.length * 6.1));
  const labelHeight = 30;
  const bubbleX = clamp(midX - labelWidth / 2, 18, size - labelWidth - 18);
  const bubbleY = Math.max(18, midY - labelHeight - 18);
  const pointerTargetX = clamp(midX, bubbleX + 18, bubbleX + labelWidth - 18);
  const pointer = `<line x1="${midX}" y1="${midY}" x2="${pointerTargetX}" y2="${bubbleY + labelHeight}" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4 3"/>`;

  const tickMarks = pts.map((pt, idx)=>{
    const next = pts[(idx+1)%n];
    const mx = (pt[0]+next[0])/2;
    const my = (pt[1]+next[1])/2;
    const vx = next[0]-pt[0];
    const vy = next[1]-pt[1];
    const len = Math.hypot(vx, vy);
    const nx = -vy/len;
    const ny = vx/len;
    const inner = 6;
    return `<line x1="${mx - nx*inner}" y1="${my - ny*inner}" x2="${mx + nx*inner}" y2="${my + ny*inner}" stroke="#334155" stroke-width="1"/>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Polígon regular" style="display:block;margin:auto"><defs>
      <linearGradient id="polyGrad${id}" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#bfdbfe"/>
        <stop offset="1" stop-color="#a5f3fc"/>
      </linearGradient>
      <linearGradient id="polyStroke${id}" x1="0" x2="1">
        <stop offset="0" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#0ea5e9"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${size}" height="${size}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2" rx="26" ry="26" />
    <circle cx="${cx}" cy="${cy}" r="${R + 12}" fill="none" stroke="#e2e8f0" stroke-width="1.6" stroke-dasharray="5 6" />
    <polygon points="${pointStr}" fill="url(#polyGrad${id})" stroke="url(#polyStroke${id})" stroke-width="2.6" stroke-linejoin="round"/>
    ${tickMarks}
    ${pointer}
    <g transform="translate(${bubbleX}, ${bubbleY})">
      <rect width="${labelWidth}" height="${labelHeight}" rx="12" ry="12" fill="#ffffff" stroke="#cbd5f5" stroke-width="1.2"/>
      <text class="svg-label" x="${labelWidth/2}" y="${labelHeight/2 + 4}" text-anchor="middle">${measureText}</text>
    </g>
    <text class="svg-label" x="${cx}" y="34" text-anchor="middle">Polígon regular de ${n} costats</text>
  </svg>`;
}

function svgCompositeFig(units='u'){
  const W = 360, H = 230, p = 14;
  const id = `comp${++compositeFigId}`;
  const originX = 80;
  const originY = 36;
  const scale = 18;
  const variant = Math.random() < 0.5 ? 'notch' : 'step';
  let points = [];
  let area = 0;
  const overlays = [];
  const dims = [];

  if(variant === 'notch'){
    const baseW = rng(8, 12);
    const baseH = rng(6, 10);
    const cutW = rng(2, baseW - 3);
    const cutH = rng(2, baseH - 3);
    const px = (v)=> originX + v * scale;
    const py = (v)=> originY + v * scale;
    points = [
      [px(0), py(0)],
      [px(baseW), py(0)],
      [px(baseW), py(baseH - cutH)],
      [px(baseW - cutW), py(baseH - cutH)],
      [px(baseW - cutW), py(baseH)],
      [px(0), py(baseH)]
    ];
    area = baseW * baseH - cutW * cutH;

    const cutY = py(baseH - cutH);
    const cutStartX = px(baseW - cutW);
    const cutEndX = px(baseW);
    const cutBottomY = py(baseH);

    dims.push(dimLineOutside(points[0][0], cutBottomY, points[1][0], cutBottomY, `amplada = ${baseW} ${units}`, 28, 'h'));
    dims.push(dimLineOutside(points[0][0], points[0][1], points[0][0], cutBottomY, `alçada = ${baseH} ${units}`, 32, 'v'));
    overlays.push(`
      <line x1="${cutStartX}" y1="${cutY - 12}" x2="${cutEndX}" y2="${cutY - 12}" stroke="#94a3b8" stroke-dasharray="4 3"/>
      <text class="svg-label" x="${(cutStartX + cutEndX)/2}" y="${cutY - 16}" text-anchor="middle">${cutW} ${units}</text>
      <line x1="${cutEndX + 14}" y1="${cutY}" x2="${cutEndX + 14}" y2="${cutBottomY}" stroke="#94a3b8" stroke-dasharray="4 3"/>
      <text class="svg-label" x="${cutEndX + 18}" y="${(cutY + cutBottomY)/2}" text-anchor="start">${cutH} ${units}</text>
    `);
    overlays.push(`<text class="svg-label" x="${cutStartX + 10}" y="${cutY + 22}" text-anchor="start">Retall = ${cutW} × ${cutH} ${units}</text>`);
  } else {
    const lowerW = rng(8, 12);
    const lowerH = rng(3, 5);
    const upperW = rng(3, lowerW - 2);
    const upperH = rng(3, 6);
    const px = (v)=> originX + v * scale;
    const py = (v)=> originY + v * scale;
    points = [
      [px(0), py(0)],
      [px(lowerW), py(0)],
      [px(lowerW), py(lowerH)],
      [px(upperW), py(lowerH)],
      [px(upperW), py(lowerH + upperH)],
      [px(0), py(lowerH + upperH)]
    ];
    area = lowerW * lowerH + upperW * upperH;

    const baseY = py(lowerH + upperH);
    dims.push(dimLineOutside(points[0][0], baseY, points[1][0], baseY, `base = ${lowerW} ${units}`, 28, 'h'));
    dims.push(dimLineOutside(points[0][0], points[0][1], points[0][0], baseY, `alçada total = ${lowerH + upperH} ${units}`, 32, 'v'));

    const stepX = points[3][0];
    const stepY = points[3][1];
    overlays.push(`
      <line x1="${points[2][0]}" y1="${stepY - 12}" x2="${points[3][0]}" y2="${stepY - 12}" stroke="#94a3b8" stroke-dasharray="4 3"/>
      <text class="svg-label" x="${(points[2][0] + points[3][0])/2}" y="${stepY - 16}" text-anchor="middle">${lowerW - upperW} ${units}</text>
      <line x1="${stepX + 14}" y1="${stepY}" x2="${stepX + 14}" y2="${points[4][1]}" stroke="#94a3b8" stroke-dasharray="4 3"/>
      <text class="svg-label" x="${stepX + 18}" y="${(stepY + points[4][1])/2}" text-anchor="start">${upperH} ${units}</text>
      <line x1="${points[2][0] - 14}" y1="${points[2][1]}" x2="${points[2][0] - 14}" y2="${points[3][1]}" stroke="#94a3b8" stroke-dasharray="4 3"/>
      <text class="svg-label" x="${points[2][0] - 18}" y="${(points[2][1] + points[3][1])/2}" text-anchor="end">${lowerH} ${units}</text>
    `);
    overlays.push(`<text class="svg-label" x="${points[3][0] - 4}" y="${points[3][1] + 20}" text-anchor="end">Escaló = ${upperW} × ${upperH} ${units}</text>`);
  }

  const polyPoints = points.map(([x,y])=>`${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return {
    svg: `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Figura composta" style="display:block;margin:auto"><defs>
        <pattern id="compGrid${id}" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0 H0 V12" fill="none" stroke="#e2e8f0" stroke-width="0.6"/>
        </pattern>
        <linearGradient id="compGrad${id}" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#bae6fd"/>
          <stop offset="1" stop-color="#c7d2fe"/>
        </linearGradient>
      </defs>
      <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="18" ry="18" fill="#f8fafc" />
      <rect x="${p+18}" y="${p+16}" width="${W-2*p-36}" height="${H-2*p-34}" fill="url(#compGrid${id})" rx="14" ry="14" opacity="0.55"/>
      <polygon points="${polyPoints}" fill="url(#compGrad${id})" stroke="#475569" stroke-width="2.2" stroke-linejoin="round"/>
      ${dims.join('')}
      ${overlays.join('')}
      <text class="svg-label" x="${W/2}" y="${H-18}" text-anchor="middle">Figura composta de rectangles</text>
    </svg>
    `,
    area
  };
}

function svgGridMask(cols, rows, maskSet){
  const w=340, h=190, pad=12, pad2=pad*2;
  const cellW = (w - pad2)/cols, cellH = (h - pad2)/rows;
  let rects = '';
  let k=0;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x = pad + c*cellW;
      const y = pad + r*cellH;
      const isFilled = maskSet.has(k);
      rects += `<rect x="${x}" y="${y}" width="${cellW-2}" height="${cellH-2}" rx="6" ry="6"
        fill="${isFilled? 'url(#gmGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2"/>`;
      k++;
    }
  }
  return `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Graella per àrea"><defs>
    <linearGradient id="gmGrad" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" rx="14" ry="14" />
  ${rects}
  </svg>`;
}

function svgCuboidFig(w,h,l,units){
  const W=380,H=240,p=14;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Prisma rectangular"><defs>
    <linearGradient id="cubeA" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>
    <linearGradient id="cubeB" x1="0" x2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#60a5fa"/></linearGradient>
    <linearGradient id="cubeC" x1="0" x2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="16" ry="16" fill="#f8fafc" />
  <polygon points="90,70 230,70 300,110 160,110" fill="url(#cubeA)" stroke="#64748b"/>
  <polygon points="160,110 300,110 300,190 160,190" fill="url(#cubeB)" stroke="#64748b"/>
  <polygon points="90,70 160,110 160,190 90,150" fill="url(#cubeC)" stroke="#64748b"/>
  ${labelText(185, 58, `amplada = ${w} ${units}`)}
  ${labelText(305, 155, `alçada = ${h} ${units}`)}
  ${labelText(95, 162, `llargada = ${l} ${units}`)}
  </svg>`;
}

function svgCylinderFig(r,h,units){
  const W=380,H=240,p=14;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cilindre"><defs>
    <linearGradient id="cyl" x1="0" x2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="16" ry="16" fill="#f8fafc" />
  <ellipse cx="190" cy="80" rx="80" ry="20" fill="url(#cyl)" stroke="#64748b"/>
  <rect x="110" y="80" width="160" height="90" fill="url(#cyl)" stroke="#64748b"/>
  <ellipse cx="190" cy="170" rx="80" ry="20" fill="url(#cyl)" stroke="#64748b"/>
  ${labelText(190, 200, `radi = ${r} ${units}, alçada = ${h} ${units}`)}
  </svg>`;
}

function withUnits(val, units, pow, requireUnits){
  const s = String(val);
  if(!requireUnits) return s;
  const su = pow===2 ? `${units}²` : (pow===3 ? `${units}³` : units);
  return `${s} ${su}`;
}
function withUnitsAnswer(val, U, pow, req){ return withUnits(val, U, pow, req); }

function genGeometry(level, opts={}){
  const scope = opts.scope || 'area';
  const U = opts.units || 'cm';
  const wantUnits = !!opts.requireUnits;
  const roundDigits = Number.isInteger(opts.round)? opts.round : 2;
  const circleMode = opts.circleMode || 'numeric';

  // sideMax per nivell 1..4
  const sideMax = [0, 20, 50, 120, 200][clamp(level,1,4)];

  function packNum({text, html, value, pow}){
    const v = roundTo(value, roundDigits);
    return {
      type:'geom-num',
      text, html,
      numeric: v,
      meta:{ requireUnits: wantUnits, units: U, pow, round: roundDigits },
      answer: withUnitsAnswer(v, U, pow, wantUnits)
    };
  }

  function packPi({text, html, coef}){
    return { type:'geom-pi', text, html, piCoef: coef, answer: `${coef}π` };
  }

  const figs2D = [];
  if(!opts.fig || opts.fig.rect) figs2D.push('rect');
  if(!opts.fig || opts.fig.tri) figs2D.push('tri');
  if(!opts.fig || opts.fig.circ) figs2D.push('circ');
  if(opts.fig?.poly) figs2D.push('poly');
  if(opts.fig?.grid) figs2D.push('grid');
  if(opts.fig?.comp) figs2D.push('comp');

  const figs3D = [];
  if(opts.fig?.cube) figs3D.push('cuboid');
  if(opts.fig?.cylinder) figs3D.push('cylinder');

  if(scope==='vol'){
    const f = figs3D.length? choice(figs3D) : choice(['cuboid','cylinder']);
    if(f==='cuboid'){
      const w=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const h=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const l=rng(2, Math.max(6, Math.floor(sideMax/10)));
      return packNum({ text:`Volum del prisma rectangular`, html: svgCuboidFig(w,h,l,U), value: w*h*l, pow: 3 });
    } else {
      const r=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const h=rng(3, Math.max(8, Math.floor(sideMax/8)));
      if(circleMode==='pi-exacte'){
        return packPi({ text:`Volum del cilindre (exacte, en π)`, html: svgCylinderFig(r,h,U), coef: r*r*h });
      } else {
        return packNum({ text:`Volum del cilindre`, html: svgCylinderFig(r,h,U), value: Math.PI*r*r*h, pow: 3 });
      }
    }
  }

  const pick = figs2D.length? choice(figs2D) : choice(['rect','tri','circ']);
  const wantA = (scope==='area' || scope==='both');
  const wantP = (scope==='perim' || scope==='both');

  if(pick==='rect'){
    const b=rng(3, Math.max(4, Math.floor(sideMax/2)));
    const h=rng(3, Math.max(4, Math.floor(sideMax/2)));
    const html = svgRectFig(b,h,U);
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A') return packNum({ text:`Àrea del rectangle`, html, value: b*h, pow: 2 });
    return packNum({ text:`Perímetre del rectangle`, html, value: 2*(b+h), pow: 0 });
  }

  if(pick==='tri'){
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A'){
      const b=rng(4, Math.max(6, Math.floor(sideMax/2)));
      const h=rng(3, Math.max(5, Math.floor(sideMax/2)));
      const html = svgTriFig(b,h,U);
      return packNum({ text:`Àrea del triangle`, html, value: 0.5*b*h, pow: 2 });
    } else {
      const a=rng(4, Math.max(6, Math.floor(sideMax/2)));
      const b=rng(4, Math.max(6, Math.floor(sideMax/2)));
      const c=rng(Math.abs(a-b)+1, a+b-1);
      const W=360,H=230,p=14;
      const html = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Triangle (costats)">
        <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="16" ry="16" fill="#f8fafc" />
        <polygon points="80,170 280,170 180,70" fill="#a7f3d0" stroke="#64748b"/>
        ${labelText(180, 200, `costats: ${a}, ${b}, ${c} ${U}`)}
      </svg>`;
      return packNum({ text:`Perímetre del triangle`, html, value: a+b+c, pow: 0 });
    }
  }

  if(pick==='circ'){
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A'){
      const r=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const html = svgCircleFig(`radi = ${r} ${U}`);
      if(circleMode==='pi-exacte') return { type:'geom-pi', text:`Àrea del cercle (exacta)`, html, piCoef:r*r, answer:`${r*r}π` };
      return packNum({ text:`Àrea del cercle`, html, value: Math.PI*r*r, pow: 2 });
    } else {
      const d=rng(6, Math.max(12, Math.floor(sideMax/6)));
      const html = svgCircleFig(`diàmetre = ${d} ${U}`);
      if(circleMode==='pi-exacte') return { type:'geom-pi', text:`Perímetre del cercle (exacte)`, html, piCoef:d, answer:`${d}π` };
      return packNum({ text:`Perímetre del cercle`, html, value: Math.PI*d, pow: 0 });
    }
  }

  if(pick==='poly'){
    const n = rng(5,8);
    const c = rng(2, Math.max(6, Math.floor(sideMax/10)));
    const P = n*c;
    const a = c/(2*Math.tan(Math.PI/n));
    const html = svgPolyFig(n,c,U);
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A') return packNum({ text:`Àrea del polígon regular`, html, value: (P*a/2), pow: 2 });
    return packNum({ text:`Perímetre del polígon regular`, html, value: P, pow: 0 });
  }

  if(pick==='grid'){
    const cols = rng(4, 10), rows = rng(4, 10);
    const total = cols*rows;
    const k = rng(Math.floor(total*0.25), Math.floor(total*0.75));
    const set = new Set(); let i=0; while(set.size<k && i<800){ set.add(rng(0,total-1)); i++; }
    const html = svgGridMask(cols, rows, set);
    return packNum({ text:`Àrea de la figura ombrejada (unitats²)`, html, value: k, pow: 2 });
  }

  const composite = svgCompositeFig('u');
  return { type:'geom-num', text:`Àrea de la figura composta (unitats²)`, html: composite.svg, numeric: composite.area, meta:{requireUnits:false, units:'u', pow:2, round:0}, answer: String(composite.area) };
}

/* ===== Percentatges ===== */

function genPercent(level){
  const L = clamp(level,1,4);
  const easy = [5,10,15,20,25,50];
  const mid  = easy.concat([30,40]);
  const hard = mid.concat([12.5,33.33,66.67,75]);
  const xhard= hard.concat([17.5,22.5,80]);

  const poolP = [null, easy, mid, hard, xhard][L];
  const baseMax = [0, 200, 600, 1000, 1500][L];

  const mode = Math.random()<.33? 'of' : (Math.random()<.5? 'is-of' : 'discount');

  if(mode==='of'){
    const p = choice(poolP);
    const n = rng(20, baseMax);
    const ans = +(n * p / 100).toFixed(L>=3? 2 : 0);
    return { type:'percent-of', text:`${p}% de ${n} = ?`, answer: ans };
  } else if(mode==='is-of'){
    const p = choice(poolP);
    const part = rng(10, Math.max(60, Math.floor(baseMax/2)));
    const whole = +(part * 100 / p).toFixed(L>=3? 2 : 0);
    return { type:'percent-is-of', text:`${part} és el ${p}% de ?`, answer: whole };
  } else {
    const n = rng(20, baseMax);
    const off = choice([5,10,12,15,20,25,30,40]);
    const ans = +(n * (1 - off/100)).toFixed(L>=3? 2 : 0);
    return { type:'percent-discount', text:`Descompte del ${off}% sobre ${n} → preu final = ?`, answer: ans };
  }
}

/* ===== Equacions ===== */

function randCoef(rangeKey){
  const [mn, mx] = rngRangeKey(rangeKey);
  let a = rng(mn, mx);
  if(a===0) a = (Math.random()<.5? -1: 1);
  return a;
}

function niceIntIf(v, forceInt){
  if(forceInt) return Math.round(v);
  return v;
}

// 1) Equacions de primer grau
function genEqLinear(level, opts){
  const a = randCoef(opts.range || 'small');
  const sol = niceIntIf(rng(-9,9), !!opts.forceInt);
  const b = -a * sol;
  const text = `${a}·x ${b>=0?'+':'−'} ${Math.abs(b)} = 0`;
  const hint = opts.hints ? `<div class="chip">Pista: mou el terme independent i divideix per a</div>` : '';
  return { type:'eq-lin', text:`Resol: ${text}`, html: opts.hints? `<div class="chip">Pista: mou el terme independent i divideix per a</div>`:'', sol: sol, answer: sol };
}

// 2) Equacions de segon grau
function genEqQuadratic(level, opts){
  const allowIncomplete = !!opts.allowIncomplete;
  const forceInt = !!opts.forceInt;
  const R = opts.range || 'small';

  if(allowIncomplete && Math.random()<0.4){
    if(Math.random()<0.5){
      // ax^2 + c = 0
      const a = randCoef(R), k = rng(1, 9);
      const c = -a * k * k;
      const text = `${a}·x² ${c>=0?'+':'−'} ${Math.abs(c)} = 0`;
      const sols = [ -k, k ].map(v => niceIntIf(v, forceInt));
      const hint = opts.hints ? `<div class="chip">Pista: x² = −c/a</div>` : '';
      return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
    } else {
      // ax² + bx = 0
      const a = randCoef(R), b = randCoef(R);
      const x2 = -b / a;
      const sols = [ 0, niceIntIf(x2, forceInt) ];
      const text = `${a}·x² ${b>=0?'+':'−'} ${Math.abs(b)}·x = 0`;
      const hint = opts.hints ? `<div class="chip">Pista: factoritza x(ax + b)=0</div>` : '';
      return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
    }
  } else {
    // Equacions completes
    const r1 = rng(-9,9), r2 = rng(-9,9);
    const sols = [r1, r2].map(v => niceIntIf(v, forceInt));
    const b = -(sols[0] + sols[1]);
    const c = sols[0]*sols[1];
    const text = `x² ${b>=0?'+':'−'} ${Math.abs(b)}·x ${c>=0?'+':'−'} ${Math.abs(c)} = 0`;
    const hint = opts.hints ? `<div class="chip">Pista: fórmula general o factorització</div>` : '';
    return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
  }
}

// 3) Sistemes d'equacions
function genEqSystem2x2(level, opts){
  const R = opts.range || 'small';
  let x = rng(-6,6), y = rng(-6,6);
  if(opts.forceInt){ x = Math.round(x); y = Math.round(y); }
  const a1 = randCoef(R), b1 = randCoef(R);
  const a2 = randCoef(R), b2 = randCoef(R);
  const c1 = a1*x + b1*y;
  const c2 = a2*x + b2*y;
  const text = `{ ${a1}x ${b1>=0?'+':'−'} ${Math.abs(b1)}y = ${c1} ; ${a2}x ${b2>=0?'+':'−'} ${Math.abs(b2)}y = ${c2} }`;
  const hint = opts.hints ? `<div class="chip">Pista: substitució o reducció</div>` : '';
  return { type:'eq-sys', text:`Resol el sistema: ${text}`, html: hint, sol:{x,y}, answer:`(${x}, ${y})` };
}

// 4) Equacions amb fraccions
function genEqFractions(level, opts){
  const denX = rng(2,9);
  const A = rng(1,8), B = rng(2,9);
  const rhs = rng(1,12);
  const x = (rhs - A/B) * denX;
  const sol = opts.forceInt ? Math.round(x) : x;
  const html = opts.hints? `<div class="chip">Pista: passa termes i redueix a comú denominador</div>` : '';
  return { type:'eq-frac', text:`Resol: ${A}/${B} + x/${denX} = ${rhs}`, html, sol, answer: sol };
}

// 5) Equacions amb parèntesis
function genEqParentheses(level, opts){
  const R = opts.range || 'small';
  const sol = opts.forceInt ? rng(-9,9) : rng(-9,9);
  const a = randCoef(R), b = randCoef(R);
  const c = randCoef(R), d = randCoef(R);
  const rhs = (a - c)*sol + (a*b - c*d);
  const text = `${a}(x ${b>=0?'+':'−'} ${Math.abs(b)}) ${c>=0?'−':'+'} ${Math.abs(c)}(x ${d>=0?'+':'−'} ${Math.abs(d)}) = ${rhs}`;
  const hint = opts.hints? `<div class="chip">Pista: desenvolupa, agrupa termes i resol</div>` : '';
  return { type:'eq-par', text:`Resol: ${text}`, html: hint, sol, answer: sol };
}

// Map defaults segons nivell (1..4)
function genEq(level, opts={}){
  function rangeFromLevel(L){
    return [null,'small','med','med','big'][L];
  }
  const L = clamp(level,1,4);

  if(!opts.range)  opts.range  = rangeFromLevel(L);
  if(opts.forceInt === undefined) opts.forceInt = (L<=3);
  if(opts.hints === undefined)    opts.hints    = (L===1);

  if(!opts.format && !opts.degree){
    if(L===1){ opts.format='normal'; opts.degree='1'; }
    else if(L===2){ opts.format = Math.random()<0.5? 'frac':'par'; opts.degree='1'; }
    else if(L===3){ opts.format='normal'; opts.degree='2'; opts.allowIncomplete = true; }
    else { // L4
      opts.format = Math.random()<0.4? 'sys':'normal';
      opts.degree = (opts.format==='sys')? '1' : '2';
      opts.allowIncomplete = true;
    }
  }

  const format = opts.format || 'normal'; // normal, frac, par, sys
  const degree = opts.degree || '1';      // 1, 2, mixed

  if (format === 'sys') return genEqSystem2x2(level, opts);
  if (format === 'frac') return genEqFractions(level, opts);
  if (format === 'par')  return genEqParentheses(level, opts);

  if (degree === '1') return genEqLinear(level, opts);
  if (degree === '2') return genEqQuadratic(level, opts);
  return Math.random() < 0.7 ? genEqLinear(level, opts) : genEqQuadratic(level, opts);
}

/* ===== Estadística bàsica ===== */

function statsList(level){
  const L = clamp(level,1,4);
  const len = rng(5, 9);
  const maxByL = [0, 20, 50, 100, 150];
  const max = maxByL[L];
  const allowZero = false;
  return Array.from({length:len}, ()=> rng(allowZero?0:1, max));
}

const arrMean = a => a.reduce((s,x)=>s+x,0)/a.length;
function arrMedian(a){
  const b=[...a].sort((x,y)=>x-y);
  const n=b.length;
  return n%2? b[(n-1)/2] : (b[n/2-1]+b[n/2])/2;
}
function arrMode(a){
  const m = new Map(); a.forEach(x=>m.set(x,(m.get(x)||0)+1));
  let best=a[0], cnt=0;
  m.forEach((v,k)=>{ if(v>cnt){cnt=v; best=k;} });
  return best;
}

  const sharedBarChartSVG = typeof root.barChartSVG === 'function' ? root.barChartSVG : null;
  function barChartSVG(data, labels){
    if (sharedBarChartSVG) return sharedBarChartSVG(data, labels);
    const w=360,h=200,p=28;
    const max = Math.max(...data, 0);
    const bw = data.length ? (w - p*2)/data.length : 0;
    const bars = data.map((v,i)=>{
      const barH = max? (v/max)*(h-p*2) : 0;
      const x = p + i*bw, y = h-p - barH;
      return `<g>
        <rect x="${x+6}" y="${y}" width="${Math.max(bw-12,0)}" height="${barH}" fill="#93c5fd" stroke="#64748b">
          <animate attributeName="height" from="0" to="${barH}" dur=".4s" fill="freeze"/>
          <animate attributeName="y" from="${h-p}" to="${y}" dur=".4s" fill="freeze"/>
        </rect>
        <text x="${x+bw/2}" y="${h-6}" text-anchor="middle" class="svg-label">${labels[i] ?? ''}</text>
      </g>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Gràfic de barres">
    <rect x="0" y="0" width="${w}" height="${h}" rx="16" ry="16" fill="#f8fafc"/>
    ${bars}
    </svg>`;
  }
  if (!sharedBarChartSVG) {
    root.barChartSVG = barChartSVG;
  }

function pieChartSVG(values, labels){
  const size=220, pad=8, cx=size/2, cy=size/2, R=size/2-pad;
  const total = values.reduce((s,x)=>s+x,0);
  let ang= -Math.PI/2;
  const segs = values.map((v,i)=>{
    const frac = total? v/total : 0;
    const a0 = ang, a1 = ang + frac*2*Math.PI; ang = a1;
    const large = (a1-a0)>Math.PI?1:0;
    const x1 = cx + R*Math.cos(a0), y1 = cy + R*Math.sin(a0);
    const x2 = cx + R*Math.cos(a1), y2 = cy + R*Math.sin(a1);
    const color = ['#93c5fd','#a7f3d0','#fde68a','#fca5a5','#c4b5fd'][i%5];
    return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z"
             fill="${color}" stroke="#64748b"><animate attributeName="opacity" from="0" to="1" dur=".35s" fill="freeze"/></path>`;
  }).join('');
  const legend = labels.map((l,i)=>`<tspan x="${size/2}" dy="16">${l}</tspan>`).join('');
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Gràfic de sectors" style="display:block;margin:auto">
  <rect x="0" y="0" width="${size}" height="${size}" rx="16" ry="16" fill="#f8fafc"/>
  ${segs}
  <text x="${size/2}" y="${size-8}" text-anchor="middle" class="svg-label">${legend}</text>
  </svg>`;
}

function genStatsMMM(level, opts){
  const arr = statsList(level);
  const round = opts.round ?? 2;
  const mean = roundTo(arrMean(arr), round);
  const med = roundTo(arrMedian(arr), round);
  const mode = arrMode(arr);
  const kind = choice(['mitjana','mediana','moda']);
  const html = barChartSVG(arr, arr.map((_,i)=>String(i+1)));
  let answer, title;
  if(kind==='mitjana'){ answer = mean; title = `Calcula la <b>mitjana</b> de: ${arr.join(', ')}`; }
  else if(kind==='mediana'){ answer = med; title = `Calcula la <b>mediana</b> de: ${arr.join(', ')}`; }
  else { answer = mode; title = `Calcula la <b>moda</b> de: ${arr.join(', ')}`; }
  return { type:'stats-num', text:title, html, numeric: answer, meta:{round}, answer: answer };
}

function genStatsRangeDev(level, opts){
  const arr = statsList(level);
  const round = opts.round ?? 2;
  const min = Math.min(...arr), max = Math.max(...arr);
  const range = max - min;
  const mean = arrMean(arr);
  const mad = roundTo(arr.reduce((s,x)=>s+Math.abs(x-mean),0)/arr.length, round);
  const kind = choice(['rang','desviacio']);
  const html = barChartSVG(arr, arr.map((_,i)=>String(i+1)));
  if(kind==='rang'){
    return { type:'stats-num', text:`Calcula el <b>rang</b> del conjunt: ${arr.join(', ')}`, html, numeric: range, meta:{round:0}, answer: range };
  } else {
    return { type:'stats-num', text:`Calcula la <b>desviació mitjana</b> del conjunt: ${arr.join(', ')}`, html, numeric: mad, meta:{round}, answer: mad };
  }
}

function genStatsGraphs(level, opts){
  const kind = choice(['bar','pie']);
  if(kind==='bar'){
    const cats = ['A','B','C','D'];
    const vals = cats.map(()=> rng(2, 12));
    const idxMax = vals.indexOf(Math.max(...vals));
    const html = barChartSVG(vals, cats);
    return { type:'stats-cat', text:`Al gràfic de barres, <b>quina categoria</b> té el valor més alt? (A/B/C/D)`, html, answer: cats[idxMax] };
  } else {
    const cats = ['X','Y','Z','W'];
    const vals = cats.map(()=> rng(1, 8));
    const idxMax = vals.indexOf(Math.max(...vals));
    const html = pieChartSVG(vals, cats);
    return { type:'stats-cat', text:`Al gràfic de sectors, <b>quina categoria</b> és la més gran? (X/Y/Z/W)`, html, answer: cats[idxMax] };
  }
}

function genStats(level, opts={}){
  const sub = opts.sub || 'mmm';
  if(sub==='mmm') return genStatsMMM(level, opts);
  if(sub==='range-dev') return genStatsRangeDev(level, opts);
  return genStatsGraphs(level, opts);
}

/* ===== Unitats i conversions ===== */

function convQuestion(set, round){
  // set: { from:'km', to:'m', factor:1000 }
  const val = +((Math.random()<.5? rng(1, 50) : (rng(10,500)/10))).toFixed(2);
  const exact = val * set.factor;
  const numeric = roundTo(exact, round);
  const title = `Converteix <b>${val} ${set.from}</b> a <b>${set.to}</b>. Escriu només el número`;
  return { type:`units-${set.group}`, text:title, html: set.icon, numeric, meta:{round}, answer: numeric };
}

const ICON = {
  ruler:`<svg viewBox="0 0 220 80" role="img" aria-label="Regla">
  <rect x="10" y="20" width="200" height="40" rx="8" fill="#a7f3d0" stroke="#64748b"/>
  ${Array.from({length:10},(_,i)=>`<rect x="${28+i*18}" y="20" width="2" height="${i%2?12:18}" fill="#334155"><animate attributeName="height" from="0" to="${i%2?12:18}" dur=".4s" fill="freeze"/></rect>`).join('')}
  </svg>`,
  scale:`<svg viewBox="0 0 220 80" role="img" aria-label="Bàscula">
  <rect x="40" y="15" width="140" height="50" rx="12" fill="#93c5fd" stroke="#64748b"/>
  <circle cx="110" cy="40" r="16" fill="#fff" stroke="#64748b"/>
  <line x1="110" y1="40" x2="125" y2="32" stroke="#ef4444" stroke-width="2">
    <animate attributeName="x2" from="110" to="125" dur=".45s" fill="freeze"/>
    <animate attributeName="y2" from="40" to="32" dur=".45s" fill="freeze"/>
  </line>
  </svg>`,
  clock:`<svg viewBox="0 0 90 90" role="img" aria-label="Rellotge" style="display:block;margin:auto">
  <circle cx="45" cy="45" r="38" fill="#fde68a" stroke="#64748b"/>
  <line x1="45" y1="45" x2="45" y2="20" stroke="#334155" stroke-width="3">
    <animate attributeName="y2" from="45" to="20" dur=".4s" fill="freeze"/>
  </line>
  <line x1="45" y1="45" x2="70" y2="45" stroke="#334155" stroke-width="3">
    <animate attributeName="x2" from="45" to="70" dur=".4s" fill="freeze"/>
  </line>
  </svg>`,
  cube:`<svg viewBox="0 0 110 80" role="img" aria-label="Cub d'aigua" style="display:block;margin:auto">
  <polygon points="20,25 65,15 90,30 45,40" fill="#a7f3d0" stroke="#64748b"/>
  <polygon points="45,40 90,30 90,60 45,70" fill="#93c5fd" stroke="#64748b"/>
  <polygon points="20,25 45,40 45,70 20,55" fill="#7dd3fc" stroke="#64748b"/>
  </svg>`,
  grid:`<svg viewBox="0 0 140 80" role="img" aria-label="Quadrícula" style="display:block;margin:auto">
  <rect x="15" y="10" width="110" height="60" fill="#f8fafc" stroke="#64748b"/>
  ${Array.from({length:3},(_,i)=>`<line x1="${15}" y1="${30+i*20}" x2="${125}" y2="${30+i*20}" stroke="#cbd5e1"/>`).join('')}
  ${Array.from({length:4},(_,i)=>`<line x1="${35+i*22.5}" y1="10" x2="${35+i*22.5}" y2="70" stroke="#cbd5e1"/>`).join('')}
  </svg>`
};

function genUnits(level, opts={}){
  const round = opts.round ?? 2;
  const group = opts.sub || 'length';

  const sets = {
    length: [
      {group:'length', from:'km', to:'m',  factor:1000,  icon:ICON.ruler},
      {group:'length', from:'m',  to:'cm', factor:100,   icon:ICON.ruler},
      {group:'length', from:'cm', to:'mm', factor:10,    icon:ICON.ruler},
      {group:'length', from:'mm', to:'cm', factor:0.1,   icon:ICON.ruler},
      {group:'length', from:'m',  to:'km', factor:0.001, icon:ICON.ruler},
    ],
    mass: [
      {group:'mass', from:'kg', to:'g',  factor:1000,  icon:ICON.scale},
      {group:'mass', from:'g',  to:'kg', factor:0.001, icon:ICON.scale},
      {group:'mass', from:'g',  to:'mg', factor:1000,  icon:ICON.scale},
      {group:'mass', from:'mg', to:'g',  factor:0.001, icon:ICON.scale},
    ],
    volume: [
      {group:'volume', from:'L',  to:'mL', factor:1000,  icon:ICON.cube},
      {group:'volume', from:'mL', to:'L',  factor:0.001, icon:ICON.cube},
    ],
    area: [
      {group:'area', from:'m²',  to:'cm²', factor:10000,  icon:ICON.grid},
      {group:'area', from:'cm²', to:'m²',  factor:0.0001, icon:ICON.grid},
    ],
    time: [
      {group:'time', from:'h',   to:'min', factor:60,   icon:ICON.clock},
      {group:'time', from:'min', to:'s',   factor:60,   icon:ICON.clock},
      {group:'time', from:'h',   to:'s',   factor:3600, icon:ICON.clock},
      {group:'time', from:'min', to:'h',   factor:1/60, icon:ICON.clock},
    ]
  };

  function filterSetsByLevel(sets, group, level){
    const L = clamp(level,1,4);
    const base = sets[group];
    const isAdj = (from,to) => (
      (from==='km' && to==='m') || (from==='m' && to==='cm') || (from==='cm' && to==='mm') ||
      (from==='kg' && to==='g') || (from==='g' && to==='mg') ||
      (from==='L'  && to==='mL') || (from==='mL' && to==='L') ||
      (from==='min'&& to==='s') || (from==='h'  && to==='min')
    );
    return base.filter(s=>{
      if(L===1){
        if(group==='area' || group==='time') return false;
        return isAdj(s.from, s.to);
      }
      if(L===2){
        if(group==='area') return false;
        if(s.from==='h' && s.to==='s') return false;
        if(s.from==='s' && s.to==='h') return false;
        return true;
      }
      if(L===3){
        if(s.from==='h' && s.to==='s') return false;
        if(s.from==='s' && s.to==='h') return false;
        return true;
      }
      return true;
    });
  }

  const pool = filterSetsByLevel(sets, group, level);
  const set = choice(pool.length ? pool : sets[group]);
  return convQuestion(set, round);
}

/* ===== Estudi de Funcions ===== */

function genFunctions(level, opts={}) {
  if(!('difficulty' in opts)) opts.difficulty = clamp(level,1,4);

  const types = opts.types || {
    lin: true, quad: true, poly: true, rac: true, rad: true, exp: true, log: true
  };
  const aspects = opts.aspects || { type: true };
  const difficulty = opts.difficulty || 1;

  const availableTypes = [];
  if (types.lin) availableTypes.push('lin');
  if (types.quad) availableTypes.push('quad');
  if (types.poly) availableTypes.push('poly');
  if (types.rac) availableTypes.push('rac');
  if (types.rad) availableTypes.push('rad');
  if (types.exp) availableTypes.push('exp');
  if (types.log) availableTypes.push('log');
  if (availableTypes.length === 0) availableTypes.push('lin');

  const selectedType = choice(availableTypes);
  const selectedAspect = getRandomAspect(aspects);

  return generateFunctionQuestion(selectedType, selectedAspect, difficulty, level);
}

function getRandomAspect(aspects) {
  const availableAspects = [];
  for (const aspect in aspects) {
    if (aspects[aspect]) availableAspects.push(aspect);
  }
  return availableAspects.length > 0 ? choice(availableAspects) : 'type';
}

function generateFunctionQuestion(type, aspect, difficulty, level) {
  let question = {};
  switch (type) {
    case 'lin':
      question = generateLinearFunction(aspect, difficulty, level);
      break;
    case 'quad':
      question = generateQuadraticFunction(aspect, difficulty, level);
      break;
    case 'poly':
      question = generatePolynomialFunction(aspect, difficulty, level);
      break;
    case 'rac':
      question = generateRationalFunction(aspect, difficulty, level);
      break;
    case 'rad':
      question = generateRadicalFunction(aspect, difficulty, level);
      break;
    case 'exp':
      question = generateExponentialFunction(aspect, difficulty, level);
      break;
    case 'log':
      question = generateLogarithmicFunction(aspect, difficulty, level);
      break;
  }
  return {
    type: `func-${type}-${aspect}`,
    text: question.text,
    html: question.html || '',
    answer: question.answer,
    meta: question.meta || {}
  };
}

function generateLinearFunction(aspect, difficulty, level) {
  let m = rng(-5, 5); if (m === 0) m = 1;
  const n = rng(-10, 10);
  const f = `f(x) = ${m}x ${n >= 0 ? '+' : ''} ${n}`;

  switch (aspect) {
    case 'type':
      return { text: `Quin tipus de funció és ${f}?`, answer: 'lineal' };
    case 'domain':
      return { text: `Quin és el domini de ${f}?`, answer: 'tots els reals' };
    case 'intercepts': {
      const xIntercept = n !== 0 ? `(${-n/m}, 0)` : '(0, 0)';
      return { text: `Quins són els punts de tall amb els eixos de ${f}? (Format: (x,0), (0,y))`, answer: `${xIntercept}, (0, ${n})` };
    }
    case 'symmetry':
      return { text: `Quina simetria té ${f}?`, answer: 'cap simetria' };
    case 'limits': {
      const limitInf = m > 0 ? '-∞' : '∞';
      const limitSup = m > 0 ? '∞' : '-∞';
      return { text: `Calcula els límits de ${f} quan x tendeix a ±∞ (Format: -∞: valor, ∞: valor)`, answer: `-∞: ${limitInf}, ∞: ${limitSup}` };
    }
    case 'extrema':
      return { text: `La funció ${f} té extrems relatius?`, answer: 'no' };
    case 'monotony': {
      const monotony = m > 0 ? 'creixent' : 'decreixent';
      return { text: `Quina és la monotonia de ${f}?`, answer: monotony };
    }
  }
}

function generateQuadraticFunction(aspect, difficulty, level) {
  let a = rng(-3, 3); if (a === 0) a = 1;
  const b = rng(-5, 5);
  const c = rng(-10, 10);
  const f = `f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`;
  const discriminant = b*b - 4*a*c;

  switch (aspect) {
    case 'type':
      return { text: `Quin tipus de funció és ${f}?`, answer: 'quadràtica' };
    case 'domain':
      return { text: `Quin és el domini de ${f}?`, answer: 'tots els reals' };
    case 'intercepts': {
      let xIntercepts = '';
      if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant))/(2*a);
        const x2 = (-b - Math.sqrt(discriminant))/(2*a);
        xIntercepts = `(${roundTo(x1, 2)}, 0), (${roundTo(x2, 2)}, 0)`;
      } else if (discriminant === 0) {
        const x = -b/(2*a);
        xIntercepts = `(${roundTo(x, 2)}, 0)`;
      } else {
        xIntercepts = 'cap';
      }
      return { text: `Quins són els punts de tall amb els eixos de ${f}? (Format: (x,0), (0,y))`, answer: `${xIntercepts}, (0, ${c})` };
    }
    case 'symmetry': {
      const vertexX = -b/(2*a);
      return { text: `Quina simetria té ${f}?`, answer: `simètrica respecte x = ${roundTo(vertexX, 2)}` };
    }
    case 'limits': {
      const limitInf = a > 0 ? '∞' : '-∞';
      const limitSup = a > 0 ? '∞' : '-∞';
      return { text: `Calcula els límits de ${f} quan x tendeix a ±∞ (Format: -∞: valor, ∞: valor)`, answer: `-∞: ${limitInf}, ∞: ${limitSup}` };
    }
    case 'extrema': {
      const vertexY = c - b*b/(4*a);
      const extremumType = a > 0 ? 'mínim' : 'màxim';
      return { text: `Quins són els extrems relatius de ${f}? (Format: tipus (x,y))`, answer: `${extremumType} (${roundTo(-b/(2*a), 2)}, ${roundTo(vertexY, 2)})` };
    }
    case 'monotony': {
      const vx = roundTo(-b/(2*a), 2);
      const behavior1 = a > 0 ? 'decreixent' : 'creixent';
      const behavior2 = a > 0 ? 'creixent' : 'decreixent';
      return { text: `Descriu la monotonia de ${f} (Format: (-∞,a): comportament, (a,∞): comportament)`, answer: `(-∞,${vx}): ${behavior1}, (${vx},∞): ${behavior2}` };
    }
  }
}

// Polinòmiques
function generatePolynomialFunction(aspect, difficulty, level) {
  const degree = difficulty === 1 ? 3 : (difficulty === 2 ? 4 : (difficulty>=4?5:5));
  const coefficients = Array.from({length: degree+1}, () => rng(-5, 5));
  coefficients[coefficients.length-1] = coefficients[coefficients.length-1] || 1;
  let f = 'f(x) = ';
  for (let i = coefficients.length-1; i >= 0; i--) {
    if (coefficients[i] !== 0) {
      if (i < coefficients.length-1 && coefficients[i] > 0) f += '+';
      if (i === 0) f += coefficients[i];
      else if (i === 1) f += `${coefficients[i]}x`;
      else f += `${coefficients[i]}x^${i}`;
    }
  }
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'polinòmica' };
}

// Racionals
function generateRationalFunction(aspect, difficulty, level) {
  const numerator = [rng(-5,5), rng(-5,5)];
  const denominator = [rng(-5,5), rng(-5,5)];
  if (denominator[1] === 0) denominator[1] = 1;
  const f = `f(x) = (${numerator[1]}x ${numerator[0] >= 0 ? '+' : ''} ${numerator[0]}) / (${denominator[1]}x ${denominator[0] >= 0 ? '+' : ''} ${denominator[0]})`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'racional' };
}

// Radicals
function generateRadicalFunction(aspect, difficulty, level) {
  const a = rng(1, 5);
  const b = rng(-5, 5);
  const c = rng(-5, 5);
  const f = `f(x) = ${a}√(x ${b >= 0 ? '+' : ''} ${b}) ${c >= 0 ? '+' : ''} ${c}`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'radical' };
}

// Exponencials
function generateExponentialFunction(aspect, difficulty, level) {
  const a = rng(1, 5);
  const b = rng(2, 5);
  const c = rng(-5, 5);
  const f = `f(x) = ${a}·${b}^x ${c >= 0 ? '+' : ''} ${c}`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'exponencial' };
}

// Logarítmiques
function generateLogarithmicFunction(aspect, difficulty, level) {
  const a = rng(1, 5);
  const b = rng(2, 5);
  const c = rng(-5, 5);
  const f = `f(x) = ${a}·log${b}(x) ${c >= 0 ? '+' : ''} ${c}`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'logarítmica' };
}


  const MATH_MODULES = [
    { id:'arith', name:'Aritmètica', desc:'Sumes, restes, multiplicacions i divisions.', gen: genArith, category:'math' },
    { id:'frac',  name:'Fraccions',  desc:'Identificar (imatge), aritmètica i simplificar.', gen: genFractions, category:'math' },
    { id:'perc',  name:'Percentatges', desc:'Calcula percentatges i descomptes.', gen: genPercent, category:'math' },
    { id:'geom',  name:'Àrees, perímetres i volums', desc:'Figures 2D i cossos 3D.', gen: genGeometry, category:'math' },
    { id:'coord', name:'Coordenades cartesianes', desc:'Col·loca punts als quadrants i llegeix coordenades.', gen: genCoordinates, category:'math' },
    { id:'stats', name:'Estadística bàsica', desc:'Mitjana/mediana/moda, rang/desviació i gràfics.', gen: genStats, category:'math' },
    { id:'units', name:'Unitats i conversions', desc:'Longitud, massa, volum, superfície i temps.', gen: genUnits, category:'math' },
    { id:'eq',    name:'Equacions', desc:'1r grau, 2n grau, sistemes, fraccions i parèntesis.', gen: genEq, category:'math' },
    { id:'func',  name:'Estudi de funcions', desc:'Tipus, domini, punts de tall, simetria, límits, extrems i monotonia.', gen: genFunctions, category:'math' }
];

  if (typeof root.addModules === 'function') {
    root.addModules(MATH_MODULES);
  } else {
    root._PENDING_MATH_MODULES_ = MATH_MODULES;
    if (typeof root.addEventListener === 'function') {
      root.addEventListener('DOMContentLoaded', () => {
        if (typeof root.addModules === 'function' && root._PENDING_MATH_MODULES_) {
          root.addModules(root._PENDING_MATH_MODULES_);
          delete root._PENDING_MATH_MODULES_;
        }
      });
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);

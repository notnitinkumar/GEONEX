// import * as d3 from "d3";
import {
  generateGreatCircle,
  stereographicProjection,
} from "./stereonetcalc.js";


export function hoverPlane2D(canvas, strike, dip, dipDirection, color="cyan") {
  const ctx = canvas.getContext("2d");
  ctx.save();

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const R = (Math.min(canvas.width, canvas.height) / 2) * 0.9;

  const orientations = generateGreatCircle(strike, dip, dipDirection);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  orientations.forEach((o, i) => {
    const { x, y } = stereographicProjection(o.trend, o.plunge, R);

    const X = centerX + x;
    const Y = centerY - y;

    if (i === 0) ctx.moveTo(X, Y);
    else ctx.lineTo(X, Y);
  });

  ctx.stroke();
  ctx.restore();
} 

export function plotPlane2D(canvas, strike, dip, dipDirection, color="cyan") {
  const ctx = canvas.getContext("2d");

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const R = (Math.min(canvas.width, canvas.height) / 2) * 0.9;

  const orientations = generateGreatCircle(strike, dip, dipDirection);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([]);

  orientations.forEach((o, i) => {
    const { x, y } = stereographicProjection(o.trend, o.plunge, R);

    const X = centerX + x;
    const Y = centerY - y;

    if (i === 0) ctx.moveTo(X, Y);
    else ctx.lineTo(X, Y);
  });

  ctx.stroke();
}

export function plotLine2D(canvas, trend, plunge, color="cyan") {
  const ctx = canvas.getContext("2d");

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const R = (Math.min(canvas.width, canvas.height) / 2) * 0.9;

  const { x, y } = stereographicProjection(trend, plunge, R);

  ctx.beginPath();
  ctx.fillStyle = color;

  ctx.arc(centerX + x, centerY - y, 4, 0, Math.PI * 2);
  ctx.fill();
}

function anglesAndDirection(canvas)
{
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const R = (canvas.height / 2) * 0.9;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const x = centerX + R * Math.sin(rad);
    const y = centerY - R * Math.cos(rad);

    // Responsive font for mobile
    let dx = 10,
      dy = 10;

    if (window.innerWidth <= 600) {
      dx = 6;
      dy = 6;
    }

    ctx.fillStyle = "white";

    if (angle < 90 && angle > 0) ctx.fillText(angle, x + dx, y - dy);
    if (angle < 180 && angle > 90) ctx.fillText(angle, x + dx + 5, y + dy + 5);
    if (angle < 270 && angle > 180) ctx.fillText(angle, x - dx - 5, y + dy);
    if (angle < 360 && angle > 270) ctx.fillText(angle, x - dx - 5, y - dy);
  }
  ctx.stroke();

  ctx.fillStyle = "white";

  let fontSize = 14;
  let offset = 15;

  if (window.innerWidth <= 600) {
    fontSize = 10;
    offset = 8;
  }

  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("N", centerX, centerY - R - offset);
  ctx.fillText("E", centerX + R + offset, centerY);
  ctx.fillText("S", centerX, centerY + R + offset);
  ctx.fillText("W", centerX - R - offset, centerY);
}

// ---------------- Stereonet background grid -------------------
export function drawStereonet2d(canvas) {
  const ctx = canvas.getContext("2d");

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const R = (canvas.height / 2) * 0.9;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, R, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  for (let r = R / 5; r < R; r += R / 5) {
    ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
  }
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const x = centerX + R * Math.sin(rad);
    const y = centerY - R * Math.cos(rad);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
    anglesAndDirection(canvas);
}
export function drawEqualAreaStereonet(canvas, gridSpacing = 8) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const R = (Math.min(width, height) / 2) * 0.9;

  ctx.clearRect(0, 0, width, height);

  const projection = d3.geoAzimuthalEqualArea()
    .scale(R / Math.SQRT2)
    .translate([centerX, centerY])
    .rotate([0, 0])      
    .clipAngle(90)
    .precision(0.1);

  // OUTER BOUNDARY
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 2;

  // LONGITUDE LINES
  for (let lon = 0; lon > -90; lon -= gridSpacing) {
    ctx.beginPath();
    let started = false;
    for (let lat = -90; lat <= 90; lat += 2) {
      const p = projection([lon, lat]);
      if (!p) continue;
      
      if (!started) {
        ctx.moveTo(p[0], p[1]);
        started = true;
      } else {
        ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.stroke();
  }
  for (let lon = 0 + gridSpacing; lon < 90; lon += gridSpacing) {
    ctx.beginPath();
    let started = false;
    for (let lat = -90; lat <= 90; lat += 2) {
      const p = projection([lon, lat]);
      if (!p) continue;
      
      if (!started) {
        ctx.moveTo(p[0], p[1]);
        started = true;
      } else {
        ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.stroke();
  }

  // LATITUDE LINES
  for (let lat = 0; lat < 90; lat += gridSpacing) {
    ctx.beginPath();
    let started = false;
    for (let lon = -90; lon <= 90; lon += 2) {
      const p = projection([lon, lat]);
      if (!p) continue;

      if (!started) {
        ctx.moveTo(p[0], p[1]);
        started = true;
      } else {
        ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.stroke();
  }
  for (let lat = 0-gridSpacing; lat > -90; lat -= gridSpacing) {
    ctx.beginPath();
    let started = false;
    for (let lon = -90; lon <= 90; lon += 2) {
      const p = projection([lon, lat]);
      if (!p) continue;

      if (!started) {
        ctx.moveTo(p[0], p[1]);
        started = true;
      } else {
        ctx.lineTo(p[0], p[1]);
      }
    }
    ctx.stroke();
  }
  anglesAndDirection(canvas);
}

export function drawTriangleMarker(canvas, trend, plunge, color) {
  const ctx = canvas.getContext("2d");

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const R = (canvas.height / 2) * 0.9;

  const trendRad = (trend * Math.PI) / 180;
  const r = (1 - plunge / 90) * R;

  const x = cx + r * Math.sin(trendRad);
  const y = cy - r * Math.cos(trendRad);

  const size = 6;

  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();

  ctx.fillStyle = color || "white";
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function drawRoseDiagram(canvas, dataset, type = "plane", binSize = 30) {
  const ctx = canvas.getContext("2d");

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxRadius = Math.min(cx, cy) * 0.9;

  let angles = dataset
    .filter(p => p.type === type)
    .map(p => p.strike);

  if (type === "plane") {
    angles = angles.map(a => a % 180);
  }

  if (angles.length === 0) return;

  const range = type === "plane" ? 180 : 360;
  const binCount = Math.floor(range / binSize);
  const bins = new Array(binCount).fill(0);

  angles.forEach(angle => {
    const index = Math.floor((angle % range) / binSize);
    bins[index]++;

    if (type === "plane") {
      const mirrorIndex = (index + binCount / 2) % binCount;
      bins[mirrorIndex]++;
    }
  });

  const maxValue = Math.max(...bins);

  bins.forEach((count, i) => {
    const angleStart = (i * binSize) * Math.PI / 180;
    const angleEnd = ((i + 1) * binSize) * Math.PI / 180;

    let start = angleStart;
    let end = angleEnd;
    if (type === "plane") {
      const scale = 2;
      start *= scale;
      end *= scale;
    }

    const radius = (count / maxValue) * maxRadius;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();

    ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(cx, cy, maxRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
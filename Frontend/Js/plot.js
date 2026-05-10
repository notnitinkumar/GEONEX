import {
  generateGreatCircle,
  stereographicProjection,
} from "./stereonetcalc.js";

export function hoverPlane2D(
  canvas,
  strike,
  dip,
  dipDirection,
  color = "cyan",
) {
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

export function plotPlane2D(canvas, strike, dip, dipDirection, color = "cyan") {
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

export function plotLine2D(canvas, trend, plunge, color = "cyan") {
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

function anglesAndDirection(canvas) {
  const ctx = canvas.getContext("2d");
  const logicalSize = canvas.logicalSize || canvas.clientWidth || canvas.width;
  const renderSize = canvas.width || logicalSize;
  const scaleFactor = renderSize / logicalSize;

  const centerX = renderSize / 2;
  const centerY = renderSize / 2;

  const R = (renderSize / 2) * 0.9;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.beginPath();
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const x = centerX + R * Math.sin(rad);
    const y = centerY - R * Math.cos(rad);

    // Responsive font for mobile
    let dx = 10 * scaleFactor,
      dy = 10 * scaleFactor;

    if (window.innerWidth <= 600) {
      dx = 6 * scaleFactor;
      dy = 6 * scaleFactor;
    }

    ctx.fillStyle = "white";

    // keep labels readable during high-resolution export
    let fontSize = 14;
    let offset = 15;

    if (window.innerWidth <= 600) {
      fontSize = 10;
      offset = 8;
    }

    ctx.font = `${Math.max(12, fontSize)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

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

  const projection = d3
    .geoAzimuthalEqualArea()
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
  for (let lat = 0 - gridSpacing; lat > -90; lat -= gridSpacing) {
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

export function drawRoseDiagram(canvas, dataset, binWidth = 30) {
  const ctx = canvas.getContext("2d");


  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = (Math.min(width, height) / 2) * 0.9;

  let bw = parseInt(binWidth);

  if (isNaN(bw) || bw <= 0 || bw > 180) {
    bw = 30;
  }

  const binsCount = Math.max(1, Math.floor(360 / bw));
  const freq = new Array(binsCount).fill(0);

  dataset
    .filter((d) => d.include !== false)
    .forEach((d) => {
    let angle = 0;
    if (d.type === "plane") {
      let trend;
      if (d.dipDirection === "South" || d.dipDirection === "West") {
        trend = (d.strike + 270) % 360;
      } else {
        trend = (d.strike + 90) % 360;
      }
      angle = trend;
    } else {
      const t = d.strike % 360;
      angle = t;
    }
    const safeIndex = Math.min(
      freq.length - 1,
      Math.floor((angle % 360) / bw)
    );

    freq[safeIndex]++;
  });
  const maxCount = Math.max(...freq, 1);
  for (let i = 0; i < binsCount; i++) {
    const startDeg = i * bw;
    const endDeg = (i + 1) * bw;

    const r = Math.sqrt(freq[i] / maxCount) * maxRadius;

    const start = (startDeg * Math.PI) / 180;
    const end = (endDeg * Math.PI) / 180;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start-Math.PI/2, end-Math.PI/2);
    ctx.closePath();

    ctx.fillStyle = "rgba(0, 100, 200, 0.3)";
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}
export function drawContourPlots(canvas, dataset) {
  const ctx = canvas.getContext("2d");


  const width = canvas.width;
  const height = canvas.height;

  const cx = width / 2;
  const cy = height / 2;

  const R = (Math.min(width, height) / 2) * 0.9;

  // CLIP TO STEREONET
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // PROJECT DATA
  const points = dataset
    .filter((d) => d.include !== false)
    .filter((d) => d.type === "line" || d.type === "plane")
    .map((d) => {
      const { x, y } = stereographicProjection(
        d.trend ?? d.strike,
        d.plunge ?? d.dip,
        R,
      );
      return [cx + x, cy - y];
    })
    .filter(([x, y]) => {
      const dx = x - cx;
      const dy = y - cy;
      return dx * dx + dy * dy <= R * R;
    });

  if (points.length < 5) {
    console.warn("Not enough points for contour");
    ctx.restore();
    return;
  }

  // DENSITY (KDE)
  const density = d3
    .contourDensity()
    .x((d) => d[0])
    .y((d) => d[1])
    .size([width, height])
    .bandwidth(25);

  const contours = density(points);

  // COLOR SCALE
  const color = d3
    .scaleSequential(d3.interpolateTurbo)
    .domain(d3.extent(contours, (d) => d.value));

  // DRAW CONTOURS
  const path = d3.geoPath(null, ctx);

  contours.forEach((c) => {
    ctx.beginPath();
    path(c);

    ctx.fillStyle = color(c.value);
    ctx.globalAlpha = 0.85;
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Draw original points on top
  ctx.fillStyle = "blue";
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

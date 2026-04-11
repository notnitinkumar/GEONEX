import {
  generateGreatCircle,
  stereographicProjection,
} from "./stereonetcalc.js";

export function plotPlane2D(canvas, strike, dip, dipDirection, color="cyan") {
  const ctx = canvas.getContext("2d");

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const R = (Math.min(canvas.width, canvas.height) / 2) * 0.9;

  const orientations = generateGreatCircle(strike, dip, dipDirection);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

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

    // Responsive font for mobile
    let dx = 10,
      dy = 10;

    if (window.innerWidth <= 600) {
      dx = 6;
      dy = 6;
    }

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

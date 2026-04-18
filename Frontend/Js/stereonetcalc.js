// --- Angle utilities ---
export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

// --- Stereographic projection (lower hemisphere) ---

export function stereographicProjection(trend, plunge, R = 250) {
  const r = R * Math.tan(degToRad((90 - plunge) / 2));

  const x = r * Math.sin(degToRad(trend));
  const y = r * Math.cos(degToRad(trend));

  return { x, y };
}
// export function equalAreaProjection(trend, plunge, R = 250) {
//   const r = R * Math.sqrt((90 - plunge) / 90);

//   const x = r * Math.sin(degToRad(trend));
//   const y = r * Math.cos(degToRad(trend));

//   return { x, y };
// }
// --- Generate great circle (plane) points ---

export function generateGreatCircle(strike, dip, dipDirection, steps = 360) {
  const points = [];

  const dipRad = degToRad(dip);

  for (let i = 0; i <= steps; i++) {
    const beta = degToRad(i * (180 / steps));

    const x = Math.cos(beta);
    const y = Math.sin(beta) * Math.cos(dipRad);
    const z = Math.sin(beta) * Math.sin(dipRad);

    let trend = normalizeAngle(radToDeg(Math.atan2(y, x)) + strike);
    let plunge = radToDeg(Math.asin(z));

    // Use dip direction to select correct hemisphere
    if (dipDirection !== undefined) {
      if (dipDirection === "North" || dipDirection === "East") {
        trend = normalizeAngle(trend + 180);
      }
    }

    points.push({ trend, plunge });
  }

  return points;
}

// ----------------- Mean Vector Calculation -----------------
export function calculateMeanVector(trends, plunges) {
  const n = trends.length;
  let sumX = 0,
      sumY = 0,
      sumZ = 0;

  for (let i = 0; i < n; i++) {
    let trend = trends[i];
    let plunge = plunges[i];

    // Ensure lower hemisphere
    if (plunge < 0) {
      plunge = -plunge;
      trend = normalizeAngle(trend + 180);
    }

    const trendRad = degToRad(trend);
    const plungeRad = degToRad(plunge);

    sumX += Math.cos(plungeRad) * Math.cos(trendRad);
    sumY += Math.cos(plungeRad) * Math.sin(trendRad);
    sumZ += Math.sin(plungeRad);
  }

  const R = Math.sqrt(sumX * sumX + sumY * sumY + sumZ * sumZ);

  const meanTrend = normalizeAngle(radToDeg(Math.atan2(sumY, sumX)));
  const meanPlunge = radToDeg(Math.asin(sumZ / R));

  return { trend: meanTrend, plunge: meanPlunge };
}

// ----------------- Angle Between ------------------

export function angleBetweenPlanes(strike1, dip1, dipDirection1, strike2, dip2, dipDirection2) {
  function pole(strike, dip) {
    const trend = normalizeAngle(strike + 90);
    const plunge = 90 - dip;

    const t = degToRad(trend);
    const p = degToRad(plunge);

    return [
      Math.cos(p) * Math.cos(t),
      Math.cos(p) * Math.sin(t),
      Math.sin(p)
    ];
  }

  const n1 = pole(strike1, dip1);
  const n2 = pole(strike2, dip2);

  const dot = n1[0]*n2[0] + n1[1]*n2[1] + n1[2]*n2[2];
  const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

  return radToDeg(angle);
}

export function angleBetweenLines(trend1, plunge1, trend2, plunge2) {
  const dot = Math.sin(degToRad(plunge1)) * Math.sin(degToRad(plunge2)) +
              Math.cos(degToRad(plunge1)) * Math.cos(degToRad(plunge2)) *
              Math.cos(degToRad(trend1 - trend2));

  return radToDeg(Math.acos(Math.min(1, Math.max(-1, dot))));
}

export function angleBetweenLineAndPlane(trend, plunge, strike, dip, dipDirection) {
  // line vector
  const t = degToRad(trend);
  const p = degToRad(plunge);

  const line = [
    Math.cos(p) * Math.cos(t),
    Math.cos(p) * Math.sin(t),
    Math.sin(p)
  ];

  // plane normal (pole)
  const poleTrend = normalizeAngle(strike + 90);
  const polePlunge = 90 - dip;

  const pt = degToRad(poleTrend);
  const pp = degToRad(polePlunge);

  const normal = [
    Math.cos(pp) * Math.cos(pt),
    Math.cos(pp) * Math.sin(pt),
    Math.sin(pp)
  ];

  const dot = line[0]*normal[0] + line[1]*normal[1] + line[2]*normal[2];

  // angle between line and plane = 90 - angle(line, normal)
  const angle = Math.asin(Math.min(1, Math.max(-1, Math.abs(dot))));

  return radToDeg(angle);
}
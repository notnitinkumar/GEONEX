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
      if (dipDirection === "South" || dipDirection === "West") {
        trend = normalizeAngle(trend + 180);
      }
    }

    points.push({ trend, plunge });
  }

  return points;
}
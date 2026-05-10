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

// ------------- Trend and Plunge to Cartesian ----------------
export function toCartesian(trend, plunge) {
  const tr = degToRad(trend);
  const pl = degToRad(plunge);

  const x = Math.cos(pl) * Math.cos(tr);
  const y = Math.cos(pl) * Math.sin(tr);
  const z = Math.sin(pl);

  return { x, y, z };
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

export function angleBetweenPlanes(
  strike1,
  dip1,
  dipDirection1,
  strike2,
  dip2,
  dipDirection2,
) {
  function pole(strike, dip) {
    const trend = normalizeAngle(strike + 90);
    const plunge = 90 - dip;

    const t = degToRad(trend);
    const p = degToRad(plunge);

    return [Math.cos(p) * Math.cos(t), Math.cos(p) * Math.sin(t), Math.sin(p)];
  }

  const n1 = pole(strike1, dip1);
  const n2 = pole(strike2, dip2);

  const dot = n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2];
  const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

  return radToDeg(angle);
}

export function angleBetweenLines(trend1, plunge1, trend2, plunge2) {
  const dot =
    Math.sin(degToRad(plunge1)) * Math.sin(degToRad(plunge2)) +
    Math.cos(degToRad(plunge1)) *
      Math.cos(degToRad(plunge2)) *
      Math.cos(degToRad(trend1 - trend2));

  return radToDeg(Math.acos(Math.min(1, Math.max(-1, dot))));
}

export function angleBetweenLineAndPlane(
  trend,
  plunge,
  strike,
  dip,
  dipDirection,
) {
  // line vector
  const t = degToRad(trend);
  const p = degToRad(plunge);

  const line = [
    Math.cos(p) * Math.cos(t),
    Math.cos(p) * Math.sin(t),
    Math.sin(p),
  ];

  // plane normal (pole)
  const poleTrend = normalizeAngle(strike + 90);
  const polePlunge = 90 - dip;

  const pt = degToRad(poleTrend);
  const pp = degToRad(polePlunge);

  const normal = [
    Math.cos(pp) * Math.cos(pt),
    Math.cos(pp) * Math.sin(pt),
    Math.sin(pp),
  ];

  const dot = line[0] * normal[0] + line[1] * normal[1] + line[2] * normal[2];

  // angle between line and plane = 90 - angle(line, normal)
  const angle = Math.asin(Math.min(1, Math.max(-1, Math.abs(dot))));

  return radToDeg(angle);
}

function getTrendsPlungesCoordinates(dataset) {
  const trends = [];
  const plunges = [];
  const coordinates = [];
  dataset.forEach((d) => {
    if (d.type === "line") {
      const trendVal = d.trend ?? d.strike;
      const plungeVal = d.plunge ?? d.dip;
      trends.push(trendVal);
      plunges.push(plungeVal);
      coordinates.push(toCartesian(trendVal, plungeVal));
    } else if (d.type === "plane") {
      const poleTrend = (d.strike + 90) % 360;
      const polePlunge = 90 - d.dip;
      trends.push(poleTrend);
      plunges.push(polePlunge);
      coordinates.push(toCartesian(poleTrend, polePlunge));
    }
  });
  return { trends, plunges, coordinates };
}

function vectorToTrendPlunge(v) {
  let [x, y, z] = v;

  const mag = Math.sqrt(x*x + y*y + z*z);
  x /= mag; y /= mag; z /= mag;

  // ensure lower hemisphere
  if (z < 0) {
    x = -x;
    y = -y;
    z = -z;
  }

  const plunge = Math.asin(z) * 180 / Math.PI;

  let trend = Math.atan2(y, x) * 180 / Math.PI;
  if (trend < 0) trend += 360;

  return { trend, plunge };
}

// ----------------- Fisher Vector Distribution -----------------
export function fisherDistribution(dataset) {
  dataset = dataset.filter((p) => p.include !== false);
  const { trends, plunges, coordinates } = getTrendsPlungesCoordinates(dataset);
  const meanVector = calculateMeanVector(trends, plunges);

  const N = dataset.length;
  let X = 0,
    Y = 0,
    Z = 0;
  coordinates.forEach((c) => {
    X += c.x;
    Y += c.y;
    Z += c.z;
  });
  const R = Math.sqrt(X * X + Y * Y + Z * Z);
  const meanLength = R / N;
  const kappa =
    (meanLength * (3 - meanLength * meanLength)) /
    (1 - meanLength * meanLength);
  const confidence = 1 / Math.sqrt(kappa * N);
  const alpha95 = radToDeg(
    Math.acos(1 - ((N - R) / R) * (Math.pow(1 / confidence, 1 / (N - 1)) - 1)),
  ); // 95% confidence cone angle
  return {
    meanTrend: meanVector.trend,
    meanPlunge: meanVector.plunge,
    kappa: kappa,
    alpha95: alpha95,
    meanLength: meanLength,
  };
}

// ----------------- Bingham Axial Distribution -----------------
export function binghamDistribution(dataset) {
  dataset = dataset.filter((p) => p.include !== false);
  const { trends, plunges, coordinates } = getTrendsPlungesCoordinates(dataset);

  const N = dataset.length;
  if (N === 0) {
    return {
      eigenvalues: [0, 0, 0],
      trend: [0, 0, 0],
      plunge: [0, 0, 0],
    };
  }

  let X2 = 0, Y2 = 0, Z2 = 0;
  let XY = 0, XZ = 0, YZ = 0;

  coordinates.forEach(c => {
    X2 += c.x * c.x;
    Y2 += c.y * c.y;
    Z2 += c.z * c.z;
    XY += c.x * c.y;
    XZ += c.x * c.z;
    YZ += c.y * c.z;
  });

  const tensor = [
    [X2, XY, XZ],
    [XY, Y2, YZ],
    [XZ, YZ, Z2]
  ].map(row => row.map(v => v / N));

  const eig = numeric.eig(tensor);

  const eigenvalues = eig.lambda.x;
  const eigenvectors = eig.E.x;

  const sorted = [0,1,2].sort((a,b) => eigenvalues[b] - eigenvalues[a]);

  const sortedEigenvalues = sorted.map(i => eigenvalues[i]);

  const sortedEigenvectors = sorted.map(i =>
    eigenvectors.map(row => row[i])
  );

  const trend = [];
  const plunge = [];

  sortedEigenvectors.forEach(v => {
    const tp = vectorToTrendPlunge(v);
    trend.push(tp.trend);
    plunge.push(tp.plunge);
  });

  // Best-fit great circle from smallest eigenvalue (axis 3)
  const poleTrend = trend[2];
  const polePlunge = plunge[2];

  const gcDip = 90 - polePlunge;
  const gcStrike = normalizeAngle(poleTrend +90)%360;

  return {
    eigenvalues: sortedEigenvalues,
    trend: trend,
    plunge: plunge,
    bestFitPlane: {
      strike: gcStrike,
      dip: gcDip
    }
  };
}

// ----------------- Von Mises Distribution -----------------
export function vonMisesDistribution(dataset) {
  dataset = dataset.filter((p) => p.include !== false);
  const { trends } = getTrendsPlungesCoordinates(dataset);

  const N = trends.length;
  if (N === 0) return { meanTrend: 0, kappa: 0, R: 0 };

  // Detect axial data 
  const isAxial = dataset.some(d => d.type === "plane");

  let C = 0, S = 0;

  trends.forEach(t => {
    let angle = degToRad(t);
    if (isAxial) angle *= 2; // axial correction

    C += Math.cos(angle);
    S += Math.sin(angle);
  });

  C /= N;
  S /= N;

  const R = Math.sqrt(C*C + S*S);

  // If completely dispersed, avoid unstable kappa
  if (R === 0) {
    return { meanTrend: 0, kappa: 0, R: 0 };
  }

  let mean = radToDeg(Math.atan2(S, C));
  if (mean < 0) mean += 360;

  if (isAxial) {
    mean /= 2; // reverse axial doubling
    if (mean < 0) mean += 360;
  }
  
  let kappa;
  if (R < 0.53) {
    kappa = 2*R + R**3 + (5*R**5)/6;
  } else if (R < 0.85) {
    kappa = -0.4 + 1.39*R + 0.43/(1 - R);
  } else {
    kappa = 1 / (R**3 - 4*R**2 + 3*R);
  }

  // --- derived statistics ---
  const circularVariance = 1 - R;

  // standard error in radians (approximation)
  const stdErrorRad = Math.sqrt((1 - R) / (N * R));
  const stdErrorDeg = radToDeg(stdErrorRad);

  // 95% confidence (≈ 1.96 * std error)
  const error95 = stdErrorDeg * 1.96;

  return {
    meanTrend: mean,
    kappa: kappa,
    R: R,
    circularVariance: circularVariance,
    stdError: stdErrorDeg,
    error95: error95
  };
}

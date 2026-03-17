// --- Angle utilities ---
export function degToRad(deg) {
    return deg * Math.PI / 180;
}

export function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

export function normalizeAngle(angle) {
    return (angle % 360 + 360) % 360;
}

// --- Stereographic projection (lower hemisphere) ---

export function stereographicProjection(trend, plunge, R = 250) {

    const r = R * Math.tan(degToRad((90 - plunge) / 2));

    const x = r * Math.sin(degToRad(trend));
    const y = r * Math.cos(degToRad(trend));

    return { x, y };
}

// --- Convert strike/dip plane to pole orientation ---

export function poleFromStrikeDip(strike, dip) {

    const trend = normalizeAngle(strike + 90);
    const plunge = 90 - dip;

    return { trend, plunge };
}

// --- Project pole directly onto stereonet ---

export function projectPole(strike, dip, R = 250) {

    const pole = poleFromStrikeDip(strike, dip);

    return stereographicProjection(pole.trend, pole.plunge, R);
}

// --- Generate great circle (plane) points ---

export function generateGreatCircle(strike, dip, steps = 360) {

    const points = [];

    const dipRad = degToRad(dip);

    for (let i = 0; i <= steps; i++) {

        const beta = degToRad(i * (180 / steps));

        const x = Math.cos(beta);
        const y = Math.sin(beta) * Math.cos(dipRad);
        const z = Math.sin(beta) * Math.sin(dipRad);

        const trend = normalizeAngle(radToDeg(Math.atan2(y, x)) + strike);
        let plunge = radToDeg(Math.asin(z));
        // ensure lower hemisphere (positive plunge)
        if (plunge < 0) {
            plunge = -plunge;
        }

        points.push({ trend, plunge });
    }

    return points;
}

// --- Convert great circle orientations to stereonet coordinates ---

export function projectGreatCircle(strike, dip, R = 250) {

    const orientations = generateGreatCircle(strike, dip);

    const projected = [];

    for (let o of orientations) {

        const point = stereographicProjection(o.trend, o.plunge, R);

        projected.push(point);
    }

    return projected;
}

// --- Dataset pole projection ---

export function projectDataset(data, R = 250) {

    const points = [];

    for (let d of data) {

        const pole = projectPole(d.strike, d.dip, R);

        points.push(pole);
    }

    return points;
}

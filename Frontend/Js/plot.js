import { projectPole, poleFromStrikeDip } from "./stereonetcalc.js";

export function plotPole2D(canvas, strike, dip, color="red") {

    const ctx = canvas.getContext("2d");

    const R = Math.min(canvas.width, canvas.height) / 2 * 0.9;
    const {x,y} = projectPole(strike, dip, R);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.fillStyle = color;

    ctx.arc(centerX + x, centerY - y, 4, 0, Math.PI*2);

    ctx.fill();
}

export function plotPole3D(scene, strike, dip) {

    const pole = poleFromStrikeDip(strike,dip);

    const trend = pole.trend * Math.PI/180;
    const plunge = pole.plunge * Math.PI/180;

    const x = Math.cos(plunge) * Math.sin(trend);
    const y = Math.cos(plunge) * Math.cos(trend);
    const z = Math.sin(plunge);

    const geometry = new THREE.SphereGeometry(0.03);
    const material = new THREE.MeshBasicMaterial({color:0xff0000});

    const point = new THREE.Mesh(geometry,material);

    point.position.set(x,y,z);

    scene.add(point);
}



export function drawStereonet2d(canvas) {

    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const R = canvas.height / 2 * 0.9;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, R, 0, 2 * Math.PI);
    ctx.stroke();
    
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    for(let r = R/5; r < R; r += R/5){
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
    }
    for(let angle = 0; angle < 360; angle += 30){
        const rad = angle * Math.PI / 180;
        const x = centerX + R * Math.cos(rad);
        const y = centerY + R * Math.sin(rad);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("N", centerX - 10, centerY - R - 10);
    ctx.fillText("E", centerX + R + 10, centerY + 5);
    ctx.fillText("S", centerX - 10, centerY + R + 20);
    ctx.fillText("W", centerX - R - 20, centerY + 5);
}
import { projectPole,generateGreatCircle } from "./stereonetcalc.js";


export function plotPole2D(canvas, strike, dip, color="red") {

    const ctx = canvas.getContext("2d");

    const R = Math.min(canvas.width, canvas.height) / 2 * 0.9;
    const {x,y} = projectPole(strike, dip, R); //coordinates of pole on stereonet

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.fillStyle = color;

    ctx.arc(centerX + x, centerY - y, 4, 0, Math.PI*2);

    ctx.fill();
}

export function plotPlane2D(canvas, strike, dip, color = "blue") {

    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const R = Math.min(canvas.width, canvas.height) / 2 * 0.9;

    const orientations = generateGreatCircle(strike, dip);

    ctx.beginPath();
    ctx.strokeStyle = color;

    orientations.forEach((o, i) => {

        const {x, y} = projectPole(o.trend, 90 - o.plunge, R); 
        // convert trend-plunge → projection

        const X = centerX + x;
        const Y = centerY - y;

        if(i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);

    });

    ctx.stroke();
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
        const x = centerX + R * Math.sin(rad);
        const y = centerY - R * Math.cos(rad);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("N", centerX, centerY - R - 15);
    ctx.fillText("E", centerX + R + 15, centerY);
    ctx.fillText("S", centerX, centerY + R + 15);
    ctx.fillText("W", centerX - R - 15, centerY);
}
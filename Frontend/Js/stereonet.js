import { plotPole2D, plotPlane2D } from "./plot.js";
import { drawStereonet2d } from "./plot.js";
let dataset = [];

const planeBtn = document.querySelector('#Plane-plot');
const lineBtn = document.querySelector('#Line-plot');
planeBtn.addEventListener('click', function () {
    //Change style of plane button to active and line to deactive
    planeBtn.classList.add('activebtn-datatype');
    planeBtn.classList.remove('deactivebtn-datatype');
    lineBtn.classList.add('deactivebtn-datatype');
    lineBtn.classList.remove('activebtn-datatype');

    //Planar data input form
    document.getElementById('nonangular').innerHTML = 'Strike (0 – 360°)';
    document.getElementById('angular').innerHTML = 'Dip (0–90°)';

});

lineBtn.addEventListener('click', function () {
   //Change style of line button to active and Plane to deactive
    lineBtn.classList.add('activebtn-datatype');
    lineBtn.classList.remove('deactivebtn-datatype');
    planeBtn.classList.add('deactivebtn-datatype');
    planeBtn.classList.remove('activebtn-datatype');

    //Linear data input form
    document.getElementById('nonangular').innerHTML = 'Trend (0 – 360°)';
    document.getElementById('angular').innerHTML = 'Plunge (0–90°)';

});

//Form data
const form = document.querySelector("#dataForm");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const formData = new FormData(form);

    const strike = formData.get("strike");
    const dip = formData.get("dip");
    const label = formData.get("label");
    const color = formData.get("color");

    const a = parseFloat(strike);
    const b = parseFloat(dip);

    const canvas = document.getElementById("stereonetCanvas");

    if (!isNaN(a) && !isNaN(b)) {

        const id = Date.now();
        const isPlane = planeBtn.classList.contains("activebtn-datatype");

        const dataPoint = {
            id,
            type: isPlane ? "plane" : "line",
            strike: a,
            dip: b,
            color
        };

        dataset.push(dataPoint);

        if (canvas) {

            if (isPlane) {
                // Plane → draw great circle
                plotPlane2D(canvas, a, b, color);
            } else {
                // Line → plot point (trend-plunge)
                plotPole2D(canvas, a, b, color);
            }
        }

        // Insert row into Saved Plots table
        const tableBody = document.querySelector("#plotTable tbody");

        const row = document.createElement("tr");

        row.dataset.id = id; // store id in row for future reference
        const typeCell = document.createElement("td");
        const labelCell = document.createElement("td");
        const paramsCell = document.createElement("td");
        const actionCell = document.createElement("td");

        // Determine plot type
        const plotType = planeBtn.classList.contains("activebtn-datatype") ? "Plane" : "Line";
        labelCell.textContent = label || "N/A";
        typeCell.textContent = plotType;
        paramsCell.textContent = `${strike}, ${dip}`;

        const deleteBtn = document.createElement("img");
        deleteBtn.src = "Assets/icons/dustbin.png";
        deleteBtn.alt = "Delete";
        deleteBtn.classList.add("dustbin");
        deleteBtn.addEventListener("click", function(){
        const row = this.closest("tr");
        const id = Number(row.dataset.id);
        // remove from dataset
        dataset = dataset.filter(p => p.id !== id);
        // remove row from table
        row.remove();
        // redraw everything
        renderPlot();

    });

        actionCell.appendChild(deleteBtn);

        row.appendChild(typeCell);
        row.appendChild(paramsCell);
        row.appendChild(labelCell);
        row.appendChild(actionCell);

        tableBody.appendChild(row);

        //Reset form after submit
        form.reset();
    }
});


function renderPlot(){

    const canvas = document.getElementById("stereonetCanvas");
    const ctx = canvas.getContext("2d");

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // redraw grid
    drawStereonet2d(canvas);

    // redraw all data
    dataset.forEach(p => {
        if (p.type === "plane") {
            plotPlane2D(canvas, p.strike, p.dip, p.color);
        } else {
            plotPole2D(canvas, p.strike, p.dip, p.color);
        }
    });

}

//Import data from file
const importBtn = document.querySelector("#importbtn");
const fileInput = document.querySelector("#fileInput");

importBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", function(){
    const file = this.files[0];
    
    if(!file) return;
    const reader = new FileReader();

    reader.onload = function(e){

        const content = e.target.result;

        parseImportedData(content);

    };

    reader.readAsText(file);

});

function parseImportedData(data){

    const lines = data.trim().split("\n");

    const header = lines.shift().toLowerCase();

    const isPlane = header.includes("strike") && header.includes("dip");
    const isLine = header.includes("trend") && header.includes("plunge");

    lines.forEach(line => {

        const [a, b, label] = line.split(",");

        if(isPlane){
            addRowToTable("Plane", a, b, label);
        }

        if(isLine){
            addRowToTable("Line", a, b, label);
        }

    });

    renderPlot();

}

function addRowToTable(type, a, b, label) {

    const tableBody = document.querySelector("#plotTable tbody");

    const row = document.createElement("tr");
    const id = Date.now() + Math.random();
    row.dataset.id = id;

    const typeCell = document.createElement("td");
    const paramsCell = document.createElement("td");
    const labelCell = document.createElement("td");
    const actionCell = document.createElement("td");

    typeCell.textContent = type;

    if (type === "Plane") {
        paramsCell.textContent = `${a}, ${b}`; // strike,dip
    } else {
        paramsCell.textContent = `${a}, ${b}`; // trend,plunge
    }

    labelCell.textContent = label || "N/A";

    dataset.push({
        id,
        type: type.toLowerCase(),
        strike: parseFloat(a),
        dip: parseFloat(b),
        color: "red"
    });

    const deleteBtn = document.createElement("img");
    deleteBtn.src = "Assets/icons/dustbin.png";
    deleteBtn.classList.add("dustbin");

    deleteBtn.addEventListener("click", () => {
        const id = Number(row.dataset.id);
        dataset = dataset.filter(p => p.id !== id);
        row.remove();
        renderPlot();
    });

    actionCell.appendChild(deleteBtn);

    row.appendChild(typeCell);
    row.appendChild(paramsCell);
    row.appendChild(labelCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);

}

function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.width; // keep square
}

// Draw base stereonet when the page loads
    window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("stereonetCanvas");
        if (canvas) {
        resizeCanvas(canvas);
        drawStereonet2d(canvas);
        renderPlot();
    }
    });
    window.addEventListener("resize", () => {
    const canvas = document.getElementById("stereonetCanvas");

    if (!canvas) return;

    resizeCanvas(canvas);
    renderPlot();   // redraw everything
});

//Export PNG
const exportPNGBtn = document.querySelector("#exportPNG");

exportPNGBtn.addEventListener("click", function(){
    const canvas = document.getElementById("stereonetCanvas");
    const link = document.createElement("a");
    link.download = "stereonet_plot.png";
    link.href = canvas.toDataURL();
    link.click();
});
const exportPdfBtn = document.querySelector("#exportPDF");

exportPdfBtn.addEventListener("click", function(){

    if (!window.jspdf) {
        alert("jsPDF library not loaded");
        return;
    }

    const { jsPDF } = window.jspdf;

    const canvas = document.getElementById("stereonetCanvas");

    // Create temporary canvas (DO NOT modify original canvas)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    const tempCtx = tempCanvas.getContext("2d");

    // Draw original canvas onto temp canvas
    tempCtx.drawImage(canvas, 0, 0);

    // Invert colors on temp canvas only
    invertforpdf(tempCanvas);

    const imgData = tempCanvas.toDataURL("image/png");

    const pdf = new jsPDF();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("stereonet_plot.pdf");
});
const exportJpgBtn = document.querySelector("#exportJPG");
exportJpgBtn.addEventListener("click", function(){
    const canvas = document.getElementById("stereonetCanvas");
    const link = document.createElement("a");
    link.download = "stereonet_plot.jpg";
    link.href = canvas.toDataURL("image/jpeg");
    link.click();
});

function invertforpdf(canvas) {

    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // Invert Red
        data[i + 1] = 255 - data[i + 1]; // Invert Green
        data[i + 2] = 255 - data[i + 2]; // Invert Blue
        // Alpha channel (data[i + 3]) remains unchanged
    }

    ctx.putImageData(imageData, 0, 0);
}
import { plotPole2D } from "./plot.js";
import { drawStereonet2d } from "./plot.js";
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

    const canvas = document.getElementById("stereonetCanvas");

    if (canvas) {
        const strikeNum = parseFloat(strike);
        const dipNum = parseFloat(dip);

        if (!isNaN(strikeNum) && !isNaN(dipNum)) {
            plotPole2D(canvas, strikeNum, dipNum, color);
        }
    }

    // Insert row into Saved Plots table
    const tableBody = document.querySelector("#plotTable tbody");

    const row = document.createElement("tr");

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
        row.remove();
    });

    actionCell.appendChild(deleteBtn);

    row.appendChild(typeCell);
    row.appendChild(paramsCell);
    row.appendChild(labelCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);

    //Reset form after submit
    form.reset();
});

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

}

function addRowToTable(type, a, b, label) {

    const tableBody = document.querySelector("#plotTable tbody");

    const row = document.createElement("tr");

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

    const deleteBtn = document.createElement("img");
    deleteBtn.src = "Assets/icons/dustbin.png";
    deleteBtn.classList.add("dustbin");

    deleteBtn.addEventListener("click", () => row.remove());

    actionCell.appendChild(deleteBtn);

    row.appendChild(typeCell);
    row.appendChild(paramsCell);
    row.appendChild(labelCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);

}


// Draw base stereonet when the page loads
    window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("stereonetCanvas");
    if (canvas) {
        drawStereonet2d(canvas);
    }
});

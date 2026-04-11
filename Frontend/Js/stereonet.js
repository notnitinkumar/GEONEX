import {
  plotPlane2D,
  plotLine2D,
  drawStereonet2d,
} from "./plot.js";
let dataset = [];
const planeBtn = document.querySelector("#Plane-plot");
const lineBtn = document.querySelector("#Line-plot");
planeBtn.addEventListener("click", function () {
  planeBtn.classList.add("activebtn-datatype");
  planeBtn.classList.remove("deactivebtn-datatype");
  lineBtn.classList.add("deactivebtn-datatype");
  lineBtn.classList.remove("activebtn-datatype");

  document.getElementById("nonangular").innerHTML = "Strike (0 – 360°)";
  document.getElementById("angular").innerHTML = "Dip (0–90°)";
  document.getElementById("dipDirection").disabled = false;
  document.getElementById("dipDirection").style.cursor = "pointer";
});

lineBtn.addEventListener("click", function () {
  lineBtn.classList.add("activebtn-datatype");
  lineBtn.classList.remove("deactivebtn-datatype");
  planeBtn.classList.add("deactivebtn-datatype");
  planeBtn.classList.remove("activebtn-datatype");

  document.getElementById("nonangular").innerHTML = "Trend (0 – 360°)";
  document.getElementById("angular").innerHTML = "Plunge (0–90°)";
  document.getElementById("dipDirection").disabled = true;
  document.getElementById("dipDirection").style.cursor = "not-allowed";
});

// ------------------- Menu Bar ----------------------

const items = document.querySelectorAll(".menu-item");

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".dropdown").forEach((d) => {
    d.style.display = "none";
  });
});

items.forEach((item) => {
  item.addEventListener("click", function (e) {
    // Close others
    document.querySelectorAll(".dropdown").forEach((d) => {
      if (d !== this.querySelector(".dropdown")) {
        d.style.display = "none";
      }
    });

    items.forEach((i) => i.classList.remove("activebtn-menu"));
    this.classList.add("activebtn-menu");

    const dropdown = this.querySelector(".dropdown");
    dropdown.style.display =
      dropdown.style.display === "block" ? "none" : "block";

    e.stopPropagation();
  });
});
// Close menu when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown").forEach((d) => {
    d.style.display = "none";
  });
  items.forEach((i) => i.classList.remove("activebtn-menu"));
});

// ------------------- Data management ----------------------
function AddToDataset({ type, strike, dip, dipDirection = "N", label = "N/A", color = "yellow" }) {
  const id = Date.now() + Math.random();

  const dataPoint = {
    id,
    type,
    strike,
    dip,
    dipDirection,
    label,
    color,
  };

  dataset.push(dataPoint);
  return dataPoint;
}

function removeFromDataset(id) {
  dataset = dataset.filter((p) => p.id !== id);
}


// ---------------------- Table Data Entry -------------------------
function AddToTable({ id, type, strike, dip, dipDirection = "N", label = "N/A" }) {
  const tableBody = document.querySelector("#plotTable tbody");

  const row = document.createElement("tr");
  row.dataset.id = id;

  const typeCell = document.createElement("td");
  const paramsCell = document.createElement("td");
  const labelCell = document.createElement("td");
  const actionCell = document.createElement("td");

  typeCell.textContent = type === "plane" ? "Plane" : "Line";

  if (type === "plane") {
    paramsCell.textContent = `${strike.toFixed(0)}, ${dip.toFixed(0)} (${dipDirection[0]})`;
  } else {
    paramsCell.textContent = `${strike.toFixed(0)}, ${dip.toFixed(0)}`;
  }

  labelCell.textContent = label;

  const deleteBtn = document.createElement("img");
  deleteBtn.src = "Assets/icons/dustbin.png";
  deleteBtn.classList.add("dustbin");

  deleteBtn.addEventListener("click", () => {
    const id = Number(row.dataset.id);
    removeFromDataset(id);
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

document.querySelectorAll(".dropdown li").forEach((opt) => {
  opt.addEventListener("click", (e) => {
    e.stopPropagation();

    const canvas = document.getElementById("stereonetCanvas");
    const text = opt.innerText.trim();

    if (text === "Pole to Plane") {
      dataset.forEach((p) => {
        if (p.type === "line") {
          const trend = p.strike;
          const plunge = p.dip;

          if (isNaN(trend) || isNaN(plunge)) return;

          const strike = (trend - 90 + 360) % 360;
          const dip = 90 - plunge;
          const dipDirection = trend;

          const dataPoint = AddToDataset({
            type: "plane",
            strike,
            dip,
            dipDirection,
            label: "Derived",
            color: p.color,
          });

          AddToTable(dataPoint);
        }
      });

      renderPlot();
    } else if (text === "Pole from Planes") {
      dataset.forEach((p) => {
        if (p.type === "plane" && p.label !== "Derived") {
          const strike = p.strike;
          const dip = p.dip;
          const dir = p.dipDirection;

          if (isNaN(strike) || isNaN(dip)) return;

          let trend;
          if (dir === "South" || dir === "West") {
            trend = (strike +270) % 360;
          } else {
            trend = (strike + 90) % 360;
          }

          const plunge = 90 - dip;

          const dataPoint = AddToDataset({
            type: "line",
            strike: trend,
            dip: plunge,
            label: "Derived",
            color: p.color,
          });

          AddToTable(dataPoint);
        }
      });

      renderPlot();
    }
    document
      .querySelectorAll(".dropdown")
      .forEach((d) => (d.style.display = "none"));
    items.forEach((i) => i.classList.remove("activebtn-menu"));
  });
});



//----------------------Form data---------------------------
const form = document.querySelector("#dataForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(form);

  const strike = formData.get("strike");
  const dip = formData.get("dip");
  const dipDirection = formData.get("dipDirection");
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
      dipDirection: dipDirection,
      label,
      color,
    };

    dataset.push(dataPoint);

    if (canvas) {
      if (isPlane) {
        // Plane
        plotPlane2D(canvas, a, b, dipDirection, color);
      } else {
        // Line
        plotLine2D(canvas, a, b, color);
      }
    }

    // Insert row into Saved Plots table
    const tableBody = document.querySelector("#plotTable tbody");

    const row = document.createElement("tr");

    row.dataset.id = id; // store id in row
    const typeCell = document.createElement("td");
    const labelCell = document.createElement("td");
    const paramsCell = document.createElement("td");
    const actionCell = document.createElement("td");

    // Determine plot type
    const plotType = isPlane ? "Plane" : "Line";
    labelCell.textContent = label || "N/A";
    typeCell.textContent = plotType;
    paramsCell.textContent = `${strike}, ${dip} (${dipDirection[0]})`;

    const deleteBtn = document.createElement("img");
    deleteBtn.src = "Assets/icons/dustbin.png";
    deleteBtn.alt = "Delete";
    deleteBtn.classList.add("dustbin");
    deleteBtn.addEventListener("click", function () {
      const row = this.closest("tr");
      const id = Number(row.dataset.id);
      // remove from dataset
      removeFromDataset(id);
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

function renderPlot() {
  const canvas = document.getElementById("stereonetCanvas");
  const ctx = canvas.getContext("2d");

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // redraw grid
  drawStereonet2d(canvas);

  // redraw all data
  dataset.forEach((p) => {
    if (p.type === "plane") {
      plotPlane2D(canvas, p.strike, p.dip, p.dipDirection, p.color);
    } else {
      plotLine2D(canvas, p.strike, p.dip, p.color);
    }
  });
}

// -------------------Import data from file--------------------
const importBtn = document.querySelector("#importbtn");
const fileInput = document.querySelector("#fileInput");

importBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;

    parseImportedData(content);
  };

  reader.readAsText(file);
});

function parseImportedData(data) {
  const lines = data.trim().split("\n");

  const header = lines.shift().toLowerCase();

  const isPlane = header.includes("strike") && header.includes("dip");
  const isLine = header.includes("trend") && header.includes("plunge");

  lines.forEach((line) => {
    const [a, b, label, color] = line.split(",");

    if (isPlane) {
      const dataPoint = AddToDataset({
        type: "plane",
        strike: parseFloat(a),
        dip: parseFloat(b),
        dipDirection: "N",
        label,
        color: color || "red",
      });

      AddToTable(dataPoint);
    }

    if (isLine) {
      const dataPoint = AddToDataset({
        type: "line",
        strike: parseFloat(a),
        dip: parseFloat(b),
        label,
        color: color || "red",
      });

      AddToTable(dataPoint);
    }
  });

  renderPlot();
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
  renderPlot(); // redraw everything
});


// ------------------- Reset Button --------------------
const resetBtn = document.querySelector("#resetBtn");

resetBtn.addEventListener("click", function () {
  dataset = [];
  const tableBody = document.querySelector("#plotTable tbody");
  tableBody.innerHTML = "";
  renderPlot();
});


//---------------------Export setting-----------------------
const exportPNGBtn = document.querySelector("#exportPNG");

exportPNGBtn.addEventListener("click", function () {
  const canvas = document.getElementById("stereonetCanvas");
  const link = document.createElement("a");
  link.download = "stereonet_plot.png";
  link.href = canvas.toDataURL();
  link.click();
});
const exportPdfBtn = document.querySelector("#exportPDF");

exportPdfBtn.addEventListener("click", function () {
  if (!window.jspdf) {
    alert("jsPDF library not loaded");
    return;
  }

  const { jsPDF } = window.jspdf;

  const canvas = document.getElementById("stereonetCanvas");

  // Create temporary canvas
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.drawImage(canvas, 0, 0);

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
exportJpgBtn.addEventListener("click", function () {
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
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  ctx.putImageData(imageData, 0, 0);
}

// -------------------Mouse hover for trend/plunge and strike/dip--------------------
let isDragging = false;

function linedata(dx, dy, R) {
  const r = Math.sqrt(dx * dx + dy * dy);

  if (r > R) {
    return null;
  }
  let trend = Math.atan2(dx, dy) * (180 / Math.PI);
  if (trend < 0) trend += 360;

  const plunge = 90 - (r / R) * 90;
  return { trend, plunge };
}

function planedata(dx, dy, R) {
  const r = Math.sqrt(dx * dx + dy * dy);

  if (r > R) {
    return null;
  }

  let trend = Math.atan2(dx, dy) * (180 / Math.PI);
  if (trend < 0) trend += 360;

  const plunge = (r / R) * 90;
  const strike = (trend + 90) % 360;
  const dip = plunge;

  return { strike, dip };
}

const canvas = document.getElementById("stereonetCanvas");
canvas.addEventListener("mousemove", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const R = (Math.min(canvas.width, canvas.height) / 2) * 0.9;

  const dx = x - centerX;
  const dy = centerY - y;

  if (isDragging) {
    const res = planedata(dx, dy, R);

    if (!res) {
      document.querySelector(".point span:nth-child(1)").style.visibility =
        "hidden";
      document.querySelector(".point span:nth-child(2)").style.visibility =
        "hidden";
      return;
    }
    document.querySelector(".point span:nth-child(1)").style.visibility =
      "visible";
    document.querySelector(".point span:nth-child(2)").style.visibility =
      "visible";
    document.querySelector(".point span:nth-child(1) p").textContent =
      `Strike : ${res.strike.toFixed(0)}°`;
    document.querySelector(".point span:nth-child(2) p").textContent =
      `Dip : ${res.dip.toFixed(0)}°`;

    renderPlot();
    plotPlane2D(canvas, res.strike, res.dip, undefined, "blue");
  } else {
    const res = linedata(dx, dy, R);

    if (!res) {
      document.querySelector(".point span:nth-child(1)").style.visibility =
        "hidden";
      document.querySelector(".point span:nth-child(2)").style.visibility =
        "hidden";
      return;
    }
    document.querySelector(".point span:nth-child(1)").style.visibility =
      "visible";
    document.querySelector(".point span:nth-child(2)").style.visibility =
      "visible";
    document.querySelector(".point span:nth-child(1) p").textContent =
      `Trend : ${res.trend.toFixed(0)}°`;
    document.querySelector(".point span:nth-child(2) p").textContent =
      `Plunge : ${res.plunge.toFixed(0)}°`;
  }
});

canvas.addEventListener("mousedown", () => {
  isDragging = true;
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  renderPlot();
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  renderPlot();
});

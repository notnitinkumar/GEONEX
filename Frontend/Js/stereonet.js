import {
  plotPlane2D,
  plotLine2D,
  drawStereonet2d,
  drawTriangleMarker,
  drawRoseDiagram,
  hoverPlane2D,
  drawEqualAreaStereonet,
  drawContourPlots,
} from "./plot.js";
import {
  calculateMeanVector,
  angleBetweenLineAndPlane,
  angleBetweenPlanes,
  angleBetweenLines,
  fisherDistribution,
  binghamDistribution,
} from "./stereonetcalc.js";
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

const screenToggle = document.querySelector(".screentoggle");
const fullscreenBtn = document.getElementById("fullscreenBtn");
screenToggle.addEventListener("click", () => {
  const elem = document.documentElement;

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => {
      alert(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  const header = document.querySelector("header");

  if (document.fullscreenElement) {
    if (header) header.style.display = "none";
    fullscreenBtn.src = "Assets/icons/minimize-screen.svg";
  } else {
    if (header) header.style.display = "";
    fullscreenBtn.src = "Assets/icons/maximize-screen.png";
  }
});

// ------------------- Data management ----------------------
function AddToDataset({
  type,
  strike,
  dip,
  dipDirection = "N",
  label = "N/A",
  color = "yellow",
}) {
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
function AddToTable({
  id,
  type,
  strike,
  dip,
  dipDirection = "N",
  label = "N/A",
}) {
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
    if (opt.id === "Pole to Plane") {
      dataset.forEach((p) => {
        if (p.type === "line") {
          const trend = p.strike;
          const plunge = p.dip;

          if (isNaN(trend) || isNaN(plunge)) return;

          const strike = (trend + 90) % 360;
          const dip = 90 - plunge;
          const dipDirection = trend;

          const dataPoint = AddToDataset({
            type: "plane",
            strike: strike,
            dip: dip,
            dipDirection: "N",
            label: "Derived",
            color: p.color,
          });

          AddToTable(dataPoint);
        }
      });

      renderPlot();
    } else if (opt.id === "Plane to Pole") {
      dataset.forEach((p) => {
        if (p.type === "plane" && p.label !== "Derived") {
          const strike = p.strike;
          const dip = p.dip;
          const dir = p.dipDirection;

          if (isNaN(strike) || isNaN(dip)) return;

          let trend;
          if (dir === "South" || dir === "West") {
            trend = (strike + 270) % 360;
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
    } else if (opt.id === "Angle Between") {
      document.querySelector(".promptbox").style.display = "block";

      const closeBtn = document.getElementById("close");
      const getAngleBtn = document.getElementById("getAngle");

      // close handler (one-time)
      closeBtn.addEventListener(
        "click",
        function () {
          document.querySelector(".promptbox").style.display = "none";
        },
        { once: true },
      );

      const toggle1 = document.getElementById("PlotModeToggle1");
      const toggle2 = document.getElementById("PlotModeToggle2");

      const dipDir1 = document.getElementById("dipDirection1");
      const dipDir2 = document.getElementById("dipDirection2");

      function updateDipDirectionState() {
        if (toggle1.checked) {
          dipDir1.disabled = true;
          dipDir1.style.cursor = "not-allowed";
        } else {
          dipDir1.disabled = false;
          dipDir1.style.cursor = "pointer";
        }

        if (toggle2.checked) {
          dipDir2.disabled = true;
          dipDir2.style.cursor = "not-allowed";
        } else {
          dipDir2.disabled = false;
          dipDir2.style.cursor = "pointer";
        }
      }

      // attach listeners
      toggle1.addEventListener("change", updateDipDirectionState);
      toggle2.addEventListener("change", updateDipDirectionState);

      // initial state
      updateDipDirectionState();
      // compute angle
      const handler = function () {
        let trend1, plunge1, strike1, dip1, dipdirection1;
        let trend2, plunge2, strike2, dip2, dipdirection2;

        if (toggle1.checked) {
          trend1 = parseFloat(document.getElementById("strike1").value);
          plunge1 = parseFloat(document.getElementById("dip1").value);
        } else {
          strike1 = parseFloat(document.getElementById("strike1").value);
          dip1 = parseFloat(document.getElementById("dip1").value);
          dipdirection1 = document.getElementById("dipDirection1").value;
        }

        if (toggle2.checked) {
          trend2 = parseFloat(document.getElementById("strike2").value);
          plunge2 = parseFloat(document.getElementById("dip2").value);
        } else {
          strike2 = parseFloat(document.getElementById("strike2").value);
          dip2 = parseFloat(document.getElementById("dip2").value);
          dipdirection2 = document.getElementById("dipDirection2").value;
        }
        let angle;

        if (
          !isNaN(trend1) &&
          !isNaN(plunge1) &&
          !isNaN(trend2) &&
          !isNaN(plunge2)
        ) {
          const dp2 = AddToDataset({
            type: "line",
            strike: trend2,
            dip: plunge2,
            label: "",
            color: "magenta",
          });
          const dp1 = AddToDataset({
            type: "line",
            strike: trend1,
            dip: plunge1,
            label: "",
            color: "cyan",
          });
          AddToTable(dp2);
          AddToTable(dp1);
          angle = angleBetweenLines(trend1, plunge1, trend2, plunge2);
        } else if (
          !isNaN(strike1) &&
          !isNaN(dip1) &&
          !isNaN(strike2) &&
          !isNaN(dip2)
        ) {
          angle = angleBetweenPlanes(
            strike1,
            dip1,
            dipdirection1,
            strike2,
            dip2,
            dipdirection2,
          );
          const dp1 = AddToDataset({
            type: "plane",
            strike: strike1,
            dip: dip1,
            dipDirection: dipdirection1,
            label: "",
            color: "cyan",
          });
          const dp2 = AddToDataset({
            type: "plane",
            strike: strike2,
            dip: dip2,
            dipDirection: dipdirection2,
            label: "",
            color: "magenta",
          });
          AddToTable(dp1);
          AddToTable(dp2);
        } else if (
          !isNaN(strike1) &&
          !isNaN(dip1) &&
          !isNaN(trend2) &&
          !isNaN(plunge2)
        ) {
          const dp1 = AddToDataset({
            type: "plane",
            strike: strike1,
            dip: dip1,
            dipDirection: dipdirection1,
            label: "",
            color: "cyan",
          });
          const dp2 = AddToDataset({
            type: "line",
            strike: trend2,
            dip: plunge2,
            label: "",
            color: "magenta",
          });
          AddToTable(dp1);
          AddToTable(dp2);
          angle = angleBetweenLineAndPlane(
            trend2,
            plunge2,
            strike1,
            dip1,
            dipdirection1,
          );
        } else if (
          !isNaN(trend1) &&
          !isNaN(plunge1) &&
          !isNaN(strike2) &&
          !isNaN(dip2)
        ) {
          const dp1 = AddToDataset({
            type: "line",
            strike: trend1,
            dip: plunge1,
            label: "",
            color: "cyan",
          });
          const dp2 = AddToDataset({
            type: "plane",
            strike: strike2,
            dip: dip2,
            dipDirection: dipdirection2,
            label: "",
            color: "magenta",
          });
          AddToTable(dp1);
          AddToTable(dp2);
          angle = angleBetweenLineAndPlane(
            trend1,
            plunge1,
            strike2,
            dip2,
            dipdirection2,
          );
        }
        renderPlot();

        const out = document.getElementById("angleResult");
        if (angle !== undefined) {
          out.textContent = `Angle: ${angle.toFixed(2)}°`;
        } else {
          out.textContent = "Invalid input";
        }
      };

      // ensure we don't stack listeners
      getAngleBtn.replaceWith(getAngleBtn.cloneNode(true));
      const newGetAngleBtn = document.getElementById("getAngle");
      newGetAngleBtn.addEventListener("click", handler);
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

    const dataPoint = AddToDataset({
      id,
      type: isPlane ? "plane" : "line",
      strike: a,
      dip: b,
      dipDirection: dipDirection,
      label,
      color,
    });

    if (canvas) {
      if (isPlane) {
        // Plane
        plotPlane2D(canvas, a, b, dipDirection, color);
      } else {
        // Line
        plotLine2D(canvas, a, b, color);
      }
    }

    AddToTable(dataPoint);
    renderPlot();

    //Reset form after submit
    form.reset();
  }
});

const PlotModeSelect = document.getElementById("Plot Mode");
PlotModeSelect.addEventListener("change", function () {
  const mode = this.value;

  renderPlot();
});
function renderPlot() {
  const canvas = document.getElementById("stereonetCanvas");
  const ctx = canvas.getContext("2d");

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // redraw grid
  if (PlotModeSelect.value === "Polar Plot") {
    drawStereonet2d(canvas);
  } else if (PlotModeSelect.value === "Equal Area") {
    drawEqualAreaStereonet(canvas);
  }
  // redraw all data
  dataset.forEach((p) => {
    if (p.type === "plane") {
      plotPlane2D(canvas, p.strike, p.dip, p.dipDirection, p.color);
    } else {
      if (p.label === "Mean Vector") {
        drawTriangleMarker(canvas, p.strike, p.dip, p.color);
      } else plotLine2D(canvas, p.strike, p.dip, p.color);
    }
  });

  // redraw overlays if active
  if (isrosemode) {
    drawRoseDiagram(canvas, dataset);
  }

  if (iscountourmode) {
    drawContourPlots(canvas, dataset);
  }
}

// ------------------- Import data from file --------------------
const importBtn = document.querySelectorAll(".import-btn");
const fileInput = document.querySelector("#fileInput");
let wasFullscreen = false;

importBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    wasFullscreen = !!document.fullscreenElement;
    fileInput.click();
  });
});

fileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;

    parseImportedData(content);
    if (wasFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  reader.readAsText(file);
});

function parseImportedData(data) {
  const lines = data.trim().split("\n");

  // remove header
  lines.shift();

  lines.forEach((line) => {
    if (!line.trim()) return;

    const [type, a, b, dipDirection, label, color] = line
      .split(",")
      .map((v) => v.trim());

    const aNum = parseFloat(a);
    const bNum = parseFloat(b);

    if (isNaN(aNum) || isNaN(bNum)) {
      console.warn("Invalid row skipped:", line);
      return;
    }

    if (type === "plane") {
      const dataPoint = AddToDataset({
        type: "plane",
        strike: aNum,
        dip: bNum,
        dipDirection: dipDirection || "N",
        label: label || "N/A",
        color: color || "red",
      });

      AddToTable(dataPoint);
    } else if (type === "line") {
      const dataPoint = AddToDataset({
        type: "line",
        strike: aNum,
        dip: bNum,
        label: label || "N/A",
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

document.getElementById("exportCSV").addEventListener("click", exportDataToCSV);
function exportDataToCSV() {
  if (dataset.length === 0) {
    alert("No data to export");
    return;
  }
  const headers = [
    "Type",
    "Strike/Trend",
    "Dip/Plunge",
    "Dip Direction",
    "Label",
    "Color",
  ];

  const rows = dataset.map((p) => [
    p.type,
    p.strike,
    p.dip,
    p.dipDirection || "",
    p.label || "",
    p.color || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "geonex_data.csv";
  a.click();

  URL.revokeObjectURL(url);
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
    hoverPlane2D(canvas, res.strike, res.dip, undefined, "cyan");
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

// ------------------- Mean Vector Calculation --------------------

const MeanVector = document.getElementById("MeanVector");
MeanVector.addEventListener("click", () => {
  let trends = [];
  let plunges = [];
  dataset.forEach((p) => {
    if (p.type === "plane") {
      const strike = p.strike;
      const dip = p.dip;
      const dir = p.dipDirection;

      let trend;
      if (dir === "South" || dir === "West") {
        trend = (strike + 270) % 360;
      } else {
        trend = (strike + 90) % 360;
      }
      const plunge = 90 - dip;

      trends.push(trend);
      plunges.push(plunge);
    }

    if (p.type === "line") {
      trends.push(p.strike);
      plunges.push(p.dip);
    }
  });

  if (trends.length === 0) {
    alert("No data available");
    return;
  }

  const meanVector = calculateMeanVector(trends, plunges);

  const dataPoint = AddToDataset({
    type: "line",
    strike: meanVector.trend,
    dip: meanVector.plunge,
    label: "Mean Vector",
    color: "white",
  });

  AddToTable(dataPoint);
  renderPlot();
});

// ------------------- Rose Diagram and Contour Plots --------------------

let isrosemode = false;
const RoseDiagrams = document.getElementById("RoseDiagrams");
RoseDiagrams.addEventListener("click", () => {
  if (!isrosemode) {
    drawRoseDiagram(canvas, dataset); 
    isrosemode = true;
    RoseDiagrams.querySelector("img").style.display = "block"; 
  }
  else {
    isrosemode = false;
    RoseDiagrams.querySelector("img").style.display = "none"; 
    renderPlot();
  }
});
let iscountourmode = false;
const ContourPlots = document.getElementById("ContourPlots");
ContourPlots.addEventListener("click", () => {
  if (!iscountourmode) {
    drawContourPlots(canvas, dataset);
    iscountourmode = true;
    ContourPlots.querySelector("img").style.display = "block"; 
  } else {
    iscountourmode = false;
    ContourPlots.querySelector("img").style.display = "none";
    renderPlot();
  }
});

// ----------------- Fisher Vector Distribution -----------------
document.getElementById("Fisher").addEventListener("click", () => {
  const points = fisherDistribution(dataset);

  document.getElementById("interpretationContent").insertAdjacentHTML("beforeend", `
    <p><strong>--------------------- Fisher Vector Distribution ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} -----------------------</strong></p>
    
    <table border="1" style="border-collapse: collapse; margin: 10px;">
      <thead>
        <tr>
          <th>Total Points (N)</th>
          <th>Mean Trend</th>
          <th>Mean Plunge</th>
          <th>Mean Length</th>
          <th>Alpha 95</th>
          <th>Kappa</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${dataset.length}</td>
          <td>${points.meanTrend.toFixed(2)}</td>
          <td>${points.meanPlunge.toFixed(2)}</td>
          <td>${points.meanLength.toFixed(2)}</td>
          <td>${points.alpha95.toFixed(2)}</td>
          <td>${points.kappa.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `);
});

document.getElementById("Bingham").addEventListener("click", () => {
  const points = binghamDistribution(dataset);
  const rows = [0, 1, 2].map(i => `
    <tr>
      <td>${i + 1}</td>
      <td>${points.eigenvalues[i].toFixed(4)}</td>
      <td>${points.trend[i].toFixed(2)}</td>
      <td>${points.plunge[i].toFixed(2)}</td>
      <td>${0.0}</td>
      <td>${0.0}</td>
    </tr>
  `).join("");
  document.getElementById("interpretationContent").insertAdjacentHTML("beforeend", `
    <p><strong>--------------------- Bingham Axial Distribution ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} -----------------------</strong></p>
    
    <table border="1" style="border-collapse: collapse; margin: 10px;">
      <thead>
        <tr>
          <th>Axis</th>
          <th>Eigenvalues</th>
          <th>Trend</th>
          <th>Plunge</th>
          <th>Alpha 95 min</th>
          <th>Alpha 95 max</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <p> Best fit Great Circle (strike, dip RHR) (${points.bestFitPlane.strike.toFixed(0)}, ${points.bestFitPlane.dip.toFixed(0)})</p>
  `);
});

document.getElementById("Von Mises").addEventListener("click", () => {
  document.getElementById("interpretationContent").insertAdjacentHTML("beforeend", `
    <p><strong> ----------------------- Von Mises Distribution ${new Date().toLocaleDateString() + " " } at ${new Date().toLocaleTimeString()} -------------------------</strong></p>
    <p>Von Mises distribution calculation not implemented yet.</p>
    <p></p>
  `);
});
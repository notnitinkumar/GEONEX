const stereonetBtn = document.querySelector("#stereonet-tool");
if (stereonetBtn) {
    stereonetBtn.addEventListener("click", function () {
        console.log("Stereonet tool opened");
        window.location.href = "stereonet.html";
    });
}

const logo = document.querySelector("#geonex-logo");
if (logo) {
    logo.addEventListener("click", function () {
        console.log("Geonex logo clicked");
        window.location.href = "index.html";
    });
}


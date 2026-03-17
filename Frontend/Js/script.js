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

// Function to update latitude and longitude
function updateLatLong() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude.toFixed(4);
            const longitude = position.coords.longitude.toFixed(4);
            document.getElementById("latitude").textContent = `Lat: ${latitude}`;
            document.getElementById("longitude").textContent = `Long: ${longitude}`;
        }, function (error) {
            console.error("Error getting location: ", error);
            document.getElementById("latitude").textContent = "Lat: --";
            document.getElementById("longitude").textContent = "Long: --";
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
        document.getElementById("latitude").textContent = "Lat: --";
        document.getElementById("longitude").textContent = "Long: --";
    }
}

// Update latitude and longitude on page load
window.addEventListener("DOMContentLoaded", () => {
    const latlongContainer = document.querySelector(".latlong");
    if (latlongContainer) {
        updateLatLong();
    }
});

document.querySelectorAll(".disabled").forEach(box => {
  box.addEventListener("click", () => {
   alert("Feature under development. Try Tools → Stereonet!");
  });
});

document.querySelectorAll(".disabled-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Feature under development. Try Tools → Stereonet!");
  });
});


const stereonetBtn = document.querySelector("#stereonet-tool");
if (stereonetBtn) {
    stereonetBtn.addEventListener("click", function () {
        window.location.href = "stereonet.html";
    });
}
const notesbtn = document.querySelector("#notesfeature");
if (notesbtn) {
    notesbtn.addEventListener("click", function () {
        window.location.href = "notes.html";
    })
}
const logo = document.querySelector("#geonex-logo");
if (logo) {
    logo.addEventListener("click", function () {
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
   alert("Feature under development.");
  });
});

document.querySelectorAll(".disabled-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Feature under development.");
  });
});


// Hamburger smooth toggle (mobile menu)
const hamburger = document.getElementById("hamburger");
const navbar = document.getElementById("navbar");

if (hamburger && navbar) {

    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();

        const isOpen = navbar.classList.toggle("active");

        // accessibility
        hamburger.setAttribute("aria-expanded", isOpen);

        // optional body class for overlay/scroll lock
        document.body.classList.toggle("menu-open", isOpen);
    });

    // prevent closing when clicking inside navbar
    navbar.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
        if (!navbar.contains(e.target) && !hamburger.contains(e.target)) {
            navbar.classList.remove("active");
            hamburger.setAttribute("aria-expanded", false);
            document.body.classList.remove("menu-open");
        }
    });

    // close when clicking a link
    navbar.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navbar.classList.remove("active");
            hamburger.setAttribute("aria-expanded", false);
            document.body.classList.remove("menu-open");
        });
    });
}

// Smooth scroll (optional enhancement for anchor links)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

//Feedback Form
const feedbackForm = document.getElementById("Feedback-Form"); 
    feedbackForm.addEventListener("click", function () {
        console.log("Feedback form opened");
        window.open("https://forms.gle/hC2yyxk1n5M1MZK79", "_blank", "noopener noreferrer");
    });
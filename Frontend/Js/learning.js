document.querySelectorAll(".content-container li").forEach((item) => {
    item.addEventListener("click", () => {
        const h3 = item.querySelector("h3");
        if (!h3) return; 
        localStorage.setItem("filename", h3.textContent);
        window.location.href = "md-viewer.html";
    });
});
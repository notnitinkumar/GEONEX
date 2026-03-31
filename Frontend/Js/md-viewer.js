document.addEventListener("DOMContentLoaded", function () {
    const filename = localStorage.getItem("filename"); 
    if (!filename) {
        document.querySelector(".content").innerHTML = "<p>No file specified.</p>";
        return;
    }

    document.querySelector(".tagline h1").innerHTML = filename;

    // fetch dynamically
    fetch(`../Content/${filename}.md`)
        .then(res => {
            if (!res.ok) throw new Error("File not found");
            return res.text();
        })
        .then(innercontent => {
            document.querySelector(".content").innerHTML = marked.parse(innercontent);
        })
        .catch(err => {
            document.querySelector(".content").innerHTML = `<p style="color:red;">${err}</p>`;
            console.error(err);
        });
});
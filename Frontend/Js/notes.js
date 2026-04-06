document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tag");
  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("activetab");
          t.classList.add("deactivetab");
        });
        tab.classList.add("activetab");
        tab.classList.remove("deactivetab");
      });
    });
  }
  
  // For New Note clear currentNote and open editor
  const NewNote = document.getElementById("newNoteBtn");
  if (NewNote) {
    NewNote.addEventListener("click", function () {
      localStorage.removeItem("currentNote");
      window.location.href = "noteseditor.html";
    });
  }

  // --------------- Load Saved Notes & Filters -----------------
  const notesContainer = document.querySelector(".notes-container");
  let allNotes = JSON.parse(localStorage.getItem("notes")) || [];

  let currentCategory = "all";
  let showFavoritesOnly = false;
  let searchQuery = "";

  function updateCounts() {
    const totalCountEl = document.getElementById("allNotesTab");
    const favCountEl = document.getElementById("favNotesTab");

    const favCount = allNotes.filter((n) => n.isfav).length;

    if (totalCountEl) {
      totalCountEl.querySelector("h4").innerText = `Total : ${allNotes.length}`;
    }

    if (favCountEl) {
      favCountEl.querySelector("h4").innerText = `Favorites : ${favCount}`;
    }
  }

  function renderNotes(notes) {
    if (!notesContainer) return;
    notesContainer.innerHTML = "";
    notes.forEach((note) => {
      const li = createNoteElement(note);
      notesContainer.appendChild(li);
    });
  }

  // ---------------- Initial render -------------------
  renderNotes(allNotes);
  updateCounts();

  function applyFilters() {
    let filtered = allNotes;

    if (showFavoritesOnly) {
      filtered = filtered.filter((note) => note.isfav);
    }

    if (currentCategory !== "all") {
      filtered = filtered.filter((note) => note.category === currentCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          (note.title || "").toLowerCase().includes(q) ||
          (note.content || "").toLowerCase().includes(q) ||
          (note.category || "").toLowerCase().includes(q),
      );
    }

    renderNotes(filtered);
  }

  const favTab = document.getElementById("favNotesTab");
  const allTab = document.getElementById("allNotesTab");

  if (favTab) {
    favTab.addEventListener("click", () => {
      showFavoritesOnly = true;
      applyFilters();
    });
  }

  if (allTab) {
    allTab.addEventListener("click", () => {
      showFavoritesOnly = false;
      applyFilters();
    });
  }

  const categoryTabs = document.querySelectorAll(".category-tab");

  if (categoryTabs.length) {
    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        currentCategory = tab.dataset.category;
        applyFilters();
      });
    });
  }

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value;
      applyFilters();
    });
  }
});

function createNoteElement(note) {
  const li = document.createElement("li");

  const h3 = document.createElement("h3");
  h3.textContent = note.title;
  h3.style.borderLeft = `4px solid ${note.BorderColor || "red"}`;
  h3.style.paddingLeft = "10px";

  const p = document.createElement("p");
  p.textContent = note.content;

  const cat = document.createElement("div");
  cat.classList.add("catlabel");
  cat.textContent = note.category;
  const ruler = document.createElement("hr");
  ruler.classList.add("divider");
  const fav = document.createElement("img");
  fav.src = "Assets/icons/Favorites.svg";
  fav.classList.add("fav-icon");
  // Append elements
  li.appendChild(h3);
  li.appendChild(p);
  li.appendChild(ruler);
  li.appendChild(cat);
  li.appendChild(fav);

  if (!note.isfav) {
    fav.style.display = "none";
  }

  // click to edit
  li.addEventListener("click", () => {
    const data = {
      ...note,
    };

    localStorage.setItem("currentNote", JSON.stringify(data));
    window.location.href = "noteseditor.html";
  });

  return li;
}

//To prevent back button loop
const backBtn = document.querySelector(".backbtn");
if (backBtn) {
  backBtn.addEventListener("click", function () {
      window.location.href = "index.html";
  });
}
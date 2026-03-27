document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.querySelector(".backbtn");
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      history.back();
    });
  }

  let selectedColor = null;

  document.querySelectorAll(".color").forEach((color) => {
    color.addEventListener("click", () => {
      document.querySelectorAll(".color").forEach((c) => {
        c.classList.remove("activecolor");
      });
      color.classList.add("activecolor");

      selectedColor = color.style.background;
    });
  });

  let category = null;
  const cat = document.getElementById("Category");
  if (cat) {
    cat.addEventListener("change", function () {
      category = cat.value;
    });
  }

  const FavBtn = document.getElementById("FavBtn");
  if (FavBtn) {
    FavBtn.addEventListener("click", function () {
      FavBtn.classList.toggle("fav-active");
    });
  }

  // --------------- Parsed Data Here -----------------
  const data = JSON.parse(localStorage.getItem("currentNote"));

  const titleEl = document.getElementById("noteTitle");
  const contentEl = document.getElementById("noteContent");
  const WorkType = document.getElementById("WorkType");
  const WorkDesc = document.getElementById("WorkDesc");

  if (data && titleEl && contentEl && WorkType && WorkDesc) {
    titleEl.value = data.title || "";
    contentEl.value = data.content || "";

    // Set heading based on id
    if (data.id) {
      WorkType.innerText = "Edit Note";
      WorkDesc.innerText = "Update your note details";
    } else {
      WorkType.innerText = "New Note";
      WorkDesc.innerText = "Create your note";
    }

    // Restore category
    if (cat && data.category) {
      cat.value = data.category;
      category = data.category;
    }

    // Restore color selection UI
    if (data.BorderColor) {
      selectedColor = data.BorderColor;
      document.querySelectorAll(".color").forEach((c) => {
        if (c.style.background === data.BorderColor) {
          c.classList.add("activecolor");
        } else {
          c.classList.remove("activecolor");
        }
      });
    }

    // Restore favorite state
    if (data.isfav && FavBtn) {
      FavBtn.classList.add("fav-active");
    }
  }

  // --------------- SAVE BUTTON ----------------
  const SaveBtn = document.getElementById("SaveBtn");
  if (SaveBtn) {
    SaveBtn.addEventListener("click", function () {
      const data = JSON.parse(localStorage.getItem("currentNote"));
      let notes = JSON.parse(localStorage.getItem("notes")) || [];

      if (data && data.id) {
        // EDIT EXISTING NOTE
        const note = notes.find((n) => n.id == data.id);
        if (note) {
          note.title = document.getElementById("noteTitle").value;
          note.content = document.getElementById("noteContent").value;
          note.BorderColor = selectedColor ?? note.BorderColor;
          note.category = category ?? note.category;
          note.isfav = FavBtn
            ? FavBtn.classList.contains("fav-active")
            : note.isfav;
        }
      } else {
        // NEW NOTE
        const noteData = {
          id: Date.now(),
          title: document.getElementById("noteTitle").value,
          content: document.getElementById("noteContent").value,
          BorderColor: selectedColor || null,
          category: category || (cat ? cat.value : null),
          isfav: FavBtn ? FavBtn.classList.contains("fav-active") : false,
        };

        notes.push(noteData);
      }

      localStorage.setItem("notes", JSON.stringify(notes));
      window.location.href = "notes.html";
    });
  }

  // ---------------- DELETE BUTTON -----------------
  const DeleteBtn = document.getElementById("DeleteBtn");
  if (DeleteBtn) {
    DeleteBtn.addEventListener("click", function () {
      const data = JSON.parse(localStorage.getItem("currentNote"));
      let notes = JSON.parse(localStorage.getItem("notes")) || [];

      if (data && data.id) {
        // remove note with matching id
        notes = notes.filter((n) => n.id != data.id);

        localStorage.setItem("notes", JSON.stringify(notes));

        // clear current note
        localStorage.removeItem("currentNote");

        window.location.href = "notes.html";
      } else {
        window.location.href = "notes.html";
      }
    });
  }
});

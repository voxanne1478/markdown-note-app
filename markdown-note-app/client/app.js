const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const titleInput = document.getElementById("noteTitle");
const foldersUI = document.getElementById("folders");

let data = JSON.parse(localStorage.getItem("notes")) || {};
let currentFolder = null;

function save() {
  localStorage.setItem("notes", JSON.stringify(data));
}

function renderFolders() {
  foldersUI.innerHTML = "";
  Object.keys(data).forEach(folder => {
    const li = document.createElement("li");
    li.textContent = folder;
    li.onclick = () => loadFolder(folder);
    foldersUI.appendChild(li);
  });
}

function addFolder() {
  const name = prompt("Folder name");
  if (!name) return;
  data[name] = [];
  save();
  renderFolders();
}

function loadFolder(folder) {
  currentFolder = folder;
  const note = data[folder][0];
  if (note) {
    titleInput.value = note.title;
    editor.value = note.content;
    renderPreview();
  } else {
    titleInput.value = "";
    editor.value = "";
    preview.innerHTML = "";
  }
}

function saveNote() {
  if (!currentFolder) return alert("Select folder first");
  data[currentFolder] = [{
    title: titleInput.value,
    content: editor.value
  }];
  save();
}

editor.addEventListener("input", renderPreview);

async function renderPreview() {
  const res = await fetch("http://localhost:3000/html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: editor.value })
  });
  preview.innerHTML = (await res.json()).html;
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
}

function downloadMD() {
  const blob = new Blob([editor.value], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${titleInput.value || "note"}.md`;
  a.click();
}

async function exportNotebook() {
  let all = "";
  Object.values(data).forEach(folder =>
    folder.forEach(n => all += `# ${n.title}\n${n.content}\n\n`)
  );

  const html = (await fetch("http://localhost:3000/html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: all })
  }).then(r => r.json())).html;

  const pdf = await fetch("http://localhost:3000/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html })
  });

  const blob = await pdf.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "notebook.pdf";
  a.click();
}

renderFolders();

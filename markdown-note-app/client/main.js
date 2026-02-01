const textarea = document.getElementById("markdown");
const preview = document.getElementById("preview");

textarea.addEventListener("input", async () => {
  const res = await fetch("http://localhost:3000/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown: textarea.value })
  });

  const data = await res.json();
  preview.innerHTML = data.html;
});

async function exportPDF() {
  const res = await fetch("http://localhost:3000/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html: preview.innerHTML })
  });

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "note.pdf";
  a.click();
}

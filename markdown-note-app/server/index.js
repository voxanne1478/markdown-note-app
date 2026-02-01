import express from "express";
import MarkdownIt from "markdown-it";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
const md = new MarkdownIt();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Markdown backend running");
});

app.post("/html", (req, res) => {
  const html = md.render(req.body.markdown);
  res.json({ html });
});

app.post("/pdf", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <html>
      <body style="font-family:Arial">${req.body.html}</body>
    </html>
  `);

  const pdf = await page.pdf({ format: "A4" });
  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
});

app.listen(3000, () => console.log("Server on http://localhost:3000"));

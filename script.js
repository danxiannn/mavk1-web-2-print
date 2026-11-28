// script.js
// 1. puts the content of each file into the page
// 2. in print preview, asks Paged.js to make the pages
// 3. adds the buttons at the top right (Web / Spreads / Boxes / Print)

// Are we in print preview? Yes if the address ends with ?print
const printPreview = location.search.includes("print");

start();

async function start() {
  await loadContent();
  await fillGalleries();    // ← 加这一行（必须加在loadContent之后：md先被填进页面，json再填进gallery（才能被找到））+ （必须在PagedPolyfill.preview()之前: 图先放好，paged.js才能把它们算进分页）

  if (printPreview) {
    await PagedPolyfill.preview(); // Paged.js cuts the document into pages
  }

  addButtons();
}


// Fill every element that has data-src="…" with the content of that file
async function loadContent() {
  for (const element of document.querySelectorAll("[data-src]")) {
    const file = element.dataset.src;
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error("file not found");
      const text = await response.text();
      element.innerHTML = toHTML(file, text);
    } catch (error) {
      element.innerHTML = `<p class="error">Could not load ${file}. Check the file name, and that the page is open with a local server (see README.md).</p>`;
    }
  }
}

// Fill every .gallery placeholder with the images of its group
// ⬆️照着 loadContent 的样子写的
async function fillGalleries() {
  for (const gallery of document.querySelectorAll(".gallery")) {    // ① 找到每一张便利贴 document.querySelectorAll(".gallery") = "页面上所有 class 是 gallery 的元素"，每次拿一个，叫它 gallery
    const file = gallery.dataset.json;    // 读 data-json 
    const group = gallery.dataset.group;  // 读 data-group

    const response = await fetch(file);   // 去拿json文件
    const text = await response.text();   // 取出里面的文字   await 的意思是"等文件读完再往下走"，因为读文件需要一点时间
    const items = JSON.parse(text);       // 文字 → 一叠卡片

    const chosen = [];                    // ④ 挑出同一组的卡片  准备一个空篮子
    for (const item of items) {           // 一张一张看
      if (item.group === group) {         // 如果这张的组别 和 便利贴上写的一样    
        chosen.push(item);                // 就放进篮子    === 的意思是"是否相等"。push 的意思是"放进列表的最后面"。
      }
    }

    gallery.innerHTML = jsonToHTML(chosen);     // ⑤ 把挑好的图填进便利贴
  }
}

// Turn the text of a file into HTML, depending on the end of its name
function toHTML(file, text) {
  if (file.endsWith(".txt")) return textToHTML(text);
  if (file.endsWith(".md")) return marked.parse(text);
  if (file.endsWith(".csv")) return csvToHTML(text);
  if (file.endsWith(".json")) return jsonToHTML(JSON.parse(text));
  return text; // .html files are already HTML
}


// .txt → every line becomes a paragraph
function textToHTML(text) {
  let html = "";
  for (const line of text.split("\n")) {
    if (line.trim() !== "") {
      html += `<p>${line}</p>`;
    }
  }
  return html;
}


// .csv → a table. The first line holds the column titles.
function csvToHTML(text) {
  const lines = text.trim().split("\n");
  let html = "<table>";
  lines.forEach((line, index) => {
    const tag = index === 0 ? "th" : "td"; // first line = titles
    html += "<tr>";
    for (const cell of splitCSVLine(line)) {
      html += `<${tag}>${cell}</${tag}>`;
    }
    html += "</tr>";
  });
  return html + "</table>";
}

// Cut one line of a .csv file into cells.
// A comma means "next cell", except between quotes: "Dolor, sit" is one cell.
// Inside quotes, "" means a real quote: "Say ""hello""" → Say "hello"
function splitCSVLine(line) {
  const separator = ","; // some spreadsheet programs use ; instead: change it here
  const cells = [];
  let cell = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && insideQuotes && line[i + 1] === '"') {
      cell += '"'; // "" → "
      i++;         // skip the second quote
    } else if (char === '"') {
      insideQuotes = !insideQuotes; // a quote opens or closes a cell
    } else if (char === separator && !insideQuotes) {
      cells.push(cell.trim()); // end of a cell
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim()); // the last cell
  return cells;
}


// .json → one block per item.
// Change the HTML below to show other fields of your file.
function jsonToHTML(items) {
  let html = "";
  for (const item of items) {
    html += `
      <figure class="figure">
        <img src="${item.url}" alt="${item.alt}">
        <figcaption>
          <p class="legende">${item.legende}</p>
          <p class="date">${item.date}</p>
          <p class="culture">${item.culture}</p>
          <p class="medium">${item.medium}</p>
          <p class="dimensions">${item.dimensions}</p>
          <p class="source">${item.source}</p>
          <p class="credit">${item.credit}</p>
          <p class="number">${item.number}</p>
          <p class="link"><a href="${item.link}" target="_blank">View on Met Museum</a></p>
        </figcaption>
      </figure>`;
  }
  return html;
}


// The buttons at the top right (their look is in preview.css)
function addButtons() {
  const buttons = document.createElement("div");
  buttons.className = "buttons";

  if (printPreview) {
    buttons.innerHTML = `
      <a href="?">🖥️</a>
      <button class="button-spreads" onclick="toggleView('spreads')">📖</button>
      <button class="button-boxes" onclick="toggleView('boxes')">⚙️</button>
      <button onclick="window.print()">🖨️</button>`;

    // turn back on the views that were on last time
    for (const view of ["spreads", "boxes"]) {
      if (localStorage.getItem(view) === "on") {
        document.body.classList.add(view);
      }
    }
  } else {
    buttons.innerHTML = `<a href="?print">🖨️</a>`;
  }

  document.body.prepend(buttons); // at the very top of the page
}


// Spreads and Boxes: add or remove a class on <body> (the styles are in preview.css)
function toggleView(view) {
  document.body.classList.toggle(view);
  const isOn = document.body.classList.contains(view);
  localStorage.setItem(view, isOn ? "on" : "off"); // remember it for next time
}

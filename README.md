# Paged.js — simple version

One HTML page that is both a **website** and a **printable document** (PDF),
made with [Paged.js](https://pagedjs.org).

## 1. Open it

The page loads its text from other files, and browsers only allow that through a
**local server** (opening `index.html` by double-clicking won't work).

- **VS Code:** install the **Live Server** extension, then click **Go Live** (bottom right).
- Or in a terminal, in this folder: `npx serve` or `python3 -m http.server`.

Use **Chrome**, **Edge** or **Brave**.

## 2. Web version ↔ print preview

Click the button at the top right.

- `index.html` → the web page
- `index.html?print` → the print preview: Paged.js cuts the page into pages

In the print preview:

| Button | What it does |
| --- | --- |
| **Spreads** | shows left and right pages side by side, like an open book |
| **Boxes** | shows where your content goes (orange) and the margin boxes around it, with their names (blue): `@top-center`, `@bottom-right`… |
| **Print / Save PDF** | opens the print window: choose **Save as PDF** |

Spreads and Boxes stay on when you reload the page.

## 3. The files

| File | What it is |
| --- | --- |
| `index.html` | your document: cover, contents, chapters |
| `content/` | the text of the chapters |
| `style.css` | the look of the document, on the web **and** on paper |
| `print.css` | paper only: page size, margins, page numbers, page breaks… |
| `script.js` | puts the content files into the page and starts Paged.js |
| `preview.css` | how the preview looks on screen (you don't need to change it) |

## 4. Add content

An element with `data-src` gets the content of a file:

```html
<div data-src="content/text.txt"></div>
```

| File | Becomes |
| --- | --- |
| `.txt` | one paragraph per line |
| `.md` | Markdown: titles, lists, bold, links, images… |
| `.csv` | a table (first line = column titles). A cell with a comma goes between quotes: `"Dolor, sit"` |
| `.json` | one block per item, with its `title` and `text` (see `jsonToHTML` in `script.js`) |
| `.html` | inserted as it is |

Images are written from `index.html`: `content/image.svg`.

**New chapter:** copy a `<section class="chapter">` in `index.html`, give it a new `id`
(like `chapter-6`), and add a link to it in the contents: `<a href="#chapter-6">…</a>`.

## 5. Change the printed version

Open `print.css`: each section is one option (page size, margins, page numbers,
chapter title at the top, cover, page breaks, page numbers in the contents),
with other values to try. Save, then reload the print preview.

## 6. Problems?

| Problem | Solution |
| --- | --- |
| Red text “Could not load…” | Check the file name in `data-src`, and open the page with a local server. |
| My change doesn't show | Reload the page. |
| Nothing works | Right-click → **Inspect** → **Console**: the error is written there. |

## Going further

- Paged.js documentation: <https://pagedjs.org/en/documentation/>


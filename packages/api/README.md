# @invoice/api — PDF Export

This package (the API server) exposes an endpoint to generate high-quality PDF invoices.

## Endpoint

- GET /api/invoices/:id/pdf — returns `application/pdf` with the invoice rendered as a printable PDF.

## How it works

1. The API renders a small invoice HTML template server-side.
2. It tries to run wkhtmltopdf to convert the HTML ➜ PDF (recommended for accurate print/CSS support).
3. If wkhtmltopdf isn't available, the API falls back to using Puppeteer (Chromium) to render the same HTML to a PDF.

## Runtime requirements & tips

- Best results: install `wkhtmltopdf` on your host (Windows/macOS/Linux). Many distributions provide binary packages or you can use an npm helper like `wkhtmltopdf-installer`.
- Fallback: the server will fall back to Puppeteer/Chromium automatically if `wkhtmltopdf` fails.
- On CI or servers where installing a native binary is hard, Puppeteer provides a reliable fallback (but larger disk usage).

## Local testing

If you want to test PDF generation locally:

1. Start your API server (e.g., `npm run dev:api` from the repo root or `cd packages/api && npm run dev`).
2. Call GET `/api/invoices/<id>/pdf` and open or save the response as a PDF file.

Example (curl):

```bash
curl -f -o invoice.pdf http://localhost:3001/api/invoices/INV-2024-0001/pdf
```

## Notes for Electron packaging

When building the Electron bundle, make sure the target platform has either wkhtmltopdf installed, or include Puppeteer dependencies (Chromium) in the packaged build. The API includes both options so the app will work on a machine without wkhtmltopdf, but installing the binary will yield better results and smaller packaged sizes.

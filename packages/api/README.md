# @invoice/api — Embedded API Server

This package provides the Hono-based API server that is embedded in the Electron desktop application. It handles database operations and PDF generation.

## Purpose

The API is **not meant to run standalone**. It serves as:
- Embedded server in the Electron app
- Shared business logic layer
- PDF generation service

## PDF Export

### Endpoint

- GET /api/invoices/:id/pdf — returns `application/pdf` with the invoice rendered as a printable PDF.

### How it works

1. The API renders an invoice HTML template server-side
2. Tries to use wkhtmltopdf for high-quality PDF conversion
3. Falls back to Puppeteer (Chromium) if wkhtmltopdf is unavailable

### Requirements

- **Best results**: wkhtmltopdf installed on the system
- **Fallback**: Puppeteer (included as dependency)
- Electron builds include wkhtmltopdf binary via `prepare-wk` script

## For Developers

### Testing the API

The API is automatically started by the Electron app. For development:

```bash
# From root - runs Electron with embedded API
npm run dev:electron
```

The API will be available at `http://localhost:3001` when Electron is running.

### Testing PDF Generation

```bash
# With Electron running, test PDF endpoint
curl -f -o invoice.pdf http://localhost:3001/api/invoices/<invoice-id>/pdf
```

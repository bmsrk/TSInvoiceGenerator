# @invoice/web — React Frontend

This package provides the React-based web interface that is bundled into the Electron desktop application.

## Purpose

The web package is **not meant to run standalone**. It serves as:
- The UI layer for the Electron app
- React-based invoice management interface
- Built with Vite for fast development

## Development

The web interface is developed alongside the Electron app:

```bash
# From root - runs Electron with hot-reloading web UI
npm run dev:electron
```

In development mode, Electron loads the Vite dev server at `http://localhost:5173`.

## Building

```bash
# Build web assets (called automatically by build:electron)
npm run build:web
```

Built files are output to `dist/` and packaged into the Electron app at build time.

## Tech Stack

- **React** - UI framework
- **React Router** - Client-side routing
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS** - Custom dark theme styling

## Features

- Invoice listing and management
- Company/customer/service CRUD
- Invoice creation wizard
- PDF export (via API)
- Dark theme UI
- Responsive design

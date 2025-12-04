# Invoice Generator

A modern, full-stack TypeScript invoice generator built with Node.js, Hono, and React.

## 📸 Screenshots

### Dashboard with Dark Mode
![Dashboard](https://github.com/user-attachments/assets/aee3ce04-4db4-4779-8328-e68933f90c93)

### Create Invoice Form
![Create Form](https://github.com/user-attachments/assets/fdd356c7-2de2-4b13-8e89-14626ca873cf)

### Invoice Preview
![Invoice Preview](https://github.com/user-attachments/assets/d4080c3a-5bae-46dc-ac95-32000a36e469)

## 🚀 Features

- **Modern Stack**: Built with Bun for blazing fast development
- **Monorepo Structure**: Easy to manage with workspace support
- **Dark Mode UI**: Beautiful, modern dark theme interface
- **Type-Safe**: Full TypeScript support across all packages
- **Invoice Management**: Create, view, and manage invoices
- **Real-time Calculations**: Automatic tax and total calculations
- **Status Tracking**: Track invoice status (Draft, Pending, Paid, Overdue)

## 📦 Project Structure

```
ts-invoice-generator/
├── packages/
│   ├── shared/          # Shared types and utilities
│   ├── api/             # Hono-based REST API
│   └── web/             # React frontend with Vite
├── package.json         # Root package with workspace config
└── tsconfig.json        # Base TypeScript configuration
```

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

> **Note**: This project is also compatible with [Bun](https://bun.sh/) for faster performance.

## 🏁 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the shared package first

```bash
npm run build:shared
```

### 3. Start Development Servers

Run both API and web development servers:

```bash
# Terminal 1: Start API server (port 3001)
npm run dev:api

# Terminal 2: Start web server (port 5173)
npm run dev:web
```

### 4. Access the Application

- **Web UI**: http://localhost:5173
- **API**: http://localhost:3001

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices |
| GET | `/api/invoices/:id` | Get invoice by ID |
| GET | `/api/invoices/:id/totals` | Get invoice with calculated totals |
| POST | `/api/invoices` | Create new invoice |
| PATCH | `/api/invoices/:id/status` | Update invoice status |
| DELETE | `/api/invoices/:id` | Delete invoice |

## 🧪 Invoice Model

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: Date;
  dueDate: Date;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  from: Party;
  to: Party;
  items: InvoiceItem[];
  currency: CurrencyCode;
  paymentTerms: PaymentTerms;
  notes?: string;
  termsAndConditions?: string;
}

interface Party {
  name: string;
  email: string;
  phone?: string;
  address: Address;
  taxId?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}
```

## 🎨 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:api` | Run API server only |
| `npm run dev:web` | Run web frontend only |
| `npm run build` | Build all packages |
| `npm run build:shared` | Build shared package (run first!) |
| `npm run lint` | Run TypeScript type checking |
| `npm run test` | Run tests |
| `npm run clean` | Clean all build artifacts and dependencies |

## 📝 Learning Resources

This project is designed to help you learn:

- **TypeScript**: Type-safe JavaScript with interfaces and generics
- **Bun**: Fast JavaScript runtime and package manager
- **Hono**: Lightweight web framework for building APIs
- **React**: Component-based UI development
- **Vite**: Next-generation frontend tooling
- **Monorepo**: Managing multiple packages in a single repository

## 🔧 Customization

### Adding New Invoice Fields

1. Update the types in `packages/shared/src/types.ts`
2. Update the API handlers in `packages/api/src/index.ts`
3. Update the form in `packages/web/src/components/InvoiceForm.tsx`
4. Update the preview in `packages/web/src/components/InvoicePreview.tsx`

### Changing the Theme

Edit the CSS variables in `packages/web/src/styles.css`:

```css
:root {
  --bg-primary: #0f0f1a;
  --accent-primary: #8b5cf6;
  /* ... other variables */
}
```

## 📄 License

MIT

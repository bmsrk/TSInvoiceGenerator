# Database Documentation

## Overview

TSInvoiceGenerator uses **Prisma** as the ORM and **SQLite** as the database engine. Both the CLI and Electron app use identical schemas but maintain separate database files.

## Database Locations

### CLI
- **Development**: `cli/prisma/dev.db`
- **Production**: Same location (portable with executable)

### Electron
- **Development**: `packages/api/prisma/dev.db`
- **Production**: OS-specific user data directory
  - Windows: `%APPDATA%/Invoice Generator/invoice.db`
  - macOS: `~/Library/Application Support/Invoice Generator/invoice.db`
  - Linux: `~/.config/Invoice Generator/invoice.db`

## Schema Overview

The database consists of 4 main entities:

```
Company ──┐
          ├──> Invoice ──> InvoiceItem
Customer ─┘

Service (catalog)
```

## Models

### Company

Represents your business(es) that issue invoices.

```prisma
model Company {
  id        String   @id @default(uuid())
  name      String
  email     String
  phone     String?
  street    String
  city      String
  state     String
  zipCode   String
  country   String
  taxId     String?
  isDefault Boolean  @default(false)
  
  // Relations
  invoices  Invoice[]
  services  Service[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Fields:**
- `isDefault`: Marks the default company for new invoices
- `taxId`: Tax identification number (optional)

### Customer

Represents clients who receive invoices.

```prisma
model Customer {
  id       String @id @default(uuid())
  name     String
  email    String
  phone    String?
  street   String
  city     String
  state    String
  zipCode  String
  country  String
  taxId    String?
  
  // Relations
  invoices Invoice[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Service

Service catalog with default rates (linked to companies).

```prisma
model Service {
  id          String  @id @default(uuid())
  description String
  defaultRate Float
  
  // Relations
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Note:** Services can be company-specific or global (companyId is optional)

### Invoice

Invoice header information.

```prisma
model Invoice {
  id                  String        @id @default(uuid())
  invoiceNumber       String        @unique
  dueDate             DateTime
  status              InvoiceStatus @default(DRAFT)
  currency            String        @default("USD")
  paymentTerms        String?
  notes               String?
  termsAndConditions  String?
  
  // Relations
  companyId           String
  company             Company       @relation(fields: [companyId], references: [id])
  
  customerId          String
  customer            Customer      @relation(fields: [customerId], references: [id])
  
  items               InvoiceItem[]
  
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
}

enum InvoiceStatus {
  DRAFT
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

**Key Fields:**
- `invoiceNumber`: Unique identifier (e.g., "INV-2024-0001")
- `status`: Current payment status
- `paymentTerms`: NET_15, NET_30, NET_45, NET_60, DUE_ON_RECEIPT

### InvoiceItem

Line items within an invoice.

```prisma
model InvoiceItem {
  id          String  @id @default(uuid())
  description String
  quantity    Float
  unitPrice   Float
  taxRate     Float   @default(0)
  
  // Relations
  invoiceId   String
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Calculation:**
- Subtotal = `quantity × unitPrice`
- Tax = `subtotal × (taxRate / 100)`
- Total = `subtotal + tax`

## Relationships

```
Company (1) ──────── (N) Invoice
Customer (1) ────── (N) Invoice
Invoice (1) ──────── (N) InvoiceItem
Company (1) ──────── (N) Service (optional)
```

**Cascade Deletes:**
- Deleting an invoice deletes all its items
- Deleting a company/customer is prevented if they have invoices

## Migrations

### Creating Migrations

```bash
# CLI
cd cli
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev --name description

# API
cd packages/api
npx prisma migrate dev --name description
```

### Applying Migrations

Migrations are applied automatically on app startup via Prisma.

### Migration History

Migration files are stored in:
- `cli/prisma/migrations/`
- `packages/api/prisma/migrations/`

## Seeding

Both CLI and API can seed the database with sample data.

### CLI Seeding
```bash
cd cli
DATABASE_URL="file:./prisma/dev.db" bun run src/index.ts seed
```

### API Seeding
```bash
POST /api/seed
```

**Seed Data Includes:**
- 2 sample companies
- 3 sample customers
- 8 sample services
- 1 sample invoice with line items

## Querying Examples

### Get All Invoices with Relations
```typescript
const invoices = await prisma.invoice.findMany({
  include: {
    company: true,
    customer: true,
    items: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

### Create Invoice with Items
```typescript
const invoice = await prisma.invoice.create({
  data: {
    invoiceNumber: 'INV-2024-0001',
    dueDate: new Date(),
    status: 'DRAFT',
    companyId: 'company-id',
    customerId: 'customer-id',
    items: {
      create: [
        {
          description: 'Consulting',
          quantity: 10,
          unitPrice: 150,
          taxRate: 10,
        },
      ],
    },
  },
  include: { items: true },
});
```

### Update Invoice Status
```typescript
await prisma.invoice.update({
  where: { id: 'invoice-id' },
  data: { status: 'PAID' },
});
```

## Performance Optimization

1. **Indexes**: Primary keys and unique constraints are indexed automatically
2. **Eager Loading**: Use `include` to fetch related data in one query
3. **Connection Pooling**: Prisma manages connections efficiently
4. **Query Optimization**: SQLite is optimized for read-heavy workloads

## Backup and Restore

### Backup
```bash
# CLI
cp cli/prisma/dev.db cli/prisma/backup.db

# Electron (production)
# Copy from user data directory
```

### Restore
```bash
# CLI
cp cli/prisma/backup.db cli/prisma/dev.db

# Electron
# Copy to user data directory and restart app
```

## Schema Alignment

The CLI and API schemas must stay synchronized. When making schema changes:

1. Update both `cli/prisma/schema.prisma` and `packages/api/prisma/schema.prisma`
2. Generate migrations for both
3. Test with both CLI and Electron
4. Commit both schema files together

## Troubleshooting

### "Table already exists" Error
```bash
# Reset the database (CAUTION: destroys data)
npx prisma migrate reset
```

### "Connection Error"
- Check DATABASE_URL environment variable
- Ensure database file directory exists
- Verify file permissions

### Migration Conflicts
```bash
# Mark as applied without running
npx prisma migrate resolve --applied <migration-name>
```

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

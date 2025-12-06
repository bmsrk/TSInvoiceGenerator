# API Reference

## Base URL

When running locally:
```
http://localhost:3001
```

In Electron, the API runs on a random available port and is accessed via the embedded web app.

## Authentication

The API does not require authentication as it runs locally and is not exposed to the network.

## Common Headers

```http
Content-Type: application/json
```

## Response Format

### Success Response
```json
{
  "id": "uuid",
  "field": "value"
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Status Codes

- `200 OK` - Successful GET/PUT/PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Companies

### List All Companies

```http
GET /api/companies
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "billing@acme.com",
    "phone": "+1 (555) 123-4567",
    "street": "123 Business Ave",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA",
    "taxId": "US-123456789",
    "isDefault": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Company by ID

```http
GET /api/companies/:id
```

**Response:** Company object or `404`

### Create Company

```http
POST /api/companies
```

**Request Body:**
```json
{
  "name": "Company Name",
  "email": "email@example.com",
  "phone": "+1 (555) 123-4567",
  "street": "123 Street",
  "city": "City",
  "state": "ST",
  "zipCode": "12345",
  "country": "USA",
  "taxId": "TAX-ID",
  "isDefault": false
}
```

**Response:** `201` with created company

### Update Company

```http
PUT /api/companies/:id
```

**Request Body:** Partial company object

**Response:** Updated company or `404`

### Delete Company

```http
DELETE /api/companies/:id
```

**Response:** `{ "success": true }` or `404`

**Note:** Cannot delete company with associated invoices.

---

## Customers

### List All Customers

```http
GET /api/customers
```

**Response:** Array of customer objects

### Get Customer by ID

```http
GET /api/customers/:id
```

**Response:** Customer object or `404`

### Create Customer

```http
POST /api/customers
```

**Request Body:**
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1 (555) 987-6543",
  "street": "456 Client Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "taxId": "TAX-ID"
}
```

**Response:** `201` with created customer

### Update Customer

```http
PUT /api/customers/:id
```

**Request Body:** Partial customer object

**Response:** Updated customer or `404`

### Delete Customer

```http
DELETE /api/customers/:id
```

**Response:** `{ "success": true }` or `404`

**Note:** Cannot delete customer with associated invoices.

---

## Services

### List All Services

```http
GET /api/services?companyId=uuid (optional)
```

**Query Parameters:**
- `companyId` (optional): Filter by company

**Response:** Array of service objects

### Get Service by ID

```http
GET /api/services/:id
```

**Response:**
```json
{
  "id": "uuid",
  "description": "Web Development",
  "defaultRate": 150.0,
  "companyId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Service

```http
POST /api/services
```

**Request Body:**
```json
{
  "description": "Service Name",
  "defaultRate": 150.0,
  "companyId": "uuid"  // optional
}
```

**Response:** `201` with created service

### Update Service

```http
PUT /api/services/:id
```

**Request Body:** Partial service object

**Response:** Updated service or `404`

### Delete Service

```http
DELETE /api/services/:id
```

**Response:** `{ "success": true }` or `404`

---

## Invoices

### List All Invoices

```http
GET /api/invoices
```

**Response:**
```json
[
  {
    "id": "uuid",
    "invoiceNumber": "INV-2024-0001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "dueDate": "2024-01-31T00:00:00.000Z",
    "status": "PENDING",
    "currency": "USD",
    "paymentTerms": "NET_30",
    "notes": "Thank you for your business!",
    "termsAndConditions": "Payment due within 30 days",
    "from": {
      "name": "Acme Corp",
      "email": "billing@acme.com",
      "address": {
        "street": "123 Business Ave",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "country": "USA"
      }
    },
    "to": {
      "name": "Client Company",
      "email": "accounts@client.com",
      "address": {
        "street": "456 Client Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      }
    },
    "items": [
      {
        "id": "uuid",
        "description": "Web Development Services",
        "quantity": 40,
        "unitPrice": 150.0,
        "taxRate": 10
      }
    ]
  }
]
```

### Get Invoice by ID

```http
GET /api/invoices/:id
```

**Response:** Invoice object or `404`

### Get Invoice with Totals

```http
GET /api/invoices/:id/totals
```

**Response:**
```json
{
  "invoice": { /* invoice object */ },
  "totals": {
    "subtotal": 6000.0,
    "totalTax": 600.0,
    "total": 6600.0
  }
}
```

### Create Invoice

```http
POST /api/invoices
```

**Request Body:**
```json
{
  "invoiceNumber": "INV-2024-0002",
  "dueDate": "2024-02-15",
  "status": "DRAFT",
  "currency": "USD",
  "paymentTerms": "NET_30",
  "notes": "Thank you!",
  "termsAndConditions": "Payment due within 30 days",
  "companyId": "uuid",
  "customerId": "uuid",
  "items": [
    {
      "description": "Consulting",
      "quantity": 10,
      "unitPrice": 150.0,
      "taxRate": 10
    }
  ]
}
```

**Response:** `201` with created invoice

### Update Invoice Status

```http
PATCH /api/invoices/:id/status
```

**Request Body:**
```json
{
  "status": "PAID"
}
```

**Valid Statuses:**
- `DRAFT`
- `PENDING`
- `PAID`
- `OVERDUE`
- `CANCELLED`

**Response:** Updated invoice or `404`

### Delete Invoice

```http
DELETE /api/invoices/:id
```

**Response:** `{ "success": true }` or `404`

### Export Invoice as PDF

```http
GET /api/invoices/:id/pdf
```

**Response:** PDF file download

**Headers:**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="INV-2024-0001.pdf"
```

---

## Seed Database

### Seed with Sample Data

```http
POST /api/seed
```

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully"
}
```

**Note:** Only seeds if database is empty (no companies exist).

**Seed Data Includes:**
- 2 companies
- 3 customers
- 8 services
- 1 sample invoice

---

## Error Handling

### Validation Errors

```http
POST /api/invoices
Content-Type: application/json

{
  "invalid": "data"
}
```

**Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid request body"
}
```

### Not Found

```http
GET /api/invoices/nonexistent-id
```

**Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Invoice not found"
}
```

### Server Errors

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Failed to generate PDF"
}
```

---

## Data Types

### Invoice Status

```typescript
type InvoiceStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';
```

### Payment Terms

```typescript
type PaymentTerms = 
  | 'NET_15'
  | 'NET_30'
  | 'NET_45'
  | 'NET_60'
  | 'DUE_ON_RECEIPT';
```

### Currency

Currently only `USD` is supported.

---

## Rate Limiting

No rate limiting is implemented as the API runs locally.

## CORS

CORS is enabled for all origins when running in development/Electron mode.

## Pagination

Pagination is not currently implemented. All list endpoints return all records.

## Filtering & Sorting

Limited filtering is available:
- Services can be filtered by `companyId`
- Invoices are sorted by creation date (newest first)

## Webhooks

Webhooks are not supported.

## SDK/Client Libraries

Use the included `packages/web/src/api.ts` as a reference for building API clients.

Example:
```typescript
const response = await fetch('http://localhost:3001/api/invoices');
const invoices = await response.json();
```

## Testing the API

### Using curl

```bash
# List companies
curl http://localhost:3001/api/companies

# Create company
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Co","email":"test@example.com",...}'

# Get invoice PDF
curl http://localhost:3001/api/invoices/{id}/pdf \
  --output invoice.pdf
```

### Using Postman

Import the API base URL and create requests for each endpoint.

### Using the Web UI

The Electron app provides a full UI for testing all API endpoints.

---

## Changelog

### v1.0.0
- Initial API release
- Support for companies, customers, services, invoices
- PDF generation
- Database seeding

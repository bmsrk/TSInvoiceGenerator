import prisma from '../database.js';

/**
 * Seed the database with sample data
 */
export async function seedDatabase(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Check if data already exists
  const existingCompanies = await prisma.company.count();
  if (existingCompanies > 0) {
    console.log('📦 Database already has data, skipping seed.');
    return;
  }

  // Create sample companies
  const acmeCorp = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      email: 'billing@acme.com',
      phone: '+1 (555) 123-4567',
      street: '123 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      taxId: 'US-123456789',
      isDefault: true,
    },
  });

  await prisma.company.create({
    data: {
      name: 'Tech Solutions LLC',
      email: 'invoices@techsolutions.io',
      phone: '+1 (555) 987-6543',
      street: '456 Innovation Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
      taxId: 'US-987654321',
    },
  });

  console.log('✅ Created sample companies');

  // Create sample customers
  const clientCompany = await prisma.customer.create({
    data: {
      name: 'Client Company',
      email: 'accounts@client.com',
      phone: '+1 (555) 987-6543',
      street: '456 Client Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  });

  await prisma.customer.create({
    data: {
      name: 'Startup Inc',
      email: 'finance@startup.io',
      phone: '+1 (555) 555-1234',
      street: '789 Startup Lane',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA',
      taxId: 'US-555123456',
    },
  });

  await prisma.customer.create({
    data: {
      name: 'Global Enterprises',
      email: 'ap@globalent.com',
      street: '321 Corporate Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
  });

  console.log('✅ Created sample customers');

  // Create sample services for each company
  await prisma.service.createMany({
    data: [
      // Services for Acme Corp
      { description: 'Web Development', defaultRate: 150.00, companyId: acmeCorp.id },
      { description: 'UI/UX Design', defaultRate: 120.00, companyId: acmeCorp.id },
      { description: 'Project Management', defaultRate: 100.00, companyId: acmeCorp.id },
      { description: 'Consulting', defaultRate: 175.00, companyId: acmeCorp.id },
      { description: 'Code Review', defaultRate: 125.00, companyId: acmeCorp.id },
      { description: 'Technical Writing', defaultRate: 85.00, companyId: acmeCorp.id },
      { description: 'Database Design', defaultRate: 140.00, companyId: acmeCorp.id },
      { description: 'API Development', defaultRate: 160.00, companyId: acmeCorp.id },
    ],
  });

  console.log('✅ Created sample services');

  // Create a sample invoice
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-0001',
      dueDate,
      status: 'PENDING',
      currency: 'USD',
      paymentTerms: 'NET_30',
      notes: 'Thank you for your business!',
      termsAndConditions: 'Payment is due within 30 days. Late payments may incur a 1.5% monthly interest.',
      companyId: acmeCorp.id,
      customerId: clientCompany.id,
      items: {
        create: [
          {
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 150.00,
            taxRate: 10,
          },
          {
            description: 'UI/UX Design',
            quantity: 20,
            unitPrice: 120.00,
            taxRate: 10,
          },
          {
            description: 'Project Management',
            quantity: 10.5, // Decimal hours example
            unitPrice: 100.00,
            taxRate: 10,
          },
        ],
      },
    },
  });

  console.log('✅ Created sample invoice');
  console.log('🎉 Database seeded successfully!');
}

// Run if executed directly
const currentFilePath = new URL(import.meta.url).pathname;
if (process.argv[1] === currentFilePath) {
  seedDatabase()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Seed failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

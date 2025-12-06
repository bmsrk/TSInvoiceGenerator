/**
 * Customer-related command functions
 */

import prompts from 'prompts';
import chalk from 'chalk';
import { table } from 'table';
import { prisma } from '../utils/database';

/**
 * Manage customers (list, create, delete)
 */
export async function manageCustomers(): Promise<void> {
  const customers = await prisma.customer.findMany();

  console.log(chalk.bold('\n👥 Customers:\n'));

  if (customers.length === 0) {
    console.log(chalk.yellow('📭 No customers found.\n'));
  } else {
    const data = [
      [chalk.bold('Name'), chalk.bold('Email'), chalk.bold('City, State')],
      ...customers.map((c) => [c.name, c.email, `${c.city}, ${c.state}`]),
    ];
    console.log(table(data));
  }

  const { action } = await prompts([
    {
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { title: '➕ Create Customer', value: 'create' },
        ...(customers.length > 0
          ? [{ title: '🗑️  Delete Customer', value: 'delete' }]
          : []),
        { title: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'create') {
    await createCustomer();
  } else if (action === 'delete') {
    const { customerId } = await prompts([
      {
        type: 'select',
        name: 'customerId',
        message: 'Select customer to delete:',
        choices: customers.map((c) => ({
          title: `${c.name} (${c.email})`,
          value: c.id,
        })),
      },
    ]);
    await deleteCustomer(customerId);
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(): Promise<void> {
  console.log(chalk.bold('\n➕ Create New Customer\n'));

  const input = await prompts([
    { type: 'text', name: 'name', message: 'Customer name:' },
    { type: 'text', name: 'email', message: 'Email:' },
    { type: 'text', name: 'phone', message: 'Phone (optional):' },
    { type: 'text', name: 'street', message: 'Street address:' },
    { type: 'text', name: 'city', message: 'City:' },
    { type: 'text', name: 'state', message: 'State:' },
    { type: 'text', name: 'zipCode', message: 'ZIP code:' },
    { type: 'text', name: 'country', message: 'Country:', initial: 'USA' },
    { type: 'text', name: 'taxId', message: 'Tax ID (optional):' },
  ]);

  await prisma.customer.create({ data: input });
  console.log(chalk.green('\n✅ Customer created successfully!\n'));
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  const { confirm } = await prompts([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this customer?',
      initial: false,
    },
  ]);

  if (confirm) {
    try {
      await prisma.customer.delete({ where: { id } });
      console.log(chalk.green('\n✅ Customer deleted successfully\n'));
    } catch (error) {
      console.log(chalk.red('\n❌ Cannot delete customer (may have associated invoices)\n'));
    }
  }
}

/**
 * Company-related command functions
 */

import prompts from 'prompts';
import chalk from 'chalk';
import { table } from 'table';
import { prisma } from '../utils/database';

/**
 * Manage companies (list, create, delete)
 */
export async function manageCompanies(): Promise<void> {
  const companies = await prisma.company.findMany();

  console.log(chalk.bold('\n🏢 Companies:\n'));

  if (companies.length === 0) {
    console.log(chalk.yellow('📭 No companies found.\n'));
  } else {
    const data = [
      [
        chalk.bold('Name'),
        chalk.bold('Email'),
        chalk.bold('City, State'),
        chalk.bold('Default'),
      ],
      ...companies.map((c) => [
        c.name,
        c.email,
        `${c.city}, ${c.state}`,
        c.isDefault ? '✓' : '',
      ]),
    ];
    console.log(table(data));
  }

  const { action } = await prompts([
    {
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { title: '➕ Create Company', value: 'create' },
        ...(companies.length > 0
          ? [{ title: '🗑️  Delete Company', value: 'delete' }]
          : []),
        { title: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'create') {
    await createCompany();
  } else if (action === 'delete') {
    const { companyId } = await prompts([
      {
        type: 'select',
        name: 'companyId',
        message: 'Select company to delete:',
        choices: companies.map((c) => ({
          title: `${c.name} (${c.email})`,
          value: c.id,
        })),
      },
    ]);
    await deleteCompany(companyId);
  }
}

/**
 * Create a new company
 */
export async function createCompany(): Promise<void> {
  console.log(chalk.bold('\n➕ Create New Company\n'));

  const input = await prompts([
    { type: 'text', name: 'name', message: 'Company name:' },
    { type: 'text', name: 'email', message: 'Email:' },
    { type: 'text', name: 'phone', message: 'Phone (optional):' },
    { type: 'text', name: 'street', message: 'Street address:' },
    { type: 'text', name: 'city', message: 'City:' },
    { type: 'text', name: 'state', message: 'State:' },
    { type: 'text', name: 'zipCode', message: 'ZIP code:' },
    { type: 'text', name: 'country', message: 'Country:', initial: 'USA' },
    { type: 'text', name: 'taxId', message: 'Tax ID (optional):' },
    {
      type: 'confirm',
      name: 'isDefault',
      message: 'Set as default company?',
      initial: false,
    },
  ]);

  await prisma.company.create({ data: input });
  console.log(chalk.green('\n✅ Company created successfully!\n'));
}

/**
 * Delete a company
 */
export async function deleteCompany(id: string): Promise<void> {
  const { confirm } = await prompts([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this company?',
      initial: false,
    },
  ]);

  if (confirm) {
    try {
      await prisma.company.delete({ where: { id } });
      console.log(chalk.green('\n✅ Company deleted successfully\n'));
    } catch (error) {
      console.log(chalk.red('\n❌ Cannot delete company (may have associated invoices)\n'));
    }
  }
}

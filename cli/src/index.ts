#!/usr/bin/env bun
/**
 * Invoice Generator CLI - Entry point
 * Built with Bun, Prisma, and Inquirer
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { prisma, seedDatabase } from './utils/database';
import { showMainMenu } from './utils/tui';
import {
  listInvoices,
  createInvoiceTUI,
  manageCompanies,
  manageCustomers,
  manageServices,
  showStats,
} from './commands';
import type { MainMenuAction } from './types';

/**
 * Main menu loop
 */
async function mainMenu(): Promise<void> {
  const action: MainMenuAction = await showMainMenu();

  switch (action) {
    case 'list-invoices':
      await listInvoices();
      break;
    case 'create-invoice':
      await createInvoiceTUI();
      break;
    case 'manage-companies':
      await manageCompanies();
      break;
    case 'manage-customers':
      await manageCustomers();
      break;
    case 'manage-services':
      await manageServices();
      break;
    case 'stats':
      await showStats();
      break;
    case 'seed':
      await seedDatabase();
      break;
    case 'exit':
      console.log(chalk.blue('👋 Goodbye!'));
      await prisma.$disconnect();
      process.exit(0);
  }

  // Loop back to main menu
  await mainMenu();
}

/**
 * CLI setup with commander
 */
const program = new Command();

program
  .name('invoice')
  .description('Invoice Generator CLI with TUI - Built with Bun')
  .version('1.0.0');

// Default command: TUI
program
  .command('tui', { isDefault: true })
  .description('Launch interactive TUI (default)')
  .action(async () => {
    console.log(chalk.bold.blue('\n🧾 Invoice Generator CLI\n'));
    await seedDatabase();
    await mainMenu();
  });

// Quick stats
program
  .command('stats')
  .description('Show quick statistics')
  .action(async () => {
    await showStats();
    await prisma.$disconnect();
    process.exit(0);
  });

// List invoices
program
  .command('list')
  .description('List all invoices')
  .action(async () => {
    await listInvoices();
    await prisma.$disconnect();
    process.exit(0);
  });

// Seed database
program
  .command('seed')
  .description('Seed database with sample data')
  .action(async () => {
    await seedDatabase();
    await prisma.$disconnect();
    process.exit(0);
  });

// Parse command line arguments
program.parse();

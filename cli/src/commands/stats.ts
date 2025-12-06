/**
 * Statistics command functions
 */

import chalk from 'chalk';
import { prisma } from '../utils/database';
import { formatCurrency, calculateLineTotal } from '../utils/formatting';

/**
 * Display statistics about the system
 */
export async function showStats(): Promise<void> {
  const invoices = await prisma.invoice.findMany({ include: { items: true } });
  const companies = await prisma.company.count();
  const customers = await prisma.customer.count();
  const services = await prisma.service.count();

  const totalRevenue = invoices.reduce((sum, inv) => {
    return (
      sum +
      inv.items.reduce(
        (itemSum, item) =>
          itemSum + calculateLineTotal(item.quantity, item.unitPrice, item.taxRate),
        0
      )
    );
  }, 0);

  const statusCounts = invoices.reduce(
    (acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log(chalk.bold('\n📊 Statistics:\n'));
  console.log(`  Total Invoices: ${chalk.cyan(invoices.length)}`);
  console.log(`  Total Revenue: ${chalk.green(formatCurrency(totalRevenue))}`);
  console.log(`  Companies: ${chalk.cyan(companies)}`);
  console.log(`  Customers: ${chalk.cyan(customers)}`);
  console.log(`  Services: ${chalk.cyan(services)}`);
  console.log('');
  console.log(chalk.bold('  Invoice Status Breakdown:'));
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`    ${status}: ${chalk.cyan(count)}`);
  });
  console.log('');
}

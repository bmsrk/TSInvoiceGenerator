/**
 * Service-related command functions
 */

import prompts from 'prompts';
import chalk from 'chalk';
import { table } from 'table';
import { prisma } from '../utils/database';
import { formatCurrency } from '../utils/formatting';

/**
 * Manage services (list, create, delete)
 */
export async function manageServices(): Promise<void> {
  const services = await prisma.service.findMany();

  console.log(chalk.bold('\n🛠️  Services:\n'));

  if (services.length === 0) {
    console.log(chalk.yellow('📭 No services found.\n'));
  } else {
    const data = [
      [chalk.bold('Description'), chalk.bold('Default Rate')],
      ...services.map((s) => [s.description, formatCurrency(s.defaultRate)]),
    ];
    console.log(table(data));
  }

  const { action } = await prompts([
    {
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { title: '➕ Create Service', value: 'create' },
        ...(services.length > 0
          ? [{ title: '🗑️  Delete Service', value: 'delete' }]
          : []),
        { title: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  if (action === 'create') {
    await createService();
  } else if (action === 'delete') {
    const { serviceId } = await prompts([
      {
        type: 'select',
        name: 'serviceId',
        message: 'Select service to delete:',
        choices: services.map((s) => ({
          title: `${s.description} - ${formatCurrency(s.defaultRate)}`,
          value: s.id,
        })),
      },
    ]);
    await deleteService(serviceId);
  }
}

/**
 * Create a new service
 */
export async function createService(): Promise<void> {
  console.log(chalk.bold('\n➕ Create New Service\n'));

  const input = await prompts([
    { type: 'text', name: 'description', message: 'Service description:' },
    {
      type: 'number',
      name: 'defaultRate',
      message: 'Default hourly rate:',
    },
  ]);

  await prisma.service.create({ data: input });
  console.log(chalk.green('\n✅ Service created successfully!\n'));
}

/**
 * Delete a service
 */
export async function deleteService(id: string): Promise<void> {
  const { confirm } = await prompts([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this service?',
      initial: false,
    },
  ]);

  if (confirm) {
    await prisma.service.delete({ where: { id } });
    console.log(chalk.green('\n✅ Service deleted successfully\n'));
  }
}

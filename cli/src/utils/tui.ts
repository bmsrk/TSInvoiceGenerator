/**
 * Terminal UI utilities for interactive prompts and displays
 */

import prompts from 'prompts';
import chalk from 'chalk';
import { table } from 'table';
import { MAIN_MENU_CHOICES, INVOICE_STATUSES } from './constants';
import type { MainMenuAction, InvoiceStatus } from '../types';

/**
 * Display the main menu and get user's choice
 */
export async function showMainMenu(): Promise<MainMenuAction> {
  const { action } = await prompts([
    {
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: MAIN_MENU_CHOICES,
    },
  ]);
  return action as MainMenuAction;
}

/**
 * Prompt for invoice status selection
 */
export async function selectInvoiceStatus(): Promise<InvoiceStatus> {
  const { status } = await prompts([
    {
      type: 'select',
      name: 'status',
      message: 'Select new status:',
      choices: INVOICE_STATUSES,
    },
  ]);
  return status as InvoiceStatus;
}

/**
 * Generic function to select from a list of items
 */
export async function selectFromList<T>(
  items: T[],
  getMessage: (item: T) => string,
  prompt: string
): Promise<T | undefined> {
  if (items.length === 0) {
    return undefined;
  }

  const { selected } = await prompts([
    {
      type: 'select',
      name: 'selected',
      message: prompt,
      choices: items.map((item, index) => ({
        title: getMessage(item),
        value: index,
      })),
    },
  ]);

  return selected !== undefined ? items[selected] : undefined;
}

/**
 * Confirm an action with yes/no prompt
 */
export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  const { confirmed } = await prompts([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      initial: defaultValue,
    },
  ]);
  return confirmed;
}

/**
 * Display a table with data
 */
export function displayTable(data: string[][]): void {
  console.log(table(data));
}

/**
 * Display a success message
 */
export function showSuccess(message: string): void {
  console.log(chalk.green(`\n✅ ${message}\n`));
}

/**
 * Display an error message
 */
export function showError(message: string): void {
  console.log(chalk.red(`\n❌ ${message}\n`));
}

/**
 * Display an info message
 */
export function showInfo(message: string): void {
  console.log(chalk.blue(`\n${message}\n`));
}

/**
 * Display a warning message
 */
export function showWarning(message: string): void {
  console.log(chalk.yellow(`\n${message}\n`));
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency based on user settings
 */
export function formatCurrency(amount: number, currency: string = 'USD', compact: boolean = false): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'DZD': 'DA'
  };

  const symbol = currencySymbols[currency] || currency;
  
  // Special handling for Algerian Dinar (DZD)
  if (currency === 'DZD') {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ' + symbol;
  }

  // For compact display (charts, etc.)
  if (compact) {
    return symbol + new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  }

  // For all other currencies, symbol goes before the amount
  return symbol + new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export const getPageNumbers = (page: number, totalPages: number, max = 5): Array<number | string> => {
  const pages: Array<number | string> = [];
  if (totalPages <= max) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }
  const start = Math.max(1, Math.min(page - Math.floor(max / 2), totalPages - max + 1));
  const end = Math.min(totalPages, start + max - 1);
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }
  return pages;
};

import { parse } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { RawTransaction, Transaction } from '@/types';
import { categorizeTransaction, extractMerchantName, extractLocation } from './categorizer';
import { CATEGORIES } from './constants';

export function parseCSV(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n');
  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length >= 4) {
      const raw: RawTransaction = {
        fecha: values[0],
        fechaCompra: values[1],
        descripcion: values[2],
        importe: parseFloat(values[3]),
      };

      const categoryId = categorizeTransaction(raw.descripcion);

      const transaction: Transaction = {
        ...raw,
        id: `txn-${i}-${Date.now()}-${Math.random()}`,
        date: parseDate(raw.fecha),
        purchaseDate: parseDate(raw.fechaCompra),
        category: CATEGORIES[categoryId],
        merchant: extractMerchantName(raw.descripcion),
        location: extractLocation(raw.descripcion),
        amount: raw.importe,
      };

      transactions.push(transaction);
    }
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

function parseDate(dateStr: string): Date {
  // Format: "04 Jan 2026"
  try {
    return parse(dateStr, 'dd MMM yyyy', new Date(), { locale: enUS });
  } catch {
    return new Date();
  }
}

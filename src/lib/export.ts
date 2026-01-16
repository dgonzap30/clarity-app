import type { Transaction } from '@/types';

/**
 * Export transactions to JSON string
 */
export function exportToJSON(transactions: Transaction[]): string {
  const exportData = transactions.map((t) => ({
    id: t.id,
    date: t.date.toISOString(),
    purchaseDate: t.purchaseDate.toISOString(),
    merchant: t.merchant,
    location: t.location,
    amount: t.amount,
    category: t.category.id,
    categoryName: t.category.name,
    descripcion: t.descripcion,
    fecha: t.fecha,
    fechaCompra: t.fechaCompra,
    importe: t.importe,
  }));

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download transactions as a JSON file
 */
export function downloadJSON(transactions: Transaction[], filename?: string): void {
  const json = exportToJSON(transactions);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `transactions-${new Date().toISOString().split('T')[0]}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Export transactions to CSV string
 */
export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Purchase Date', 'Merchant', 'Location', 'Category', 'Amount', 'Description'];
  const rows = transactions.map((t) => [
    t.date.toISOString().split('T')[0],
    t.purchaseDate.toISOString().split('T')[0],
    `"${t.merchant.replace(/"/g, '""')}"`,
    `"${t.location.replace(/"/g, '""')}"`,
    t.category.name,
    t.amount.toFixed(2),
    `"${t.descripcion.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Download transactions as a CSV file
 */
export function downloadCSV(transactions: Transaction[], filename?: string): void {
  const csv = exportToCSV(transactions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

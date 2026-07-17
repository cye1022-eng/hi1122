import * as XLSX from 'xlsx';
import { ProductionRecord, ColumnMapping } from '../types';

export const parseExcelFile = async (file: File, mapping: ColumnMapping): Promise<ProductionRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const records: ProductionRecord[] = jsonData.map((row, index) => {
          return {
            id: `${file.name}-${index}`,
            date: formatDate(row[mapping.standardDate]),
            line: row[mapping.standardLine] || file.name.split('.')[0],
            target: Number(row[mapping.standardTarget]) || 0,
            actual: Number(row[mapping.standardActual]) || 0,
            defects: Number(row[mapping.standardDefect]) || 0,
          };
        });

        resolve(records);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const formatDate = (val: any): string => {
  if (!val) return new Date().toISOString().split('T')[0];
  if (typeof val === 'number') {
    // Excel date serial
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const date = new Date(val);
  return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
};

export const mergeRecords = (existing: ProductionRecord[], incoming: ProductionRecord[]): ProductionRecord[] => {
  // Simple merge by ID (file-index)
  const map = new Map<string, ProductionRecord>();
  existing.forEach(r => map.set(r.id, r));
  incoming.forEach(r => map.set(r.id, r));
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

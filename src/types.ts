/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColumnMapping {
  standardDate: string;
  standardTarget: string;
  standardActual: string;
  standardDefect: string;
  standardLine: string;
}

export interface ProductionRecord {
  date: string;
  line: string;
  target: number;
  actual: number;
  defects: number;
  id: string;
}

export interface LineTarget {
  line: string;
  monthlyTarget: number;
  weeklyTarget: number;
  defectThreshold: number; // percentage
  achievementThreshold: number; // percentage
}

export interface AppState {
  records: ProductionRecord[];
  mappings: Record<string, ColumnMapping>; // key is line name or filename
  targets: Record<string, LineTarget>;
}

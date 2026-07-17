/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, FileText, Settings, Database, Download, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, ProductionRecord, LineTarget, ColumnMapping } from './types';
import { DataIngest } from './components/DataIngest';
import { Dashboard } from './components/Dashboard';
import { TargetSettings } from './components/TargetSettings';
import { parseExcelFile, mergeRecords } from './lib/excel';
import { generateWordReport } from './lib/report';

const STORAGE_KEY = 'pgm_smart_tracker_data';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingest' | 'settings'>('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      records: [],
      mappings: {},
      targets: {}
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const lines = useMemo(() => {
    const lineSet = new Set<string>();
    state.records.forEach(r => lineSet.add(r.line));
    return Array.from(lineSet);
  }, [state.records]);

  const handleFilesProcessed = async (files: { file: File; mapping: ColumnMapping }[]) => {
    try {
      let newRecords: ProductionRecord[] = [];
      const newMappings = { ...state.mappings };

      for (const { file, mapping } of files) {
        const parsed = await parseExcelFile(file, mapping);
        newRecords = [...newRecords, ...parsed];
        newMappings[file.name] = mapping;
      }

      setState(prev => ({
        ...prev,
        records: mergeRecords(prev.records, newRecords),
        mappings: newMappings
      }));
      
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Failed to process files:', error);
      alert('파일 처리 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateTarget = (line: string, target: LineTarget) => {
    setState(prev => ({
      ...prev,
      targets: { ...prev.targets, [line]: target }
    }));
  };

  const clearData = () => {
    if (confirm('모든 데이터를 삭제하시겠습니까?')) {
      setState({ records: [], mappings: {}, targets: {} });
    }
  };

  const downloadReport = async () => {
    const lineStats = state.records.reduce((acc: any, curr) => {
      if (!acc[curr.line]) acc[curr.line] = { target: 0, actual: 0, defects: 0 };
      acc[curr.line].target += curr.target;
      acc[curr.line].actual += curr.actual;
      acc[curr.line].defects += curr.defects;
      return acc;
    }, {});

    Object.keys(lineStats).forEach(line => {
      const s = lineStats[line];
      s.achievement = s.target > 0 ? Math.round((s.actual / s.target) * 100) : 0;
    });

    const totalTarget = Object.values(lineStats).reduce((sum: number, s: any) => sum + s.target, 0);
    const totalActual = Object.values(lineStats).reduce((sum: number, s: any) => sum + s.actual, 0);
    const totalAchievement = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

    const warnings = Object.keys(lineStats).filter(line => {
      const s = lineStats[line];
      const t = state.targets[line] || { achievementThreshold: 85, defectThreshold: 5 };
      const defectRate = s.actual > 0 ? (s.defects / s.actual) * 100 : 0;
      return s.achievement < t.achievementThreshold || defectRate > t.defectThreshold;
    }).map(line => {
      const s = lineStats[line];
      const t = state.targets[line] || { achievementThreshold: 85, defectThreshold: 5 };
      const defectRate = (s.actual > 0 ? (s.defects / s.actual) * 100 : 0).toFixed(1);
      return `${line} 라인: 달성률 ${s.achievement}% (기준 ${t.achievementThreshold}%), 불량률 ${defectRate}% (기준 ${t.defectThreshold}%)`;
    });

    const summary = {
      totalAchievement,
      lineStats,
      warnings
    };

    await generateWordReport(state.records, state.targets, summary);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-black text-xs">PGM</div>
            <h1 className="text-lg font-bold tracking-tight">Smart Tracker</h1>
          </div>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold leading-none">Intelligent Monitoring</p>
        </div>
        
        <nav className="flex-1 py-6">
          <div className="px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Management</div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all border-l-4 ${
                activeTab === 'dashboard' 
                ? 'bg-slate-800 text-blue-400 border-blue-500' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('ingest')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all border-l-4 ${
                activeTab === 'ingest' 
                ? 'bg-slate-800 text-blue-400 border-blue-500' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Data Ingest</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all border-l-4 ${
                activeTab === 'settings' 
                ? 'bg-slate-800 text-blue-400 border-blue-500' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Threshold Rules</span>
            </button>
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <button
            onClick={downloadReport}
            disabled={state.records.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black py-3 rounded uppercase tracking-wider transition-colors disabled:opacity-30 shadow-lg shadow-blue-500/10"
          >
            <FileText className="w-4 h-4" />
            Word Report
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span>Home</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' ? 'Real-time Dashboard' : activeTab === 'ingest' ? 'Data Integration' : 'System Rules'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-xs font-bold text-slate-900">Manufacturing Tech Team</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">
                Last sync: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button
              onClick={clearData}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-lg"
              title="데이터 초기화"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 font-bold text-sm">
              TC
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard records={state.records} targets={state.targets} />
                )}
                {activeTab === 'ingest' && (
                  <DataIngest
                    onFilesProcessed={handleFilesProcessed}
                    existingMappings={state.mappings}
                  />
                )}
                {activeTab === 'settings' && (
                  <TargetSettings
                    lines={lines}
                    targets={state.targets}
                    onUpdate={handleUpdateTarget}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import { LineTarget } from '../types';
import { Target, ShieldAlert } from 'lucide-react';

interface Props {
  lines: string[];
  targets: Record<string, LineTarget>;
  onUpdate: (line: string, target: LineTarget) => void;
}

export const TargetSettings: React.FC<Props> = ({ lines, targets, onUpdate }) => {
  return (
    <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
      <div className="mb-8">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-blue-600" />
          Threshold & Goal Calibration
        </h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Define operational limits for manufacturing lines</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {lines.length === 0 && (
          <div className="col-span-full py-12 bg-slate-50 border border-dashed border-slate-200 rounded flex flex-col items-center justify-center text-center">
            <Target className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Lines Identified</p>
            <p className="text-[9px] text-slate-300 mt-1 uppercase">Integration required to synchronize line data</p>
          </div>
        )}
        {lines.map(line => {
          const config = targets[line] || {
            line,
            monthlyTarget: 0,
            weeklyTarget: 0,
            defectThreshold: 5,
            achievementThreshold: 85
          };

          const update = (field: keyof LineTarget, val: number) => {
            onUpdate(line, { ...config, [field]: val });
          };

          return (
            <div key={line} className="p-6 rounded-lg border border-slate-200 bg-white hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {line} Line Configuration
                </h3>
                <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
              </div>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Monthly Target</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.monthlyTarget}
                      onChange={(e) => update('monthlyTarget', parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <span className="absolute right-3 top-2 text-[9px] font-bold text-slate-300 uppercase">Qty</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Weekly Target</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.weeklyTarget}
                      onChange={(e) => update('weeklyTarget', parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <span className="absolute right-3 top-2 text-[9px] font-bold text-slate-300 uppercase">Qty</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-red-500 font-black uppercase tracking-widest">Defect Limit</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={config.defectThreshold}
                      onChange={(e) => update('defectThreshold', parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-bold px-3 py-2 bg-red-50/30 border border-red-100 rounded outline-none focus:ring-1 focus:ring-red-500 transition-all text-red-700"
                    />
                    <span className="absolute right-3 top-2 text-[9px] font-bold text-red-300 uppercase">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-blue-500 font-black uppercase tracking-widest">Goal Threshold</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.achievementThreshold}
                      onChange={(e) => update('achievementThreshold', parseInt(e.target.value) || 0)}
                      className="w-full text-xs font-bold px-3 py-2 bg-blue-50/30 border border-blue-100 rounded outline-none focus:ring-1 focus:ring-blue-500 transition-all text-blue-700"
                    />
                    <span className="absolute right-3 top-2 text-[9px] font-bold text-blue-300 uppercase">%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

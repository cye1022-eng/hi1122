import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from 'recharts';
import { ProductionRecord, LineTarget } from '../types';
import { AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

interface Props {
  records: ProductionRecord[];
  targets: Record<string, LineTarget>;
}

export const Dashboard: React.FC<Props> = ({ records, targets }) => {
  const lineStats = records.reduce((acc: any, curr) => {
    if (!acc[curr.line]) {
      acc[curr.line] = { name: curr.line, target: 0, actual: 0, defects: 0 };
    }
    acc[curr.line].target += curr.target;
    acc[curr.line].actual += curr.actual;
    acc[curr.line].defects += curr.defects;
    return acc;
  }, {});

  const chartData = Object.values(lineStats).map((stat: any) => ({
    ...stat,
    achievement: stat.target > 0 ? Math.round((stat.actual / stat.target) * 100) : 0,
    defectRate: stat.actual > 0 ? ((stat.defects / stat.actual) * 100).toFixed(1) : 0,
  }));

  const totalTarget = Object.values(lineStats).reduce((sum: number, s: any) => sum + s.target, 0);
  const totalActual = Object.values(lineStats).reduce((sum: number, s: any) => sum + s.actual, 0);
  const totalAchievement = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  const warnings = chartData.filter((d: any) => {
    const target = targets[d.name] || { achievementThreshold: 85, defectThreshold: 5 };
    return d.achievement < target.achievementThreshold || parseFloat(d.defectRate as string) > target.defectThreshold;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Target</p>
          <h3 className="text-2xl font-black text-slate-800">
            {totalTarget.toLocaleString()} <small className="text-xs font-normal text-slate-400">units</small>
          </h3>
        </div>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Overall Achievement</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-blue-600">{totalAchievement}%</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase">vs. Target</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, totalAchievement)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Avg Defect Rate</p>
          <h3 className="text-2xl font-black text-slate-800">
            {(chartData.reduce((sum, d) => sum + parseFloat(d.defectRate as string), 0) / (chartData.length || 1)).toFixed(2)}%
          </h3>
          <p className="text-[9px] text-green-500 font-black mt-1 uppercase tracking-tighter">Stable Trend Detection</p>
        </div>

        <div className={`p-5 rounded-lg border shadow-sm transition-colors ${warnings.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${warnings.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>Anomalies Detected</p>
          <h3 className={`text-2xl font-black ${warnings.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {warnings.length.toString().padStart(2, '0')} <small className="text-xs font-normal">Lines</small>
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Line Monitoring & Performance</h4>
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase">
                <span className="w-2 h-2 rounded-full bg-slate-200"></span> Target
              </span>
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="p-4 pl-6">Line ID</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Actual</th>
                  <th className="p-4">Achievement</th>
                  <th className="p-4">Defect</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-100">
                {chartData.map((d: any) => {
                  const target = targets[d.name] || { achievementThreshold: 85, defectThreshold: 5 };
                  const isLowAchievement = d.achievement < target.achievementThreshold;
                  const isHighDefect = parseFloat(d.defectRate as string) > target.defectThreshold;
                  const isAnomaly = isLowAchievement || isHighDefect;

                  return (
                    <tr key={d.name} className={`group hover:bg-slate-50/50 transition-colors ${isAnomaly ? 'bg-red-50/30' : ''}`}>
                      <td className="p-4 pl-6 font-bold text-slate-700">{d.name}</td>
                      <td className="p-4 text-slate-500 font-medium">{d.target.toLocaleString()}</td>
                      <td className={`p-4 font-bold ${isLowAchievement ? 'text-red-600' : 'text-slate-900'}`}>
                        {d.actual.toLocaleString()}
                      </td>
                      <td className={`p-4 font-black ${isLowAchievement ? 'text-red-600' : 'text-blue-600'}`}>
                        {d.achievement}%
                      </td>
                      <td className={`p-4 font-medium ${isHighDefect ? 'text-red-600' : 'text-slate-500'}`}>
                        {d.defectRate}%
                      </td>
                      <td className="p-4 text-center">
                        {isAnomaly ? (
                          <span className="bg-red-600 text-white px-2 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter">
                            {isLowAchievement && isHighDefect ? 'Critical' : isLowAchievement ? 'Delayed' : 'Quality'}
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 text-white rounded-lg p-6 shadow-xl border border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400">Production Comparison</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '4px', fontSize: '10px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar dataKey="actual" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="target" fill="#334155" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between">
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Avg Line Util</p>
                <p className="text-sm font-black">92.4%</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Sync Status</p>
                <p className="text-sm font-black text-green-500">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              Critical Issues
            </h4>
            <div className="space-y-3">
              {warnings.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-bold text-slate-400 uppercase italic">All systems normal</div>
              ) : (
                warnings.map((w: any) => (
                  <div key={w.name} className="p-3 bg-red-50 border-l-4 border-red-500 rounded flex flex-col gap-1">
                    <p className="text-[10px] font-black text-red-700 uppercase">{w.name} Line Failure</p>
                    <p className="text-[11px] text-red-600 font-medium leading-tight">
                      Achievement dropped to {w.achievement}% (Defect: {w.defectRate}%)
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

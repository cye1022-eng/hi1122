import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X, Check } from 'lucide-react';
import { ColumnMapping } from '../types';

interface Props {
  onFilesProcessed: (files: { file: File; mapping: ColumnMapping }[]) => void;
  existingMappings: Record<string, ColumnMapping>;
}

export const DataIngest: React.FC<Props> = ({ onFilesProcessed, existingMappings }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [tempMappings, setTempMappings] = useState<Record<string, ColumnMapping>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newTemp = { ...tempMappings };
      newFiles.forEach(f => {
        if (!newTemp[f.name]) {
          newTemp[f.name] = existingMappings[f.name] || {
            standardDate: 'Date',
            standardTarget: 'Target',
            standardActual: 'Actual',
            standardDefect: 'Defects',
            standardLine: 'Line'
          };
        }
      });
      setTempMappings(newTemp);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (activeFileIndex === index) setActiveFileIndex(null);
  };

  const updateMapping = (fileName: string, field: keyof ColumnMapping, value: string) => {
    setTempMappings(prev => ({
      ...prev,
      [fileName]: { ...prev[fileName], [field]: value }
    }));
  };

  const processFiles = () => {
    const data = files.map(file => ({
      file,
      mapping: tempMappings[file.name]
    }));
    onFilesProcessed(data);
    setFiles([]);
  };

  return (
    <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
      <div className="mb-8">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Upload className="w-4 h-4 text-blue-600" />
          Data Ingest Status
        </h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Multi-source excel synchronization</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
            <input
              type="file"
              multiple
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Drag Excel Files</p>
            <p className="text-[9px] text-slate-400 mt-1 uppercase">Multi-upload (up to 10 files)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] border-b border-slate-100 pb-1 mb-2">
              <span className="text-slate-500 font-bold uppercase tracking-widest">Active Queue</span>
              <span className="text-blue-600 font-bold underline cursor-pointer uppercase">History</span>
            </div>
            {files.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">No files in queue</p>
            ) : (
              files.map((file, i) => (
                <div
                  key={i}
                  onClick={() => setActiveFileIndex(i)}
                  className={`flex items-center justify-between p-2 rounded text-[11px] cursor-pointer transition-all ${
                    activeFileIndex === i ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2 text-slate-700 font-bold truncate pr-4">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeFileIndex === i ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></span>
                    {file.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-[9px]">{(file.size / 1024).toFixed(0)}KB</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="text-slate-300 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-50/50 rounded-lg border border-slate-100 p-6">
          {activeFileIndex !== null && files[activeFileIndex] ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  Mapping: {files[activeFileIndex].name}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {(Object.keys(tempMappings[files[activeFileIndex].name]) as Array<keyof ColumnMapping>).map(field => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                      {field.replace('standard', '')} Field
                    </label>
                    <input
                      type="text"
                      value={tempMappings[files[activeFileIndex].name][field]}
                      onChange={(e) => updateMapping(files[activeFileIndex].name, field, e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2.5 bg-white border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700"
                      placeholder={`Source column for ${field}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={processFiles}
                  className="w-full py-3 bg-slate-900 text-white rounded text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
                >
                  Commit Data Integration
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select a file to configure mapping</p>
              <p className="text-[10px] text-slate-300 mt-1">Configure source fields for synchronization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

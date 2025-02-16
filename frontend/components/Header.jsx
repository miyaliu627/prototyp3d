// components/Header.jsx
'use client';
import React from 'react';
import { Save } from 'lucide-react';

export default function Header({ onDownload, lastSaved, showAutoSave }) {
  return (
    <header className="bg-gradient-to-b from-slate-800/80 to-slate-900/0 p-2 relative">
      <div className="max-w-[95%] mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            prototyp3d
          </h1>
          {lastSaved && (
            <div className="animate-fade-out absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full transition-opacity">
              {showAutoSave ? 'Auto-saved to instance' : 'Saved to instance'}
            </div>
          )}
        </div>
        <button 
          onClick={onDownload}
          className="px-3 py-1.5 rounded-lg bg-slate-800/50 text-white hover:bg-slate-700/50 transition flex items-center gap-2 text-sm"
        >
          <Save size={14} />
          Download
        </button>
      </div>
    </header>
  );
}

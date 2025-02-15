// components/Header.jsx
'use client';
import React from 'react';
import { Save } from 'lucide-react';

export default function Header({ onDownload }) {
  return (
    <header className="bg-gradient-to-b from-slate-800/80 to-slate-900/0 p-2">
      <div className="max-w-[95%] mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            prototyp3d
          </h1>
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


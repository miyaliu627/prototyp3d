// components/FileNavigation.jsx
'use client';
import React from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';

export default function FileNavigation({ 
  files, 
  currentFile, 
  setCurrentFile, 
  isNavExpanded, 
  setIsNavExpanded 
}) {
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsNavExpanded(!isNavExpanded)}
        className="flex items-center gap-1 text-slate-400 hover:text-slate-300 mb-2"
      >
        {isNavExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Folder size={16} />
        <span className="text-xs">Project Files</span>
      </button>
      
      {isNavExpanded && (
        <div className="pl-6 space-y-1">
          {Object.keys(files).map(filename => (
            <button
              key={filename}
              onClick={() => setCurrentFile(filename)}
              className={`flex items-center gap-2 text-xs w-full px-2 py-1 rounded-md ${
                currentFile === filename
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <File size={14} />
              {filename}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


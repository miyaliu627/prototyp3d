// components/CodeEditor.jsx
'use client';
import React from 'react';
import { Terminal, Play } from 'lucide-react';
import FileNavigation from './FileNavigation.jsx';

export default function CodeEditor({ 
  files, 
  currentFile, 
  setCurrentFile, 
  setFiles, 
  isNavExpanded, 
  setIsNavExpanded, 
  onRenderPreview, 
  handleKeyDown 
}) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-slate-400" />
          <h2 className="text-white font-medium text-sm">Code Editor</h2>
        </div>
        <button 
          onClick={onRenderPreview}
          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition"
        >
          <Play size={14} className="text-green-400" />
        </button>
      </div>
      
      <FileNavigation
        files={files}
        currentFile={currentFile}
        setCurrentFile={setCurrentFile}
        isNavExpanded={isNavExpanded}
        setIsNavExpanded={setIsNavExpanded}
      />
      
      <textarea
        value={files[currentFile]}
        onChange={(e) => setFiles({ ...files, [currentFile]: e.target.value })}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-gradient-to-br from-slate-900/90 to-slate-900/70 rounded-lg p-3 font-mono text-sm text-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
        spellCheck="false"
      />
    </div>
  );
}

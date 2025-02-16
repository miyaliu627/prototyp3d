'use client';
import React, { useState } from 'react';
import { Save, Pencil } from 'lucide-react';

export default function Header({ onDownload, projectName, setProjectName }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProjectName(tempName);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTempName(projectName);
    }
  };

  return (
    <header className="bg-gradient-to-b from-slate-800/80 to-slate-900/0 p-2 relative">
      <div className="max-w-[95%] mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          prototyp3d
        </h1>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Project name (optional)..."
                className="w-64 bg-gradient-to-br from-slate-900/90 to-slate-900/70 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                autoFocus
              />
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-sm">
                {projectName || 'Untitled Project'}
              </span>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setTempName(projectName);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800/50 transition"
              >
                <Pencil size={14} className="text-slate-500 hover:text-slate-400" />
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={onDownload}
          className="px-3 py-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 transition flex items-center gap-2 text-sm"
        >
          <Save size={14} />
          Download
        </button>
      </div>
    </header>
  );
}

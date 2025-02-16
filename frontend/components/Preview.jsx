// components/Preview.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowsPointingOutIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Monitor } from "lucide-react";

export default function Preview({ previewRef }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  return (
    <div 
      className={`bg-gradient-to-bl from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col transition-all ${
        isFullScreen ? 'fixed inset-0 z-50 p-5 bg-slate-900' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Monitor className="h-5 w-5 mr-2 text-purple-400" />
          <h2 className="text-purple-400 font-medium text-sm font-sans font-bold">Preview</h2>
        </div>
        <button
          onClick={toggleFullScreen}
          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition"
          title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        >
          {isFullScreen ? <XMarkIcon size={14} className="h-5 w-5 text-red-400" /> : <ArrowsPointingOutIcon size={14} className="h-5 w-5 text-slate-400" />}
        </button>
      </div>
      <div 
        ref={previewRef}
        className="flex-1 bg-gradient-to-br from-slate-900/90 to-slate-900/70 rounded-lg"
      >
        <p className="text-slate-500 flex items-center justify-center h-full">Click Run to preview</p>
      </div>
    </div>
  );
}


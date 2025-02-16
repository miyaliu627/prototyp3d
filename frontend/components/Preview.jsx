// components/Preview.jsx
'use client';
import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Preview({ previewRef }) {
  return (
    <div className="bg-gradient-to-bl from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col">
      <h2 className="text-white font-medium mb-2 text-sm flex items-center">
        {/* Magnifying Glass Icon with matching color */}
        <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-slate-400" />
        Preview
      </h2>
      <div 
        ref={previewRef}
        className="flex-1 bg-gradient-to-br from-slate-900/90 to-slate-900/70 rounded-lg"
      >
        <p className="text-slate-500 flex items-center justify-center h-full">Click Run to preview</p>
      </div>
    </div>
  );
}


// components/CodeEditor.jsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Play, Copy, CheckCheck } from 'lucide-react';
import FileNavigation from './FileNavigation.jsx';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

const getLanguageFromFile = (filename) => {
  const ext = filename.split('.').pop();
  switch (ext) {
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
      return 'javascript';
    default:
      return 'plaintext';
  }
};

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
  const [isCopied, setIsCopied] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState('');
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  useEffect(() => {
    const language = getLanguageFromFile(currentFile);
    const html = Prism.highlight(files[currentFile], Prism.languages[language], language);
    setHighlightedContent(html);
  }, [files, currentFile]);

  const handleCopy = async () => {
    try {
      const textToCopy = files[currentFile];
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

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
      <div className="relative flex-1 overflow-hidden">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition z-20"
          title="Copy code"
        >
          {isCopied ? (
            <CheckCheck size={14} className="text-green-400" />
          ) : (
            <Copy size={14} className="text-slate-400" />
          )}
        </button>
        <div className="relative h-full">
          <textarea
            ref={textareaRef}
            value={files[currentFile]}
            onChange={(e) => setFiles({ ...files, [currentFile]: e.target.value })}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full bg-transparent font-mono text-sm text-transparent caret-white p-3 resize-none overflow-auto outline-none whitespace-pre-wrap"
            spellCheck="false"
          />
          <pre
            ref={preRef}
            className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-br from-slate-900/90 to-slate-900/75 rounded-lg p-3 font-mono text-sm text-slate-300 overflow-auto whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
      </div>
    </div>
  );
}

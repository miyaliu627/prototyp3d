// CodeEditor.jsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Play, Copy, CheckCheck } from 'lucide-react';
import FileNavigation from './FileNavigation';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

const TYPING_SPEED = 1;
const MAX_CHUNK_SIZE = 50;

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
  handleKeyDown,
  lastSaved,
  showAutoSave,
  projectName
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState('');
  const [displayedContent, setDisplayedContent] = useState('');
  const [modifiedFiles, setModifiedFiles] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const previousFilesRef = useRef({});
  const currentContentRef = useRef('');
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  useEffect(() => {
    if (!files || !previousFilesRef.current) return;

    Object.entries(files).forEach(([filename, content]) => {
      if (content !== previousFilesRef.current[filename]) {
        if (filename === currentFile) {
          animateCodeTyping(content);
        } else {
          setModifiedFiles(prev => new Set([...prev, filename]));
        }
      }
    });

    previousFilesRef.current = { ...files };
  }, [files]);

  useEffect(() => {
    if (files && currentFile) {
      const content = files[currentFile] || '';
      currentContentRef.current = content;
      
      if (!isAnimating) {
        setDisplayedContent(content);
        const language = getLanguageFromFile(currentFile);
        const html = Prism.highlight(content, Prism.languages[language], language);
        setHighlightedContent(html);
      }
    }
  }, [currentFile, files, isAnimating]);

  const animateCodeTyping = async (newContent) => {
    if (isAnimating) return;
    setIsAnimating(true);

    let currentText = '';
    const chunks = [];
    for (let i = 0; i < newContent.length; i += MAX_CHUNK_SIZE) {
      chunks.push(newContent.slice(i, i + MAX_CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      if (currentContentRef.current !== newContent) {
        break;
      }

      currentText += chunk;
      setDisplayedContent(currentText);
      
      const language = getLanguageFromFile(currentFile);
      const html = Prism.highlight(currentText, Prism.languages[language], language);
      setHighlightedContent(html);

      if (preRef.current) {
        preRef.current.scrollTop = preRef.current.scrollHeight;
      }

      await new Promise(resolve => setTimeout(resolve, TYPING_SPEED * chunk.length));
    }

    setIsAnimating(false);
  };

  const handleFileSelect = (filename) => {
    setIsAnimating(false);
    setModifiedFiles(prev => {
      const next = new Set(prev);
      next.delete(filename);
      return next;
    });
  };

  const handleCopy = async () => {
    try {
      if (files && currentFile) {
        const textToCopy = files[currentFile] || '';
        await navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
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
      <div className="flex items-center justify-between mb-2 relative">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-purple-400" />
          <h2 className="text-purple-400 font-medium text-sm font-sans font-bold">Code Editor</h2>
        </div>

        {lastSaved && (
          <div className="absolute left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full transition-opacity">
            {showAutoSave ? 'Auto-saved to remote instance' : 'Saved to remote instance'}
          </div>
        )}

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
        projectName={projectName}
        modifiedFiles={modifiedFiles}
        onFileSelect={handleFileSelect}
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
            value={files?.[currentFile] || ''}
            onChange={(e) => setFiles({ ...files, [currentFile]: e.target.value })}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full bg-transparent font-mono text-xs text-transparent caret-white p-3 resize-none overflow-auto outline-none whitespace-pre-wrap"
            spellCheck="false"          
          />
          <pre
            ref={preRef}
            className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-br from-slate-900/90 to-slate-900/75 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-auto whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
      </div>
    </div>
  );
}


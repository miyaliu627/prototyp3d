// app/page.js

'use client';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import Chat from '@/components/Chat';
import JSZip from 'jszip';
import { DEFAULT_FILES } from './defaultFiles';

export default function Home() {
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [currentFile, setCurrentFile] = useState('index.html');
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you with your 3D model?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef(null);
  const previewRef = useRef(null);

  const [lastSaved, setLastSaved] = useState(new Date());
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isAutoSave, setIsAutoSave] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const saveFiles = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;

      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(files),
      });
      
      if (!response.ok) throw new Error('Failed to save files');
      
      setLastSaved(new Date());
      setShowSaveNotification(true);
      renderPreview();

      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowSaveNotification(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving files:', error);
      // Optionally show an error notification
    }
  }, [files]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
    }
  };
  
  const renderPreview = async () => {
    if (previewRef.current) {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.background = 'transparent';
        
        previewRef.current.innerHTML = '';
        previewRef.current.appendChild(iframe);
        
        // Use the files from static/template directory
        const baseUrl = '/static/template/';
        const htmlContent = files['index.html']
          .replace('href="styles.css"', `href="${baseUrl}styles.css"`)
          .replace('src="script.js"', `src="${baseUrl}script.js"`);
        
        iframe.contentDocument.open();
        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();
      } catch (error) {
        console.error('Error rendering preview:', error);
      }
    }
  };

  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      setIsAutoSave(true);
      saveFiles().finally(() => {
        setTimeout(() => setIsAutoSave(false), 2000);
      });
    }, 30000);

    return () => {
      clearInterval(autoSaveInterval);
      setIsAutoSave(false);
    };
  }, [autoSaveEnabled, saveFiles]);

  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project-files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFiles();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [saveFiles]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '  ';
      const newContent = files[currentFile].substring(0, start) + spaces + files[currentFile].substring(end);
      setFiles({ ...files, [currentFile]: newContent });
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const compileFiles = () => {
    const cssBlob = new Blob([files['styles.css']], { type: 'text/css' });
    const cssUrl = URL.createObjectURL(cssBlob);
    
    const jsBlob = new Blob([files['script.js']], { type: 'text/javascript' });
    const jsUrl = URL.createObjectURL(jsBlob);
    
    const compiledHTML = files['index.html']
      .replace('href="styles.css"', `href="${cssUrl}"`)
      .replace('src="script.js"', `src="${jsUrl}"`);
    
    return compiledHTML;
  };

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col">
      <Header 
        onDownload={handleDownload} 
        lastSaved={showSaveNotification}
        showAutoSave={isAutoSave}
      />      
      <main className="flex-1 max-w-[95%] w-full mx-auto px-2 flex flex-col">
        <div className="flex-1 grid grid-cols-2 gap-3 h-[65vh]">
          <CodeEditor 
            files={files}
            currentFile={currentFile}
            setCurrentFile={setCurrentFile}
            setFiles={setFiles}
            isNavExpanded={isNavExpanded}
            setIsNavExpanded={setIsNavExpanded}
            onRenderPreview={renderPreview}
            handleKeyDown={handleKeyDown}
          />
          
          <Preview previewRef={previewRef} />
        </div>

        <Chat 
          chatMessages={chatMessages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          chatContainerRef={chatContainerRef}
        />
      </main>
    </div>
  );
}

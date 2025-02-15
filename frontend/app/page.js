'use client';
import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import Chat from '@/components/Chat';
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleDownload = () => {
    const zip = new Blob(
      [Object.entries(files).map(([name, content]) => `--- ${name} ---\n${content}`).join('\n\n')],
      { type: 'text/plain' }
    );
    const url = window.URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-files.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: inputMessage }]);
      setInputMessage('');
    }
  };

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

  const renderPreview = () => {
    if (previewRef.current) {
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.background = 'transparent';
      
      previewRef.current.innerHTML = '';
      previewRef.current.appendChild(iframe);
      
      const compiledContent = compileFiles();
      iframe.contentDocument.open();
      iframe.contentDocument.write(compiledContent);
      iframe.contentDocument.close();
    }
  };

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col">
      <Header onDownload={handleDownload} />
      
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

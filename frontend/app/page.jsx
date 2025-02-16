'use client';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import Chat from '@/components/Chat';
import JSZip from 'jszip';

export default function Home() {
  const [files, setFiles] = useState({});
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
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    async function loadFiles() {
      try {
        const response = await fetch('/api/load');
        if (!response.ok) throw new Error('Failed to load files');
        const loadedFiles = await response.json();

        if (!loadedFiles['index.html']) {
          console.warn("Warning: index.html is missing in API response!");
        }

        setFiles(loadedFiles);
      } catch (error) {
        console.error('Error loading files:', error);
      }
    }

    loadFiles();

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/load');
        if (!response.ok) throw new Error('Failed to load files');
        const latestFiles = await response.json();

        if (!latestFiles['index.html']) {
          console.warn("Polling Warning: index.html is missing in latest files!");
        }

        setFiles((prevFiles) => {
          const hasChanges = Object.entries(latestFiles).some(
            ([filename, content]) => prevFiles[filename] !== content
          );

          return hasChanges ? latestFiles : prevFiles;
        });

      } catch (error) {
        console.error('Error checking for file changes:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

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

      setTimeout(() => {
        setShowSaveNotification(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving files:', error);
    }
  }, [files]);

  const handleSendMessage = async () => {
    const response = await fetch('/prototype', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_prompt: inputMessage,
        project_name: 'your-project'
      })
    });
    
    const data = await response.json();
    
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: data.message,
      ticketData: {
        initial: data.initial_data,
        final: data.final_data
      }
    }]);
  };

  const renderPreview = async () => {
    if (!files || !files['index.html']) {
      console.error("Error: index.html is missing from files!", files);
      return;
    }

    if (previewRef.current) {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.background = 'transparent';

        previewRef.current.innerHTML = '';
        previewRef.current.appendChild(iframe);

        const baseUrl = '/static/product/';

        let htmlContent = files['index.html']
          ?.replace('href="styles.css"', `href="${baseUrl}styles.css"`)
          ?.replace('src="script.js"', `src="${baseUrl}script.js"`) || '';

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        renderPreview();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [renderPreview]);

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

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col">
      <Header 
        onDownload={handleDownload} 
        projectName={projectName}
        setProjectName={setProjectName}
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
            lastSaved={showSaveNotification}
            showAutoSave={isAutoSave}
            projectName={projectName}
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


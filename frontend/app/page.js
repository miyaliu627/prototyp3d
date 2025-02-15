'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, MessageSquare, Play, Save } from 'lucide-react';

export default function Home() {
  const [codeContent, setCodeContent] = useState(`// 3D Model Configuration
const model = {
  dimensions: [10, 20, 10],
  material: "metal",
  smoothness: 0.8
}`);

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you with your 3D model?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleDownload = () => {
    const blob = new Blob([codeContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model-config.html';
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

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col">
      {/* Header with gradient fade */}
      <header className="bg-gradient-to-b from-slate-800/80 to-slate-900/0 p-2">
        <div className="max-w-[95%] mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              prototyp3d
            </h1>
          </div>
          <button 
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-slate-800/50 text-white hover:bg-slate-700/50 transition flex items-center gap-2 text-sm"
          >
            <Save size={14} />
            Download
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[95%] w-full mx-auto px-2 flex flex-col">
        <div className="flex-1 grid grid-cols-2 gap-3 h-[65vh]">
          {/* Code Editor */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-slate-400" />
                <h2 className="text-white font-medium text-sm">Code Editor</h2>
              </div>
              <button className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition">
                <Play size={14} className="text-green-400" />
              </button>
            </div>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className="flex-1 bg-gradient-to-br from-slate-900/90 to-slate-900/70 rounded-lg p-3 font-mono text-sm text-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          {/* Preview Window */}
          <div className="bg-gradient-to-bl from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col">
            <h2 className="text-white font-medium mb-2 text-sm">Preview</h2>
            <div className="flex-1 bg-gradient-to-br from-slate-900/90 to-slate-900/70 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">3D Preview</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="mt-3 bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col h-[28vh]">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-slate-400" />
            <h2 className="text-white font-medium text-sm">AI Assistant</h2>
          </div>
          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-500/90 to-purple-600/90 ml-auto max-w-[80%]' 
                    : 'bg-gradient-to-r from-slate-700/90 to-slate-700/70 max-w-[80%]'
                }`}
              >
                <p className="text-white text-sm">{message.content}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe your 3D model requirements..."
              className="flex-1 bg-gradient-to-br from-slate-900/90 to-slate-900/70 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            <button 
              onClick={handleSendMessage}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

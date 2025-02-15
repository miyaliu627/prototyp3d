// components/Chat.jsx
'use client';
import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function Chat({ 
  chatMessages, 
  inputMessage, 
  setInputMessage, 
  handleSendMessage, 
  chatContainerRef 
}) {
  return (
    <div className="mt-3 bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col h-[28vh]">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={18} className="text-slate-400" />
        <h2 className="text-white font-medium text-sm">AI Assistant</h2>
      </div>
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
  );
}

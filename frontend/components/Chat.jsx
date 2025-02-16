import React, { useState, useRef } from 'react';
import { MessageSquare, Database, Loader2 } from 'lucide-react';

const Chat = ({ projectName }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCreatedPrototype, setHasCreatedPrototype] = useState(false);
  const chatContainerRef = useRef(null);

  const DataDisplay = ({ data, title }) => {
    if (!data) return null;
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg mb-2">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Database size={14} className="text-purple-400" />
            <h3 className="text-sm font-medium text-white">{title}</h3>
          </div>
          <div className="space-y-1">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-slate-400">{key}:</span>
                <span className="text-white ml-2">
                  {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setChatMessages(prev => [...prev, {
      role: 'user',
      content: inputMessage
    }]);

    setIsLoading(true);

    try {
      const endpoint = hasCreatedPrototype ? 'iterate' : 'create';
      const response = await fetch(`http://localhost:5001/prototype/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_prompt: inputMessage,
          project_name: projectName || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error}`
        }]);
        return;
      }

      if (!hasCreatedPrototype) {
        setHasCreatedPrototype(true);
      }

      data.ticket_responses?.forEach(ticketResponse => {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: ticketResponse.message,
          ticketData: {
            initial: ticketResponse.initial_data,
            final: ticketResponse.final_data
          }
        }]);
      });

      if (!data.ticket_responses?.length) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Success: ${data.success}. Repository path: ${data.repo_path}`
        }]);
      }

    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}. Make sure the backend server is running on port 5001.`
      }]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
      
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="mt-3 bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-lg p-3 flex flex-col h-[28vh]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-purple-400" />
          <h2 className="text-purple-400 font-medium text-sm font-sans font-bold">AI Assistant</h2>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
        {chatMessages.map((message, index) => (
          <div key={index}>
            <div className={`p-2.5 rounded-lg ${
              message.role === 'user' 
                ? 'bg-gradient-to-r from-purple-500/90 to-purple-600/90 ml-auto max-w-[80%]' 
                : 'bg-gradient-to-r from-slate-700/90 to-slate-700/70 max-w-[80%]'
            }`}>
              <p className="text-white text-sm">{message.content}</p>
            </div>
            {message.ticketData && (
              <>
                <DataDisplay 
                  data={message.ticketData.initial} 
                  title="Initial Ticket Data" 
                />
                <DataDisplay 
                  data={message.ticketData.final} 
                  title="Final Ticket Data" 
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder="Describe your 3D model requirements..."
          className="flex-1 bg-gradient-to-br from-slate-900/90 to-slate-900/70 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </div>
  );
};

export default Chat;

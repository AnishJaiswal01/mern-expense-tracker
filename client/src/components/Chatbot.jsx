import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your AI Financial Assistant. Ask me things like "Where am I spending the most?" or "How much did I spend last month?"' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { selectedMonth } = useSelector((state) => state.transactions);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { 
        message: userMessage.text,
        currentMonthStr: selectedMonth 
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I couldn't reach the server right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestPrompt = (text) => {
    setInput(text);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-surface border border-surface-lighter rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Financial Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-slate-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-surface-light flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.sender === 'user' ? 'bg-primary-600 text-white self-end rounded-tr-none' : 'bg-surface-lighter text-slate-200 self-start rounded-tl-none'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-surface-lighter text-slate-400 self-start rounded-lg rounded-tl-none p-3 text-sm flex gap-1">
                <span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span><span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
             <div className="p-2 bg-surface-light flex flex-wrap gap-2 text-xs border-t border-surface-lighter">
                <button onClick={() => suggestPrompt("Where am I spending the most?")} className="bg-surface border border-slate-700 text-primary-400 px-2 py-1 rounded-full hover:bg-surface-lighter transition-colors">Biggest expense?</button>
                <button onClick={() => suggestPrompt("Compare this month with last month")} className="bg-surface border border-slate-700 text-primary-400 px-2 py-1 rounded-full hover:bg-surface-lighter transition-colors">Compare months</button>
             </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-surface border-t border-surface-lighter flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-surface-lighter text-slate-100 rounded-lg px-3 py-2 text-sm border border-slate-700 focus:outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-3 py-2 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 transform rotate-45 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

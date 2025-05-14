import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Trash2, User } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content: input,
      type: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call Ollama API
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-r1:1.5b',
          messages: [
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content,
            })),
            { role: 'user', content: input },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Ollama');
      }

      const data = await response.json();

      // Add bot response
      const botMessage: Message = {
        id: Date.now(),
        content: data.message.content,
        type: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: Date.now(),
        content: "Error: Couldn't connect to Ollama. Make sure it's running with 'ollama run deepseek-r1:1.5b'",
        type: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-[#FFECDB] flex flex-col">
      {/* Header */}
      <div className="bg-[#60B5FF] p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="text-white" size={24} />
            <h1 className="text-2xl font-bold text-white">DeepSeek Chatbot</h1>
          </div>
          <button
            onClick={clearChat}
            className="text-white hover:text-red-100 transition-colors"
            title="Clear chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-[#60B5FF] text-white'
                      : 'bg-[#AFDDFF]'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User size={24} className="mb-2" />
                  ) : (
                    <Bot size={24} className="mb-2" />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#AFDDFF] p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t bg-white">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60B5FF]"
            />
            <button
              type="submit"
              className="bg-[#FF9149] text-white p-2 rounded-lg hover:bg-[#FF9149]/90 transition-colors"
              disabled={!input.trim() || isTyping}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
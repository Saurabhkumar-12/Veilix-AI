import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIChatModal({ isOpen, onClose, appName = 'this app', category = 'Utility', permissions = [] }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I am your Veilix AI Security Assistant. Ask me about ${appName}'s declared permissions or recommended access settings.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (questionText) => {
    const query = questionText || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = `Regarding your query about ${appName}: Most permissions requested by ${appName} serve specific features. You can safely manage or revoke non-essential permissions in Android Settings > Apps > ${appName} > Permissions.`;

      const qLower = query.toLowerCase();
      if (qLower.includes('bluetooth')) {
        botResponse = `${appName} uses Bluetooth to discover and stream audio to wireless headphones, speakers, or car systems. It is expected for audio/media features and does not allow reading your private files.`;
      } else if (qLower.includes('location') || qLower.includes('gps')) {
        botResponse = `Location permission allows ${appName} to provide localized features (like nearby places or navigation). If you don't use location features, you can safely select "While using app" or "Don't allow" in Android Settings.`;
      } else if (qLower.includes('revoke') || qLower.includes('deny')) {
        botResponse = `If you revoke a permission in Android, the app will ask again when that specific feature is used. Core features will continue working normally!`;
      } else if (qLower.includes('camera') || qLower.includes('microphone') || qLower.includes('mic')) {
        botResponse = `Camera and Microphone access are high-sensitivity permissions. Android displays a green indicator light in the top status bar whenever any app accesses them.`;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 600);
  };

  const PRESET_QUESTIONS = [
    `Why does ${appName} request its permissions?`,
    'Can I safely deny Location access?',
    'What happens if I revoke Camera permission?',
    'Is this app safe to install?'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md animate-fadeIn">
      <div className="glass-panel rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="bg-indigo-950/80 p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                AI Privacy Assistant <Sparkles className="w-3 h-3 text-cyan-400" />
              </h4>
              <span className="text-[10px] text-indigo-300 font-medium">Contextual Security Helper</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#09090B]/90 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-cyan-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              <div
                className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/30 rounded-tr-none'
                    : 'bg-slate-900/80 text-slate-200 border border-white/10 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs italic p-2">
              <Bot className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
              <span>AI Assistant is analyzing...</span>
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="p-2 bg-slate-950/60 border-t border-white/5 flex gap-1.5 overflow-x-auto text-[10px]">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/10 text-slate-300 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-white/10 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask a question about this app's permissions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-9 px-3 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

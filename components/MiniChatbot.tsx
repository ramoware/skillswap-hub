'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'help';
}

interface MiniChatbotProps {
  className?: string;
}

export default function MiniChatbot({ className = '' }: MiniChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hi! I\'m your SkillSwap assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const quickSuggestions = [
    'How do I find skill matches?',
    'How to create a session?',
    'What skills are trending?',
    'How to improve my profile?',
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(inputValue.trim());
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        type: response.type
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (input: string): { text: string; type: 'text' | 'suggestion' | 'help' } => {
    const lowerInput = input.toLowerCase();

    // Skill matching queries
    if (lowerInput.includes('match') || lowerInput.includes('find') || lowerInput.includes('skill')) {
      return {
        text: 'I can help you find perfect skill matches! Our AI analyzes compatibility based on skill levels, categories, and learning goals. Try browsing the Matches page or use the advanced filters to discover users with complementary skills.',
        type: 'suggestion'
      };
    }

    // Session creation queries
    if (lowerInput.includes('session') || lowerInput.includes('create') || lowerInput.includes('host')) {
      return {
        text: 'Creating a session is easy! Go to the Sessions page and click "New Session". Choose your skill to teach, set the date/time, and invite participants. You can also join existing sessions to learn new skills.',
        type: 'help'
      };
    }

    // Profile improvement queries
    if (lowerInput.includes('profile') || lowerInput.includes('improve') || lowerInput.includes('better')) {
      return {
        text: 'To improve your profile: 1) Add detailed skill descriptions 2) Set accurate skill levels 3) Upload a professional photo 4) Complete your bio 5) Add your LinkedIn/GitHub links. This helps our AI find better matches for you!',
        type: 'suggestion'
      };
    }

    // Trending skills queries
    if (lowerInput.includes('trending') || lowerInput.includes('popular') || lowerInput.includes('demand')) {
      return {
        text: 'Currently trending skills include: AI/ML, Web Development, UI/UX Design, Data Science, and Digital Marketing. These skills have high demand and many potential matches available.',
        type: 'suggestion'
      };
    }

    // General help queries
    if (lowerInput.includes('help') || lowerInput.includes('how') || lowerInput.includes('what')) {
      return {
        text: 'I\'m here to help! You can ask me about: finding skill matches, creating sessions, improving your profile, trending skills, or any other SkillSwap features. What would you like to know?',
        type: 'help'
      };
    }

    // Default responses
    const defaultResponses = [
      'That\'s interesting! Could you tell me more about what you\'re looking for?',
      'I\'d be happy to help with that. Can you provide more details?',
      'Great question! Let me know if you need help with skill matching, sessions, or profile optimization.',
      'I understand you\'re looking for help. Feel free to ask about any SkillSwap features!',
    ];

    return {
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      type: 'text'
    };
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">SkillSwap Assistant</h3>
                <p className="text-xs opacity-90">AI-Powered Help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : message.type === 'suggestion'
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-gray-800'
                      : message.type === 'help'
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4" />
                      <span className="text-xs font-medium">Assistant</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span className="text-xs font-medium">Assistant is typing</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-glow transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import aiService from '../services/aiService';
import type { ChatMessage, ChatResponse } from '../services/aiService';

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai_chat_messages');
    const savedConversationId = localStorage.getItem('ai_conversation_id');

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    }

    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_chat_messages', JSON.stringify(messages));
    }
    if (conversationId) {
      localStorage.setItem('ai_conversation_id', conversationId);
    }
  }, [messages, conversationId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await aiService.chat({
        message: userMessage.content,
        conversationId,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation? This cannot be undone.')) {
      setMessages([]);
      setConversationId(undefined);
      localStorage.removeItem('ai_chat_messages');
      localStorage.removeItem('ai_conversation_id');
    }
  };

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isOpen) {
      setHasUnreadMessages(false);
    }
  }, [isOpen]);

  // Set unread flag when new assistant message arrives and chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setHasUnreadMessages(true);
      }
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Fitness Coach</h3>
                <p className="text-xs text-white text-opacity-80">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {messages.length > 0 && (
                <button
                  onClick={handleClearConversation}
                  className="hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full p-4 mb-3">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Start a Conversation</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Ask me about workouts, goals, or fitness advice!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            {hasUnreadMessages && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                !
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
};

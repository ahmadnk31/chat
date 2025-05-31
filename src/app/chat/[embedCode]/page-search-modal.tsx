"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, Bot, User, Minimize2, MessageSquare, Search, X } from "lucide-react";

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

interface ChatbotConfig {
  id: string;
  name: string;
  type: string;
  welcomeMessage: string;
  placeholder: string;
  primaryColor: string;
}

export default function ChatPage() {
  const params = useParams();
  const [chatbot, setChatbot] = useState<ChatbotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatbot = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat/${params.embedCode}`);
      if (response.ok) {
        const data = await response.json();
        setChatbot(data);
        // Add welcome message
        setMessages([{
          id: '1',
          role: 'ASSISTANT',
          content: data.welcomeMessage,
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error fetching chatbot:', error);
    }
  }, [params.embedCode]);

  useEffect(() => {
    if (params.embedCode) {
      fetchChatbot();
    }
  }, [params.embedCode, fetchChatbot]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !chatbot) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content: userMessage,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ASSISTANT',
          content: data.message,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ASSISTANT',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !chatbot) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(`/api/chatbots/${chatbot.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: searchQuery,
          sessionId: 'search-' + Math.random().toString(36).substring(7)
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Parse the response to extract search results
        setSearchResults([{
          id: Date.now().toString(),
          title: "Search Result",
          content: data.message,
          relevance: 100
        }]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([{
        id: Date.now().toString(),
        title: "Error",
        content: "Sorry, I couldn't process your search. Please try again.",
        relevance: 0
      }]);
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleSearchModal = () => {
    if (chatbot?.type === 'DOCS_SEARCH_ENGINE') {
      setShowSearchModal(!showSearchModal);
    }
  };

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Search Modal for Documentation Search Engine */}
        {showSearchModal && chatbot.type === 'DOCS_SEARCH_ENGINE' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div 
                className="flex items-center justify-between p-4 text-white"
                style={{ backgroundColor: chatbot.primaryColor }}
              >
                <div className="flex items-center">
                  <Search className="h-6 w-6 mr-2" />
                  <span className="font-medium">Search {chatbot.name}</span>
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="p-4 border-b">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading || !searchQuery.trim()}
                    className="px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:bg-gray-300"
                    style={{ 
                      backgroundColor: !searchLoading && searchQuery.trim() ? chatbot.primaryColor : undefined 
                    }}
                  >
                    {searchLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Search Results */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <h3 className="font-medium text-gray-900 mb-2">{result.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{result.content}</p>
                      </div>
                    ))}
                  </div>
                ) : searchQuery && !searchLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No results found. Try different keywords.</p>
                  </div>
                ) : !searchQuery ? (
                  <div className="text-center text-gray-500 py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Enter your search query above to find relevant information.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Chat Widget */}
        <div 
          className={`bg-white rounded-lg shadow-xl transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-96'
          }`}
          style={{ borderColor: chatbot.primaryColor }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 rounded-t-lg text-white cursor-pointer"
            style={{ backgroundColor: chatbot.primaryColor }}
            onClick={chatbot.type === 'DOCS_SEARCH_ENGINE' ? toggleSearchModal : undefined}
          >
            <div className="flex items-center">
              {chatbot.type === 'DOCS_SEARCH_ENGINE' ? (
                <Search className="h-6 w-6 mr-2" />
              ) : (
                <Bot className="h-6 w-6 mr-2" />
              )}
              <span className="font-medium">{chatbot.name}</span>
              {chatbot.type === 'DOCS_SEARCH_ENGINE' && (
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  Click to Search
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isMinimized ? <MessageSquare className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
            </button>
          </div>

          {!isMinimized && (
            <>
              {chatbot.type === 'DOCS_SEARCH_ENGINE' ? (
                /* Search Interface */
                <div className="h-64 p-4 flex flex-col items-center justify-center text-center">
                  <Search className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Documentation Search</h3>
                  <p className="text-gray-600 mb-4">Click on the header above to open the search interface and find answers in our documentation.</p>
                  <button
                    onClick={toggleSearchModal}
                    className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: chatbot.primaryColor }}
                  >
                    Open Search
                  </button>
                </div>
              ) : (
                /* Regular Chat Interface */
                <>
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex items-start space-x-2 max-w-xs ${
                            message.role === 'USER' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${
                              message.role === 'USER' 
                                ? 'bg-gray-400' 
                                : 'bg-blue-600'
                            }`}
                            style={{
                              backgroundColor: message.role === 'ASSISTANT' ? chatbot.primaryColor : undefined
                            }}
                          >
                            {message.role === 'USER' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              message.role === 'USER'
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2 max-w-xs">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
                            style={{ backgroundColor: chatbot.primaryColor }}
                          >
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t p-4">
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={chatbot.placeholder}
                        disabled={loading}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:bg-gray-300"
                        style={{ 
                          backgroundColor: !loading && input.trim() ? chatbot.primaryColor : undefined 
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Powered by */}
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ChatBase
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

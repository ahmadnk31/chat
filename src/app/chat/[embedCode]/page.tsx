"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, Bot, User, Minimize2, MessageSquare, Search, X } from "lucide-react";

import TypingAnimation from "@/components/TypingAnimation";
import MessageRenderer from "@/components/MessageRenderer";

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
  const params = useParams();  const [chatbot, setChatbot] = useState<ChatbotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);const fetchChatbot = useCallback(async () => {
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
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change or when typing completes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setMessages(prev => [...prev, newUserMessage]);    try {
      const response = await fetch(`/api/chat/${params.embedCode}`, {
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
  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim() || !chatbot) {
      setSearchResults([]);
      return;
    }
      setSearchLoading(true);
    try {
      const response = await fetch(`/api/chat/${params.embedCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId: 'search-' + Math.random().toString(36).substring(7)
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Parse the response to extract multiple search results
        const results = parseSearchResults(data.message, query);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([{
        id: Date.now().toString(),
        title: "Error",
        content: "Sorry, I couldn't process your search. Please try again.",
        relevance: 0,
        query: query
      }]);
    } finally {
      setSearchLoading(false);
    }
  };

  const parseSearchResults = (response: string, query: string) => {
    // Split response into logical sections or sentences for better UX
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    return sentences.slice(0, 5).map((sentence, index) => ({
      id: `result-${Date.now()}-${index}`,
      title: `Related to "${query}"`,
      content: sentence.trim() + (sentence.trim().endsWith('.') ? '' : '.'),
      relevance: Math.max(60, 90 - (index * 10)),
      query: query,
      isExpandable: true
    }));
  };  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setIsTyping(true);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for real-time search
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      if (value.trim().length >= 2) {
        handleSearch(value);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms delay for better UX
    
    setSearchTimeout(newTimeout);
  };  const handleResultClick = (result: any) => {
    // Show the result details in the modal instead of opening a new page
    setSelectedResult(result);
  };
  const toggleSearchModal = () => {
    if (chatbot?.type === 'DOCS_SEARCH_ENGINE') {      if (!showSearchModal) {
        // Reset search state when opening modal
        setSearchQuery("");
        setSearchResults([]);
        setSelectedResult(null);
        setIsTyping(false);
        setSearchLoading(false);
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          setSearchTimeout(null);
        }
      }
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
        {/* Chat Widget */}
        <div 
          className={`bg-white rounded-lg shadow-xl transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-96'
          }`}
          style={{ borderColor: chatbot.primaryColor }}
        >
          {/* Header */}
          <div 
            className={`flex items-center justify-between p-4 rounded-t-lg text-white cursor-pointer ${
              chatbot.type === 'DOCS_SEARCH_ENGINE' ? 'hover:opacity-90' : ''
            }`}
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
                    >                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${
                          message.role === 'USER' 
                            ? 'bg-gray-400' 
                            : ''
                        }`}
                        style={{
                          backgroundColor: message.role === 'ASSISTANT' ? chatbot.primaryColor : undefined
                        }}
                      >
                        {message.role === 'USER' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>                      <div
                        className={`px-3 py-2 rounded-lg ${
                          message.role === 'USER'
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-white'
                        }`}
                        style={{
                          backgroundColor: message.role === 'ASSISTANT' ? chatbot.primaryColor : undefined
                        }}
                      >                        <MessageRenderer content={message.content} role={message.role} />
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
                      </div>                      <div 
                        className="rounded-lg text-white text-sm"
                        style={{ backgroundColor: chatbot.primaryColor }}
                      >
                        <TypingAnimation primaryColor={chatbot.primaryColor} />
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
        </div>        {/* Powered by */}
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ChatBase
            </Link>
          </span>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && chatbot.type === 'DOCS_SEARCH_ENGINE' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-4 rounded-t-lg text-white"
              style={{ backgroundColor: chatbot.primaryColor }}
            >
              <div className="flex items-center">
                <Search className="h-6 w-6 mr-2" />
                <span className="font-medium">Search {chatbot.name}</span>
              </div>              <button
                onClick={() => {
                  setShowSearchModal(false);
                  // Reset search state when closing modal
                  setTimeout(() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setSelectedResult(null);
                    setIsTyping(false);
                    setSearchLoading(false);
                    if (searchTimeout) {
                      clearTimeout(searchTimeout);
                      setSearchTimeout(null);
                    }
                  }, 300);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder="Start typing to search..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {(searchLoading || isTyping) && (
                  <div className="flex items-center px-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && !isTyping && (
                <p className="text-xs text-gray-500 mt-1">Type at least 2 characters to search</p>
              )}
              {isTyping && searchQuery.trim().length >= 2 && (
                <p className="text-xs text-blue-500 mt-1">Searching...</p>
              )}
            </div>            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {selectedResult ? (
                /* Selected Result Details */
                <div className="p-4">
                  <div className="flex items-center mb-4">
                    <button
                      onClick={() => setSelectedResult(null)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ← Back to results
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mr-2">
                        Search Result
                      </span>
                      <span className="text-xs text-gray-500">
                        Query: "{searchQuery}"
                      </span>
                    </div>                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedResult.content}
                      </p>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          // Insert this result into the chat
                          const userMessage = `I found this in the search: "${selectedResult.content.substring(0, 100)}..." Can you explain this further?`;
                          setInput(userMessage);
                          setShowSearchModal(false);
                          setSelectedResult(null);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Ask about this
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedResult.content);
                          // You could add a toast notification here
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                /* Results List */
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                  </div>
                  <div className="space-y-3">
                    {searchResults.map((result, index) => (                      <div 
                        key={result.id}
                        className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                      >
                        <div 
                          className="flex items-start justify-between cursor-pointer"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mr-2">
                                #{index + 1}
                              </span>
                              {result.relevance && (
                                <span className="text-xs text-gray-500">
                                  {result.relevance}% relevant
                                </span>
                              )}
                            </div>                            <p className="text-sm text-gray-700 leading-relaxed" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {result.content}
                            </p>
                          </div>                          <div className="ml-2 text-gray-400">
                            <span className="text-xs">Click to view →</span>
                          </div>
                        </div>
                        
                        {/* Quick actions */}
                        <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const userMessage = `I found this in the search: "${result.content.substring(0, 100)}..." Can you explain this further?`;
                              setInput(userMessage);
                              setShowSearchModal(false);
                              setSelectedResult(null);
                            }}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            💬 Ask about this
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResult(result);
                            }}
                            className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            📖 View full
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchQuery.trim().length >= 2 && !searchLoading && !isTyping ? (
                <div className="text-center text-gray-500 py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No results found for &quot;{searchQuery}&quot;</p>
                  <p className="text-sm mt-2">Try different keywords or check your spelling.</p>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Start typing to search through the documentation</p>
                  <p className="text-sm mt-2">Results will appear as you type.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

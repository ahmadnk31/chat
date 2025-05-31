"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Bot, Search, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [chatbot, setChatbot] = useState<any>(null);
  const [relatedResults, setRelatedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const query = searchParams.get('query') || '';
  const resultId = searchParams.get('resultId') || '';
  const content = searchParams.get('content') || '';
  const chatbotId = searchParams.get('chatbotId') || '';
  const chatbotName = searchParams.get('chatbotName') || '';

  useEffect(() => {
    if (chatbotId) {
      fetchRelatedResults();
    }
  }, [chatbotId, query]);

  const fetchRelatedResults = async () => {
    if (!chatbotId || !query) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Find more information related to: ${query}`,
          sessionId: 'related-' + Math.random().toString(36).substring(7)
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Parse additional results
        const results = parseAdditionalResults(data.message, query);
        setRelatedResults(results);
      }
    } catch (error) {
      console.error('Error fetching related results:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseAdditionalResults = (response: string, query: string) => {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    return sentences.slice(0, 3).map((sentence, index) => ({
      id: `related-${Date.now()}-${index}`,
      title: `Additional Information ${index + 1}`,
      content: sentence.trim() + (sentence.trim().endsWith('.') ? '' : '.'),
      relevance: Math.max(70, 85 - (index * 5))
    }));
  };

  const handleNewSearch = (newQuery: string) => {
    const searchParams = new URLSearchParams({
      query: newQuery,
      chatbotId: chatbotId,
      chatbotName: chatbotName
    });
    
    router.push(`/search-result?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-800">{chatbotName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Query Display */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-500">Search Query</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{query}</h1>
        </div>

        {/* Main Result */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Search Result</h2>
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Primary Match
            </span>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{content}</p>
          </div>
        </div>

        {/* Related Results Section */}
        {relatedResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Related Information</h3>
            <div className="space-y-4">
              {relatedResults.map((result) => (
                <div key={result.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{result.title}</h4>
                    <span className="text-xs text-gray-500">
                      {result.relevance}% relevant
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{result.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              Finding related information...
            </div>
          </div>
        )}

        {/* Search Again Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Again</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter a new search query..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    handleNewSearch(target.value.trim());
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Enter a new search query..."]') as HTMLInputElement;
                if (input?.value.trim()) {
                  handleNewSearch(input.value.trim());
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Suggested Searches */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Searches</h3>
          <div className="flex flex-wrap gap-2">
            {[
              `More about ${query}`,
              `${query} examples`,
              `${query} best practices`,
              `How to ${query}`,
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleNewSearch(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

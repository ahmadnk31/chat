import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface DocsCrawlFormProps {
  chatbotId: string;
  onComplete: (results: any) => void;
  userPlan?: {
    plan: 'free' | 'pro' | 'enterprise';
    hasFirecrawlAccess: boolean;
    features: {
      maxUrlsPerCrawl: number;
      advancedCrawling: boolean;
    };
  };
}

export default function DocsCrawlForm({ chatbotId, onComplete, userPlan }: DocsCrawlFormProps) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [urls, setUrls] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Predefined documentation templates
  const templates = {
    shadcn: {
      name: 'shadcn/ui Documentation',
      baseUrl: 'https://ui.shadcn.com',
      urls: [
        'https://ui.shadcn.com/docs/installation',
        'https://ui.shadcn.com/docs/installation/next',
        'https://ui.shadcn.com/docs/installation/vite',
        'https://ui.shadcn.com/docs/installation/remix',
        'https://ui.shadcn.com/docs/components/button',
        'https://ui.shadcn.com/docs/components/input',
        'https://ui.shadcn.com/docs/components/form',
        'https://ui.shadcn.com/docs/components/dialog',
        'https://ui.shadcn.com/docs/components/card',
        'https://ui.shadcn.com/docs/components/table'
      ]
    },
    nextjs: {
      name: 'Next.js Documentation',
      baseUrl: 'https://nextjs.org',
      urls: [
        'https://nextjs.org/docs/getting-started/installation',
        'https://nextjs.org/docs/app/building-your-application/routing',
        'https://nextjs.org/docs/app/building-your-application/data-fetching',
        'https://nextjs.org/docs/app/building-your-application/rendering',
        'https://nextjs.org/docs/app/api-reference/components/image',
        'https://nextjs.org/docs/app/api-reference/components/link'
      ]
    },
    react: {
      name: 'React Documentation',
      baseUrl: 'https://react.dev',
      urls: [
        'https://react.dev/learn/start-a-new-react-project',
        'https://react.dev/learn/describing-the-ui',
        'https://react.dev/learn/adding-interactivity',
        'https://react.dev/learn/managing-state',
        'https://react.dev/reference/react/useState',
        'https://react.dev/reference/react/useEffect'
      ]
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    setName(template.name);
    setBaseUrl(template.baseUrl);
    setUrls(template.urls.join('\n'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !urls.trim()) {
      toast.error('Please provide a name and at least one URL');
      return;
    }

    const urlList = urls.split('\n').map(url => url.trim()).filter(url => url);
      if (urlList.length === 0) {
      toast.error('Please provide at least one valid URL');
      return;
    }

    // Check URL limit based on user plan
    if (userPlan && urlList.length > userPlan.features.maxUrlsPerCrawl) {
      toast.error(`URL limit exceeded. Your ${userPlan.plan} plan allows up to ${userPlan.features.maxUrlsPerCrawl} URLs per crawl.`);
      return;
    }

    // Validate URLs
    const invalidUrls = urlList.filter(url => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      toast.error(`Invalid URLs found: ${invalidUrls.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const response = await fetch('/api/docs-crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbotId,
          baseUrl: baseUrl || urlList[0],
          urls: urlList,
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to crawl documentation');
      }

      setResults(data);
      toast.success(`Successfully crawled ${data.summary.successfulSources} pages with ${data.summary.totalChunks} chunks!`);
      onComplete(data);

    } catch (error) {
      console.error('Error crawling documentation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to crawl documentation');
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Documentation Crawler</h3>
        <p className="text-sm text-gray-600 mb-4">
          Crawl multiple pages from a documentation site to create a comprehensive knowledge base for your chatbot.
        </p>
        
        {/* Plan Information */}
        {userPlan && (
          <div className={`p-3 rounded-lg border ${
            userPlan.hasFirecrawlAccess 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-sm capitalize">
                  {userPlan.plan} Plan
                </span>
                <span className="ml-2 text-xs text-gray-600">
                  • Up to {userPlan.features.maxUrlsPerCrawl} URLs per crawl
                </span>
              </div>
              {userPlan.hasFirecrawlAccess && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Advanced Crawling ✨
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {userPlan.hasFirecrawlAccess 
                ? 'Using advanced Firecrawl technology for better content extraction and faster processing.'
                : 'Using standard crawling method. Upgrade to Pro for advanced crawling with better content extraction.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Templates */}
      <div>
        <label className="block text-sm font-medium mb-2">Quick Templates</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(templates).map(([key, template]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTemplateSelect(key)}
              className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-gray-500">{template.urls.length} pages</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Documentation Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., shadcn/ui Documentation"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
            required
          />
        </div>

        <div>
          <label htmlFor="baseUrl" className="block text-sm font-medium mb-1">
            Base URL (Optional)
          </label>
          <input
            id="baseUrl"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://ui.shadcn.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
        </div>        <div>
          <label htmlFor="urls" className="block text-sm font-medium mb-1">
            URLs to Crawl * <span className="text-gray-500">(one per line)</span>
            {userPlan && (
              <span className="ml-2 text-xs text-gray-500">
                ({urls.split('\n').filter(url => url.trim()).length}/{userPlan.features.maxUrlsPerCrawl} URLs)
              </span>
            )}
          </label>
          <textarea
            id="urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={`https://ui.shadcn.com/docs/installation
https://ui.shadcn.com/docs/installation/next
https://ui.shadcn.com/docs/components/button`}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            disabled={isProcessing}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter one URL per line. The crawler will extract text content and create searchable chunks.
            {userPlan && userPlan.features.maxUrlsPerCrawl < 50 && (
              <span className="block text-blue-600 mt-1">
                💡 Upgrade to Pro for up to 50 URLs per crawl and advanced Firecrawl technology.
              </span>
            )}
          </p>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !name.trim() || !urls.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Crawling Documentation...' : 'Start Crawling'}
        </button>
      </form>      {/* Results */}
      {results && (
        <div className="border rounded-lg p-4 bg-green-50">
          <h4 className="font-semibold text-green-800 mb-2">Crawling Results</h4>
          <div className="text-sm space-y-1">
            <p>✅ Successfully processed: {results.summary.successfulSources}/{results.summary.totalUrls} pages</p>
            <p>📦 Total chunks created: {results.summary.totalChunks}</p>
            {results.summary.userPlan && (
              <p>🔧 Crawling method: {results.summary.crawlingMethod === 'firecrawl' ? 'Advanced (Firecrawl)' : 'Standard'}</p>
            )}
            {results.summary.failedSources > 0 && (
              <p className="text-red-600">❌ Failed pages: {results.summary.failedSources}</p>
            )}
          </div>
          
          {results.results && results.results.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium">View detailed results</summary>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {results.results.map((result: any, index: number) => (
                  <div key={index} className="text-xs p-2 bg-white rounded border">
                    <div className={`font-medium ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.success ? '✅' : '❌'} {result.url}
                    </div>
                    {result.success ? (
                      <div className="text-gray-600">
                        {result.chunks} chunks created ({result.contentLength} characters)
                        {result.method && (
                          <span className="ml-2 text-gray-500">• {result.method}</span>
                        )}
                        {result.title && (
                          <div className="text-gray-500 truncate">Title: {result.title}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-600">{result.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">
              Crawling documentation pages and generating embeddings...
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            This may take a few minutes depending on the number of pages.
          </p>
        </div>
      )}
    </div>
  );
}

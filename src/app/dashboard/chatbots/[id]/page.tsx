"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  MessageSquare, 
  Settings, 
  Code, 
  Eye,
  FileText,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Copy
} from "lucide-react";

interface Chatbot {
  id: string;
  name: string;
  description: string;
  welcomeMessage: string;
  placeholder: string;
  primaryColor: string;
  isPublic: boolean;
  embedCode: string;
  dataSources: DataSource[];
  _count: {
    conversations: number;
  };
}

interface DataSource {
  id: string;
  type: string;
  name: string;
  url?: string;
  status: string;
  errorMessage?: string;
  _count: {
    chunks: number;
  };
}

export default function ChatbotDetailPage() {
  const params = useParams();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const fetchChatbot = useCallback(async () => {
    try {
      const response = await fetch(`/api/chatbots/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setChatbot(data);
      }
    } catch (error) {
      console.error('Error fetching chatbot:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchChatbot();
    }
  }, [params.id, fetchChatbot]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chatbot not found</h3>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const embedScript = `<script>
  window.chatbaseConfig = {
    chatbotId: "${chatbot.id}",
    domain: "${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}"
  };
  (function() {
    var script = document.createElement('script');
    script.src = '${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/embed.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/dashboard" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{chatbot.name}</h1>
          <p className="text-gray-600 mt-2">{chatbot.description}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/chat/${chatbot.embedCode}`}
            target="_blank"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
          <Link
            href={`/dashboard/chatbots/${chatbot.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "data"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Data Sources
          </button>
          <button
            onClick={() => setActiveTab("embed")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "embed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Embed Code
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{chatbot.dataSources.length}</div>
                <div className="text-sm text-gray-600">Data Sources</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{chatbot._count.conversations}</div>
                <div className="text-sm text-gray-600">Conversations</div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {chatbot.dataSources.reduce((acc, ds) => acc + ds._count.chunks, 0)}
                </div>
                <div className="text-sm text-gray-600">Content Chunks</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-gray-500">
                No recent activity to display
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/chat/${chatbot.embedCode}`}
                  target="_blank"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Test Chatbot
                </Link>
                <button
                  onClick={() => copyToClipboard(embedScript)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Copy Embed Code
                </button>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${chatbot.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                    {chatbot.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Primary Color:</span>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2" 
                      style={{ backgroundColor: chatbot.primaryColor }}
                    ></div>
                    <span className="font-mono">{chatbot.primaryColor}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Welcome Message:</span>
                  <span className="font-medium text-right max-w-32 truncate">
                    {chatbot.welcomeMessage}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Sources</h3>
            <Link
              href={`/dashboard/chatbots/${chatbot.id}/sources/new`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Data Source
            </Link>
          </div>

          <div className="space-y-4">
            {chatbot.dataSources.map((source) => (
              <div key={source.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {source.type === 'PDF' && <FileText className="h-5 w-5 text-red-600" />}
                      {source.type === 'URL' && <Globe className="h-5 w-5 text-blue-600" />}
                      {source.type === 'WEBSITE' && <Globe className="h-5 w-5 text-green-600" />}
                      {source.type === 'TEXT' && <FileText className="h-5 w-5 text-gray-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{source.name}</h4>
                      {source.url && (
                        <p className="text-sm text-gray-600 mt-1">{source.url}</p>
                      )}
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600 mr-4">
                          {source._count.chunks} chunks
                        </span>
                        <div className="flex items-center">
                          {source.status === 'COMPLETED' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                              <span className="text-sm text-green-600">Processed</span>
                            </>
                          )}
                          {source.status === 'PROCESSING' && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                              <span className="text-sm text-yellow-600">Processing</span>
                            </>
                          )}
                          {source.status === 'FAILED' && (
                            <>
                              <XCircle className="h-4 w-4 text-red-600 mr-1" />
                              <span className="text-sm text-red-600">Failed</span>
                            </>
                          )}
                        </div>
                      </div>
                      {source.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">{source.errorMessage}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {chatbot.dataSources.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources</h3>
              <p className="text-gray-600 mb-6">
                Add PDFs, websites, or text content to train your chatbot
              </p>
              <Link
                href={`/dashboard/chatbots/${chatbot.id}/sources/new`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
              >
                Add Your First Data Source
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "embed" && (
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Embed Your Chatbot</h3>            <p className="text-gray-600 mb-6">
              Copy and paste this code into your website&apos;s HTML to embed your chatbot.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embed Code
                </label>
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{embedScript}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(embedScript)}
                    className="absolute top-2 right-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direct Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/chat/${chatbot.embedCode}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/chat/${chatbot.embedCode}`)}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Integration Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Place the embed code just before the closing &lt;/body&gt; tag</li>
                <li>• The chatbot will appear as a floating button in the bottom-right corner</li>
                <li>• Customize the appearance in the chatbot settings</li>
                <li>• Test the integration in a staging environment first</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Globe, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";

export default function NewChatbotPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [chatbotData, setChatbotData] = useState({
    name: "",
    description: "",
    welcomeMessage: "Hello! How can I help you today?",
    placeholder: "Type your message...",
    primaryColor: "#000000"
  });
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateChatbot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...chatbotData,
          dataSources
        })
      });

      if (response.ok) {
        const chatbot = await response.json();
        router.push(`/dashboard/chatbots/${chatbot.id}`);
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDataSource = (source: any) => {
    setDataSources([...dataSources, { ...source, id: Date.now() }]);
  };

  const removeDataSource = (id: number) => {
    setDataSources(dataSources.filter(source => source.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/dashboard" className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Chatbot</h1>
          <p className="text-gray-600 mt-2">Build an AI chatbot trained on your data</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className="ml-2 text-sm font-medium text-gray-600">Basic Info</div>
        </div>
        <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className="ml-2 text-sm font-medium text-gray-600">Data Sources</div>
        </div>
        <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
          <div className="ml-2 text-sm font-medium text-gray-600">Customize</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={chatbotData.name}
                  onChange={(e) => setChatbotData({...chatbotData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Customer Support Bot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={chatbotData.description}
                  onChange={(e) => setChatbotData({...chatbotData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what your chatbot will help with..."
                />
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!chatbotData.name}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Next: Add Data Sources
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <DataSourcesStep
            dataSources={dataSources}
            onAddSource={addDataSource}
            onRemoveSource={removeDataSource}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customize Your Chatbot</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <input
                  type="text"
                  value={chatbotData.welcomeMessage}
                  onChange={(e) => setChatbotData({...chatbotData, welcomeMessage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={chatbotData.placeholder}
                  onChange={(e) => setChatbotData({...chatbotData, placeholder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={chatbotData.primaryColor}
                  onChange={(e) => setChatbotData({...chatbotData, primaryColor: e.target.value})}
                  className="w-16 h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateChatbot}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creating...' : 'Create Chatbot'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DataSourcesStep({ dataSources, onAddSource, onRemoveSource, onNext, onBack }: any) {
  const [sourceType, setSourceType] = useState('');
  const [sourceData, setSourceData] = useState<{ url: string; file: File | null; text: string }>({ url: '', file: null, text: '' });

  const handleAddSource = () => {
    if (sourceType === 'url' && sourceData.url) {
      onAddSource({ type: 'URL', url: sourceData.url, name: sourceData.url });
    } else if (sourceType === 'text' && sourceData.text) {
      onAddSource({ type: 'TEXT', content: sourceData.text, name: 'Text Input' });
    } else if (sourceType === 'file' && sourceData.file) {
      onAddSource({ type: 'PDF', file: sourceData.file, name: sourceData.file.name });
    }
    
    setSourceType('');
    setSourceData({ url: '', file: null, text: '' });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Data Sources</h2>
      
      {/* Data Source Types */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setSourceType('file')}
          className={`p-6 border-2 rounded-lg text-center transition-colors ${
            sourceType === 'file' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <h3 className="font-medium text-gray-900">Upload PDF</h3>
          <p className="text-sm text-gray-600 mt-1">Upload PDF documents</p>
        </button>

        <button
          onClick={() => setSourceType('url')}
          className={`p-6 border-2 rounded-lg text-center transition-colors ${
            sourceType === 'url' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <h3 className="font-medium text-gray-900">Website URL</h3>
          <p className="text-sm text-gray-600 mt-1">Scrape website content</p>
        </button>

        <button
          onClick={() => setSourceType('text')}
          className={`p-6 border-2 rounded-lg text-center transition-colors ${
            sourceType === 'text' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
          <h3 className="font-medium text-gray-900">Plain Text</h3>
          <p className="text-sm text-gray-600 mt-1">Paste text directly</p>
        </button>
      </div>

      {/* Source Input Forms */}
      {sourceType === 'url' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
          <div className="flex space-x-2">
            <input
              type="url"
              value={sourceData.url}
              onChange={(e) => setSourceData({...sourceData, url: e.target.value})}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
            <button
              onClick={handleAddSource}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {sourceType === 'file' && (        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF</label>
          <div className="flex space-x-2">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSourceData({...sourceData, file});
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddSource}
              disabled={!sourceData.file}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {sourceType === 'text' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
          <textarea
            value={sourceData.text}
            onChange={(e) => setSourceData({...sourceData, text: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
            rows={4}
            placeholder="Paste your text content here..."
          />
          <button
            onClick={handleAddSource}
            disabled={!sourceData.text}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {/* Added Sources */}
      {dataSources.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Added Sources</h3>
          <div className="space-y-2">
            {dataSources.map((source: any) => (
              <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {source.type === 'PDF' && <FileText className="h-5 w-5 text-red-600 mr-2" />}
                  {source.type === 'URL' && <LinkIcon className="h-5 w-5 text-blue-600 mr-2" />}
                  {source.type === 'TEXT' && <FileText className="h-5 w-5 text-gray-600 mr-2" />}
                  <span className="text-sm font-medium text-gray-900">{source.name}</span>
                  <span className="ml-2 text-xs text-gray-500">({source.type})</span>
                </div>
                <button
                  onClick={() => onRemoveSource(source.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={dataSources.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Next: Customize
        </button>
      </div>
    </div>
  );
}

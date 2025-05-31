'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Globe, FileText, Link as LinkIcon, Trash2 } from "lucide-react";
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
  const [uploadedDataSources, setUploadedDataSources] = useState<string[]>([]);
  const [webDataSources, setWebDataSources] = useState<{url: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempChatbotId, setTempChatbotId] = useState<string | null>(null);

  const handleCreateChatbot = async () => {
    if (step < 3) {
      // Create chatbot first if we haven't yet
      if (!tempChatbotId && step === 1) {
        try {
          const response = await fetch('/api/chatbots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatbotData)
          });

          if (response.ok) {
            const chatbot = await response.json();
            setTempChatbotId(chatbot.id);
            setStep(step + 1);
          }
        } catch (error) {
          console.error('Error creating chatbot:', error);
        }
      } else {
        setStep(step + 1);
      }
      return;
    }

    // Final step - update chatbot with customizations
    setLoading(true);
    try {
      if (tempChatbotId) {
        const response = await fetch(`/api/chatbots/${tempChatbotId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatbotData)
        });

        if (response.ok) {
          router.push(`/dashboard/chatbots/${tempChatbotId}`);
        }
      }
    } catch (error) {
      console.error('Error updating chatbot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadComplete = (dataSourceId: string) => {
    setUploadedDataSources(prev => [...prev, dataSourceId]);
  };
  const handleAddWebSource = async (url: string, name: string) => {
    if (!tempChatbotId) return;

    try {
      const response = await fetch('/api/datasources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: tempChatbotId,
          type: 'WEBSITE',
          name,
          url
        })
      });

      const data = await response.json();

      if (response.ok) {
        setWebDataSources(prev => [...prev, { url, name }]);
        console.log('Web source added successfully:', data);
      } else {
        console.error('Failed to add web source:', data);
        alert(`Failed to add website source: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding web source:', error);
      alert('Error adding website source. Please check the URL and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Create New Chatbot</h1>
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
                  onClick={handleCreateChatbot}
                  disabled={!chatbotData.name}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Next: Add Data Sources
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Data Sources</h2>
              <div className="space-y-8">
                {/* File Upload */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
                  {tempChatbotId && (
                    <FileUpload
                      chatbotId={tempChatbotId}
                      onUploadComplete={handleFileUploadComplete}
                      onError={(error) => console.error('Upload error:', error)}
                    />
                  )}
                </div>

                {/* Website Sources */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Website Sources</h3>
                  <WebSourceForm onAdd={handleAddWebSource} />
                  {webDataSources.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {webDataSources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{source.name}</p>
                              <p className="text-xs text-gray-500">{source.url}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateChatbot}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Next: Customize
                </button>
              </div>
            </div>
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
    </div>
  );
}

function WebSourceForm({ onAdd }: { onAdd: (url: string, name: string) => void }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && name) {
      onAdd(url, name);
      setUrl('');
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Company FAQ"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={!url || !name}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Add Website Source
      </button>
    </form>
  );
}

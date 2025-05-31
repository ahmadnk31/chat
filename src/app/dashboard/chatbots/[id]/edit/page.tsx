"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

interface Chatbot {
  id: string;
  name: string;
  description: string;
  welcomeMessage: string;
  placeholder: string;
  primaryColor: string;
  isPublic: boolean;
}

export default function EditChatbotPage() {
  const params = useParams();
  const router = useRouter();
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!chatbot) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/chatbots/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatbot)
      });

      if (response.ok) {
        router.push(`/dashboard/chatbots/${params.id}`);
      }
    } catch (error) {
      console.error('Error saving chatbot:', error);
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href={`/dashboard/chatbots/${params.id}`} className="mr-4">
          <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Edit Chatbot</h1>
          <p className="text-gray-600 mt-2">Customize your chatbot&apos;s appearance and behavior</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="space-y-8">
          {/* Basic Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={chatbot.name}
                  onChange={(e) => setChatbot({...chatbot, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={chatbot.isPublic ? 'public' : 'private'}
                  onChange={(e) => setChatbot({...chatbot, isPublic: e.target.value === 'public'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={chatbot.description}
                onChange={(e) => setChatbot({...chatbot, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Messages */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Messages</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <input
                  type="text"
                  value={chatbot.welcomeMessage}
                  onChange={(e) => setChatbot({...chatbot, welcomeMessage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hello! How can I help you today?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={chatbot.placeholder}
                  onChange={(e) => setChatbot({...chatbot, placeholder: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Type your message..."
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Appearance</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={chatbot.primaryColor}
                  onChange={(e) => setChatbot({...chatbot, primaryColor: e.target.value})}
                  className="w-16 h-10 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={chatbot.primaryColor}
                  onChange={(e) => setChatbot({...chatbot, primaryColor: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview</h2>
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="max-w-sm mx-auto">
                <div 
                  className="rounded-lg shadow-lg overflow-hidden"
                  style={{ borderColor: chatbot.primaryColor }}
                >
                  <div 
                    className="p-4 text-white"
                    style={{ backgroundColor: chatbot.primaryColor }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm">🤖</span>
                      </div>
                      <span className="font-medium">{chatbot.name}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4">
                    <div className="bg-gray-100 rounded-lg p-3 mb-4">
                      <span className="text-sm text-gray-700">{chatbot.welcomeMessage}</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder={chatbot.placeholder}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        disabled
                      />
                      <button
                        className="px-4 py-2 rounded-lg text-white text-sm"
                        style={{ backgroundColor: chatbot.primaryColor }}
                        disabled
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

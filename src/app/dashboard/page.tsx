"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, MoreVertical, Eye, Edit, Trash2, Plus } from "lucide-react";

interface Chatbot {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  _count: {
    dataSources: number;
    conversations: number;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const response = await fetch('/api/chatbots');
      if (response.ok) {
        const data = await response.json();
        setChatbots(data);
      }
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChatbot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chatbot?')) return;

    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChatbots(chatbots.filter(bot => bot.id !== id));
      }
    } catch (error) {
      console.error('Error deleting chatbot:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Chatbots</h1>
          <p className="text-gray-600 mt-2">Manage your AI chatbots and their data sources</p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Chatbot
        </Link>
      </div>

      {chatbots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chatbots yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first chatbot to get started with AI-powered customer support
          </p>
          <Link
            href="/dashboard/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Chatbot
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chatbots.map((chatbot) => (
            <div key={chatbot.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{chatbot.name}</h3>
                    <p className="text-sm text-gray-600">{chatbot.description}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Sources:</span>
                  <span className="font-medium">{chatbot._count.dataSources}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Conversations:</span>
                  <span className="font-medium">{chatbot._count.conversations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${chatbot.isPublic ? 'text-green-600' : 'text-gray-600'}`}>
                    {chatbot.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/chatbots/${chatbot.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View
                </Link>
                <Link
                  href={`/dashboard/chatbots/${chatbot.id}/edit`}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => deleteChatbot(chatbot.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

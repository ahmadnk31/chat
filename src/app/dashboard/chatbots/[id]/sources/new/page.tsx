"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Globe, FileText, Upload } from "lucide-react";

export default function NewDataSourcePage() {
  const params = useParams();
  const router = useRouter();
  const [sourceType, setSourceType] = useState<'URL' | 'TEXT' | 'PDF'>('URL');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    content: '',
    file: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const sourceData = {
        type: sourceType,
        name: formData.name,
        url: sourceType === 'URL' ? formData.url : undefined,
        content: sourceType === 'TEXT' ? formData.content : undefined,
      };

      const response = await fetch(`/api/chatbots/${params.id}/sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sourceData),
      });

      if (response.ok) {
        router.push(`/dashboard/chatbots/${params.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create data source');
      }
    } catch (err) {
      setError('An error occurred while creating the data source');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/dashboard/chatbots/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chatbot
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Data Source</h1>
          <p className="text-gray-600 mt-2">
            Add content to train your chatbot. You can add websites, text content, or upload PDF files.
          </p>
        </div>

        {/* Source Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Data Source Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setSourceType('URL')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                sourceType === 'URL'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className={`h-6 w-6 mb-2 ${sourceType === 'URL' ? 'text-blue-500' : 'text-gray-400'}`} />
              <h3 className="font-medium text-gray-900">Website URL</h3>
              <p className="text-sm text-gray-500">Crawl and extract content from a website</p>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('TEXT')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                sourceType === 'TEXT'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className={`h-6 w-6 mb-2 ${sourceType === 'TEXT' ? 'text-blue-500' : 'text-gray-400'}`} />
              <h3 className="font-medium text-gray-900">Text Content</h3>
              <p className="text-sm text-gray-500">Paste or type content directly</p>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('PDF')}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                sourceType === 'PDF'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Upload className={`h-6 w-6 mb-2 ${sourceType === 'PDF' ? 'text-blue-500' : 'text-gray-400'}`} />
              <h3 className="font-medium text-gray-900">PDF File</h3>
              <p className="text-sm text-gray-500">Upload a PDF document</p>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Data Source Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Product Documentation, FAQ, User Guide"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* URL Input */}
            {sourceType === 'URL' && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/docs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The content from this URL will be extracted and used to train your chatbot.
                </p>
              </div>
            )}

            {/* Text Content */}
            {sourceType === 'TEXT' && (
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Paste your content here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This text will be used to train your chatbot. Make sure it's relevant and well-formatted.
                </p>
              </div>
            )}

            {/* PDF Upload */}
            {sourceType === 'PDF' && (
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">PDF upload is coming soon!</p>
                  <p className="text-xs text-gray-400">
                    For now, please use URL or Text content options.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/dashboard/chatbots/${params.id}`}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || (sourceType === 'PDF')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Data Source
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

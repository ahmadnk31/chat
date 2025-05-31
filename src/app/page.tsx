import Link from "next/link";
import { Bot, FileText, Globe, MessageSquare, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">ChatBase</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Create AI Chatbots
              <span className="text-blue-600 block">from Your Data</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Build intelligent customer support chatbots by training AI on your PDFs, websites, and documents. 
              Embed them anywhere with a simple script.
            </p>
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-flex items-center"
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Building Now
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to build smart chatbots
              </h2>
              <p className="text-lg text-gray-600">
                Upload your data, customize your bot, and deploy anywhere
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Data Sources</h3>
                <p className="text-gray-600">
                  Upload PDFs, scrape websites, or paste URLs. We&apos;ll extract and process all the text.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart AI Responses</h3>
                <p className="text-gray-600">
                  Powered by GPT-3.5, your chatbot provides accurate answers based on your content.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
                <p className="text-gray-600">
                  Add your chatbot to any website with a simple embed code. No coding required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to transform your customer support?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Create your first AI chatbot in minutes
            </p>
            <Link 
              href="/dashboard" 
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-block"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

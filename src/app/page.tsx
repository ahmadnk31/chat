import Link from "next/link";
import { Bot, FileText, Globe, MessageSquare, Zap, Shield, Clock, Users, BarChart3, Code, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

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
                  Upload PDFs, scrape websites, or paste URLs. We&apos;ll extract and process all the text automatically.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart AI Responses</h3>
                <p className="text-gray-600">
                  Powered by advanced AI models, your chatbot provides accurate, contextual answers based on your content.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
                <p className="text-gray-600">
                  Add your chatbot to any website with a simple embed code. No coding or complex setup required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600">
                Get your AI chatbot up and running in 3 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Your Data</h3>
                <p className="text-gray-600 mb-4">
                  Upload PDFs, paste website URLs, or add text content. Our system will automatically process and chunk your data for optimal AI training.
                </p>
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
                </div>
              </div>

              <div className="text-center">
                <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Train Your Bot</h3>
                <p className="text-gray-600 mb-4">
                  Our AI automatically learns from your content using advanced vector embeddings and semantic search to provide accurate responses.
                </p>
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400 hidden md:block" />
                </div>
              </div>

              <div className="text-center">
                <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Deploy Anywhere</h3>
                <p className="text-gray-600">
                  Copy the embed code and paste it into your website. Your chatbot is ready to help your customers 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Powerful Features for Modern Businesses
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to create professional AI chatbots
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Responses</h3>
                  <p className="text-gray-600 text-sm">
                    Advanced language models provide natural, contextual responses based on your training data.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                  <p className="text-gray-600 text-sm">
                    Your data is encrypted and stored securely. We never share your information with third parties.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Availability</h3>
                  <p className="text-gray-600 text-sm">
                    Your chatbot works around the clock, providing instant support to customers worldwide.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Code className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Integration</h3>
                  <p className="text-gray-600 text-sm">
                    Simple embed code that works with any website, CMS, or platform. No technical expertise required.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600 text-sm">
                    Track conversations, monitor performance, and gain insights into customer interactions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multi-Bot Management</h3>
                  <p className="text-gray-600 text-sm">
                    Create and manage multiple chatbots for different purposes, departments, or websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Perfect for Any Business
              </h2>
              <p className="text-lg text-gray-600">
                See how different industries use our chatbot platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Support</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Provide instant answers to common questions, reduce support tickets, and improve customer satisfaction.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    FAQ automation
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    24/7 support coverage
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentation Helper</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Turn your documentation into an interactive assistant that helps users find information quickly.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    API documentation
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    User manuals
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Assistant</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Help potential customers learn about your products and services, qualify leads automatically.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Product information
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Lead qualification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Built with Modern Technology
              </h2>
              <p className="text-lg text-gray-600">
                Powered by cutting-edge AI and robust infrastructure
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced AI Architecture</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-1 rounded">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Vector Embeddings</h4>
                      <p className="text-gray-600 text-sm">
                        Advanced semantic search using vector embeddings for accurate content matching
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-1 rounded">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Smart Chunking</h4>
                      <p className="text-gray-600 text-sm">
                        Intelligent document processing that maintains context and meaning
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-1 rounded">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Context-Aware Responses</h4>
                      <p className="text-gray-600 text-sm">
                        AI that understands context and provides relevant, accurate answers
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Supported Data Formats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border text-center">
                    <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <span className="text-sm font-medium">PDF Files</span>
                  </div>
                  <div className="bg-white p-3 rounded border text-center">
                    <Globe className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <span className="text-sm font-medium">Websites</span>
                  </div>
                  <div className="bg-white p-3 rounded border text-center">
                    <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <span className="text-sm font-medium">Text Content</span>
                  </div>
                  <div className="bg-white p-3 rounded border text-center">
                    <Code className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <span className="text-sm font-medium">APIs</span>
                  </div>
                </div>
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
              Join thousands of businesses using AI chatbots to improve customer experience
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-flex items-center"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Free Trial
              </Link>
              <Link 
                href="/dashboard" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-block"
              >
                View Demo
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              No credit card required • Setup in 5 minutes • 14-day free trial
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center mb-4">
                  <Bot className="h-8 w-8 text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-white">ChatBase</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Build intelligent AI chatbots from your data. Provide 24/7 customer support with the power of artificial intelligence.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Create Chatbot</Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Analytics</Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Integrations</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">API Reference</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Community</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                {                  new Date().getFullYear()
                }©
                 ChatBase. All rights reserved. Built with Next.js and powered by AI.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

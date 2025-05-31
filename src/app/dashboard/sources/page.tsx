'use client';

import { useState, useEffect } from 'react';
import { FileText, Globe, Link as LinkIcon, Upload, Trash2, Search, RefreshCw } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

interface DataSource {
  id: string;
  name: string;
  type: 'PDF' | 'WEBSITE' | 'URL' | 'TEXT';
  chatbotName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  chunksCount?: number;
}

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState('');

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockDataSources: DataSource[] = [
        {
          id: '1',
          name: 'Product Documentation.pdf',
          type: 'PDF',
          chatbotName: 'Customer Support Bot',
          status: 'COMPLETED',
          fileSize: 2048576,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:35:00Z',
          chunksCount: 45
        },
        {
          id: '2',
          name: 'https://company.com/faq',
          type: 'WEBSITE',
          chatbotName: 'FAQ Bot',
          status: 'COMPLETED',
          createdAt: '2024-01-14T15:20:00Z',
          updatedAt: '2024-01-14T15:25:00Z',
          chunksCount: 23
        },
        {
          id: '3',
          name: 'User Manual v2.pdf',
          type: 'PDF',
          chatbotName: 'Technical Support',
          status: 'PROCESSING',
          fileSize: 5242880,
          createdAt: '2024-01-16T09:15:00Z',
          updatedAt: '2024-01-16T09:15:00Z'
        },
        {
          id: '4',
          name: 'Privacy Policy Text',
          type: 'TEXT',
          chatbotName: 'Legal Assistant',
          status: 'FAILED',
          createdAt: '2024-01-13T14:45:00Z',
          updatedAt: '2024-01-13T14:50:00Z',
          errorMessage: 'Text content too short'
        },
        {
          id: '5',
          name: 'https://blog.company.com',
          type: 'URL',
          chatbotName: 'Content Bot',
          status: 'PENDING',
          createdAt: '2024-01-16T11:30:00Z',
          updatedAt: '2024-01-16T11:30:00Z'
        }
      ];
      
      setTimeout(() => {
        setDataSources(mockDataSources);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
      setLoading(false);
    }
  };

  const handleDeleteDataSource = async (id: string) => {
    if (confirm('Are you sure you want to delete this data source?')) {
      try {
        // API call to delete data source
        setDataSources(dataSources.filter(ds => ds.id !== id));
      } catch (error) {
        console.error('Failed to delete data source:', error);
      }
    }
  };

  const handleReprocessDataSource = async (id: string) => {
    try {
      // API call to reprocess data source
      setDataSources(dataSources.map(ds => 
        ds.id === id ? { ...ds, status: 'PROCESSING' as const } : ds
      ));
    } catch (error) {
      console.error('Failed to reprocess data source:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-4 w-4 text-red-600" />;
      case 'WEBSITE': return <Globe className="h-4 w-4 text-blue-600" />;
      case 'URL': return <LinkIcon className="h-4 w-4 text-green-600" />;
      case 'TEXT': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredDataSources = dataSources.filter(ds => {
    const matchesSearch = ds.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ds.chatbotName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || ds.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || ds.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
          <p className="text-gray-600 mt-2">Manage all your training data across chatbots</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search data sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="PDF">PDF</option>
              <option value="WEBSITE">Website</option>
              <option value="URL">URL</option>
              <option value="TEXT">Text</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Sources Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chatbot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size / Chunks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDataSources.map((dataSource) => (
                <tr key={dataSource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getTypeIcon(dataSource.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {dataSource.name}
                        </div>
                        <div className="text-sm text-gray-500">{dataSource.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dataSource.chatbotName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dataSource.status)}`}>
                      {dataSource.status.toLowerCase()}
                    </span>
                    {dataSource.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">{dataSource.errorMessage}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatFileSize(dataSource.fileSize)}</div>
                    {dataSource.chunksCount && (
                      <div className="text-xs">{dataSource.chunksCount} chunks</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(dataSource.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {dataSource.status === 'FAILED' && (
                        <button
                          onClick={() => handleReprocessDataSource(dataSource.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Reprocess"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDataSource(dataSource.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDataSources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data sources found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL' 
                ? 'Try adjusting your filters or search term.' 
                : 'Get started by uploading your first data source.'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Data Source</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Chatbot
                </label>
                <select
                  value={selectedChatbot}
                  onChange={(e) => setSelectedChatbot(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a chatbot...</option>
                  <option value="1">Customer Support Bot</option>
                  <option value="2">FAQ Bot</option>
                  <option value="3">Technical Support</option>
                </select>
              </div>
              
              {selectedChatbot && (
                <FileUpload
                  chatbotId={selectedChatbot}
                  onUploadComplete={() => {
                    setShowUploadModal(false);
                    fetchDataSources();
                  }}
                  onError={(error) => {
                    console.error('Upload error:', error);
                  }}
                />
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import CredentialForm from '../components/CredentialForm'
import CredentialList from '../components/CredentialList'
import FolderManager from '../components/FolderManager'
import UserManager from '../components/UserManager'
import Toast from '../components/Toast'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [credentials, setCredentials] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('credentials')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  useEffect(() => {
    fetchCredentials()
    fetchFolders()
  }, [])

  useEffect(() => {
    // Auto-select first folder when folders are loaded
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0])
    }
  }, [folders, selectedFolder])

  const fetchCredentials = async () => {
    try {
      const response = await api.get('/credentials')
      setCredentials(response.data || [])
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await api.get('/folders')
      setFolders(response.data || [])
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    }
  }

  const handleCreate = () => {
    setEditingCredential(null)
    setShowForm(true)
  }

  const handleEdit = (credential) => {
    setEditingCredential(credential)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credential?')) return

    try {
      await api.delete(`/credentials/${id}`)
      showToast('Credential deleted successfully!', 'success')
      fetchCredentials()
    } catch (error) {
      showToast('Failed to delete credential', 'error')
    }
  }

  const handleFormClose = (success, action) => {
    setShowForm(false)
    setEditingCredential(null)
    if (success) {
      const message = action === 'create' 
        ? '✨ Credential created successfully!' 
        : '✏️ Credential updated successfully!'
      showToast(message, 'success')
      fetchCredentials()
    }
  }

  const filteredCredentials = selectedFolder 
    ? credentials.filter(cred => cred.folder_id === selectedFolder.id)
    : []

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Credential Vault</h1>
                <p className="text-xs text-gray-400">Enterprise Security Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <div className="flex items-center justify-end space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-200">
                    {user?.role}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-900 text-purple-200">
                    {user?.user_group}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium border border-gray-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1.5 rounded-xl border border-gray-700">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
              activeTab === 'credentials' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Credentials</span>
            </div>
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('folders')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                  activeTab === 'folders' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span>Folders</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                  activeTab === 'users' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Users</span>
                </div>
              </button>
            </>
          )}
        </div>

        {activeTab === 'credentials' && (
          <>
            {/* Folder Filter */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Environment</h3>
              <div className="flex flex-wrap gap-3">
                {folders && folders.length > 0 ? (
                  folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 border ${
                        selectedFolder?.id === folder.id 
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/50' 
                          : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span>{folder.name}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400">No folders available</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedFolder ? selectedFolder.name : 'Credentials'}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedFolder ? `Manage ${selectedFolder.name} environment credentials` : 'Select an environment'}
                </p>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={handleCreate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-blue-500/50 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Credential</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-400">Loading credentials...</p>
                </div>
              </div>
            ) : (
              <CredentialList
                credentials={filteredCredentials}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={user?.role === 'admin'}
              />
            )}
          </>
        )}

        {activeTab === 'folders' && user?.role === 'admin' && (
          <FolderManager folders={folders} onUpdate={fetchFolders} />
        )}

        {activeTab === 'users' && user?.role === 'admin' && (
          <UserManager />
        )}

        {showForm && (
          <CredentialForm
            credential={editingCredential}
            folders={folders}
            onClose={handleFormClose}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </div>
  )
}

export default Dashboard

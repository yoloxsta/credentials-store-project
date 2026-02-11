import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import CredentialForm from '../components/CredentialForm'
import CredentialList from '../components/CredentialList'
import FolderManager from '../components/FolderManager'
import UserManager from '../components/UserManager'
import DocumentManager from '../components/DocumentManager'
import Toast from '../components/Toast'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
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
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Navigation Bar */}
      <nav className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-xl`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Credential Vault</h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enterprise Security Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <div className="text-right">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.email}</p>
                <div className="flex items-center justify-end space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user?.user_group}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                }`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className={`flex space-x-1 mb-8 p-1.5 rounded-xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
              activeTab === 'credentials' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Credentials</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
              activeTab === 'documents' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documents</span>
            </div>
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('folders')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                  activeTab === 'folders' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                    : isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                    : isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              <h3 className={`text-sm font-semibold mb-4 uppercase tracking-wider ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Environment</h3>
              <div className="flex flex-wrap gap-3">
                {folders && folders.length > 0 ? (
                  folders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 border ${
                        selectedFolder?.id === folder.id 
                          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/50' 
                          : isDark
                            ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No folders available</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedFolder ? selectedFolder.name : 'Credentials'}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading credentials...</p>
                </div>
              </div>
            ) : (
              <CredentialList
                credentials={filteredCredentials}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={user?.role === 'admin'}
                isDark={isDark}
              />
            )}
          </>
        )}

        {activeTab === 'documents' && (
          <DocumentManager isDark={isDark} isAdmin={user?.role === 'admin'} />
        )}

        {activeTab === 'folders' && user?.role === 'admin' && (
          <FolderManager folders={folders} onUpdate={fetchFolders} isDark={isDark} />
        )}

        {activeTab === 'users' && user?.role === 'admin' && (
          <UserManager isDark={isDark} />
        )}

        {showForm && (
          <CredentialForm
            credential={editingCredential}
            folders={folders}
            onClose={handleFormClose}
            isDark={isDark}
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

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import CredentialForm from '../components/CredentialForm'
import CredentialList from '../components/CredentialList'
import FolderManager from '../components/FolderManager'
import UserManager from '../components/UserManager'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [credentials, setCredentials] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('credentials')

  useEffect(() => {
    fetchCredentials()
    fetchFolders()
  }, [])

  useEffect(() => {
    // Auto-select first folder when folders are loaded
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0])
    }
  }, [folders])

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
      fetchCredentials()
    } catch (error) {
      alert('Failed to delete credential')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCredential(null)
    fetchCredentials()
  }

  const filteredCredentials = selectedFolder 
    ? credentials.filter(cred => cred.folder_id === selectedFolder.id)
    : credentials.filter(cred => !cred.folder_id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  🔐 Credential Store
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {user?.role} • {user?.user_group}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-xl shadow-md">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'credentials' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 My Credentials
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('folders')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'folders' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📁 Manage Folders
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'users' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                👥 Manage Users
              </button>
            </>
          )}
        </div>

        {activeTab === 'credentials' && (
          <>
            {/* Folder Filter */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Filter by Folder</h3>
              <div className="flex flex-wrap gap-3">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder)}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                      selectedFolder?.id === folder.id 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    📁 {folder.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedFolder ? `${selectedFolder.name} Credentials` : 'Credentials'}
              </h2>
              {user?.role === 'admin' && (
                <button
                  onClick={handleCreate}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                >
                  <span className="text-xl">+</span> Add Credential
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
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
      </main>
    </div>
  )
}

export default Dashboard

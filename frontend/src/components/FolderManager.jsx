import { useState, useEffect } from 'react'
import api from '../services/api'

const FolderManager = ({ folders, onUpdate, isDark }) => {
  const [editingFolder, setEditingFolder] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [groups, setGroups] = useState([])

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups')
      setGroups(response.data || [])
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  const handleEdit = (folder) => {
    setEditingFolder(folder)
    const perms = {}
    folder.permissions?.forEach(p => {
      perms[p.user_group] = {
        can_read: p.can_read,
        can_write: p.can_write,
        can_delete: p.can_delete
      }
    })
    setPermissions(perms)
  }

  const handlePermissionChange = (group, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [permission]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      for (const [group, perms] of Object.entries(permissions)) {
        await api.put(`/folders/${editingFolder.id}/permissions`, {
          user_group: group,
          ...perms
        })
      }
      setEditingFolder(null)
      setPermissions({})
      onUpdate()
    } catch (error) {
      alert('Failed to update permissions')
    }
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    setCreating(true)
    try {
      await api.post('/folders', {
        name: newFolderName.trim(),
        description: newFolderDescription.trim()
      })
      setShowCreateForm(false)
      setNewFolderName('')
      setNewFolderDescription('')
      onUpdate()
    } catch (error) {
      alert('Failed to create folder')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Are you sure you want to delete "${folderName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/folders/${folderId}`)
      onUpdate()
    } catch (error) {
      alert('Failed to delete folder. It may contain credentials.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Folder Management</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Configure folder permissions for user groups</p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-blue-500/50 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Folder</span>
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className={`rounded-xl p-6 mb-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create New Folder</h3>
          <form onSubmit={handleCreateFolder}>
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Folder Name *
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="e.g., Staging, Testing, etc."
                required
              />
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                rows="3"
                placeholder="Brief description of the folder (optional)"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !newFolderName.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-600 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/50"
              >
                {creating ? 'Creating...' : 'Create Folder'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewFolderName('')
                  setNewFolderDescription('')
                }}
                className={`px-6 py-3 rounded-lg transition-colors duration-200 font-semibold border ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!folders || folders.length === 0 ? (
        <div className={`rounded-xl p-12 text-center border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No folders found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {folders.map((folder) => (
          <div key={folder.id} className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-xl font-bold flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span>{folder.name}</span>
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Environment folder</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(folder)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  Edit Permissions
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id, folder.name)}
                  className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                  title="Delete Folder"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {editingFolder?.id === folder.id ? (
              <div className="mt-4 space-y-4">
                {groups.map((group) => (
                  <div key={group.name} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 capitalize">{group.name} Group</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions[group.name]?.can_read || false}
                          onChange={(e) => handlePermissionChange(group.name, 'can_read', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Read</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions[group.name]?.can_write || false}
                          onChange={(e) => handlePermissionChange(group.name, 'can_write', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Write</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions[group.name]?.can_delete || false}
                          onChange={(e) => handlePermissionChange(group.name, 'can_delete', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Delete</span>
                      </label>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/50"
                  >
                    Save Permissions
                  </button>
                  <button
                    onClick={() => {
                      setEditingFolder(null)
                      setPermissions({})
                    }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-semibold border border-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {Array.isArray(folder.permissions) && folder.permissions.length > 0 ? (
                  folder.permissions.map((perm) => (
                    <div key={perm.user_group} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                      <p className="text-sm font-semibold text-white capitalize mb-2">{perm.user_group}</p>
                      <div className="flex flex-wrap gap-1">
                        {perm.can_read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-200">
                            Read
                          </span>
                        )}
                        {perm.can_write && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-200">
                            Write
                          </span>
                        )}
                        {perm.can_delete && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900 text-red-200">
                            Delete
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm col-span-3">No permissions configured</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  )
}

export default FolderManager

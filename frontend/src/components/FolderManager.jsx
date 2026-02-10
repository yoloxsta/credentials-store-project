import { useState } from 'react'
import api from '../services/api'

const FolderManager = ({ folders, onUpdate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolder, setNewFolder] = useState({ name: '', description: '' })
  const [editingPermissions, setEditingPermissions] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/folders', newFolder)
      setNewFolder({ name: '', description: '' })
      setShowCreateForm(false)
      onUpdate()
    } catch (error) {
      alert('Failed to create folder')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePermission = async (folderId, userGroup, permission) => {
    try {
      await api.put(`/folders/${folderId}/permissions`, {
        user_group: userGroup,
        ...permission
      })
      onUpdate()
    } catch (error) {
      alert('Failed to update permission')
    }
  }

  const userGroups = ['admin', 'senior', 'junior']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Folder Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Folder
        </button>
      </div>

      {/* Create Folder Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
          <form onSubmit={handleCreateFolder}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={newFolder.description}
                  onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Folders List */}
      <div className="space-y-6">
        {folders.map(folder => (
          <div key={folder.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{folder.name}</h3>
                <p className="text-gray-600">{folder.description}</p>
              </div>
              <button
                onClick={() => setEditingPermissions(
                  editingPermissions === folder.id ? null : folder.id
                )}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                {editingPermissions === folder.id ? 'Hide' : 'Manage Permissions'}
              </button>
            </div>

            {/* Current Permissions Display */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Current Permissions:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {userGroups.map(group => {
                  const perm = folder.permissions?.[group]
                  return (
                    <div key={group} className="bg-gray-50 p-2 rounded">
                      <div className="font-medium capitalize">{group}</div>
                      <div className="text-xs text-gray-600">
                        {perm ? (
                          <>
                            {perm.can_read && <span className="bg-green-200 px-1 rounded mr-1">R</span>}
                            {perm.can_write && <span className="bg-blue-200 px-1 rounded mr-1">W</span>}
                            {perm.can_delete && <span className="bg-red-200 px-1 rounded mr-1">D</span>}
                            {!perm.can_read && !perm.can_write && !perm.can_delete && 'No Access'}
                          </>
                        ) : (
                          'No Access'
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Permission Editor */}
            {editingPermissions === folder.id && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Edit Permissions:</h4>
                <div className="space-y-3">
                  {userGroups.map(group => {
                    const currentPerm = folder.permissions?.[group] || {
                      can_read: false,
                      can_write: false,
                      can_delete: false
                    }
                    
                    return (
                      <div key={group} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="font-medium capitalize">{group}</span>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={currentPerm.can_read}
                              onChange={(e) => handleUpdatePermission(folder.id, group, {
                                can_read: e.target.checked,
                                can_write: currentPerm.can_write,
                                can_delete: currentPerm.can_delete
                              })}
                              className="mr-1"
                            />
                            Read
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={currentPerm.can_write}
                              onChange={(e) => handleUpdatePermission(folder.id, group, {
                                can_read: currentPerm.can_read,
                                can_write: e.target.checked,
                                can_delete: currentPerm.can_delete
                              })}
                              className="mr-1"
                            />
                            Write
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={currentPerm.can_delete}
                              onChange={(e) => handleUpdatePermission(folder.id, group, {
                                can_read: currentPerm.can_read,
                                can_write: currentPerm.can_write,
                                can_delete: e.target.checked
                              })}
                              className="mr-1"
                            />
                            Delete
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FolderManager
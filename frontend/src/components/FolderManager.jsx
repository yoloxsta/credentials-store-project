import { useState } from 'react'
import api from '../services/api'

const FolderManager = ({ folders, onUpdate, isDark }) => {
  const [editingFolder, setEditingFolder] = useState(null)
  const [permissions, setPermissions] = useState({})

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

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Folder Management</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Configure folder permissions for user groups</p>
      </div>

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
            </div>

            {editingFolder?.id === folder.id ? (
              <div className="mt-4 space-y-4">
                {['admin', 'senior', 'junior'].map((group) => (
                  <div key={group} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 capitalize">{group} Group</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions[group]?.can_read || false}
                          onChange={(e) => handlePermissionChange(group, 'can_read', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Read</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions[group]?.can_write || false}
                          onChange={(e) => handlePermissionChange(group, 'can_write', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Write</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permissions[group]?.can_delete || false}
                          onChange={(e) => handlePermissionChange(group, 'can_delete', e.target.checked)}
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

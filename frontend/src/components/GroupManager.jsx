import { useState, useEffect } from 'react'
import api from '../services/api'

const GroupManager = ({ isDark, onUpdate }) => {
  const [groups, setGroups] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

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

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      await api.post('/groups', formData)
      setShowCreateForm(false)
      setFormData({ name: '', description: '' })
      fetchGroups()
      onUpdate?.()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      await api.put(`/groups/${editingGroup.id}`, formData)
      setEditingGroup(null)
      setFormData({ name: '', description: '' })
      fetchGroups()
      onUpdate?.()
    } catch (error) {
      alert('Failed to update group')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (group) => {
    if (!window.confirm(`Delete group "${group.name}"? Users in this group will need to be reassigned.`)) {
      return
    }

    try {
      await api.delete(`/groups/${group.id}`)
      fetchGroups()
      onUpdate?.()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete group')
    }
  }

  const startEdit = (group) => {
    setEditingGroup(group)
    setFormData({ name: group.name, description: group.description })
  }

  const cancelEdit = () => {
    setEditingGroup(null)
    setShowCreateForm(false)
    setFormData({ name: '', description: '' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Group Management
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage user groups for access control
          </p>
        </div>
        {!showCreateForm && !editingGroup && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-blue-500/50 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Group</span>
          </button>
        )}
      </div>

      {(showCreateForm || editingGroup) && (
        <div className={`rounded-xl p-6 mb-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingGroup ? 'Edit Group' : 'Create New Group'}
          </h3>
          <form onSubmit={editingGroup ? handleUpdate : handleCreate}>
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Group Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="e.g., QA, DevOps, Intern"
                required
              />
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                rows="3"
                placeholder="Brief description of the group"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-600 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/50"
              >
                {loading ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
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

      <div className="grid gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`rounded-xl p-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {group.name}
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {group.description || 'No description'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(group)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(group)}
                  className="px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupManager

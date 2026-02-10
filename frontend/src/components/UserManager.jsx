import { useState, useEffect } from 'react'
import api from '../services/api'

const UserManager = () => {
  const [users, setUsers] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    user_group: 'junior'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData)
      } else {
        await api.post('/users', formData)
      }
      setFormData({ email: '', password: '', role: 'user', user_group: 'junior' })
      setShowCreateForm(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      alert('Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      user_group: user.user_group
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      fetchUsers()
    } catch (error) {
      alert('Failed to delete user')
    }
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingUser(null)
    setFormData({ email: '', password: '', role: 'user', user_group: 'junior' })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create User
        </button>
      </div>

      {/* Create/Edit User Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required={!editingUser}
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">User Group *</label>
                <select
                  value={formData.user_group}
                  onChange={(e) => setFormData({ ...formData, user_group: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {loading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.role === 'admin' ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.user_group === 'admin' ? 'bg-red-200 text-red-800' :
                    user.user_group === 'senior' ? 'bg-blue-200 text-blue-800' :
                    'bg-green-200 text-green-800'
                  }`}>
                    {user.user_group}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManager

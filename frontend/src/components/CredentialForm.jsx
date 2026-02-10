import { useState, useEffect } from 'react'
import api from '../services/api'

const CredentialForm = ({ credential, folders, onClose, isDark }) => {
  const [formData, setFormData] = useState({
    folder_id: null,
    service_name: '',
    username: '',
    password: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (credential) {
      setFormData({
        folder_id: credential.folder_id,
        service_name: credential.service_name,
        username: credential.username,
        password: credential.password,
        notes: credential.notes || ''
      })
    } else if (folders && folders.length > 0) {
      // Set first folder as default for new credentials
      setFormData(prev => ({
        ...prev,
        folder_id: folders[0].id
      }))
    }
  }, [credential, folders])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const action = credential ? 'update' : 'create'
      if (credential) {
        await api.put(`/credentials/${credential.id}`, formData)
      } else {
        await api.post('/credentials', formData)
      }
      onClose(true, action) // Pass success and action type
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl max-w-md w-full p-6 shadow-2xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {credential ? 'Edit Credential' : 'New Credential'}
        </h3>

        {error && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm border ${
            isDark 
              ? 'bg-red-900/50 border-red-800 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Environment *
            </label>
            <select
              value={formData.folder_id || ''}
              onChange={(e) => setFormData({ ...formData, folder_id: e.target.value ? parseInt(e.target.value) : null })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            >
              {folders?.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Service Name *
            </label>
            <input
              type="text"
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="e.g., AWS Console, GitHub"
              required
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Enter username or email"
              required
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              rows="3"
              placeholder="Additional information (optional)"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-600 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors duration-200 font-semibold border ${
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
    </div>
  )
}

export default CredentialForm

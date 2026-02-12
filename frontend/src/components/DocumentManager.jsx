import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const DocumentManager = ({ isDark, isAdmin }) => {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [groups, setGroups] = useState([])
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingPermissions, setEditingPermissions] = useState(null)
  const [permissions, setPermissions] = useState({})

  useEffect(() => {
    fetchDocuments()
    fetchGroups()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await api.get('/documents')
      setDocuments(response.data || [])
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups')
      setGroups(response.data || [])
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      setGroups([])
    }
  }

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('description', description)

    try {
      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setShowUploadForm(false)
      setSelectedFile(null)
      setDescription('')
      fetchDocuments()
    } catch (error) {
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (id, filename) => {
    try {
      const token = localStorage.getItem('token')
      const url = `http://localhost:8080/api/documents/${id}/download?token=${token}`
      
      // Simply open the URL - backend will redirect to S3 presigned URL
      window.open(url, '_blank')
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download document')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      await api.delete(`/documents/${id}`)
      fetchDocuments()
    } catch (error) {
      alert('Failed to delete document')
    }
  }

  const handleEditPermissions = (doc) => {
    setEditingPermissions(doc)
    const perms = {}
    doc.permissions?.forEach(p => {
      perms[p.user_group] = {
        can_view: p.can_view,
        can_download: p.can_download
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

  const handleSavePermissions = async () => {
    try {
      for (const [group, perms] of Object.entries(permissions)) {
        await api.put(`/documents/${editingPermissions.id}/permissions`, {
          user_group: group,
          can_view: perms.can_view,
          can_download: perms.can_download
        })
      }
      setEditingPermissions(null)
      setPermissions({})
      fetchDocuments()
    } catch (error) {
      alert('Failed to update permissions')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const canDownload = (doc) => {
    // Admin can always download
    if (isAdmin) return true
    
    // Check if user's group has download permission
    const userPermission = doc.permissions?.find(p => p.user_group === user?.user_group)
    return userPermission?.can_download || false
  }

  const handleView = (id) => {
    // Open document in new tab for viewing
    const token = localStorage.getItem('token')
    const url = `http://localhost:8080/api/documents/${id}/view`
    window.open(url + `?token=${token}`, '_blank')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Documentation</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage project documentation and files</p>
        </div>
        {isAdmin && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg shadow-blue-500/50 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {showUploadForm && isAdmin && (
        <div className={`rounded-xl p-6 mb-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload New Document</h3>
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Select File *
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600' 
                    : 'bg-white border-gray-300 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'
                }`}
                required
              />
              {selectedFile && (
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                rows="3"
                placeholder="Brief description of the document (optional)"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-600 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false)
                  setSelectedFile(null)
                  setDescription('')
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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading documents...</p>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className={`rounded-xl p-12 text-center border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No documents found</p>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {isAdmin ? 'Upload your first document to get started' : 'No documents available yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className={`rounded-xl transition-all duration-200 overflow-hidden border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{doc.original_filename}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatFileSize(doc.file_size)} • Uploaded by {doc.uploader_email}
                        </p>
                      </div>
                    </div>
                    {doc.description && (
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{doc.description}</p>
                    )}
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                    </p>

                    {/* Show permissions */}
                    {editingPermissions?.id === doc.id ? (
                      <div className="mt-4 space-y-3">
                        {groups.map((group) => (
                          <div key={group.id} className={`rounded-lg p-3 border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <h5 className={`text-sm font-semibold mb-2 capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{group.name} Group</h5>
                            <div className="flex gap-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={permissions[group.name]?.can_view || false}
                                  onChange={(e) => handlePermissionChange(group.name, 'can_view', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Can View</span>
                              </label>
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={permissions[group.name]?.can_download || false}
                                  onChange={(e) => handlePermissionChange(group.name, 'can_download', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Can Download</span>
                              </label>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleSavePermissions}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 text-sm font-medium"
                          >
                            Save Permissions
                          </button>
                          <button
                            onClick={() => {
                              setEditingPermissions(null)
                              setPermissions({})
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                              isDark 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {doc.permissions?.map((perm) => (
                          <div key={perm.user_group} className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <span className="capitalize">{perm.user_group}:</span>
                            <span className="ml-1">
                              {perm.can_view && '👁️'}
                              {perm.can_download && '⬇️'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleView(doc.id)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                        isDark 
                          ? 'bg-green-900/50 hover:bg-green-900 text-green-200 border-green-800' 
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      View
                    </button>
                    {canDownload(doc) && (
                      <button
                        onClick={() => handleDownload(doc.id, doc.original_filename)}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                          isDark 
                            ? 'bg-blue-900/50 hover:bg-blue-900 text-blue-200 border-blue-800' 
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        Download
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditPermissions(doc)}
                          className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                            isDark 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                          }`}
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                            isDark 
                              ? 'bg-red-900/50 hover:bg-red-900 text-red-200 border-red-800' 
                              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DocumentManager

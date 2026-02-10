import { useState } from 'react'

const CredentialList = ({ credentials, onEdit, onDelete, isAdmin }) => {
  const [showPassword, setShowPassword] = useState({})

  const togglePassword = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!credentials || credentials.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
        <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-gray-400 text-lg">No credentials found</p>
        <p className="text-gray-500 text-sm mt-2">Create your first credential to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {credentials.map((cred) => (
        <div key={cred.id} className="bg-gray-800 border border-gray-700 rounded-xl hover:border-gray-600 transition-all duration-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{cred.service_name}</h3>
                    <p className="text-sm text-gray-400">{cred.username}</p>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(cred)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium border border-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(cred.id)}
                    className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg transition-colors duration-200 text-sm font-medium border border-red-800"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-gray-400 text-sm font-medium">Password:</span>
                  <code className="text-white font-mono text-sm">
                    {showPassword[cred.id] ? cred.password : '••••••••••••'}
                  </code>
                </div>
                <button
                  onClick={() => togglePassword(cred.id)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200 text-sm font-medium border border-gray-700"
                >
                  {showPassword[cred.id] ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {cred.notes && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <span className="text-gray-400 text-sm font-medium block mb-2">Notes:</span>
                <p className="text-gray-300 text-sm leading-relaxed">{cred.notes}</p>
              </div>
            )}

            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <span className="text-xs text-gray-500">User ID: {cred.user_id}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CredentialList

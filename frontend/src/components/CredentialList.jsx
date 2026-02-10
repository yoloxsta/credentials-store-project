import { useState } from 'react'

const CredentialList = ({ credentials, onEdit, onDelete, isAdmin }) => {
  const [showPassword, setShowPassword] = useState({})

  const togglePassword = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (!credentials || credentials.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <div className="text-6xl mb-4">🔒</div>
        <p className="text-gray-500 text-lg">No credentials found. Add your first credential to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {credentials.map((cred) => (
        <div key={cred.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🔑</span>
                <h3 className="text-2xl font-bold text-gray-800">{cred.service_name}</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-600 ml-11">
                <span className="text-sm">👤</span>
                <p className="font-medium">{cred.username}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(cred)}
                  className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(cred.id)}
                  className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-3 ml-11">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-semibold">🔐 Password:</span>
                <span className="font-mono text-lg text-gray-800">
                  {showPassword[cred.id] ? cred.password : '••••••••'}
                </span>
              </div>
              <button
                onClick={() => togglePassword(cred.id)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 text-sm font-medium shadow-sm"
              >
                {showPassword[cred.id] ? '🙈 Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          {cred.notes && (
            <div className="bg-gray-50 rounded-xl p-4 ml-11">
              <span className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                📝 Notes:
              </span>
              <p className="text-gray-600 leading-relaxed">{cred.notes}</p>
            </div>
          )}

          {isAdmin && (
            <div className="mt-4 ml-11 text-sm text-gray-400 flex items-center gap-2">
              <span>👤 User ID: {cred.user_id}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default CredentialList

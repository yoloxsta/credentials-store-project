import { useState } from 'react'

const ServiceList = ({ services, onEdit, onDelete, isAdmin, isDark }) => {
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = async (text, fieldId) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!services || services.length === 0) {
    return (
      <div className={`rounded-xl p-12 text-center border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No services found</p>
        <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Add your first service to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {services.map((service) => (
        <div key={service.id} className={`rounded-xl transition-all duration-200 overflow-hidden border ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{service.service_name}</h3>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(service)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(service.id)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium border ${
                      isDark 
                        ? 'bg-red-900/50 hover:bg-red-900 text-red-200 border-red-800' 
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {service.hostname && (
              <div className={`rounded-lg p-4 mb-3 border ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className={`text-sm font-medium block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Hostname:</span>
                    <code className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {service.hostname}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(service.hostname, `hostname-${service.id}`)}
                    className={`ml-3 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium border flex items-center space-x-2 ${
                      copiedField === `hostname-${service.id}`
                        ? isDark
                          ? 'bg-green-900 border-green-700 text-green-200'
                          : 'bg-green-50 border-green-300 text-green-700'
                        : isDark 
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                    title="Copy hostname"
                  >
                    {copiedField === `hostname-${service.id}` ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {service.ip_address && (
              <div className={`rounded-lg p-4 mb-3 border ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className={`text-sm font-medium block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>IP Address:</span>
                    <code className={`font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {service.ip_address}{service.port ? `:${service.port}` : ''}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(service.ip_address, `ip-${service.id}`)}
                    className={`ml-3 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium border flex items-center space-x-2 ${
                      copiedField === `ip-${service.id}`
                        ? isDark
                          ? 'bg-green-900 border-green-700 text-green-200'
                          : 'bg-green-50 border-green-300 text-green-700'
                        : isDark 
                          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700' 
                          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                    title="Copy IP address"
                  >
                    {copiedField === `ip-${service.id}` ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {service.description && (
              <div className={`rounded-lg p-4 border ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <span className={`text-sm font-medium block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Description:</span>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{service.description}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ServiceList

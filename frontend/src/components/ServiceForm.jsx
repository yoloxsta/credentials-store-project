import { useState, useEffect } from 'react'

const ServiceForm = ({ service, folders, onClose, isDark }) => {
  const [formData, setFormData] = useState({
    service_name: '',
    hostname: '',
    ip_address: '',
    port: '',
    description: '',
    folder_id: ''
  })

  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        hostname: service.hostname || '',
        ip_address: service.ip_address || '',
        port: service.port || '',
        description: service.description || '',
        folder_id: service.folder_id || ''
      })
    }
  }, [service])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // This will be handled by the parent component
    onClose(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`sticky top-0 px-6 py-4 border-b ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {service ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button
              onClick={() => onClose(null)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Service Name *
            </label>
            <input
              type="text"
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., Web Server, Database Server"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Hostname / Domain
            </label>
            <input
              type="text"
              value={formData.hostname}
              onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., abc.example.com"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                IP Address
              </label>
              <input
                type="text"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., 172.16.100.2"
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Port
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="8080"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Folder
            </label>
            <select
              value={formData.folder_id}
              onChange={(e) => setFormData({ ...formData, folder_id: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">No Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Additional notes about this service..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/50"
            >
              {service ? 'Update Service' : 'Add Service'}
            </button>
            <button
              type="button"
              onClick={() => onClose(null)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
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

export default ServiceForm

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Credential Store
          </h1>
          <p className="text-gray-600">Secure credential management system</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              {loading ? '🔄 Logging in...' : '🚀 Login'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
              <span>ℹ️</span>
              <span>Contact your administrator to create an account</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

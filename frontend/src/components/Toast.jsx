import { useEffect } from 'react'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'success' 
    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
    : type === 'error'
    ? 'bg-gradient-to-r from-red-600 to-rose-600'
    : 'bg-gradient-to-r from-blue-600 to-indigo-600'

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'i'

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md border border-white/20`}>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold">{icon}</span>
        </div>
        <p className="flex-1 font-medium text-sm">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl font-bold leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast

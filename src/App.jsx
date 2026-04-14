import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm text-center border border-white">
        <h1 className="text-4xl mb-4">🥐</h1>
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-widest">
          Dulcinea <span className="text-orange-500">App</span>
        </h2>
        <p className="mt-4 text-gray-600 font-medium">
          Si ves este fondo con degradado y la letra elegante, 
          <span className="text-green-600 font-bold"> ¡Tailwind está vivo!</span>
        </p>
        <div className="mt-6 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 w-2/3"></div>
        </div>
      </div>
    </div>
  )
}

export default App
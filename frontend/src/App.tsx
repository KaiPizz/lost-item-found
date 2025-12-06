function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Odnalezione Zguby
        </h1>
        <p className="text-slate-400 text-lg">
          5-krokowy kreator publikacji znalezionych rzeczy
        </p>
        <div className="mt-8">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            Rozpocznij
          </button>
        </div>
      </div>
    </div>
  )
}

export default App


import { useState, useEffect } from 'react'
import { ShieldCheck, Database, Loader2 } from 'lucide-react'
import { db } from './lib/db'

function App() {
  const [dbReady, setDbReady] = useState(false)
  const [narrativeLoaded, setNarrativeLoaded] = useState(false)

  useEffect(() => {
    // Initialize database
    db.open().then(() => {
      setDbReady(true)
    }).catch(err => {
      console.error('Database initialization error:', err)
    })
  }, [])

  const handleLoadMasterNarrative = async () => {
    // Placeholder for narrative loading logic
    setNarrativeLoaded(true)
    console.log('Master Narrative loading logic will be implemented in Phase 2')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="captain-header captain-mode">
        <div className="container mx-auto flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-green-400" />
          <h1 className="text-xl">Pro Se Legal DB - The Truth Repo</h1>
          <span className="ml-auto text-sm text-slate-400">v2.0.0</span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <Database className="w-8 h-8 text-slate-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">System Status</h2>
              <p className="text-slate-600">Montgomery County, PA - Firey v. Firey</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {dbReady ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-700">Database: Connected (Version 2)</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-slate-700">Database: Initializing...</span>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleLoadMasterNarrative}
                disabled={!dbReady || narrativeLoaded}
                className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                {narrativeLoaded ? 'Master Narrative Loaded' : 'Load Master Narrative'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App


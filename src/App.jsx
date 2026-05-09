import { useMemo } from 'react'
import AuthCard from './components/AuthCard'
import LandingHero from './components/LandingHero'
import { useAuthSession } from './hooks/useAuthSession'

function App() {
  const { user, isLoadingSession } = useAuthSession()

  const isSupabaseConfigured = useMemo(
    () =>
      Boolean(
        import.meta.env.VITE_SUPABASE_URL &&
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      ),
    []
  )

  if (isLoadingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f7fb] px-6 text-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Loading
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_430px] lg:px-8">
        <LandingHero />
        <AuthCard isSupabaseConfigured={isSupabaseConfigured} user={user} />
      </div>
    </main>
  )
}

export default App

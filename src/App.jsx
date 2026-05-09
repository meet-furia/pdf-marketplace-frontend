import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isConfigured = useMemo(
    () =>
      Boolean(
        import.meta.env.VITE_SUPABASE_URL &&
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      ),
    []
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoadingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
        setIsLoadingSession(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const resetStatus = () => {
    setError('')
    setMessage('')
  }

  const handleEmailAuth = async (event) => {
    event.preventDefault()
    resetStatus()
    setIsSubmitting(true)

    const credentials = {
      email: email.trim(),
      password,
    }

    const { data, error: authError } =
      authMode === 'login'
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp({
            ...credentials,
            options: {
              emailRedirectTo: window.location.origin,
            },
          })

    setIsSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (authMode === 'signup' && !data.session) {
      setMessage('Check your email to confirm your account, then come back to log in.')
      return
    }

    setMessage(authMode === 'login' ? 'Logged in successfully.' : 'Account created.')
  }

  const loginWithGoogle = async () => {
    resetStatus()
    setIsSubmitting(true)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    setIsSubmitting(false)

    if (authError) {
      setError(authError.message)
    }
  }

  const copyAccessToken = async () => {
    resetStatus()

    try {
      await navigator.clipboard.writeText(session.access_token)
      setMessage('Access token copied.')
    } catch {
      setError('Could not copy the access token. Select and copy it manually.')
    }
  }

  const logout = async () => {
    resetStatus()
    await supabase.auth.signOut()
  }

  if (isLoadingSession) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">
            Loading session
          </p>
        </div>
      </main>
    )
  }

  const user = session?.user
  const displayName = user?.user_metadata?.full_name || user?.email

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_430px] lg:px-8">
        <section className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            PDF Marketplace
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-6xl">
              Sign in and get your Supabase access token.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Use email and password or Google authentication. After login, the
              active JWT access token appears in your account panel.
            </p>
          </div>

          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {['Email login', 'Email signup', 'Google OAuth'].map((item) => (
              <div
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                key={item}
              >
                <p className="text-sm font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          {!isConfigured ? (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Supabase is not configured</h2>
              <p className="text-sm leading-6 text-slate-600">
                Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to
                your frontend `.env` file, then restart Vite.
              </p>
            </div>
          ) : !user ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {authMode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {authMode === 'login'
                    ? 'Log in to continue to your marketplace account.'
                    : 'Sign up with email and password to create your account.'}
                </p>
              </div>

              <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                <button
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    authMode === 'login'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600'
                  }`}
                  onClick={() => {
                    setAuthMode('login')
                    resetStatus()
                  }}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    authMode === 'signup'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600'
                  }`}
                  onClick={() => {
                    setAuthMode('signup')
                    resetStatus()
                  }}
                  type="button"
                >
                  Sign up
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleEmailAuth}>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Email
                  </span>
                  <input
                    autoComplete="email"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Password
                  </span>
                  <input
                    autoComplete={
                      authMode === 'login' ? 'current-password' : 'new-password'
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    minLength={6}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    required
                    type="password"
                    value={password}
                  />
                </label>

                <button
                  className="w-full rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting
                    ? 'Please wait...'
                    : authMode === 'login'
                      ? 'Login with email'
                      : 'Sign up with email'}
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isSubmitting}
                onClick={loginWithGoogle}
                type="button"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-blue-600 shadow-sm">
                  G
                </span>
                Continue with Google
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    alt={displayName}
                    className="h-14 w-14 rounded-full object-cover"
                    src={user.user_metadata.avatar_url}
                  />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-cyan-100 text-xl font-bold text-cyan-700">
                    {displayName?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-bold">{displayName}</h2>
                  <p className="truncate text-sm text-slate-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Supabase access token
                  </p>
                  <button
                    className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    onClick={copyAccessToken}
                    type="button"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  className="h-44 w-full resize-none rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700 outline-none"
                  readOnly
                  value={session.access_token}
                />
              </div>

              <button
                className="w-full rounded-lg border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 transition hover:bg-red-100"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </div>
          )}

          {(error || message) && (
            <p
              className={`mt-5 rounded-lg px-4 py-3 text-sm ${
                error
                  ? 'bg-red-50 text-red-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {error || message}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}

export default App

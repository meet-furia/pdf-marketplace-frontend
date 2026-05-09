import AuthForm from './AuthForm'
import EmailVerificationNotice from './EmailVerificationNotice'
import SupabaseSetupNotice from './SupabaseSetupNotice'
import UserCard from './UserCard'

function AuthCard({ isSupabaseConfigured, user }) {
  const isEmailVerified = Boolean(user?.email_confirmed_at)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      {!isSupabaseConfigured ? (
        <SupabaseSetupNotice />
      ) : !user ? (
        <AuthForm />
      ) : !isEmailVerified ? (
        <EmailVerificationNotice user={user} />
      ) : (
        <UserCard user={user} />
      )}
    </section>
  )
}

export default AuthCard

import { apiRequest } from './apiClient'

export const registerAuthenticatedUser = (user) => {
  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email

  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      supabaseUserId: user.id,
      email: user.email,
      name,
      emailVerified: Boolean(user.email_confirmed_at),
    }),
  })
}

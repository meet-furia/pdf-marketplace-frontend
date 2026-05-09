import { supabase } from '../lib/supabaseClient'

export function loginWithEmail(email, password) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })
}

export function signupWithEmail(email, password) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
}

export function loginWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
}

export function logout() {
  return supabase.auth.signOut()
}

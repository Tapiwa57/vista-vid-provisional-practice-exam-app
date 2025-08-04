// src/pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabase'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import LoggedInNavbar from '@/components/Navbar'
import PublicNavbar from '@/components/PublicNavbar'
import { ComponentType } from 'react'

function AppContent({ Component, pageProps }: { Component: AppProps['Component']; pageProps: AppProps['pageProps'] }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  const hideNavbarRoutes = ['/', '/exam', '/results']
  const shouldHideNavbar = hideNavbarRoutes.includes(router.pathname)

  if (loading) return null

  return (
    <>
      {!shouldHideNavbar && (user ? <LoggedInNavbar /> : <PublicNavbar />)}
      <Component {...pageProps} />
    </>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <AuthProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AuthProvider>
    </SessionContextProvider>
  )
}

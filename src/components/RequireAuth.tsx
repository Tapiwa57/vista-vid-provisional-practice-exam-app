import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function RequireAuth({ children }: Props) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) {
    return null // or a loading spinner if you prefer
  }

  return <>{children}</>
}

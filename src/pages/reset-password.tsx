// src/pages/reset-password.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenChecked, setTokenChecked] = useState(false)

  useEffect(() => {
    const { access_token, refresh_token } = router.query

    if (access_token && refresh_token) {
      // ✅ Set session using tokens from URL fragment
      supabase.auth.setSession({
        access_token: access_token as string,
        refresh_token: refresh_token as string,
      }).then(({ error }) => {
        if (error) {
          setError('Session could not be restored. Link may be invalid or expired.')
        }
        setTokenChecked(true)
      })
    } else {
      setError('Missing token in URL. Reset link may be broken or expired.')
      setTokenChecked(true)
    }
  }, [router.query])

  const handleReset = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) setError(error.message)
    else {
      setMessage('✅ Password successfully updated. Redirecting to login...')
      setTimeout(() => {
        router.push('/') // or '/login' if you have a separate login page
      }, 2500)
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>

        {!tokenChecked ? (
          <p className="text-gray-500">Validating reset link...</p>
        ) : (
          <>
            {message && <p className="text-green-600 mb-3">{message}</p>}
            {error && <p className="text-red-600 mb-3">{error}</p>}

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              disabled={loading}
            />

            <button
              onClick={handleReset}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              disabled={loading || !tokenChecked}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

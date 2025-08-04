import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
/*import { useAuth } from '@/context/AuthContext'*/

export default function ChangePasswordPage() {
  /*const { user } = useAuth()*/
  const router = useRouter()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = async () => {
    setError('')
    setSuccess('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('✅ Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-md mx-auto bg-gray-100 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Change Password</h1>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <label className="block mb-2">
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-2 border mt-1 rounded"
          />
        </label>

        <label className="block mb-4">
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-2 border mt-1 rounded"
          />
        </label>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Updating...' : 'Change Password'}
        </button>

        <button
          onClick={() => router.push('/profile')}
          className="mt-4 text-sm text-blue-600 underline"
        >
          ← Back to Profile
        </button>
      </div>
    </div>
  )
}

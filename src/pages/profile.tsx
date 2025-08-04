// src/pages/profile.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

interface Result {
  id: number
  score: number
  created_at: string
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [darkMode, setDarkMode] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  const fetchProgress = useCallback(async () => {
    if (!user) return
    const { data: topics } = await supabase.from('study-notes').select('id')
    const { data: progress } = await supabase
      .from('study_progress')
      .select('completed_ids')
      .eq('user_id', user.id)
      .single()

    if (topics && progress) {
      const completed = progress.completed_ids.length
      const total = topics.length
      const percentage = total > 0 ? Math.floor((completed / total) * 100) : 0
      setProgress(percentage)
    }
  }, [user])

  const fetchResults = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('results')
      .select('id, score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setResults(data)
  }, [user])

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    setName(user.user_metadata?.name || '')

    fetchProgress()
    fetchResults()

    // Get dark mode from localStorage
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      setDarkMode(savedMode === 'true')
    }
  }, [user, router, fetchProgress, fetchResults])

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  const handleNameSave = async () => {
    await supabase.auth.updateUser({
      data: { name },
    })
    setEditingName(false)
  }

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This is permanent.')
    if (!confirmed) return

    await supabase.rpc('delete_user')
    await signOut()
    router.push('/')
  }

  const data = {
    labels: results.map(r => new Date(r.created_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Score',
        data: results.map(r => r.score),
        backgroundColor: '#1B264F',
      },
    ],
  }

  if (!user) return null

  return (
    <div
      ref={containerRef}
      className={`min-h-screen p-6 transition-colors duration-300 ${
        darkMode ? 'bg-[#111] text-white' : 'bg-white text-black'
      }`}
    >
      <h1 className="text-3xl font-bold mb-4">My Profile</h1>

      <div className="mb-6">
        <p className="font-bold text-lg">
          {editingName ? (
            <>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <button
                onClick={handleNameSave}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </>
          ) : (
            <>
              {name}{' '}
              <button onClick={() => setEditingName(true)} className="text-blue-600 text-sm underline">
                Edit
              </button>
            </>
          )}
        </p>
        <p>Email: {user.email}</p>
        <p>Study Progress: {progress}%</p>
        <button className="text-sm text-blue-600 underline mt-1" onClick={() => router.push('/change-password')}>
          Change Password
        </button>

        <label className="ml-4 inline-flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          Dark Mode
        </label>
      </div>

      <h2 className="text-xl font-bold mb-2">Recent Results</h2>
      <div className="bg-white rounded shadow p-4 dark:bg-gray-800">
        <Bar data={data} />
      </div>

      <div className="mt-10">
        <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
          Delete Account
        </button>
      </div>
    </div>
  )
}

// pages/my-results.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Result {
  id: number
  score: number
  created_at: string
}

export default function MyResultsPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<Result[]>([])

  useEffect(() => {
    if (!user) return

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from('results')
        .select('id, score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) setResults(data)
      else console.error(error)
    }

    fetchResults()
  }, [user])

  if (!user) return <p className="text-center p-6">Please login to view results</p>
  if (!results.length) return <p className="text-center p-6">No results found</p>



  return (
    <div className="min-h-screen bg-white p-6 text-gray-900">
      <h1 className="text-3xl font-bold text-center mb-6">📁 My Results</h1>

      <div className="max-w-xl mx-auto mb-8">
        <Bar
          data={{
            labels: results.map((r, i) => `Attempt ${results.length - i}`),
            datasets: [
              {
                label: 'Score (%)',
                data: results.map(r => r.score),
                backgroundColor: '#1B264F'
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Score History' }
            }
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {results.map((r) => (
          <div
            key={r.id}
            className={`p-4 rounded shadow flex justify-between items-center ${
              r.score >= 90 ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <div>
              <p className="font-semibold">Score: {r.score.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">{new Date(r.created_at).toLocaleString()}</p>
            </div>
            <Link
              href={`/results?id=${r.id}`}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

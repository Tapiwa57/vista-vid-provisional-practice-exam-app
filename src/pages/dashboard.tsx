// src/pages/dashboard.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [allCompleted, setAllCompleted] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    const checkProgress = async () => {
      const { data: topics } = await supabase
        .from('study-notes')
        .select('id')
        .order('id')

      const { data: progress } = await supabase
        .from('study_progress')
        .select('completed_ids')
        .eq('user_id', user.id)
        .single()

      if (topics && progress) {
        const topicIds = topics.map(t => t.id)
        const isAllDone = topicIds.every(id => progress.completed_ids.includes(id))
        setAllCompleted(isAllDone)
      }
    }

    checkProgress()
  }, [user])

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#1B264F] text-[#F5F3F5] px-4 sm:px-6 md:px-10 py-8 flex flex-col items-center overflow-x-hidden w-full">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center">
        Welcome, {user.user_metadata?.name || 'Driver'}!
      </h1>

      <p className="text-base sm:text-lg mb-6 text-center max-w-2xl">
        Prepare for your VID Oral Provisional Exam with confidence.
        Follow these simple steps to get started:
      </p>

      <ol className="list-decimal list-inside text-left max-w-md mb-8 space-y-2 text-sm sm:text-base">
        <li>✅ Read the Study Notes carefully.</li>
        <li>✅ Attempt the Practice Exam.</li>
        <li>✅ Review your Results and Learn!</li>
      </ol>

      <div className="w-full flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-8">
        {/* Study Notes Card */}
        <div className="flex flex-col items-center w-full sm:max-w-xs">
          <Link href="/notes">
            <Image
              className="rounded w-full object-cover"
              src="/image/Focused-Collaboration-in-Cozy Workspace.png"
              alt="Study Notes"
              width={300}
              height={100}
            />
          </Link>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4 gap-3">
            <Link href="/notes">
              <button className="bg-[#F5F3F5] text-[#1B264F] font-bold px-6 py-3 rounded hover:bg-[#1B264F] hover:text-[#F5F3F5] transition w-full sm:w-auto">
                Go to Study Notes
              </button>
            </Link>
            <Image
              src="/image/material-symbols--key-outline.svg"
              alt="key"
              width={30}
              height={30}
            />
          </div>
        </div>

        {/* Practice Exam Card */}
        <div className="flex flex-col items-center w-full sm:max-w-xs">
          <Image
            className="rounded w-full object-cover"
            src="/image/Woman-Working-on-Laptop-in-Neon-lit-Space.png"
            alt="Practice Exam"
            width={300}
            height={100}
          />
          <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4 gap-3">
            {allCompleted ? (
              <Link href="/exam">
                <button className="bg-[#302B27] text-[#F5F3F5] font-bold px-6 py-3 rounded hover:bg-[#F5F3F5] hover:text-[#302B27] transition w-full sm:w-auto">
                  Start Practice Exam
                </button>
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-500 text-gray-300 font-bold px-6 py-3 rounded cursor-not-allowed w-full sm:w-auto"
              >
                Finish Notes to Unlock Exam
              </button>
            )}
            <Image
              src="/image/bxs--lock.svg"
              alt="lock"
              width={30}
              height={30}
            />
          </div>
        </div>

        {/* Results Card */}
        <div className="flex flex-col items-center w-full sm:max-w-xs">
          <Link href="/results">
            <Image
              className="rounded w-full object-cover"
              src="/image/Collaborative-Work-Session.png"
              alt="Results"
              width={265}
              height={100}
            />
          </Link>
          <Link href="/results">
            <button className="bg-[#1B299F] text-[#F5F3F5] font-bold px-6 py-3 rounded hover:bg-[#F5F3F5] hover:text-[#1B299F] transition mt-4 w-full sm:w-auto">
              View Results
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

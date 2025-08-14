import RequireAuth from '../components/RequireAuth'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

interface Topic {
  id: number
  title: string
  content: string
}

export default function StudyNotesPage() {
  const { user } = useAuth()
  const [topics, setTopics] = useState<Topic[]>([])
  const [completedIds, setCompletedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loadingUrlId, setLoadingUrlId] = useState<number | null>(null)
  const [iframeLoading, setIframeLoading] = useState(false)

  // Fetch all notes
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('study-notes')
        .select('*')
        .order('id')

      if (error) setError(error.message)
      else setTopics(data)

      setLoading(false)
    }

    fetchNotes()
  }, [])

  // Fetch or initialize user's progress
  useEffect(() => {
    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('study_progress')
        .select('completed_ids')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error(error)
      } else if (data) {
        setCompletedIds(data.completed_ids)
      } else {
        await supabase.from('study_progress').insert([{ user_id: user?.id, completed_ids: [] }])
      }
    }

    if (user) fetchProgress()
  }, [user])

  const isUnlocked = (topicId: number) => (topicId === 1 ? true : completedIds.includes(topicId - 1))
  const allCompleted = topics.length > 0 && topics.every(t => completedIds.includes(t.id))

  const handleComplete = async (topicId: number) => {
    if (completedIds.includes(topicId)) return
    const updated = [...completedIds, topicId]
    setCompletedIds(updated)
    const { error } = await supabase
      .from('study_progress')
      .update({ completed_ids: updated })
      .eq('user_id', user?.id)
    if (error) console.error(error)
  }

  const handleViewNotes = async (topic: Topic) => {
    setLoadingUrlId(topic.id)
    setIframeLoading(true)

    const { data, error } = await supabase
      .storage
      .from('notes-private')
      .createSignedUrl(topic.content, 3600)

    if (error || !data?.signedUrl) {
      alert('Could not load note. ' + (error?.message ?? 'Unknown error'))
      return
    }

    setSignedUrl(data.signedUrl)
    setViewingTopic(topic)
    setLoadingUrlId(null)
  }

  const getNextUnlockedTopic = () => {
    if (!viewingTopic) return null
    const index = topics.findIndex(t => t.id === viewingTopic.id)
    for (let i = index + 1; i < topics.length; i++) {
      if (isUnlocked(topics[i].id)) return topics[i]
    }
    return null
  }

  const getPreviousTopic = () => {
    if (!viewingTopic) return null
    const index = topics.findIndex(t => t.id === viewingTopic.id)
    for (let i = index - 1; i >= 0; i--) {
      if (isUnlocked(topics[i].id)) return topics[i]
    }
    return null
  }

  const isLastTopic = () => viewingTopic?.id === topics[topics.length - 1]?.id
  const nextTopic = getNextUnlockedTopic()
  const previousTopic = getPreviousTopic()
  const progressPercentage = Math.round((completedIds.length / topics.length) * 100)

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#1B264F] text-[#F5F3F5] p-6 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Study Notes</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {loading && <p>Loading your notes...</p>}

        {!loading && (
          <>
            <p className="mb-6 text-center max-w-xl">
              Complete each topic in order. Once all are complete, the exam will unlock.
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-md bg-gray-300 rounded-full h-4 mb-6">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="mb-6 text-sm text-center">{progressPercentage}% completed</p>

            {/* Topics List */}
            <div className="space-y-4 w-full max-w-lg">
              {topics.map(topic => {
                const isDone = completedIds.includes(topic.id)
                const unlocked = isUnlocked(topic.id)

                return (
                  <div
                    key={topic.id}
                    className={`p-4 rounded-lg shadow-lg flex justify-between items-center ${
                      unlocked ? 'bg-[#F5F3F5] text-[#1B264F]' : 'bg-gray-400 text-gray-300'
                    }`}
                  >
                    <div>
                      <h2 className="text-xl font-bold">{topic.title}</h2>
                      <p className="text-sm">
                        {isDone ? '✅ Completed' : unlocked ? '🔓 Unlocked' : '🔒 Locked'}
                      </p>
                    </div>
                    {unlocked && !isDone && (
                      <button
                        onClick={() => handleViewNotes(topic)}
                        disabled={loadingUrlId === topic.id}
                        className={`bg-[#1B264F] text-[#F5F3F5] px-4 py-2 rounded hover:bg-[#1B299F] transition font-bold ${
                          loadingUrlId === topic.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {loadingUrlId === topic.id ? 'Loading...' : 'Read Notes'}
                      </button>
                    )}
                    {isDone && <span className="text-green-500 font-bold">Done</span>}
                  </div>
                )
              })}
            </div>

            <div className="mt-10">
              {allCompleted ? (
                <Link href="/exam">
                  <button className="bg-[#F5F3F5] text-[#1B264F] font-bold px-6 py-3 rounded hover:bg-[#1B264F] hover:text-[#F5F3F5] transition">
                    ✅ Go to Practice Exam
                  </button>
                </Link>
              ) : (
                <button
                  disabled
                  className="bg-gray-500 text-gray-300 font-bold px-6 py-3 rounded cursor-not-allowed"
                >
                  Complete All Topics to Unlock Exam
                </button>
              )}
            </div>
          </>
        )}

        {/* Responsive Modal for PDF */}
        {viewingTopic && signedUrl && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl relative flex flex-col items-center">
              <button
                className="absolute top-2 right-4 text-gray-600 text-xl font-bold"
                onClick={() => {
                  setViewingTopic(null)
                  setSignedUrl(null)
                }}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center text-[#1B264F]">
                {viewingTopic.title}
              </h2>
              {iframeLoading && <p className="text-center text-gray-500 mb-2">Loading PDF...</p>}
              <iframe
                src={signedUrl}
                className="w-full h-[70vh] md:h-[80vh] lg:h-[90vh] border rounded"
                onLoad={async () => {
                  setIframeLoading(false)
                  await handleComplete(viewingTopic.id)
                }}
              ></iframe>

              {/* Modal Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <button
                  onClick={() => {
                    setViewingTopic(null)
                    setSignedUrl(null)
                  }}
                  className="bg-gray-300 text-[#1B264F] px-4 py-2 rounded hover:bg-gray-400 transition font-bold"
                >
                  Back to Notes List
                </button>
                {previousTopic && (
                  <button
                    onClick={() => handleViewNotes(previousTopic)}
                    className="bg-[#1B264F] text-[#F5F3F5] px-4 py-2 rounded hover:bg-[#1B299F] transition font-bold"
                  >
                    Previous Topic
                  </button>
                )}
                {isLastTopic() ? (
                  <Link href="/exam">
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-bold">
                      ✅ Go to Practice Exam
                    </button>
                  </Link>
                ) : nextTopic && (
                  <button
                    onClick={() => handleViewNotes(nextTopic)}
                    className="bg-[#1B264F] text-[#F5F3F5] px-4 py-2 rounded hover:bg-[#1B299F] transition font-bold"
                  >
                    Next Topic: {nextTopic.title}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  )
}

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function LoggedInNavbar() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const name = user?.user_metadata?.name || 'Driver'
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <nav className="bg-[#F5F3F5] w-full  text-[#1B264F] p-4 shadow flex flex-col md:flex-row md:justify-between md:items-center">
      <div className="flex justify-between items-center">
        <Link href="/explore">
          <img
            src="/image/Logo.png"
            alt="Logo"
            width={60}
            height={60}
            className="cursor-pointer"
          />
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      <div className={`mt-2 md:mt-0 ${isOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-6 font-semibold`}>
        <Link href="/notes" className="block mt-2 md:mt-0 hover:underline">Study Notes</Link>
        <Link href="/exam" className="block mt-2 md:mt-0 hover:underline">Practice Exam</Link>
        <Link href="/results" className="block mt-2 md:mt-0 hover:underline">Results</Link>

        <Link href="/profile" className="flex items-center gap-2 mt-2 md:mt-0 hover:underline">
          <div className="w-8 h-8 rounded-full bg-[#1B264F] text-white flex items-center justify-center font-bold">
            {initials}
          </div>
          <span>{name}</span>
        </Link>

        <button
          onClick={signOut}
          className="bg-red-500 text-white px-3 py-1 mt-2 md:mt-0 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

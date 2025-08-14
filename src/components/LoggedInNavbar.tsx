import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

export default function LoggedInNavbar() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const name = user?.user_metadata?.name || 'Driver'
  const initials = name
  .split(' ')
  .map((n: string) => n[0])
  .join('')
  .toUpperCase()


  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo / Brand */}
      <Link href="/">
        <span className="font-bold text-xl text-[#1B264F] cursor-pointer">MyApp</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/exam" className="hover:underline">
          Exam
        </Link>
        <Link href="/results" className="hover:underline">
          Results
        </Link>

        {/* Profile / Study Notes */}
        <Link
          href="/notes"
          className="flex items-center gap-2 hover:underline"
        >
          <div className="bg-[#1B264F] text-white flex items-center justify-center font-bold w-8 h-8 rounded-full">
            {initials}
          </div>
          <span>{name}</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="bg-[#1B264F] text-white px-4 py-2 rounded hover:bg-[#1B299F] transition font-bold"
        >
          Logout
        </button>
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#1B264F] font-bold text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/exam" className="hover:underline">
            Exam
          </Link>
          <Link href="/results" className="hover:underline">
            Results
          </Link>
          <Link
            href="/notes"
            className="flex items-center gap-2 hover:underline"
          >
            <div className="bg-[#1B264F] text-white flex items-center justify-center font-bold w-8 h-8 rounded-full">
              {initials}
            </div>
            <span>{name}</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="bg-[#1B264F] text-white px-4 py-2 rounded hover:bg-[#1B299F] transition font-bold"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

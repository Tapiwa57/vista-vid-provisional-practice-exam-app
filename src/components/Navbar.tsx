import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  const name = user?.user_metadata?.name || 'Profile'
  const avatarUrl = user?.user_metadata?.avatar_url || '/image/avatar-default.png'

  return (
    <nav className="bg-[#F5F3F5] text-[#1B264F] p-4 flex justify-between items-center">
      {/* Left: Logo links to dashboard if logged in, else explore */}
      <div className="flex items-center space-x-2">
        <Link href={user ? '/notes' : '/explore'}>
          <Image src="/image/Logo.png" alt="Logo" width={70} height={70} priority />
        </Link>
      </div>

      {/* Right: Authenticated View */}
      {user ? (
        <div className="flex items-center space-x-6 mt-2">
          <Link href="/notes">Study Notes</Link>
          <Link href="/exam">Practice Exam</Link>
          <Link href="/results">Results</Link>

          <Link href="/profile" className="flex items-center space-x-2 hover:underline">
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full border border-[#1B264F]"
            />
            <span className="font-semibold">{name}</span>
          </Link>

          <button
            onClick={signOut}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        // Visitor View
        <div className="flex items-center space-x-6 mt-2">
          <Link href="/explore" className="font-semibold">Explore</Link>
          <Link href="/" className="bg-[#1B264F] text-white px-4 py-2 rounded hover:bg-[#1B299F]">
            Sign Up / Log In
          </Link>
        </div>
      )}
    </nav>
  )
}

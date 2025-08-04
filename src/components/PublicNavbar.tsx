// src/components/PublicNavbar.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import SignUpModal from './SignUpModal' // we'll build this next

export default function PublicNavbar() {
  const [showSignup, setShowSignup] = useState(false)

  return (
    <>
      <nav className="bg-[#F5F3F5] text-[#1B264F] p-4 flex justify-between items-center shadow">
        <Link href="/explore">
          <Image src="/image/Logo.png" alt="Logo" width={60} height={60} className="cursor-pointer" />
        </Link>
        <ul className="flex gap-6 font-bold">
          <li>
            <Link href="/about">
              <button className="py-2 px-2 rounded text-[#1B264F] hover:text-[#302B27] transition hover:underline">About Us</button>
            </Link>
          </li>
          <li>
            <Link href="/">
              <button className='rounded py-2 px-2 bg-[#1B264F] text-white hover:bg-[#302B27]'>Log In</button>
            </Link>
          </li>
          <li>
            <button
              onClick={() => setShowSignup(true)}
              className='rounded py-2 px-2 bg-[#302B27] text-white hover:bg-[#1B264F]'
            >
              Sign Up
            </button>
          </li>
        </ul>
      </nav>
      {showSignup && <SignUpModal onClose={() => setShowSignup(false)} />}
    </>
  )
}

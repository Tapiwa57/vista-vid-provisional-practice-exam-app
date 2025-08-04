// src/components/SignUpModal.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'


interface SignUpModalProps {
  onClose: () => void
}

export default function SignUpModal({ onClose }: SignUpModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignup = async () => {
    setError(null)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const user = signUpData?.user
    if (user) {
      await supabase.from('profiles').insert([
        {
          id: user.id,
          name,
          created_at: new Date().toISOString(),
        },
      ])
    }

    setMessage('Check your email to confirm signup.')
    setEmail('')
    setPassword('')
    setName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-[#302B27] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl relative">
        <button
          className="absolute top-2 right-4 text-gray-600 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <Link href='/explore'><Image  className=" ml-39" src='/image/Logo.png' alt='Logo' width={80} height={80} /></Link>
        <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-3 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-6 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-[#1B264F] text-white w-full py-2 rounded hover:bg-[#302B27] transition"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}

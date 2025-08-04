'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import React from 'react'

export default function IndexPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showSignup, setShowSignup] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  /*const { user, loading } = useAuth()*/

  const handleLogin = async () => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignup = async () => {
    setError(null)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const user = signUpData?.user
    if (user) {
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          created_at: new Date().toISOString(),
          name: name,
        },
      ])

      if (insertError) {
        console.error("Failed to insert into profiles:", insertError)
      }
    }

    alert('Check your email to confirm signup.')
    setShowSignup(false)
  }

  const handleForgotPassword = async () => {
    setError(null)
    setMessage(null)

    const currentUrl = window.location.origin
    const redirectUrl = `${currentUrl}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) setError(error.message)
    else {
      setMessage('Password reset email sent. Please check your inbox.')
      setShowForgot(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1B264F] flex flex-col md:flex-row items-center justify-center max-w-full gap-7 px-4 py-12 md:py-7">
      {/* Left side: Welcome & Logo */}
      <div className="md:w-1/2 flex flex-col justify-center items-center text-[#F5F3F5]">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center leading-tight">
          Welcome<br />to
        </h2>
        <Image src="/image/Logo.png" alt="logo" width={170} height={170} className="mb-6" priority />
        <p className="text-base md:text-lg mb-6 text-center leading-relaxed max-w-md">
          VID Oral Provisional Exam Practice site which is a smart, interactive learning platform
          designed to help aspiring drivers confidently prepare for their Vehicle Inspection Department (VID) oral exams.
        </p>
        <Link href="/explore" passHref>
          <button className="bg-[#F5F3F5] text-[#1B264F] font-extrabold rounded px-8 py-3 mb-4 hover:bg-[#1B264F] hover:text-[#F5F3F5] transition cursor-pointer w-full max-w-xs">
            Explore more
          </button>
        </Link>
        <button
          className="bg-[#302B27] text-[#F5F3F5] font-semibold px-8 py-3 rounded hover:bg-[#F5F3F5] hover:text-[#302B27] transition cursor-pointer w-full max-w-xs"
          onClick={() => setShowSignup(true)}
        >
          Sign Up
        </button>
      </div>

      {/* Right side: Login Form */}
      <div
        className="md:w-1/2 py-10 px-6 flex flex-col justify-center items-center rounded-lg bg-cover bg-center opacity-90 max-w-md w-full"
        style={{ backgroundImage: "url('/image/Aerial-Intersection-Dynamics.png')"}}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center">Log In</h2>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {message && <p className="text-green-300 text-sm mb-3">{message}</p>}

        <input
          className="text-black font-semibold p-3 w-full mb-4 rounded bg-[#D9D9D9] opacity-90"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="text-black font-semibold p-3 w-full mb-4 rounded bg-[#D9D9D9] opacity-90"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between w-full mb-6 text-white text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#F5F3F5]"
            />
            <span>Remember Me</span>
          </label>
          <button
            className="hover:underline text-sm"
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </button>
        </div>

        <button
          className="bg-[#1B264F] text-white w-full py-3 rounded hover:bg-[#1B299F] transition font-extrabold"
          onClick={handleLogin}
        >
          Log In
        </button>
      </div>

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 bg-[#302B27] bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl relative">
            <button
              className="absolute top-3 right-4 text-gray-600 text-2xl font-bold"
              onClick={() => setShowSignup(false)}
              aria-label="Close signup modal"
            >
              &times;
            </button>
            <Link href='/explore'><Image  className=" ml-39" src='/image/Logo.png' alt='Logo' width={80} height={80} /></Link>
            <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <input
              className="border p-3 w-full mb-4 rounded"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border p-3 w-full mb-4 rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border p-3 w-full mb-6 rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="bg-[#1B264F] text-white w-full py-3 rounded hover:bg-[#302B15] transition cursor-pointer font-semibold"
              
              onClick={handleSignup}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl relative">
            <button
              className="absolute top-3 right-4 text-gray-600 text-2xl font-bold"
              onClick={() => setShowForgot(false)}
              aria-label="Close forgot password modal"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
            <input
              className="border p-3 w-full mb-6 rounded"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="bg-[#1B264F] text-white w-full py-3 rounded hover:bg-[#1B299F] transition font-extrabold"
              onClick={handleForgotPassword}
            >
              Send Reset Link
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

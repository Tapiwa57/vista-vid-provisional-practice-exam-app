'use client'

import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import SignUpModal from '../components/SignUpModal'
import Link from 'next/link'

interface Testimonial {
  id: number
  message: string
  rating: number
  user_id: string
  profiles?: { name: string }
}

export default function AboutPage() {
  const [showSignup, setShowSignup] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'snap',
    slides: { perView: 1, spacing: 10 },
  })

  const [years, setYears] = useState<number>(0)

  useEffect(() => {
    AOS.init({ duration: 1000 })
  }, [])

  useEffect(() => {
    const fetchExperienceYears = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('experience_years')
        .single()

      if (!error && data) setYears(data.experience_years || 0)
    }

    fetchExperienceYears()
  }, [])

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, message, rating, user_id, profiles(name)')
        .order('id', { ascending: false })
        .limit(10)

      if (error) {
        console.error('❌ Failed to fetch testimonials:', error)
      } else if (data) {
        const flattened = data.map(item => ({
          ...item,
          profiles: item.profiles?.[0] || null,
        }))
        setTestimonials(flattened)
      }
    }

    fetchTestimonials()
  }, [])

  return (
    <>
      <Head>
        <title>About Us | VISTA</title>
        <meta name="description" content="Learn more about VISTA's mission, goals, and location." />
      </Head>

      <section className="relative bg-[url('/image/Focused-Student-Writing.png')] text-white py-20 sm:py-28 px-4 sm:px-6 md:px-20">
        <div className="absolute inset-0 bg-[url('/image/hero-bg-road.png')] bg-cover bg-center opacity-10 animate-pulse" />
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <Image src="/image/Logo.png" alt="VISTA Logo" width={100} height={100} className="mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6">About VISTA</h1>
          <p className="text-base sm:text-lg text-white">
            Zimbabwes #1 platform for preparing for the VID Provisional Exam with interactive mock tests,
            study notes, and instant feedback.
          </p>
        </div>
      </section>

      <section className="flex flex-col md:flex-row items-center justify-between gap-10 px-4 sm:px-6 md:px-20 py-12 sm:py-16 max-w-7xl mx-auto">
        <motion.div
          className="w-full md:w-1/2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/image/pexels-julia-m-cameron-4144144.jpg"
            alt="Happy learner"
            width={500}
            height={500}
            className="rounded-2xl w-full object-cover"
          />
          <div className="mt-6 sm:mt-10 bg-[#1B264F] text-white px-6 py-4 rounded-xl shadow-xl w-fit mx-auto sm:mx-0">
            <h3 className="text-2xl sm:text-3xl font-bold">{years.toString().padStart(2, '0')}</h3>
            <p className="text-sm">years of experience</p>
          </div>
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 text-[#1B264F]"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold mb-2">About Us</h3>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Build Your Skills With <br />
            Flexible Online Courses
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6">
            VISTA is your smart companion for preparing for VID oral exams. With interactive questions,
            feedback, and a library of study materials, we aim to make your success inevitable.
          </p>
          <p className="text-gray-600 mb-6">
            Join thousands of learners who’ve trusted VISTA to gain confidence before the big day!
          </p>
          <button
            className="bg-[#302B15] hover:bg-[#1B264F] transition text-white px-6 py-3 rounded-lg font-medium"
            onClick={() => setShowSignup(true)}
          >
            Join With Us Now
          </button>
          {showSignup && <SignUpModal onClose={() => setShowSignup(false)} />}
        </motion.div>
      </section>

      <section className="bg-white py-20 px-4 sm:px-6 md:px-20 text-[#1B264F] text-center">
        <h2 className="text-3xl font-bold mb-10">🎬 Meet VISTA</h2>
        <div className="mx-auto max-w-3xl rounded-xl overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/ppCFstVjp4g"
            title="VISTA Introduction Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <section className="bg-[#F5F3F5] py-20 px-4 sm:px-6 md:px-20 text-center">
        <h2 className="text-3xl font-bold mb-12 text-[#1B264F]">🚗 What Drives Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: '🎯',
              title: 'Our Goal',
              text: 'Make exam prep accessible and engaging using smart, user-friendly tools.',
            },
            {
              icon: '🚀',
              title: 'Mission',
              text: 'Simplify the journey to a license by offering curated content and mock exams.',
            },
            {
              icon: '📍',
              title: 'Location',
              text: 'Proudly built in Zimbabwe — serving learners nationwide 24/7 online.',
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white text-[#1B264F] rounded-lg p-6 shadow-md hover:shadow-xl transition"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <h3 className="text-2xl font-bold mb-2">{card.icon} {card.title}</h3>
              <p className="text-gray-700">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#1B264F] text-white py-20 px-4 sm:px-6 md:px-20 text-center">
        <h2 className="text-3xl font-bold mb-10">⭐ Trusted by Learners</h2>
        <div className="flex flex-wrap justify-center gap-10 max-w-5xl mx-auto">
          {['Chipo, Harare', 'Tawanda, Bulawayo', 'Rudo, Mutare'].map((name, i) => (
            <div key={i} className="bg-white text-[#1B264F] p-6 rounded-xl shadow w-full sm:w-[300px]" data-aos="fade-in">
              <p className="italic">"This platform helped me pass on my first try!"</p>
              <p className="mt-4 font-bold">{name}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-white text-center py-10">
        <a href="/" className="bg-[#1B264F] text-white px-8 py-4 rounded font-semibold hover:bg-[#302B27] transition">
          🚀 Explore VISTA Now
        </a>
      </div>
      {/* Footer */}
      <div className="bg-[#302B27] text-white px-4 sm:px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 w-full text-center md:text-left">
            <Link href='/explore'><Image src="/image/Logo.png" alt="Logo" width={120} height={0} /></Link>
            <div>
              <Link href='/about'>
                <h2 className="text-xl font-bold mb-4">About Us</h2>
                <ul className="space-y-2 text-gray-300">
                  <li>Our Goal</li>
                  <li>Mission</li>
                  <li>Location</li>
                </ul>
              </Link>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Follow Us</h2>
              <div className="flex justify-center md:justify-start gap-4 mb-4">
                <Image src="/image/skill-icons--instagram.svg" alt="Instagram" width={30} height={30} />
                <Image src="/image/skill-icons--linkedin.svg" alt="LinkedIn" width={30} height={30} />
                <Image src="/image/logos--facebook.svg" alt="Facebook" width={30} height={30} />
              </div>
              <p className="text-gray-300 mb-1">Or Email Us:</p>
              <a href="mailto:bibiralph57@gmail.com" className="hover:underline">
                supporteam@vistaprovisional.co.zw
              </a>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Course</h2>
              <p className="text-gray-300 mb-4">VID Provisional</p>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="font-semibold"><button
                  onClick={() => setShowSignup(true)}
                 className='bg-white hover:bg-[#1B264F] hover:text-white text-[#1B264F] px-4 py-2 rounded'>Sign Up</button></span>
                 <Link href='/'><button className='bg-[#1B264F] hover:bg-white hover:text-[#1B264F] text-white font-bold px-4 py-2 rounded'>Log In</button></Link>
              </div>
              {showSignup && <SignUpModal onClose={() => setShowSignup(false)} />}
            </div>
            
          </div>
          <div className="w-full border-t border-gray-600 pt-6 text-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} <span className="font-bold text-white">VISTA</span>, Zimbabwe. All rights reserved.
              <br />
              <span className="text-xs mt-1 block"><a href='www.linkedin.com/in/tapiwa-ndemera-373704348'>Designed by Tapiwa Ndemera</a></span>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

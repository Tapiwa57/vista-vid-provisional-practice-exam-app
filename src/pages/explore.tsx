'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import SignUpModal from '../components/SignUpModal' 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Blog = { id: string; title: string; content: string; created_at: string }
type Testimonial = { id: string; message: string; rating: number; profiles?: { name?: string }; created_at: string }

export default function ExplorePage() {
  const [showSignup, setShowSignup] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const sliderContainerRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isHovered = useRef(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    detailsChanged(s) { setCurrentSlide(s.track.details.rel) },
  })

  const [testimonialsSliderRef] = useKeenSlider({
    loop: true,
    breakpoints: { '(max-width: 768px)': { slides: { perView: 1 } } },
    slides: { perView: 3, spacing: 15 },
  })

  const [stats, setStats] = useState({ users: 0, questions: 0, blogs: 0, completed: 0 })
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    const startAutoplay = () => {
      timerRef.current = setInterval(() => { if (!isHovered.current) instanceRef.current?.next() }, 3000)
    }
    const stopAutoplay = () => { if (timerRef.current) clearInterval(timerRef.current) }

    startAutoplay()
    const container = sliderContainerRef.current
    if (container) {
      const onMouseEnter = () => { isHovered.current = true }
      const onMouseLeave = () => { isHovered.current = false }
      container.addEventListener("mouseenter", onMouseEnter)
      container.addEventListener("mouseleave", onMouseLeave)
      return () => {
        stopAutoplay()
        container.removeEventListener("mouseenter", onMouseEnter)
        container.removeEventListener("mouseleave", onMouseLeave)
      }
    }
    return () => { stopAutoplay() }
  }, [instanceRef])

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: userCount }, { count: questionCount }, { count: blogCount }, { count: completedCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('exam-questions').select('*', { count: 'exact', head: true }),
        supabase.from('blogs').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true })
      ])
      setStats({
        users: userCount || 0,
        questions: questionCount || 0,
        blogs: blogCount || 0,
        completed: completedCount || 0
      })
    }

    const fetchBlogs = async () => {
      const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })
      setBlogs(data || [])
    }

    const fetchTestimonials = async () => {
      const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
      setTestimonials(data || [])
    }

    fetchStats()
    fetchBlogs()
    fetchTestimonials()
  }, [])

  const slides = [
    { image: "/image/Focused-Study-Session.png", caption: "Prepare for your VID Oral Exams" },
    { image: "/image/pexels-pixabay-208494.jpg", caption: "Interactive Learning Platform" },
    { image: "/image/Yellow-Urban-Composition.png", caption: "Test Your Knowledge Today" }
  ]

  return (
    <section className="bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">

      {/* Hero Slider */}
      <div ref={sliderContainerRef} className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] w-full overflow-hidden">
        <div ref={sliderRef} className="keen-slider h-full w-full">
          {slides.map((slide, i) => (
            <div key={i} className={`keen-slider__slide relative transition-opacity duration-1000 ${currentSlide === i ? 'opacity-100' : 'opacity-0'}`}>
              <Image src={slide.image} alt={`Slide ${i + 1}`} fill className="object-cover w-full h-full" priority />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold px-4 text-center">
                {slide.caption}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => instanceRef.current?.prev()} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/70">
          <ChevronLeft size={28} />
        </button>
        <button onClick={() => instanceRef.current?.next()} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/40 p-2 rounded-full text-white hover:bg-black/70">
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Intro Section */}
      <section className="py-12 px-4 sm:px-6 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[var(--primary)] leading-tight mb-4">
            Welcome to <br className="md:hidden" />
            <span className="text-[var(--highlight)]">Vehicle Inspector Skill &amp; Test Application (VISTA)</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[var(--foreground)] max-w-3xl mx-auto mt-4">
            Your complete preparation companion for the VID provisional oral exams. Learn, practice, and track your progress — all in one place.
          </p>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center gap-10 md:gap-20">
          {/* Image */}
          <div className="w-full md:w-1/2 flex justify-center">
            <Image
              className="rounded-2xl shadow-xl w-[90%] max-w-[400px]"
              src="/image/Aerial-View-of-Urban-Traffic.png"
              alt="Urban Traffic"
              width={400}
              height={350}
            />
          </div>

          {/* Text Content */}
          <div className="w-full md:w-1/2 text-[var(--primary)]">
            <p className="text-base md:text-lg mb-6 leading-relaxed text-[var(--foreground)]">
              VISTA is a smart, interactive learning platform designed to help aspiring drivers confidently prepare for their Vehicle Inspection Department (VID) oral exams.{" "}
              The app offers a comprehensive practice experience with multiple-choice questions, realistic simulations, and detailed performance feedback.
            </p>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">How to Get Started</h2>
            <ul className="list-disc list-inside text-base space-y-2 text-[var(--foreground)]">
              <li>📝 <Link href="/" className="font-bold underline hover:text-[var(--highlight)]">Sign up</Link> to unlock full access</li>
              <li>📘 Review study notes covering the Highway Code</li>
              <li>🕐 Attempt timed multiple-choice exams</li>
              <li>📊 Analyze your results and focus on improvement</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Video Intro */}
      <section className="bg-[var(--secondary)] py-16 px-4 sm:px-6 md:px-20 text-[var(--foreground)] text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-10">🎬 Meet VISTA</h2>
        <div className="mx-auto max-w-3xl rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-[200px] sm:h-[250px] md:h-[315px]"
            src="https://www.youtube.com/embed/ppCFstVjp4g"
            title="VISTA Introduction Video"
            allowFullScreen
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 md:px-20 bg-[var(--secondary)] text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-[var(--primary)]">Trusted by Learners Across Zimbabwe</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatBox number={stats.users} label="Registered Users" />
          <StatBox number={stats.questions} label="Questions Available" />
          <StatBox number={stats.completed} label="Mock Exams Completed" />
        </div>
        <Link href="/">
          <button className="bg-[var(--accent)] hover:bg-[var(--primary)] text-white font-medium px-10 py-3 rounded-lg mt-8 transition duration-300">
            🚀 Get Started Now
          </button>
        </Link>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 md:px-20 bg-[var(--primary)] text-[var(--foreground)]">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 text-white">What Our Learners Say</h1>
        <div ref={testimonialsSliderRef} className="keen-slider">
          {testimonials.map((item, index) => (
            <div className="keen-slider__slide bg-[var(--secondary)] text-[var(--foreground)] p-6 rounded-xl shadow" key={index}>
              <p className="italic">&quot;{item.message}&quot;</p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={18} fill={star <= item.rating ? 'var(--highlight)' : 'none'} stroke="var(--highlight)" />
                ))}
              </div>
              <h4 className="mt-4 font-bold">– {item.profiles?.name || 'Anonymous'}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Tutorials Section */}
      <section className="py-16 px-4 sm:px-6 md:px-20 bg-[var(--secondary)] text-[var(--foreground)]">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10">
          Driving Video Tutorials &amp; Tips
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { title: "VID Provisional Test Questions 2024", src: "https://www.youtube.com/embed/2IdyMI2J88M" },
            { title: "Which Car Goes First? (VID Provisional)", src: "https://www.youtube.com/embed/_s5JtBugXM8" },
            { title: "Defensive Driving Tips in Zimbabwe", src: "https://www.youtube.com/embed/9pgRqooseBs" }
          ].map((video, i) => (
            <div key={i} className="bg-[var(--secondary)] p-4 rounded-xl shadow">
              <iframe className="w-full h-[200px] sm:h-[250px]" src={video.src} allowFullScreen title={video.title} />
              <h3 className="font-bold text-xl mt-3">{video.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center py-10 gap-10 px-4 text-center">
        <Image className="rounded" src="/image/Urban-Tapestry-The-Zebra-Crossing-Ballet.png" alt='' width={300} height={0} />
        <Link href="/notes">
          <button className="bg-[var(--accent)] hover:bg-[var(--primary)] transition text-white px-10 py-4 rounded text-lg">
            Unlock Study Notes
          </button>
        </Link>
      </div>

      {/* Footer */}
      <div className="bg-[var(--accent)] text-white px-4 sm:px-6 py-10">
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
              <Link href='/'><p className="text-gray-300 mb-4">Provisional Practice exam</p></Link>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="font-semibold">
                  <button onClick={() => setShowSignup(true)} className='bg-white hover:bg-[var(--primary)] hover:text-white text-[var(--accent)] px-4 py-2 rounded'>Sign Up</button>
                </span>
                <Link href='/'><button className='bg-[var(--primary)] hover:bg-white hover:text-[var(--primary)] text-white font-bold px-4 py-2 rounded'>Log In</button></Link>
              </div>
              {showSignup && <SignUpModal onClose={() => setShowSignup(false)} />}
            </div>
          </div>
          <div className="w-full border-t border-gray-600 pt-6 text-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} <span className="font-bold text-white">VISTA</span>, Zimbabwe. All rights reserved.
              <br />
              <span className="text-xs mt-1 block"><a href="https://www.linkedin.com/in/tapiwa-ndemera-373704348">Designed by Tapiwa Ndemera</a></span>
            </p>
          </div>
        </div>
      </div>

    </section>
  )
}

function StatBox({ number, label }: { number: number; label: string }) {
  return (
    <div className="bg-[var(--secondary)] rounded-xl shadow p-4 sm:p-6 transition hover:scale-105 duration-300">
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--primary)]">{number}</h2>
      <p className="mt-2 text-sm text-[var(--foreground)]">{label}</p>
    </div>
  )
}

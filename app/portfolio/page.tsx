// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code, 
  Palette, 
  Smartphone,
  Menu,
  X,
  ArrowRight
} from 'lucide-react'

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'contact']
      const scrollPosition = window.scrollY + 100

      sections.forEach(section => {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const projects = [
    {
      title: "NeuralDoodle - AI Image Classification Tool",
      description: "Real-time browser-based image classifier with 90%+ accuracy using TensorFlow.js and MobileNet.",
      tech: ["Next.js", "TypeScript", "TailwindCSS", "TensorFlow.js"],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
      github: "https://github.com/RahulGogra",
      live: "https://neuraldoodle.vercel.app"
    },
    {
      title: "Algorithm Visualizer",
      description: "Interactive platform to visualize sorting and pathfinding algorithms using React and D3.js.",
      tech: ["React", "D3.js", "JavaScript", "CSS Animations"],
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
      github: "https://github.com/RahulGogra",
      live: "https://algorithm-visualizer-umber.vercel.app"
    }
  ]

  const skills = [
    { name: "Frontend", icon: <Code className="w-8 h-8" />, items: ["HTML5", "CSS3", "React.js", "Next.js", "Bootstrap", "TailwindCSS"] },
    { name: "Backend", icon: <Code className="w-8 h-8" />, items: ["Node.js", "Express.js", "PHP"] },
    { name: "Databases", icon: <Code className="w-8 h-8" />, items: ["MongoDB", "MySQL", "Firebase"] },
    { name: "Tools & More", icon: <Palette className="w-8 h-8" />, items: ["Git", "Postman", "VS Code", "Chrome DevTools"] }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <motion.div
        className="fixed w-6 h-6 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{ left: mousePosition.x - 12, top: mousePosition.y - 12 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* -- Header Updated -- */}
      {/* Replace Name & Title */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 px-4">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Rahul Gogra
            </span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Full Stack Developer | AI Enthusiast | Cybersecurity Advocate
          </motion.p>
        </div>
      </section>

      {/* -- About Section Update -- */}
      {/* Professional Summary */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              About Me
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-6">
              <p className="text-lg text-gray-300 leading-relaxed">
                I’m a Computer Science student with hands-on experience in full-stack web development, AI/ML, and cybersecurity. Built 10+ projects, optimized systems up to 60%, and contributed to major showcases including a CTF competition and AI presentations.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                I enjoy solving complex problems, exploring ethical hacking, and designing intuitive, scalable solutions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -- Contact Info Update -- */}
      <section id="contact" className="py-20 px-4 bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Let's Work Together
            </h2>
            <p className="text-xl text-gray-300">
              Ready to bring your ideas to life? Let’s create something amazing together.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-gray-300">rgogra914@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Linkedin className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">LinkedIn</h3>
                  <p className="text-gray-300">linkedin.com/in/rahul-gogra-ba4135203</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <Github className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">GitHub</h3>
                  <p className="text-gray-300">github.com/RahulGogra</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -- Footer Update -- */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 Rahul Gogra. Crafted with ❤️ using Next.js, TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}

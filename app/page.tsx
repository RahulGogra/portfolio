// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    ArrowRight,
    Download,
} from "lucide-react";

// Import the CustomCursor component
import CustomCursor from "../components/CustomCursor"; // Adjust path as needed
import Image from "next/image";
import Link from "next/link";

export default function Portfolio() {
    const [activeSection, setActiveSection] = useState("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Scroll spy for active section
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "about", "skills", "projects", "contact"];
            const scrollPosition = window.scrollY + 100;

            sections.forEach((section) => {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveSection(section);
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
        setIsMenuOpen(false);
    };

    const projects = [
        {
            title: "NeuralDoodle - AI Image Classification Tool",
            description:
                "Built a browser-based image classifier supporting real-time webcam input with over 90% accuracy. Trained and deployed a KNN classifier using MobileNet embeddings for 5+ dynamic user-defined classes. Designed an intuitive interface adopted by 100+ testers for live model training and prediction visualization. [cite_start]Achieved 60% lower latency by executing training entirely client-side without server requests.",
            tech: ["Next.js", "TypeScript", "TailwindCSS", "TensorFlow.js"],
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop", // Placeholder image
            github: "https://github.com/RahulGogra/NeuralDoodle", // Assuming a GitHub link based on name
            live: "https://neuraldoodle.vercel.app",
        },
        {
            title: "Algorithm Visualizer",
            description:
                "Developed an interactive web app to animate 10+ algorithms, enhancing conceptual clarity for students. Illustrated complex logic of 5+ sorting and pathfinding algorithms (e.g., Merge Sort, A*) through real-time visuals. Optimized UI/UX design, resulting in a 35% increase in user interaction during testing sessions.",
            tech: ["React", "D3.js", "JavaScript", "CSS Animations"],
            image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop", // Placeholder image
            github: "https://github.com/RahulGogra/Algorithm_Visualizer", // Assuming a GitHub link based on name
            live: "https://algorithm-visualizer-umber.vercel.app",
        },
        {
            title: "Event Management System (Internship Project)",
            description:
                "Engineered a full-featured event management system using PHP, MySQL, HTML, and JavaScript. Secured user workflows with robust authentication, session handling, and role-based access control. Integrated email and SMS notifications, enhancing user engagement by 35%. Reduced server response time by 40% through SQL query optimization and indexing strategies.",
            tech: ["PHP", "MySQL", "HTML", "JavaScript"],
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
        },
    ];

    const skills = [
        {
            name: "Programming Languages",
            icon: <Code className="w-8 h-8" />,
            items: ["JavaScript", "TypeScript", "PHP", "C/C++", "SQL"],
        },
        {
            name: "Frontend Development",
            icon: <Code className="w-8 h-8" />,
            items: [
                "HTML5",
                "CSS3",
                "React.js",
                "Next.js",
                "Bootstrap",
                "TailwindCSS",
            ],
        },
        {
            name: "Backend Development",
            icon: <Code className="w-8 h-8" />,
            items: ["Node.js", "Express.js", "PHP"],
        },
        {
            name: "Database Technologies",
            icon: <Palette className="w-8 h-8" />,
            items: ["MongoDB", "MySQL", "Firebase", "Google Cloud"],
        },
        {
            name: "Developer Tools",
            icon: <Smartphone className="w-8 h-8" />,
            items: ["Git", "GitHub", "VS Code", "Chrome DevTools", "Postman"],
        },
        {
            name: "Other Skills",
            icon: <Code className="w-8 h-8" />,
            items: [
                "RESTful API Integration",
                "Data Structures & Algorithms",
                "UI/UX Design Principles",
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
            <CustomCursor />

            {/* Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <motion.div
                            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                        >
                            Rahul Gogra
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex space-x-8">
                            {[
                                "home",
                                "about",
                                "skills",
                                "projects",
                                "contact",
                            ].map((item) => (
                                <motion.button
                                    key={item}
                                    onClick={() => scrollToSection(item)}
                                    className={`capitalize transition-colors hover:text-blue-400 ${
                                        activeSection === item
                                            ? "text-blue-400"
                                            : "text-gray-300"
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {item}
                                </motion.button>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="md:hidden bg-gray-800 border-t border-gray-700"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="px-4 py-4 space-y-4">
                                {[
                                    "home",
                                    "about",
                                    "skills",
                                    "projects",
                                    "contact",
                                ].map((item) => (
                                    <motion.button
                                        key={item}
                                        onClick={() => scrollToSection(item)}
                                        className="block w-full text-left capitalize text-gray-300 hover:text-blue-400 transition-colors"
                                        whileHover={{ x: 10 }}
                                    >
                                        {item}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Hero Section */}
            <section
                id="home"
                className="min-h-screen flex items-center justify-center relative overflow-hidden"
            >
                {/* Background Animation */}
                <div className="absolute inset-0 opacity-20">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-blue-500 rounded-full"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                            }}
                            animate={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                            }}
                            transition={{
                                duration: Math.random() * 10 + 20,
                                repeat: Infinity,
                                repeatType: "reverse",
                            }}
                        />
                    ))}
                </div>

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
                        Full Stack Web Developer | AI Enthusiast | Cybersecurity
                        Advocate
                    </motion.p>
                    
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      <motion.button
                        onClick={() => scrollToSection('projects')}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View My Work <ArrowRight className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => scrollToSection('contact')}
                        className="px-8 py-3 border-2 border-gray-600 rounded-full font-semibold hover:border-blue-400 hover:text-blue-400 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Get In Touch
                      </motion.button>

                      {/* New Download Resume Button */}
                      <motion.a
                        href="/Rahul Gogra's CV.pdf" // Path relative to the public directory
                        download // This attribute makes the browser download the file
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Download Resume <Download className="w-4 h-4" />
                      </motion.a>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                </motion.div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            About Me
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                          initial={{ opacity: 0, x: -50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8 }}
                          viewport={{ once: true }}
                        >
                          <div className="relative">
                            <div className="w-80 h-80 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-1">
                              <div className="relative w-full h-full bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
                                {/* The actual image */}
                                <Image
                                  src="/RahulGogra.jpg" // Ensure this path is correct relative to your public folder
                                  alt="Rahul Gogra"
                                  layout="fill" // Use fill to make it cover the parent
                                  objectFit="cover" // Cover the area without distortion
                                  className="rounded-full z-10" // Make it round, ensure it's above the overlay
                                />
                                {/* Gradient overlay, ensure it's below the image */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 z-0"></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <p className="text-lg text-gray-300 leading-relaxed">
                                I&apos;m a Computer Science student with
                                experience in full-stack web development, AI
                                projects, and cybersecurity. I have worked with
                                6+ programming languages and frameworks, built
                                10+ web applications, and achieved up to 60%
                                performance gains by applying efficient tools
                                and techniques.
                            </p>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                I am currently pursuing a B.Tech in Computer
                                Science and Engineering at the Indian Institute
                                of Information Technology, Manipur (2022-2026).
                                My coursework includes Data Structures and
                                Algorithms, Operating Systems, Artificial
                                Intelligence & Machine Learning, Database
                                Management Systems, Web Development, and
                                Computer Networks.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="bg-gray-800 px-4 py-2 rounded-full">
                                    <span className="text-blue-400 font-semibold">
                                        6+
                                    </span>{" "}
                                    Programming Languages
                                </div>
                                <div className="bg-gray-800 px-4 py-2 rounded-full">
                                    <span className="text-purple-400 font-semibold">
                                        10+
                                    </span>{" "}
                                    Web Applications
                                </div>
                                <div className="bg-gray-800 px-4 py-2 rounded-full">
                                    <span className="text-pink-400 font-semibold">
                                        60%
                                    </span>{" "}
                                    Performance Gains
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="py-20 px-4 bg-gray-800/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Skills & Expertise
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {skills.map((skill, index) => (
                            <motion.div
                                key={skill.name}
                                className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                            >
                                <div className="text-blue-400 mb-4 flex justify-center">
                                    {skill.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-center">
                                    {skill.name}
                                </h3>
                                <ul className="space-y-2">
                                    {skill.items.map((item, itemIndex) => (
                                        <motion.li
                                            key={item}
                                            className="text-gray-300 text-center"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: itemIndex * 0.1,
                                            }}
                                            viewport={{ once: true }}
                                        >
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Featured Projects
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.title}
                                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="relative overflow-hidden">
                                    <Image
                                        width={600}
                                        height={400}
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-3">
                                        {project.title}
                                    </h3>
                                    <p className="text-gray-300 mb-4">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        {project.github ?<motion.a
                                            href={project.github}
                                            className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Github className="w-4 h-4" />
                                            Code
                                        </motion.a>:null}
                                        {project.live? <motion.a
                                            href={project.live}
                                            className="flex items-center gap-2 text-gray-300 hover:text-purple-400 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Live Demo
                                        </motion.a>:null}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-4 bg-gray-800/50">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Let&apos;s Work Together
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                        <p className="text-xl text-gray-300">
                            Ready to bring your ideas to life? Let&apos;s create
                            something amazing together.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <Link
                                href="mailto:rgogra914@gmail.com"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Email
                                    </h3>
                                    <p className="text-gray-300">
                                        rgogra914@gmail.com
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="https://www.linkedin.com/in/rahul-gogra-ba4135203/"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <Linkedin className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        LinkedIn
                                    </h3>
                                    <p className="text-gray-300">
                                        linkedin.com/in/rahulgogra
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="https://www.github.com/RahulGogra"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                                    <Github className="w-6 h-6 text-pink-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        GitHub
                                    </h3>
                                    <p className="text-gray-300">
                                        github.com/RahulGogra
                                    </p>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.form
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <textarea
                                    placeholder="Your Message"
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                ></textarea>
                            </div>
                            <motion.button
                                type="submit"
                                className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Send Message
                            </motion.button>
                        </motion.form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-gray-800">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-400">
                        © 2024 Rahul Gogra. Crafted with ❤️ using Next.js,
                        TypeScript & Tailwind CSS
                    </p>
                </div>
            </footer>
        </div>
    );
}

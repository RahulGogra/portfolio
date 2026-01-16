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
import CustomCursor from "../components/CustomCursor";
import ThemeSwitcher from "../components/ThemeSwitcher";
import Image from "next/image";
import Link from "next/link";

type Position = {
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  duration: number;
};

export default function Portfolio() {
    const [activeSection, setActiveSection] = useState("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [positions, setPositions] = useState<Position[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
        const newPositions = Array.from({ length: 50 }, () => ({
            initialX: Math.random() * window.innerWidth,
            initialY: Math.random() * window.innerHeight,
            targetX: Math.random() * window.innerWidth,
            targetY: Math.random() * window.innerHeight,
            duration: Math.random() * 10 + 20,
        }));
        setPositions(newPositions);
        }
    }, []);

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
                "Built a browser-based image classifier supporting real-time webcam input with over 90% accuracy. Trained and deployed a KNN classifier using MobileNet embeddings for 5+ dynamic user-defined classes. Designed an intuitive interface adopted by 100+ testers for live model training and prediction visualization.",
            tech: ["Next.js", "TypeScript", "TailwindCSS", "TensorFlow.js"],
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
            github: "https://github.com/RahulGogra/NeuralDoodle",
            live: "https://neuraldoodle.vercel.app",
        },
        {
            title: "Algorithm Visualizer",
            description:
                "Developed an interactive web app to animate 10+ algorithms, enhancing conceptual clarity for students. Illustrated complex logic of 5+ sorting and pathfinding algorithms (e.g., Merge Sort, A*) through real-time visuals. Optimized UI/UX design, resulting in a 35% increase in user interaction during testing sessions.",
            tech: ["React", "D3.js", "JavaScript", "CSS Animations"],
            image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
            github: "https://github.com/RahulGogra/Algorithm_Visualizer",
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
        <div className="min-h-screen bg-primary text-primary overflow-x-hidden transition-theme">
            <CustomCursor />

            {/* Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-40 bg-primary/80 backdrop-blur-lg border-b border-theme"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <motion.div
                            className="text-2xl font-bold gradient-text"
                            whileHover={{ scale: 1.05 }}
                        >
                            Rahul Gogra
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
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
                                    className={`capitalize transition-theme ${
                                        activeSection === item
                                            ? "text-primary"
                                            : "text-secondary hover:text-primary"
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {item}
                                </motion.button>
                            ))}
                            <ThemeSwitcher />
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-4">
                            <ThemeSwitcher />
                            <motion.button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                whileTap={{ scale: 0.95 }}
                                className="text-secondary hover:text-primary transition-theme"
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="md:hidden bg-secondary border-t border-theme"
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
                                        className="block w-full text-left capitalize text-secondary hover:text-primary transition-theme"
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
                    {positions.map((pos, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                        initial={{ x: pos.initialX, y: pos.initialY }}
                        animate={{ x: pos.targetX, y: pos.targetY }}
                        transition={{
                        duration: pos.duration,
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
                        <span className="gradient-text">
                            Rahul Gogra
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-secondary mb-8"
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
                        className="px-8 py-3 gradient-primary rounded-full font-semibold shadow-theme transition-theme flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View My Work <ArrowRight className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        onClick={() => scrollToSection('contact')}
                        className="px-8 py-3 border-2 border-theme rounded-full font-semibold hover:bg-tertiary transition-theme"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Get In Touch
                      </motion.button>

                      <motion.a
                        href="https://drive.google.com/file/d/1gtkKFIwCusxQamjvCVxJ2xXnJ0eU-yVb/view?usp=drive_link"
                        target="_blank"
                        download
                        className="px-8 py-3 gradient-primary rounded-full font-semibold shadow-theme transition-theme flex items-center gap-2"
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
                    <ChevronDown className="w-6 h-6 text-muted" />
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
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                            About Me
                        </h2>
                        <div className="w-24 h-1 gradient-primary mx-auto"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                          initial={{ opacity: 0, x: -50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8 }}
                          viewport={{ once: true }}
                        >
                          <div className="relative">
                            <div className="w-80 h-80 mx-auto gradient-primary rounded-full p-1">
                              <div className="relative w-full h-full bg-primary rounded-full flex items-center justify-center overflow-hidden">
                                <Image
                                  src="/RahulGogra.jpg"
                                  alt="Rahul Gogra"
                                  layout="fill"
                                  objectFit="cover"
                                  className="rounded-full z-10"
                                />
                                <div className="absolute inset-0 gradient-primary rounded-full opacity-20 z-0"></div>
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
                            <p className="text-lg text-secondary leading-relaxed">
                                I&apos;m a Computer Science student with
                                experience in full-stack web development, AI
                                projects, and cybersecurity. I have worked with
                                6+ programming languages and frameworks, built
                                10+ web applications, and achieved up to 60%
                                performance gains by applying efficient tools
                                and techniques.
                            </p>
                            <p className="text-lg text-secondary leading-relaxed">
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
                                <div className="bg-secondary px-4 py-2 rounded-full">
                                    <span className="text-primary font-semibold">
                                        6+
                                    </span>{" "}
                                    Programming Languages
                                </div>
                                <div className="bg-secondary px-4 py-2 rounded-full">
                                    <span className="text-primary font-semibold">
                                        10+
                                    </span>{" "}
                                    Web Applications
                                </div>
                                <div className="bg-secondary px-4 py-2 rounded-full">
                                    <span className="text-primary font-semibold">
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
            <section id="skills" className="py-20 px-4 bg-secondary/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                            Skills & Expertise
                        </h2>
                        <div className="w-24 h-1 gradient-primary mx-auto"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {skills.map((skill, index) => (
                            <motion.div
                                key={skill.name}
                                className="bg-secondary p-6 rounded-xl border border-theme hover:border-primary transition-theme"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                            >
                                <div className="text-primary mb-4 flex justify-center">
                                    {skill.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-center">
                                    {skill.name}
                                </h3>
                                <ul className="space-y-2">
                                    {skill.items.map((item, itemIndex) => (
                                        <motion.li
                                            key={item}
                                            className="text-secondary text-center"
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
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                            Featured Projects
                        </h2>
                        <div className="w-24 h-1 gradient-primary mx-auto"></div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.title}
                                className="bg-secondary rounded-xl overflow-hidden border border-theme hover:border-primary transition-theme group"
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-60"></div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-3">
                                        {project.title}
                                    </h3>
                                    <p className="text-secondary mb-4">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-tertiary/20 text-tertiary rounded-full text-sm"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        {project.github ?<motion.a
                                            href={project.github}
                                            className="flex items-center gap-2 text-secondary hover:text-primary transition-theme"
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
                                            className="flex items-center gap-2 text-secondary hover:text-primary transition-theme"
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
            <section id="contact" className="py-20 px-4 bg-secondary/50">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                            Let&apos;s Work Together
                        </h2>
                        <div className="w-24 h-1 gradient-primary mx-auto mb-6"></div>
                        <p className="text-xl text-secondary">
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
                                <div className="w-12 h-12 bg-tertiary/20 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-tertiary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Email
                                    </h3>
                                    <p className="text-secondary">
                                        rgogra914@gmail.com
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="https://www.linkedin.com/in/rahul-gogra/"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-tertiary/20 rounded-full flex items-center justify-center">
                                    <Linkedin className="w-6 h-6 text-tertiary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        LinkedIn
                                    </h3>
                                    <p className="text-secondary">
                                        linkedin.com/in/rahul-gogra
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="https://www.github.com/RahulGogra"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-tertiary/20 rounded-full flex items-center justify-center">
                                    <Github className="w-6 h-6 text-tertiary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        GitHub
                                    </h3>
                                    <p className="text-secondary">
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
                                    className="w-full px-4 py-3 bg-primary border border-theme rounded-lg focus:border-accent-primary focus:outline-none transition-theme"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full px-4 py-3 bg-primary border border-theme rounded-lg focus:border-accent-primary focus:outline-none transition-theme"
                                />
                            </div>
                            <div>
                                <textarea
                                    placeholder="Your Message"
                                    rows={5}
                                    className="w-full px-4 py-3 bg-primary border border-theme rounded-lg focus:border-accent-primary focus:outline-none transition-theme resize-none"
                                ></textarea>
                            </div>
                            <motion.button
                                type="submit"
                                className="w-full px-8 py-3 gradient-primary rounded-lg font-semibold shadow-theme transition-theme"
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
            <footer className="py-8 px-4 border-t border-theme">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-muted">
                        © 2025 Rahul Gogra. Crafted with ❤️ using Next.js,
                        TypeScript & Tailwind CSS
                    </p>
                </div>
            </footer>
        </div>
    );
}
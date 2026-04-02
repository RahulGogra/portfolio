"use client";

import { useState, useEffect, type ReactElement } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
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
    Briefcase,
    Calendar,
} from "lucide-react";

import CustomCursor from "../components/CustomCursor";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useTheme } from "../contexts/ThemeContext";
import Image from "next/image";
import Link from "next/link";

type SkillItem = { name: string; icon: string; mono?: boolean };

export default function Portfolio() {
    const [activeSection, setActiveSection] = useState("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme } = useTheme();

    const isLightTheme = theme === "light";
    const monoColor = isLightTheme ? "000000" : "ffffff";

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "about", "skills", "experience", "projects", "contact"];
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
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
        },
    ];

    // skills is inside the component so monoColor is in scope
    const skills: { name: string; icon: ReactElement; items: SkillItem[] }[] = [
        {
            name: "Programming Languages",
            icon: <Code className="w-8 h-8" />,
            items: [
                { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript" },
                { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript" },
                { name: "PHP", icon: "https://cdn.simpleicons.org/php" },
                { name: "C", icon: "https://cdn.simpleicons.org/c" },
                { name: "C++", icon: "https://cdn.simpleicons.org/cplusplus" },
                { name: "Python", icon: "https://cdn.simpleicons.org/python" },
                { name: "SQL", icon: "https://cdn.simpleicons.org/mysql" },
            ],
        },
        {
            name: "Frontend Development",
            icon: <Palette className="w-8 h-8" />,
            items: [
                { name: "HTML5", icon: "https://cdn.simpleicons.org/html5" },
                { name: "CSS", icon: "https://cdn.simpleicons.org/css" },
                { name: "React.js", icon: "https://cdn.simpleicons.org/react" },
                { name: "Next.js", icon: `https://cdn.simpleicons.org/nextdotjs/${monoColor}`, mono: true },
                { name: "Vue.js", icon: "https://cdn.simpleicons.org/vuedotjs" },
                { name: "Bootstrap", icon: "https://cdn.simpleicons.org/bootstrap" },
                { name: "TailwindCSS", icon: "https://cdn.simpleicons.org/tailwindcss" },
            ],
        },
        {
            name: "Backend Development",
            icon: <Code className="w-8 h-8" />,
            items: [
                { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs" },
                { name: "Express.js", icon: `https://cdn.simpleicons.org/express/${monoColor}`, mono: true },
                { name: "PHP", icon: "https://cdn.simpleicons.org/php" },
                { name: "Python", icon: "https://cdn.simpleicons.org/python" },
            ],
        },
        {
            name: "Database Technologies",
            icon: <Briefcase className="w-8 h-8" />,
            items: [
                { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb" },
                { name: "MySQL", icon: "https://cdn.simpleicons.org/mysql" },
                { name: "Firebase", icon: "https://cdn.simpleicons.org/firebase" },
                { name: "Google Cloud", icon: "https://cdn.simpleicons.org/googlecloud" },
            ],
        },
        {
            name: "Developer Tools",
            icon: <Smartphone className="w-8 h-8" />,
            items: [
                { name: "Git", icon: "https://cdn.simpleicons.org/git" },
                { name: "GitHub", icon: `https://cdn.simpleicons.org/github/${monoColor}`, mono: true },
                { name: "Gitlab", icon: "https://cdn.simpleicons.org/gitlab" },
                { name: "Chrome DevTools", icon: "https://cdn.simpleicons.org/googlechrome" },
                { name: "Postman", icon: "https://cdn.simpleicons.org/postman" },
            ],
        },
        {
            name: "Other Skills",
            icon: <ExternalLink className="w-8 h-8" />,
            items: [
                { name: "RESTful API", icon: "https://cdn.simpleicons.org/fastapi" },
                { name: "DSA", icon: "https://cdn.simpleicons.org/leetcode" },
                { name: "UI/UX", icon: "https://cdn.simpleicons.org/figma" },
            ],
        },
    ];

    const experiences = [
        {
            year: "Mar 2026 – Present",
            role: "Full Stack Development Intern",
            company: "SiteGuru Pvt. Ltd.",
            description:
                "Building scalable frontend modules with Vue.js (Vuetify 2) and backend services using Node.js, Express.js, and MySQL across various product modules. Developing a production Service Management System with ticket lifecycle management, RBAC, real-time status tracking, and reporting dashboards.",
        },
        {
            year: "May 2025 – Mar 2026",
            role: "Full Stack Development Intern",
            company: "Quantinent Analytics Pvt. Ltd.",
            description:
                "Engineered scalable frontend and backend features across 5+ modules using React, Node.js, Express, and MongoDB. Designed and deployed 15+ REST API endpoints, improving data retrieval efficiency by 30%. Optimized MongoDB queries and schema design, reducing average API response time by 25%.",
        },
        {
            year: "May 2024 – Aug 2024",
            role: "Backend Development Intern",
            company: "Blueplanet Info Solutions",
            description:
                "Developed a full-stack event management system supporting 1,000+ users using PHP and MySQL. Implemented secure authentication, role-based access control, and session handling. Integrated automated email and SMS notifications, increasing user engagement by 35%. Applied indexing and query optimization techniques, achieving 40% faster server response times.",
        },
        {
            year: "2022 - 2026",
            role: "B.Tech in Computer Science",
            company: "IIIT Manipur",
            description:
                "Pursuing Bachelor of Technology in Computer Science and Engineering. Active member of the coding club and hackathon participant.",
        },
    ];

    return (
        <div className="min-h-screen bg-primary text-primary overflow-x-hidden transition-theme selection:bg-purple-500/30 selection:text-purple-500">
            <CustomCursor />

            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-purple-500 origin-left z-100"
                style={{ scaleX }}
            />

            {/* Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 bg-primary/70 backdrop-blur-xl border-b border-theme/50 supports-backdrop-filter:bg-primary/60"
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
                            {["home", "about", "skills", "experience", "projects", "contact"].map(
                                (item) => (
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
                                )
                            )}
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
                                {["home", "about", "skills", "experience", "projects", "contact"].map(
                                    (item) => (
                                        <motion.button
                                            key={item}
                                            onClick={() => scrollToSection(item)}
                                            className="block w-full text-left capitalize text-secondary hover:text-primary transition-theme"
                                            whileHover={{ x: 10 }}
                                        >
                                            {item}
                                        </motion.button>
                                    )
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Hero Section */}
            <section
                id="home"
                className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
            >
                {/* Modern Background */}
                <div className="absolute inset-0 w-full h-full bg-primary">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
                    <div className="absolute inset-0 bg-primary gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)"></div>
                </div>

                {/* Animated Gradient Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, -100, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"
                    />
                </div>

                <div className="text-center z-10 px-4 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 text-sm font-medium"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        Available for new opportunities
                    </motion.div>

                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-tight"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Building{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                            Digital
                        </span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                            Rahul Gogra
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-light"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Full Stack Developer specializing in building exceptional digital
                        experiences. Blending technical expertise in{" "}
                        <span className="text-primary font-medium">AI</span> and{" "}
                        <span className="text-primary font-medium">Cybersecurity</span> to create
                        robust, scalable solutions.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <motion.button
                            onClick={() => scrollToSection("projects")}
                            className="px-8 py-4 gradient-primary rounded-full font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View My Work <ArrowRight className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                            onClick={() => scrollToSection("contact")}
                            className="px-8 py-4 border border-theme bg-secondary/50 backdrop-blur-sm rounded-full font-semibold hover:bg-secondary transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Get In Touch
                        </motion.button>

                        <motion.a
                            href="https://drive.google.com/file/d/1_CAEVEdzeQJfhONQWTixHZRe-exbNziu/view?usp=drive_link"
                            target="_blank"
                            download
                            className="px-8 py-4 gradient-primary rounded-full font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
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
            <section id="about" className="py-24 px-4">
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
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative w-80 h-80 mx-auto rounded-full p-1 bg-primary ring-1 ring-theme">
                                    <div className="relative w-full h-full bg-primary rounded-full flex items-center justify-center overflow-hidden">
                                        <Image
                                            src="/RahulGogra.jpg"
                                            alt="Rahul Gogra"
                                            fill
                                            className="rounded-full z-10 transition-transform duration-500 group-hover:scale-110 object-cover"
                                        />
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
                                I&apos;m a Computer Science student with experience in full-stack
                                web development, AI projects, and cybersecurity. I have worked with
                                6+ programming languages and frameworks, built 10+ web applications,
                                and achieved up to 60% performance gains by applying efficient tools
                                and techniques.
                            </p>
                            <p className="text-lg text-secondary leading-relaxed">
                                I am currently pursuing a B.Tech in Computer Science and Engineering
                                at the Indian Institute of Information Technology, Manipur
                                (2022-2026). My coursework includes Data Structures and Algorithms,
                                Operating Systems, Artificial Intelligence & Machine Learning,
                                Database Management Systems, Web Development, and Computer Networks.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="bg-secondary/50 backdrop-blur-sm border border-theme px-6 py-3 rounded-2xl hover:border-purple-500/50 transition-colors">
                                    <span className="text-primary font-semibold">6+</span>{" "}
                                    Programming Languages
                                </div>
                                <div className="bg-secondary/50 backdrop-blur-sm border border-theme px-6 py-3 rounded-2xl hover:border-purple-500/50 transition-colors">
                                    <span className="text-primary font-semibold">10+</span> Web
                                    Applications
                                </div>
                                <div className="bg-secondary/50 backdrop-blur-sm border border-theme px-6 py-3 rounded-2xl hover:border-purple-500/50 transition-colors">
                                    <span className="text-primary font-semibold">60%</span>{" "}
                                    Performance Gains
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="py-24 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-full h-full bg-linear-to-b from-purple-500/5 to-transparent opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-full h-full bg-linear-to-t from-blue-500/5 to-transparent opacity-50 blur-3xl"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
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
                                className="group relative h-full"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="relative h-full bg-secondary/30 backdrop-blur-sm p-8 rounded-2xl border border-theme hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                                    <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-purple-500/10 group-hover:shadow-purple-500/30">
                                        {skill.icon}
                                    </div>

                                    <h3 className="text-xl font-bold mb-4 text-primary group-hover:text-purple-500 transition-colors duration-300">
                                        {skill.name}
                                    </h3>

                                    <div className="flex flex-wrap gap-3">
                                        {skill.items.map((item) => (
                                            <div
                                                key={item.name}
                                                className="group flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-primary/50 text-secondary border border-theme hover:border-purple-500/20 hover:bg-purple-500/5 hover:text-primary transition-all duration-300 hover:scale-105 cursor-default"
                                            >
                                                <img
                                                    src={item.icon}
                                                    alt={item.name}
                                                    className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                                                />
                                                <span>{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Experience Section */}
            <section id="experience" className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                            Experience & Education
                        </h2>
                        <div className="w-24 h-1 gradient-primary mx-auto"></div>
                    </motion.div>

                    <div className="space-y-8">
                        {experiences.map((exp, index) => (
                            <motion.div
                                key={index}
                                className="relative pl-8 border-l-2 border-theme"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                                <div className="bg-secondary/30 p-6 rounded-2xl border border-theme hover:border-purple-500/50 transition-colors">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-primary">
                                                {exp.role}
                                            </h3>
                                            <div className="flex items-center gap-2 text-purple-500 font-medium mt-1">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{exp.company}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-secondary bg-primary/50 px-3 py-1 rounded-full border border-theme">
                                            <Calendar className="w-3 h-3" />
                                            <span>{exp.year}</span>
                                        </div>
                                    </div>
                                    <p className="text-secondary leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-24 px-4">
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
                                className="bg-secondary/30 rounded-2xl overflow-hidden border border-theme hover:border-purple-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/10"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="relative overflow-hidden">
                                    <Image
                                        width={600}
                                        height={400}
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-xl font-semibold mb-3">{project.title}</h3>
                                    <p className="text-secondary mb-6 line-clamp-3">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.tech.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-medium border border-purple-500/20"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        {project.github ? (
                                            <motion.a
                                                href={project.github}
                                                className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-purple-500 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Github className="w-4 h-4" />
                                                Code
                                            </motion.a>
                                        ) : null}
                                        {project.live ? (
                                            <motion.a
                                                href={project.live}
                                                className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-purple-500 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Live Demo
                                            </motion.a>
                                        ) : null}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 px-4 bg-secondary/30">
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
                            Ready to bring your ideas to life? Let&apos;s create something amazing
                            together.
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
                                href="https://mail.google.com/mail/?view=cm&to=rgogra914@gmail.com"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Email</h3>
                                    <p className="text-secondary">rgogra914@gmail.com</p>
                                </div>
                            </Link>

                            <Link
                                href="https://www.linkedin.com/in/rahul-gogra/"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Linkedin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">LinkedIn</h3>
                                    <p className="text-secondary">linkedin.com/in/rahul-gogra</p>
                                </div>
                            </Link>

                            <Link
                                href="https://www.github.com/RahulGogra"
                                target="_blank"
                                className="flex items-center gap-4"
                            >
                                <div className="w-14 h-14 bg-gray-500/10 rounded-2xl flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <Github className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">GitHub</h3>
                                    <p className="text-secondary">github.com/RahulGogra</p>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <form
                                action="https://formsubmit.co/86fa67bd92964862a5326d891947c610"
                                method="POST"
                                className="space-y-6"
                            >
                                <input type="hidden" name="_captcha" value="false" />
                                <input type="hidden" name="_template" value="table" />
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Your Name"
                                        className="w-full px-6 py-4 bg-primary/50 border border-theme rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Your Email"
                                        className="w-full px-6 py-4 bg-primary/50 border border-theme rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        name="message"
                                        required
                                        placeholder="Your Message"
                                        rows={5}
                                        className="w-full px-6 py-4 bg-primary/50 border border-theme rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                                <motion.button
                                    type="submit"
                                    className="w-full px-8 py-4 gradient-primary rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Send Message
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-theme">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-muted">
                        {`© ${new Date().getFullYear()} Rahul Gogra. Crafted with ❤️ using Next.js, TypeScript & Tailwind CSS`}
                    </p>
                </div>
            </footer>
        </div>
    );
}
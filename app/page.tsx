"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { 
    Github, Linkedin, Mail, ExternalLink, 
    ChevronDown, Menu, X, ArrowRight, Download,
    Code, Server, Database, Smartphone, Briefcase,
    Cpu, Hexagon, Component
} from "lucide-react";
import Image from "next/image";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import CustomCursor from "@/components/CustomCursor";
import InteractiveIcon from "@/components/InteractiveIcon";
import BackgroundScene from "@/components/BackgroundScene";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";

export default function Home() {
    const [activeSection, setActiveSection] = useState("home");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Global scroll progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Theme logic (assuming global CSS variables)
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState("amethyst");

    const themeHexMap: Record<string, string> = {
        'amethyst': '#a855f7',
        'sapphire': '#3b82f6',
        'emerald': '#10b981',
        'rose': '#f43f5e'
    };
    const accentHex = themeHexMap[theme] || '#a855f7';


    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.className.replace('theme-', '') || 'dark';
        setTheme(currentTheme);

        const observer = new MutationObserver(() => {
            const newTheme = document.documentElement.className.replace('theme-', '') || 'dark';
            setTheme(newTheme);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    // Since the layout is permanently a dark spatial theme, use white for monochrome icons.
    const monoColor = 'ffffff';

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
        setIsMenuOpen(false);
    };

    // Update active section based on scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "about", "skills", "experience", "projects", "contact"];
            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top >= -100 && rect.top <= window.innerHeight / 2;
                }
                return false;
            });
            if (current) setActiveSection(current);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ----------------- DATA -----------------
    const projects = [
        {
            title: "Vectra",
            description: "A fast semantic search engine built from scratch using cosine similarity, inverted index, and TF-IDF.",
            image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80",
            tech: ["Python", "Flask", "FAISS", "React"],
            github: "https://github.com/RahulGogra/Vectra",
            live: "https://vectra-omega-three.vercel.app",
        },
        {
            title: "NeuralDoodle",
            description: "An interactive web app that applies neural style transfer to user doodles in real-time.",
            image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80",
            tech: ["TensorFlow.js", "React", "Node.js"],
            github: "https://github.com/RahulGogra/NeuralDoodle",
            live: "https://neuraldoodle-demo.vercel.app",
        },
        {
            title: "Algorithm Visualizer",
            description: "A comprehensive tool to visualize sorting and pathfinding algorithms with step-by-step playback.",
            image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80",
            tech: ["TypeScript", "Next.js", "Tailwind CSS"],
            github: "https://github.com/RahulGogra/AlgoVis",
            live: "https://algo-vis-live.vercel.app",
        },
    ];

    const skills = [
        {
            name: "Frontend",
            items: [
                { name: "React.js", icon: "https://cdn.simpleicons.org/react" },
                { name: "Next.js", icon: `https://cdn.simpleicons.org/nextdotjs/${monoColor}` },
                { name: "Vue.js", icon: "https://cdn.simpleicons.org/vuedotjs" },
                { name: "Tailwind CSS", icon: "https://cdn.simpleicons.org/tailwindcss" },
                { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript" },
            ],
        },
        {
            name: "Backend",
            items: [
                { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs" },
                { name: "Express.js", icon: `https://cdn.simpleicons.org/express/${monoColor}` },
                { name: "Django", icon: `https://cdn.simpleicons.org/django/${monoColor}` },
                { name: "Python", icon: "https://cdn.simpleicons.org/python" },
            ],
        },
        {
            name: "Database",
            items: [
                { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb" },
                { name: "MySQL", icon: "https://cdn.simpleicons.org/mysql" },
                { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql" },
            ],
        },
        {
            name: "Cloud & Tools",
            items: [
                { name: "GCP", icon: "https://cdn.simpleicons.org/googlecloud" },
                { name: "Docker", icon: "https://cdn.simpleicons.org/docker" },
                { name: "Git", icon: "https://cdn.simpleicons.org/git" },
            ],
        },
    ];

    const experiences = [
        {
            year: "Mar 2026 – Aug 2026",
            role: "Full Stack Developer",
            company: "Site Guru Pvt. Ltd.",
            description: "Built scalable frontend modules using Vue.js (Vuetify 2) and backend services with Node.js, Express.js, MySQL across 5+ product modules. Developed a production Service Management System with ticket lifecycle management, RBAC, real-time status tracking, and reporting dashboards.",
        },
        {
            year: "May 2025 – Mar 2026",
            role: "Full Stack Developer",
            company: "Quantinent Analytics",
            description: "Delivered scalable features across 5+ modules using React.js, Node.js, Express.js, MongoDB; designed 15+ REST API endpoints, improving retrieval efficiency by 30% and response time by 25%. Refactored the component library, reducing duplicate code by 40%; shipped features across Agile sprints with designers, QA, and backend teams.",
        },
        {
            year: "May 2024 – Aug 2024",
            role: "Backend Development",
            company: "Blueplanet Info Solutions",
            description: "Built a full-stack event management platform for 900+ users using Javascript, PHP, MySQL, secure authentication, RBAC, and session handling across 3 user roles. Automated email and SMS notifications, boosting engagement by 35%; implemented query indexing achieving 40% faster response times.",
        },
    ];

    if (!mounted) return null;

    return (
        <div className="relative min-h-screen text-primary selection:bg-accent/30 selection:text-accent w-full">
            <CustomCursor />

            {/* Global WebGL Canvas */}
            <div className="fixed inset-0 z-[-1] pointer-events-none w-full h-full">
                <Canvas eventSource={document.body} className="w-full h-full">
                    <View.Port />
                </Canvas>
            </div>

            {/* Background 3D View (rendered safely through the port system) */}
            <View className="fixed inset-0 z-[-2] pointer-events-none w-full h-full">
                <BackgroundScene accentHex={accentHex} />
            </View>

            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-[1000]"
                style={{ scaleX }}
            />

            {/* Navigation */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-[999] bg-primary/80 backdrop-blur-xl border-b border-theme/20 shadow-sm"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <motion.div className="text-xl md:text-2xl font-black uppercase tracking-widest" whileHover={{ scale: 1.05 }}>
                            Rahul Gogra
                        </motion.div>

                        <div className="hidden md:flex items-center space-x-8">
                            {["home", "about", "skills", "experience", "projects", "contact"].map((item) => (
                                <motion.button
                                    key={item}
                                    onClick={() => scrollToSection(item)}
                                    className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                                        activeSection === item ? "text-accent" : "text-secondary hover:text-primary"
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {item}
                                </motion.button>
                            ))}
                            <ThemeSwitcher />
                        </div>

                        <div className="md:hidden flex items-center gap-4">
                            <ThemeSwitcher />
                            <motion.button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                whileTap={{ scale: 0.95 }}
                                className="text-secondary hover:text-primary transition-colors"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </motion.button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="md:hidden bg-primary border-t border-theme/20"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="px-4 py-6 space-y-6 flex flex-col items-center">
                                {["home", "about", "skills", "experience", "projects", "contact"].map((item) => (
                                    <motion.button
                                        key={item}
                                        onClick={() => scrollToSection(item)}
                                        className="block w-full text-center text-lg font-bold uppercase tracking-widest text-secondary hover:text-primary"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        {item}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            <main className="w-full">
                
                {/* HERO SECTION */}
                <section id="home" className="min-h-screen flex flex-col justify-center items-center text-center px-4 md:px-8 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-theme bg-secondary/50 text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Ready to innovate
                        </div>
                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-none mb-6">
                            DIGITAL<br/>
                            <span className="gradient-text glow-accent">SPATIAL</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-secondary max-w-3xl mx-auto font-light leading-relaxed mb-12">
                            A Full Stack Developer pushing the boundaries of web experiences through immersive interfaces and robust engineering.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button onClick={() => scrollToSection("projects")} className="group px-8 py-4 bg-primary text-primary border border-theme hover:border-accent rounded-full font-bold uppercase tracking-widest transition-all flex items-center gap-3">
                                Explore Work 
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a href="https://drive.google.com/file/d/1Dj88Xw7nSQfN45swWvmTH_XO1GUCxOnb/view?usp=sharing" target="_blank" download className="group px-8 py-4 bg-accent text-white rounded-full font-bold uppercase tracking-widest hover:bg-accent transition-all flex items-center gap-3">
                                Resume 
                                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* ABOUT SECTION */}
                <section id="about" className="min-h-screen flex items-center px-4 md:px-12 lg:px-24 py-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
                    <motion.div 
                        className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 lg:gap-20 items-center relative z-10"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* LEFT COLUMN: Heading & Visual */}
                        <div className="md:col-span-5 flex flex-col gap-10">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                                Behind the <br/><span className="gradient-text glow-accent">Code.</span>
                            </h2>
                            {/* Abstract Code Visual instead of a photo */}
                            <div className="relative w-full aspect-5/5 max-w-sm rounded-4xl bg-primary/30 backdrop-blur-xl border border-theme/20 shadow-2xl flex items-center justify-center group overflow-hidden">
                                {/* Ambient glow behind the icon */}
                                <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
                                
                                {/* Complex Layered Tech Visual */}
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <Hexagon className="absolute w-48 h-48 text-theme/20 animate-[spin_15s_linear_infinite]" strokeWidth={0.5} />
                                    <Hexagon className="absolute w-32 h-32 text-theme/40 animate-[spin_10s_linear_infinite_reverse]" strokeWidth={1} />
                                    <Component className="absolute w-16 h-16 text-secondary group-hover:text-accent group-hover:scale-125 transition-all duration-700 z-10" strokeWidth={1.5} />
                                </div>
                                
                                {/* Decorative tech lines */}
                                <div className="absolute top-10 left-10 w-20 h-px bg-theme/20" />
                                <div className="absolute bottom-10 right-10 w-20 h-px bg-theme/20" />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Bio & Stats */}
                        <div className="md:col-span-7 flex flex-col gap-8 mt-12 md:mt-0">
                            <div className="space-y-6 text-xl text-secondary leading-relaxed font-light bg-primary/40 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-theme/20 shadow-2xl hover:border-accent/50 transition-colors duration-500">
                                <p>
                                    I am a Full Stack Web Developer and Computer Science graduate delivering production-ready applications across the full stack. I have deep expertise in React.js, Vue.js, Node.js, Express.js, MongoDB, and MySQL.
                                </p>
                                <p>
                                    Currently pursuing a B.Tech in Computer Science at IIIT Senapati (2022-2026), my career has been defined by hands-on internships and end-to-end feature ownership. I've delivered solutions driving 60% latency reduction and significantly faster server response times.
                                </p>
                            </div>

                            {/* STATS GRID */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: "Internships Experience", value: "1+ yr" },
                                    { label: "Projects", value: "15+" },
                                    { label: "Focus", value: "Full Stack" },
                                    { label: "Graduation", value: "2026" }
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-6 bg-primary/30 backdrop-blur-md rounded-2xl border border-theme/10 hover:border-accent hover:bg-accent/5 hover:-translate-y-2 transition-all duration-300 shadow-xl group">
                                        <div className="text-3xl font-black text-white group-hover:text-accent transition-colors">{stat.value}</div>
                                        <div className="text-xs uppercase tracking-widest text-secondary mt-2">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* SKILLS SECTION (3D INTERACTIVE) */}
                <section id="skills" className="min-h-screen flex flex-col justify-center px-4 md:px-12 lg:px-24 py-24">
                    <div className="max-w-7xl mx-auto w-full">
                        <motion.h2 
                            className="text-5xl md:text-7xl font-black tracking-tight mb-20 text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            Interactive <span className="text-accent">Stack.</span>
                        </motion.h2>
                        
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                            {skills.flatMap(cat => cat.items).map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                    <InteractiveIcon name={item.name} iconUrl={item.icon} accentHex={accentHex} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* EXPERIENCE SECTION */}
                <section id="experience" className="min-h-screen flex items-center px-4 md:px-12 lg:px-24 py-24 relative">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="flex flex-col md:flex-row gap-12 md:gap-24 relative items-start">
                            <div className="md:w-1/3 sticky top-32">
                                <motion.h2 
                                    className="text-5xl md:text-7xl font-black tracking-tight"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    Career <br/><span className="text-accent">Trajectory.</span>
                                </motion.h2>
                            </div>
                            <motion.div 
                                className="md:w-2/3 space-y-16"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                {experiences.map((exp, index) => (
                                    <div key={index} className="group flex flex-col bg-primary/30 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-theme/10 hover:border-accent hover:shadow-2xl transition-all duration-500">
                                        <div className="text-sm font-mono text-accent mb-4 tracking-widest">{exp.year}</div>
                                        <h3 className="text-4xl font-bold mb-2 group-hover:text-accent transition-colors">{exp.company}</h3>
                                        <div className="text-xl font-medium text-secondary mb-6">{exp.role}</div>
                                        <p className="text-lg text-secondary leading-relaxed font-light">{exp.description}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* PROJECTS SECTION */}
                <section id="projects" className="min-h-screen flex flex-col justify-center px-4 md:px-12 lg:px-24 py-24">
                    <div className="max-w-7xl mx-auto w-full">
                        <motion.h2 
                            className="text-5xl md:text-7xl font-black tracking-tight mb-20"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            Featured <span className="text-accent">Works.</span>
                        </motion.h2>
                        
                        <div className="grid md:grid-cols-2 gap-12">
                            {projects.map((project, index) => (
                                <motion.div 
                                    key={project.title} 
                                    className="group cursor-pointer bg-primary/40 backdrop-blur-xl border border-theme/20 p-6 md:p-10 rounded-[2rem] hover:border-accent hover:shadow-accent transition-all duration-500"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -10 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="relative h-[400px] w-full overflow-hidden rounded-2xl mb-8">
                                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                        <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 group-hover:text-accent transition-colors">{project.title}</h3>
                                    <p className="text-lg text-secondary mb-6 font-light">{project.description}</p>
                                    <div className="flex flex-wrap gap-3 mb-6">
                                        {project.tech.map((tech) => (
                                            <span key={tech} className="text-sm font-mono bg-secondary/50 px-4 py-2 rounded-full border border-theme/20">{tech}</span>
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        {project.github && (
                                            <a href={project.github} target="_blank" className="p-3 bg-secondary/50 rounded-full hover:bg-accent hover:text-white transition-all">
                                                <Github className="w-6 h-6" />
                                            </a>
                                        )}
                                        {project.live && (
                                            <a href={project.live} target="_blank" className="px-6 py-3 bg-primary text-primary border border-theme hover:border-accent rounded-full font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                                                View Live <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CONTACT SECTION */}
                <section id="contact" className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">
                            Let's <span className="text-accent">Talk.</span>
                        </h2>
                        <p className="text-2xl text-secondary max-w-2xl mx-auto font-light mb-12">
                            Always open to new opportunities, collaborations, and conversations.
                        </p>
                        
                        <div className="flex flex-wrap justify-center gap-6">
                            <a href="https://mail.google.com/mail/?view=cm&to=rgogra914@gmail.com" target="_blank" className="flex items-center gap-3 bg-secondary/50 px-8 py-4 rounded-full hover:bg-primary border border-transparent hover:border-accent transition-all text-lg font-bold">
                                <Mail className="w-6 h-6 text-accent" /> Email Me
                            </a>
                            <a href="https://www.linkedin.com/in/rahul-gogra/" target="_blank" className="flex items-center gap-3 bg-secondary/50 px-8 py-4 rounded-full hover:bg-primary border border-transparent hover:border-blue-500 transition-all text-lg font-bold">
                                <Linkedin className="w-6 h-6 text-blue-500" /> LinkedIn
                            </a>
                            <a href="https://www.github.com/RahulGogra" target="_blank" className="flex items-center gap-3 bg-secondary/50 px-8 py-4 rounded-full hover:bg-primary border border-transparent hover:border-gray-400 transition-all text-lg font-bold">
                                <Github className="w-6 h-6 text-primary" /> GitHub
                            </a>
                        </div>
                    </motion.div>
                </section>

            </main>

            <footer className="py-12 text-center border-t border-theme/20 relative z-10 bg-primary">
                <p className="text-secondary text-sm tracking-widest uppercase font-bold">
                    &copy; {new Date().getFullYear()} Rahul Gogra. Built with Next.js, Tailwind & Three.js.
                </p>
            </footer>
        </div>
    );
}

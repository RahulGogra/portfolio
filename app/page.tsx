"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import CustomCursor from "@/components/CustomCursor";
import SpaceJourney from "@/components/space/SpaceJourney";
import ExperienceTimeline, { type Role } from "@/components/sections/ExperienceTimeline";
import ProjectShowcase, { type Project } from "@/components/sections/ProjectShowcase";
import ReadingShade from "@/components/sections/ReadingShade";
import RevealWords from "@/components/sections/RevealWords";

/* ---------------------------------------------------------------------------------------------
   Content. Everything here comes from the résumé; keep the two in step.
--------------------------------------------------------------------------------------------- */

const RESUME_URL = "https://drive.google.com/file/d/1fNVsfPI5-m32ec4xDAsTyw9dvqAeQWGe/view?usp=sharing";
const EMAIL = "rgogra914@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/rahul-gogra/";
const GITHUB = "https://github.com/RahulGogra";

const NAV = [
    { id: "about", label: "About" },
    { id: "experience", label: "Experience" },
    { id: "work", label: "Work" },
    { id: "background", label: "Background" },
    { id: "contact", label: "Contact" },
];

const EXPERIENCE: Role[] = [
    {
        period: "Sep 2026 – Present",
        company: "Spyne",
        role: "Software Development Engineer, Intern · Gurugram",
        pipeline: true,
        points: [
            "Optimise the event-driven video generation pipeline above.",
            "Extend the Next.js dashboard used to verify production output in real time, with Grafana for observability across daily live operations.",
            "Improve data access across MySQL and MongoDB for high-volume production workloads.",
        ],
    },
    {
        period: "Mar 2026 – Aug 2026",
        company: "Site Guru Pvt. Ltd.",
        role: "Full Stack Developer",
        points: [
            "Built frontend modules in Vue.js and backend services in Node.js, Express.js and MySQL across 5+ product modules.",
            "Delivered a production service management system: ticket lifecycle, role-based access control, real-time status tracking and reporting dashboards.",
        ],
    },
    {
        period: "May 2025 – Mar 2026",
        company: "Quantinent Analytics",
        role: "Full Stack Developer",
        points: [
            "Designed 15+ REST API endpoints on React.js, Node.js, Express.js and MongoDB, improving retrieval efficiency by 30% and response time by 25%.",
            "Refactored the shared component library, removing 40% of duplicated code, and shipped across 5+ modules in Agile sprints with design, QA and backend teams.",
        ],
    },
    {
        period: "May 2024 – Aug 2024",
        company: "Blueplanet Info Solutions",
        role: "Backend Developer",
        points: [
            "Built an event management platform for 900+ users in JavaScript, PHP and MySQL, with secure authentication, RBAC and session handling across 3 user roles.",
            "Automated email and SMS notifications, lifting engagement by 35%, and added query indexing that made responses 40% faster.",
        ],
    },
];

const PROJECTS: Project[] = [
    {
        title: "NeuralDoodle",
        description:
            "Real-time image classification in the browser from a live webcam feed, at 90% accuracy. Training runs client-side in TensorFlow.js, which removed backend inference and cut latency by 60%. A Node.js and Express API with JWT auth and MongoDB stores accounts and custom-trained model weights. Rated 4.5/5 by 100+ users.",
        image: "/projects/neuraldoodle.jpg",
        tech: ["Next.js", "TypeScript", "Node.js", "Express.js", "TensorFlow.js"],
        github: "https://github.com/RahulGogra/neuraldoodle",
        live: "https://neuraldoodle.vercel.app",
    },
    {
        title: "Vectra",
        description:
            "A multi-tenant SaaS project management platform with workspaces, interactive Kanban boards, role-based access control, and task-velocity charts built with Recharts.",
        image: "/projects/vectra.jpg",
        tech: ["React", "TypeScript", "Tailwind", "Django", "WebSockets", "Stripe"],
        github: "https://github.com/RahulGogra/Vectra-frontend",
        live: "https://vectra-omega-three.vercel.app",
    },
    {
        title: "Algorithm Visualizer",
        description:
            "An interactive platform that animates algorithms step by step. Work on UI responsiveness raised user engagement by 35%.",
        image: "/projects/algorithm-visualizer.jpg",
        tech: ["React.js", "Express.js", "MongoDB", "D3.js"],
        github: "https://github.com/RahulGogra/Algorithm_visualizer",
        live: "https://algorithm-visualizer-umber.vercel.app",
    },
];

const SKILLS = [
    { group: "Languages", items: "JavaScript, TypeScript, Python, C/C++, SQL, Shell" },
    { group: "Backend & APIs", items: "Node.js, Express.js, Django, Django REST Framework, MongoDB, MySQL, JWT, WebSockets, Kafka, AWS SQS" },
    { group: "Frontend", items: "React.js, Next.js, Vue.js, HTML5, CSS3, Tailwind CSS, Zustand, React Query, Recharts" },
    { group: "Cloud & tools", items: "AWS (EC2, SQS, Deadline), GCP, Stripe API, Grafana, Git, GitHub, GitLab, CI/CD, Vercel" },
    { group: "AI & ML", items: "TensorFlow.js, machine learning, NumPy, Google TTS" },
];

const CERTIFICATIONS = [
    { name: "Software Testing", url: "https://drive.google.com/file/d/1-r3ucs9BbWolFhdBdqv7yZpapHPzncWZ/view?usp=sharing" },
    { name: "Data Analytics with Python", url: "https://drive.google.com/file/d/1wHuwpZfZpCA9JY_FtYoiOXwseZyHAJPn/view?usp=sharing" },
    { name: "Introduction to Internet of Things", url: "https://drive.google.com/file/d/1HUGpn0605TuiZzkBcQ-p4ZaqTh921hM8/view?usp=sharing" },
    { name: "Design & Implementation of Human-Computer Interface", url: "https://drive.google.com/file/d/1Dfm8SB2LnIDxyAH0VveQkhROkyqXVmoe/view?usp=sharing" },
];

const ACHIEVEMENTS: { text: string; url?: string }[] = [
    { text: "Cybersecurity Club lead (2025): organised a Capture-The-Flag competition, and presented an AI image classification system at the institute project showcase." },
    { text: "Completed the Ethical Hacking and Cyber Forensics workshop at IIIT Manipur." },
    { text: "500+ problems solved on competitive programming platforms.", url: "https://leetcode.com/u/W-cked/" },
];

/* ---------------------------------------------------------------------------------------------
   Layout pieces
--------------------------------------------------------------------------------------------- */

/** Fades content in once, gently, as it scrolls into view. */
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

function SectionTitle({ index, children }: { index: string; children: ReactNode }) {
    return (
        <Reveal className="mb-12 md:mb-16">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent mb-4">{index}</div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">{children}</h2>
        </Reveal>
    );
}

/** A quiet section marker, for sections whose content carries its own large type. */
function Label({ index, children }: { index: string; children: ReactNode }) {
    return (
        <Reveal className="mb-10 md:mb-12 font-mono text-xs uppercase tracking-[0.3em]">
            <span className="text-accent">{index}</span>
            <span className="text-white/45 ml-4">{children}</span>
        </Reveal>
    );
}

/** The reading column. On wide screens it keeps to the left, leaving the right side to the view of space. */
function Column({ children, className = "", wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
    return (
        <div className="w-full max-w-6xl mx-auto px-6 md:px-12">
            <div className={`${wide ? "md:max-w-[44rem]" : "md:max-w-[38rem]"} ${className}`}>{children}</div>
        </div>
    );
}

/** One block of the Background sheet: a mono heading over hairline rows. */
function Sheet({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div>
            <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-white/40 mb-3">{title}</h3>
            <dl className="border-t border-white/10">{children}</dl>
        </div>
    );
}

/** A row of the sheet. Rows come in one after another, quickly, as the sheet scrolls into view. */
function SheetRow({ label, order, children }: { label: string; order: number; children: ReactNode }) {
    return (
        <motion.div
            className="grid grid-cols-[7.5rem_1fr] gap-4 py-3 border-b border-white/10"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: order * 0.07, ease: "easeOut" }}
        >
            <dt className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/45 pt-0.5">{label}</dt>
            <dd className="text-white/80 leading-relaxed">{children}</dd>
        </motion.div>
    );
}

/* ---------------------------------------------------------------------------------------------
   Page
--------------------------------------------------------------------------------------------- */

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();
    const [activeSection, setActiveSection] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { scrollYProgress } = useScroll();
    const progressBar = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const accentHex = ({ amethyst: "#a855f7", sapphire: "#3b82f6", emerald: "#10b981", rose: "#f43f5e" } as Record<string, string>)[theme] ?? "#a855f7";
    const accentToHex = ({ amethyst: "#ec4899", sapphire: "#06b6d4", emerald: "#3b82f6", rose: "#fb923c" } as Record<string, string>)[theme] ?? "#ec4899";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const onScroll = () => {
            // The active section is the last one whose top has passed the middle of the screen.
            const current = [...NAV].reverse().find(({ id }) => {
                const element = document.getElementById(id);
                return element ? element.getBoundingClientRect().top <= window.innerHeight / 2 : false;
            });
            setActiveSection(current?.id ?? "");
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [mounted]);

    const go = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setIsMenuOpen(false);
    };

    if (!mounted) return null;

    return (
        <div className="relative min-h-screen text-primary selection:bg-accent/30 selection:text-white w-full">
            <CustomCursor />
            <SpaceJourney accentHex={accentHex} accentToHex={accentToHex} />

            <ReadingShade />

            <motion.div className="fixed top-0 left-0 right-0 h-px bg-accent origin-left z-[1000]" style={{ scaleX: progressBar }} />

            <nav className="fixed top-0 left-0 right-0 z-[999] bg-primary/70 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-base font-semibold tracking-tight cursor-pointer">
                        Rahul Gogra
                    </button>
                    <div className="hidden md:flex items-center gap-8">
                        {NAV.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => go(id)}
                                className={`text-sm transition-colors cursor-pointer ${activeSection === id ? "text-white" : "text-white/50 hover:text-white"}`}
                            >
                                {label}
                            </button>
                        ))}
                        <ThemeSwitcher />
                    </div>
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeSwitcher />
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMenuOpen} className="text-white/70">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="md:hidden border-t border-white/5 bg-primary"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="px-6 py-4 flex flex-col">
                                {NAV.map(({ id, label }) => (
                                    <button key={id} onClick={() => go(id)} className="py-3 text-left text-lg text-white/80">
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="relative z-10">
                {/* HERO: name on the left, Earth on the right (below the text on phones) */}
                <section id="home" className="relative min-h-screen flex items-center pb-[22vh] md:pb-0 pt-24">
                    <Column className="text-center md:text-left">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: "easeOut" }}>
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/55 mb-6">Software Development Engineer · Gurugram</p>
                        <h1 className="text-6xl sm:text-7xl md:text-8xl xl:text-[8.5rem] font-semibold tracking-tighter leading-[0.92]">Rahul<br className="hidden md:block" /> Gogra</h1>
                        <p className="mt-8 max-w-xl md:max-w-md mx-auto md:mx-0 font-serif text-xl md:text-2xl text-white/75 leading-relaxed">
                            I build backend systems that hold up under real traffic, and the interfaces people use on top of them.
                        </p>
                        <div className="mt-10 flex items-center justify-center md:justify-start gap-4">
                            <button onClick={() => go("work")} className="px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/85 transition-colors cursor-pointer">
                                Selected work
                            </button>
                            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full border border-white/25 text-sm font-medium hover:border-white/60 transition-colors inline-flex items-center gap-1">
                                Résumé <ArrowUpRight className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                    </Column>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-white/50">Scroll</div>
                </section>

                {/* ABOUT: the statement is the heading, and it lights up word by word as you read it */}
                <section id="about" className="py-32 md:py-48">
                    <div className="max-w-6xl mx-auto px-6 md:px-12">
                        <Label index="01">About</Label>
                        <RevealWords
                            className="max-w-4xl font-serif text-3xl md:text-5xl leading-[1.2] tracking-tight text-white"
                            text="I'm a Software Development Engineer who works across the stack, with most of my attention on backend systems: event pipelines, APIs and the data underneath them."
                        />
                        <Reveal>
                            <p className="mt-10 md:max-w-[38rem] text-lg text-white/60 leading-relaxed">
                                I like owning a feature from design through deployment, and I judge the work by how it behaves once real users arrive.
                            </p>
                            <ul className="mt-10 flex flex-col md:flex-row gap-2 md:gap-0 font-mono text-xs uppercase tracking-[0.2em] text-white/45">
                                {["10+ production applications shipped", "4 engineering teams", "60% largest latency reduction"].map((stat, i) => (
                                    <li key={stat}>
                                        {i > 0 && <span aria-hidden className="hidden md:inline text-white/20 mx-4">/</span>}
                                        {stat}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    </div>
                </section>

                {/* EXPERIENCE: a pinned rail of roles beside the details of the one being read */}
                <section id="experience" className="py-32 md:py-48">
                    <Column wide>
                        <SectionTitle index="02">Experience</SectionTitle>
                        <ExperienceTimeline roles={EXPERIENCE} />
                    </Column>
                </section>

                {/* WORK: pinned while the projects roll past on a drum; the view of space crosses to the left */}
                <section id="work">
                    <ProjectShowcase projects={PROJECTS} label={<Label index="03">Selected work</Label>} />
                </section>

                {/* BACKGROUND: a compact spec sheet across the full width */}
                <section id="background" className="py-32 md:py-40">
                    <div className="max-w-6xl mx-auto px-6 md:px-12">
                        <Reveal className="flex items-baseline gap-6 border-b border-white/15 pb-5">
                            <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">04</span>
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Background</h2>
                        </Reveal>

                        <div className="mt-10 grid md:grid-cols-2 gap-x-16 gap-y-12 text-sm">
                            <div className="space-y-12">
                                <Sheet title="Skills">
                                    {SKILLS.map((skill, i) => (
                                        <SheetRow key={skill.group} label={skill.group} order={i}>
                                            {skill.items}
                                        </SheetRow>
                                    ))}
                                </Sheet>
                                <Sheet title="Education">
                                    <SheetRow label="B.Tech, CSE" order={0}>
                                        Indian Institute of Information Technology, Senapati
                                        <span className="block text-white/50">2022–2026 · CGPA 8.27</span>
                                    </SheetRow>
                                </Sheet>
                            </div>

                            <div className="space-y-12">
                                <Sheet title="Achievements">
                                    {ACHIEVEMENTS.map((item, i) => (
                                        <SheetRow key={item.text} label={String(i + 1).padStart(2, "0")} order={i}>
                                            {item.url ? (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors inline-flex items-start gap-1">
                                                    {item.text} <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                </a>
                                            ) : (
                                                item.text
                                            )}
                                        </SheetRow>
                                    ))}
                                </Sheet>
                                <Sheet title="Certifications">
                                    {CERTIFICATIONS.map((cert, i) => (
                                        <SheetRow key={cert.name} label={String(i + 1).padStart(2, "0")} order={i}>
                                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors inline-flex items-start gap-1">
                                                {cert.name} <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            </a>
                                        </SheetRow>
                                    ))}
                                </Sheet>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTACT: the whole galaxy behind */}
                <section id="contact" className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-32">
                    <Reveal className="flex flex-col items-center">
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent mb-6">05</div>
                        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">Contact</h2>
                        <p className="mt-8 max-w-xl font-serif text-xl md:text-2xl text-white/75 leading-relaxed">
                            If something here is relevant to what you&apos;re building, I&apos;d like to hear about it.
                        </p>
                        <a href={`mailto:${EMAIL}`} className="mt-10 text-2xl md:text-4xl font-semibold tracking-tight underline decoration-white/25 underline-offset-8 hover:decoration-accent hover:text-accent transition-colors">
                            {EMAIL}
                        </a>
                        <div className="mt-10 flex gap-8 text-sm text-white/65">
                            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                                LinkedIn <ArrowUpRight className="w-4 h-4" />
                            </a>
                            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                                GitHub <ArrowUpRight className="w-4 h-4" />
                            </a>
                            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">
                                Résumé <ArrowUpRight className="w-4 h-4" />
                            </a>
                        </div>
                    </Reveal>
                </section>
            </main>

            <footer className="relative z-10 border-t border-white/5 bg-primary">
                <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/40">
                    <span>© {new Date().getFullYear()} Rahul Gogra</span>
                    <span>
                        The view behind this page zooms from Earth to the whole Milky Way, at true scale. Earth maps:{" "}
                        <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-white/70">Solar System Scope</a>, CC BY 4.0.
                    </span>
                </div>
            </footer>
        </div>
    );
}

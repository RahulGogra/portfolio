"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export interface Project {
    title: string;
    description: string;
    image: string;
    tech: string[];
    github?: string;
    live?: string;
}

const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
    return t * t * (3 - 2 * t);
};

/** One screenshot on the drum. It dims as it turns away from the viewer. */
function Face({ index, step, radius, turn, children }: { index: number; step: number; radius: number; turn: MotionValue<number>; children: ReactNode }) {
    const filter = useTransform(turn, (angle) => {
        const facing = Math.max(Math.cos(((angle - index * step) * Math.PI) / 180), 0);
        return `brightness(${(0.25 + 0.75 * facing).toFixed(3)})`;
    });
    return (
        <motion.div
            className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 bg-[#0b0b0b]"
            style={{ transform: `rotateX(${-index * step}deg) translateZ(${radius}px)`, backfaceVisibility: "hidden", filter }}
        >
            {children}
        </motion.div>
    );
}

/**
 * The projects on a drum that rolls as you scroll. The section pins while the drum turns from one project to
 * the next, resting on each for a moment, and the details beside it change with it.
 */
export default function ProjectShowcase({ projects, label }: { projects: Project[]; label: ReactNode }) {
    const section = useRef<HTMLDivElement>(null);
    const drum = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const [height, setHeight] = useState(0);

    const count = projects.length;
    const step = 360 / count;
    // Far enough out that neighbouring faces leave a gap between them as they roll past.
    const radius = height * 0.62;

    const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

    // Scroll position along the projects, eased so the drum rests on each one and rolls in between.
    const position = useTransform(scrollYProgress, (p) => {
        const t = Math.min(Math.max(p, 0), 1) * (count - 1);
        const index = Math.min(Math.floor(t), count - 2);
        return index + smoothstep(0.25, 0.75, t - index);
    });
    const smooth = useSpring(position, { stiffness: 90, damping: 22, restDelta: 0.0005 });
    const turn = useTransform(reduce ? position : smooth, (value) => (reduce ? Math.round(value) : value) * step);
    // A slight sideways lean while it rolls, settling flat when it rests.
    const roll = useTransform(smooth, (value) => (reduce ? 0 : Math.sin((value % 1) * Math.PI) * -6));

    useMotionValueEvent(position, "change", (value) => setActive(Math.round(value)));

    useEffect(() => {
        if (!drum.current) return;
        const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
        observer.observe(drum.current);
        return () => observer.disconnect();
    }, []);

    const tiltX = useMotionValue(0);
    const tiltY = useMotionValue(0);
    const leanX = useSpring(tiltX, { stiffness: 120, damping: 18 });
    const leanY = useSpring(tiltY, { stiffness: 120, damping: 18 });
    const lean = (event: PointerEvent<HTMLDivElement>) => {
        if (reduce) return;
        const box = event.currentTarget.getBoundingClientRect();
        tiltY.set(((event.clientX - box.left) / box.width - 0.5) * 8);
        tiltX.set(-((event.clientY - box.top) / box.height - 0.5) * 6);
    };
    const settle = () => {
        tiltX.set(0);
        tiltY.set(0);
    };

    const project = projects[active];

    return (
        <div ref={section} style={{ height: `${count * 100}vh` }} className="relative">
            <div className="sticky top-0 h-[100svh] flex items-center">
                <div className="w-full max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-6 md:py-0 grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 md:gap-16 items-center">
                    {/* The drum */}
                    <motion.div onPointerMove={lean} onPointerLeave={settle} style={{ perspective: 1800, rotateX: leanX, rotateY: leanY }} className="order-1">
                        <div ref={drum} className="relative w-full aspect-[16/10]">
                            <motion.div
                                className="absolute inset-0"
                                style={{ transformStyle: "preserve-3d", z: -radius, rotateX: turn, rotateZ: roll }}
                            >
                                {projects.map((item, i) => (
                                    <Face key={item.title} index={i} step={step} radius={radius} turn={turn}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image} alt={`${item.title} screenshot`} className="w-full h-full object-cover object-top" />
                                    </Face>
                                ))}
                            </motion.div>
                        </div>
                        <div className="mt-6 md:mt-8 flex items-center gap-4 font-mono text-xs text-white/45">
                            <span className="text-white">{String(active + 1).padStart(2, "0")}</span>
                            <span className="relative h-px flex-1 max-w-40 bg-white/15 overflow-hidden">
                                <motion.span style={{ scaleX: scrollYProgress }} className="absolute inset-0 bg-accent origin-left" />
                            </span>
                            <span>{String(count).padStart(2, "0")}</span>
                        </div>
                    </motion.div>

                    {/* What is on the front face */}
                    {/* A fixed height on wide screens, so the label stays put while descriptions of different lengths swap. */}
                    <div className="order-2 md:h-[28rem]">
                        {label}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={project.title}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                <h3 className="text-3xl md:text-6xl font-semibold tracking-tight leading-[1.05]">{project.title}</h3>
                                <p className="mt-4 md:mt-6 text-sm md:text-lg text-white/75 leading-relaxed">{project.description}</p>
                                <p className="mt-4 md:mt-5 font-mono text-xs md:text-sm text-white/50">{project.tech.join("  ·  ")}</p>
                                <div className="mt-4 md:mt-6 flex gap-6 text-sm font-medium">
                                    {project.live && (
                                        <a href={project.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white hover:text-accent transition-colors">
                                            Live site <ArrowUpRight className="w-4 h-4" />
                                        </a>
                                    )}
                                    {project.github && (
                                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/70 hover:text-accent transition-colors">
                                            Source <ArrowUpRight className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

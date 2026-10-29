"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import PipelineFlow from "./PipelineFlow";

export interface Role {
    period: string;
    company: string;
    role: string;
    pipeline?: boolean;
    points: string[];
}

/** "May 2024 – Aug 2024" becomes "2024"; "Sep 2026 – Present" becomes "2026 – now". */
function years(period: string) {
    const found = period.match(/\d{4}/g) ?? [];
    const present = /present/i.test(period);
    const start = found[0] ?? "";
    const end = present ? "now" : found[1] ?? start;
    return start === end ? start : `${start} – ${end}`;
}

/**
 * Roles, newest first. On wide screens a rail stays pinned beside them, marks the role being read, and a
 * line on it fills as you read down through them.
 */
export default function ExperienceTimeline({ roles }: { roles: Role[] }) {
    const [active, setActive] = useState(0);
    const items = useRef<(HTMLLIElement | null)[]>([]);
    const list = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.55", "end 0.55"] });
    const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
                });
            },
            // A thin band across the middle of the screen: whichever role crosses it is the one being read.
            { rootMargin: "-45% 0px -50% 0px" }
        );
        items.current.forEach((item) => item && observer.observe(item));
        return () => observer.disconnect();
    }, [roles.length]);

    return (
        <div ref={list} className="md:grid md:grid-cols-[9rem_minmax(0,30rem)] md:gap-12">
            <aside className="hidden md:block" aria-label="Roles">
                <div className="sticky top-32">
                    <div className="relative pl-5">
                        <span aria-hidden className="absolute left-0 top-1 bottom-1 w-px bg-white/10" />
                        <motion.span aria-hidden style={{ scaleY: fill }} className="absolute left-0 top-1 bottom-1 w-px bg-accent origin-top" />
                        <ol className="space-y-7">
                            {roles.map((role, i) => (
                                <li key={role.company}>
                                    <button
                                        onClick={() => items.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                                        className={`text-left transition-colors duration-500 cursor-pointer ${i === active ? "text-white" : "text-white/30 hover:text-white/60"}`}
                                    >
                                        <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em]">{years(role.period)}</span>
                                        <span className="block mt-1 text-sm font-medium leading-snug">{role.company}</span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </aside>

            <ol>
                {roles.map((role, i) => (
                    <li
                        key={role.company}
                        ref={(item) => { items.current[i] = item; }}
                        data-index={i}
                        className="py-14 first:pt-0 border-b border-white/10 last:border-0"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">{role.period}</div>
                            <h3 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">{role.company}</h3>
                            <p className="mt-1 text-white/55">{role.role}</p>
                            {role.pipeline && (
                                <>
                                    <p className="mt-6 text-white/75">An event-driven video generation pipeline:</p>
                                    <PipelineFlow />
                                </>
                            )}
                            <ul className="mt-5 space-y-3 text-white/70 leading-relaxed">
                                {role.points.map((point) => (
                                    <li key={point} className="flex gap-3">
                                        <span aria-hidden className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-white/40" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

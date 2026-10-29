"use client";

import { motion } from "framer-motion";

/** The Spyne video pipeline, as described on the résumé, drawn as a simple vertical flow. */
const STEPS = [
    { label: "Inputs", detail: "AI hotspot classification and Google TTS configuration" },
    { label: "Messaging", detail: "Kafka and AWS SQS" },
    { label: "Rendering", detail: "Adobe After Effects via Windows EC2 and AWS Deadline" },
    { label: "Verification", detail: "Next.js dashboard, with Grafana for observability" },
];

export default function PipelineFlow() {
    return (
        <figure className="mt-8 mb-2">
            <ol className="relative pl-8">
                {/* The line draws itself once, as the diagram comes into view. */}
                <motion.span
                    aria-hidden
                    className="absolute left-[7px] top-2 bottom-2 w-px bg-white/25 origin-top"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1.6, ease: "easeInOut" }}
                />
                {STEPS.map((step, i) => (
                    <motion.li
                        key={step.label}
                        className="relative pb-6 last:pb-0"
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.35, ease: "easeOut" }}
                    >
                        <span aria-hidden className="absolute -left-8 top-1 h-[15px] w-[15px] rounded-full border border-white/30 bg-[#050505] grid place-items-center">
                            <span className="h-[5px] w-[5px] rounded-full bg-accent" />
                        </span>
                        <div className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-white/45">{step.label}</div>
                        <div className="text-white/85 mt-1">{step.detail}</div>
                    </motion.li>
                ))}
            </ol>
            <figcaption className="sr-only">Event-driven video generation pipeline at Spyne</figcaption>
        </figure>
    );
}

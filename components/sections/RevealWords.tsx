"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

function Word({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) {
    const opacity = useTransform(progress, range, [0.16, 1]);
    return <motion.span style={{ opacity }}>{children} </motion.span>;
}

/** A paragraph whose words brighten one after another as it scrolls through the screen, like reading along. */
export default function RevealWords({ text, className }: { text: string; className?: string }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
    const words = text.split(" ");

    if (reduce) return <p className={className}>{text}</p>;
    return (
        <p ref={ref} className={className}>
            {words.map((word, i) => (
                <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                    {word}
                </Word>
            ))}
        </p>
    );
}

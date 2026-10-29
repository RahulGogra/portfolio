"use client";

import { useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import * as THREE from "three";
import { journey } from "@/components/space/journey";

/** 1 while the section with this id fills the middle of the screen, easing to 0 as it scrolls in or out. */
function presence(id: string) {
    const box = document.getElementById(id)?.getBoundingClientRect();
    if (!box) return 0;
    const middle = window.innerHeight / 2;
    const ramp = window.innerHeight * 0.35;
    return Math.min(
        THREE.MathUtils.smoothstep((middle - box.top) / ramp, 0, 1),
        THREE.MathUtils.smoothstep((box.bottom - middle) / ramp, 0, 1)
    );
}

/**
 * Darkens the space behind whichever side the text is on, so reading is never a strain: the left for most
 * sections, the right while Work has the text on the right, and the whole width for the Background sheet.
 * It also tells the 3D view which side to keep clear.
 */
export default function ReadingShade() {
    const left = useMotionValue(0);
    const right = useMotionValue(0);
    const full = useMotionValue(0);
    const phone = useMotionValue(0);

    useEffect(() => {
        const update = () => {
            const shade = THREE.MathUtils.clamp(window.scrollY / 500, 0, 1);
            const flip = presence("work");
            const wide = presence("background");
            journey.flipTarget = flip;
            left.set(shade * (1 - flip) * (1 - wide));
            right.set(shade * flip);
            full.set(shade * wide);
            phone.set(shade);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [left, right, full, phone]);

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
            <motion.div style={{ opacity: left }} className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/55 to-transparent" />
            <motion.div style={{ opacity: right }} className="hidden md:block absolute inset-0 bg-gradient-to-l from-[#050505]/90 via-[#050505]/55 to-transparent" />
            <motion.div style={{ opacity: full }} className="hidden md:block absolute inset-0 bg-[#050505]/70" />
            <motion.div style={{ opacity: phone }} className="md:hidden absolute inset-0 bg-[#050505]/60" />
        </div>
    );
}

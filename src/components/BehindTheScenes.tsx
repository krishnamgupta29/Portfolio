import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Sparkles, ShieldAlert, Workflow } from 'lucide-react';

const BehindTheScenes: React.FC = () => {
  return (
    <section
      id="behind-scenes-section"
      className="relative py-24 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden border-t border-white/5 bg-black/10 text-left"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-black text-2xl sm:text-4xl text-white dark:text-white light:text-black tracking-tight"
          >
            Behind the Scenes: How This Portfolio Was Built
          </motion.h2>
          <p className="mt-2 text-xs sm:text-sm text-white/50 dark:text-white/50 light:text-black/50 font-sans max-w-2xl">
            A transparent look into the engineering, design choices, and workflow behind this space.
          </p>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-3 rounded-full" />
        </div>

        {/* Case Study Writeup */}
        <div className="space-y-10 font-sans text-sm sm:text-base leading-relaxed text-white/75 dark:text-white/75 light:text-black/75">
          {/* Opening Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/80 dark:text-white/80 light:text-black/80 font-sans text-sm sm:text-base leading-relaxed"
          >
            This portfolio was designed from the ground up to feel like a genuine interactive experience rather than a templated website. Instead of relying on pre-built 3D model files — which are heavy to load and often struggle on mobile browsers — the site uses a procedural, code-generated approach wherever possible: shapes, motion, and visual effects are calculated mathematically and rendered in real time via WebGL, rather than loaded as static assets. The goal throughout was to keep the experience fast, smooth, and genuinely interactive, without sacrificing visual polish.
          </motion.p>

          {/* Technical Stack Callout Box */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-black/50 dark:bg-black/50 light:bg-black/5 border border-white/10 dark:border-white/10 light:border-black/10 shadow-xl"
          >
            <div className="flex items-center gap-2 text-white dark:text-white light:text-black font-display font-bold text-sm mb-4">
              <Cpu className="w-4 h-4 text-harvest-orange" />
              Technical Stack
            </div>
            <ul className="text-xs sm:text-sm space-y-2.5 list-disc pl-5 font-mono text-white/70 dark:text-white/70 light:text-black/70">
              <li>
                <strong className="text-white dark:text-white light:text-black font-sans font-semibold">Framework:</strong> React + Vite + TypeScript
              </li>
              <li>
                <strong className="text-white dark:text-white light:text-black font-sans font-semibold">Styling:</strong> Tailwind CSS (utility-first, custom theme tokens for the orange-gold palette)
              </li>
              <li>
                <strong className="text-white dark:text-white light:text-black font-sans font-semibold">3D & WebGL:</strong> React Three Fiber (R3F) + Drei, built on Three.js
              </li>
              <li>
                <strong className="text-white dark:text-white light:text-black font-sans font-semibold">Scrolling:</strong> Lenis, for smooth inertial scroll behavior
              </li>
              <li>
                <strong className="text-white dark:text-white light:text-black font-sans font-semibold">Animation & Interaction:</strong> GSAP with ScrollTrigger, and Framer Motion for component-level transitions
              </li>
              <li>
                <strong className="text-white dark:text-white light:text-black font-sans font-semibold">Deployment:</strong> Netlify
              </li>
            </ul>
          </motion.div>

          {/* Design Decisions & Challenge Block Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Design Decisions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/3 dark:bg-white/3 light:bg-black/2 border border-white/5 dark:border-white/5 light:border-black/5"
            >
              <div className="flex items-center gap-2 text-white dark:text-white light:text-black font-display font-bold text-sm mb-3">
                <Sparkles className="w-4 h-4 text-gold" />
                Design Decisions
              </div>
              <p className="text-xs sm:text-sm text-white/70 dark:text-white/70 light:text-black/70 leading-relaxed">
                The orange-gold gradient palette was chosen deliberately — warm, energetic, and distinct from the blue-toned tech-portfolio look that's become the default across the web. Every section (the Skill Storybook, the Hackathon timeline, the Mini Arcade) was built as its own self-contained interactive experience rather than a static content block, with the goal of making a visitor actually want to explore rather than just scroll past.
              </p>
            </motion.div>

            {/* A Challenge Worth Mentioning */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/3 dark:bg-white/3 light:bg-black/2 border border-white/5 dark:border-white/5 light:border-black/5"
            >
              <div className="flex items-center gap-2 text-white dark:text-white light:text-black font-display font-bold text-sm mb-3">
                <ShieldAlert className="w-4 h-4 text-harvest-orange" />
                A Challenge Worth Mentioning
              </div>
              <p className="text-xs sm:text-sm text-white/70 dark:text-white/70 light:text-black/70 leading-relaxed">
                One of the trickier problems was keeping the site performant while running multiple animated/interactive sections at once — background particles, scroll-linked motion, and interactive cards all competing for the same render budget. The solution was to lazy-load and pause off-screen sections using intersection observers, so only what's actually visible is actively animating at any given time.
              </p>
            </motion.div>
          </div>

          {/* AI-Assisted Workflow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-8 rounded-2xl bg-white/3 dark:bg-white/3 light:bg-black/2 border border-white/5 dark:border-white/5 light:border-black/5"
          >
            <div className="flex items-center gap-2 text-white dark:text-white light:text-black font-display font-bold text-sm mb-3">
              <Workflow className="w-4 h-4 text-gold" />
              AI-Assisted Workflow
            </div>
            <p className="text-xs sm:text-sm text-white/70 dark:text-white/70 light:text-black/70 leading-relaxed">
              This project was built using a modern, AI-assisted workflow. I used Claude (Anthropic) to plan the site's structure, work through interaction and animation ideas, and turn them into detailed technical specifications — essentially acting as a design and planning partner throughout the process. I then used Google Antigravity to implement, debug, and iterate on the actual React/TypeScript codebase. This back-and-forth between planning and implementation let me move quickly while still making deliberate design decisions at every step, which I think reflects how a lot of real development work looks today.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BehindTheScenes;

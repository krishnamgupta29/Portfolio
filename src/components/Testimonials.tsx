import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import sound from '../utils/sound';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  relation: string;
  text: string;
  stars: number;
}

const testimonialsList: Testimonial[] = [
  {
    id: '1',
    name: 'Rohan Sharma',
    role: 'Full-Stack Developer',
    relation: 'Hackathon Teammate (Team Xynapse)',
    text: "Krishnam's logic building is exceptional. Under intense 24-hour hackathon sprints, he maps complex data layers and writes highly optimized algorithms without breaking a sweat. Working with him is an absolute masterclass in technical efficiency.",
    stars: 5,
  },
  {
    id: '2',
    name: 'Prof. S. Verma',
    role: 'Computer Science Faculty',
    relation: 'Academic Advisor (GLA University)',
    text: "Krishnam exhibits a level of engineering depth and curiosity rare for a second-year student. He consistently goes beyond academic curriculum requirements, building functional procedural models, game engines, and full-stack web applications.",
    stars: 5,
  },
  {
    id: '3',
    name: 'Ananya Goel',
    role: 'Data Science Analyst',
    relation: 'Project Collaborator (IIT Hyderabad Hackathon)',
    text: 'Highly focused, clean coder, and a great team player. Krishnam structured our data cleaning pipelines and model shapes during the AI/ML challenge, enabling us to pitch a fully working prototype within hours.',
    stars: 5,
  },
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleNext = () => {
    sound.playClick();
    setCurrentIndex((prev) => (prev === testimonialsList.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    sound.playClick();
    setCurrentIndex((prev) => (prev === 0 ? testimonialsList.length - 1 : prev - 1));
  };

  const active = testimonialsList[currentIndex];

  return (
    <section
      id="testimonials-section"
      className="relative py-24 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden bg-black/5"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-left">
          <motion.h2
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white dark:text-white light:text-black tracking-tight flex items-center gap-3"
          >
            Social Validation
          </motion.h2>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
        </div>

        {/* Carousel Card */}
        <div className="relative min-h-[350px] sm:min-h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full p-8 sm:p-12 rounded-3xl glass-card border border-white/10 dark:border-white/10 light:border-black/10 flex flex-col justify-between text-left relative shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 30px rgba(255,123,0,0.02)',
              }}
            >
              {/* Giant decorative quote mark */}
              <Quote className="absolute right-8 top-6 w-24 h-24 text-white/5 opacity-[0.02] pointer-events-none" />

              <div className="space-y-6">
                {/* Stars */}
                <div className="flex gap-1.5 text-gold">
                  {Array.from({ length: active.stars }).map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-gold stroke-transparent" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="font-sans text-sm sm:text-base md:text-lg italic leading-relaxed text-white/80 dark:text-white/80 light:text-black/80">
                  "{active.text}"
                </p>
              </div>

              {/* Author footer */}
              <div className="mt-8 pt-6 border-t border-white/5 dark:border-white/5 light:border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-display font-black text-base text-white dark:text-white light:text-black">
                    {active.name}
                  </h4>
                  <span className="text-xs text-white/45 dark:text-white/45 light:text-black/50 block">
                    {active.role}
                  </span>
                </div>
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-harvest-orange bg-harvest-orange/10 px-3 py-1 rounded-full">
                  {active.relation}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel controls */}
        <div className="flex justify-center gap-4 mt-8 select-none">
          <button
            onClick={handlePrev}
            className="p-3.5 rounded-full border border-white/10 dark:border-white/10 light:border-black/10 text-white dark:text-white light:text-black hover:border-harvest-orange hover:text-harvest-orange transition-all cursor-pointer bg-transparent"
            title="Previous Recommendation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="flex items-center text-xs font-mono text-white/50 tracking-wider">
            {currentIndex + 1} / {testimonialsList.length}
          </span>

          <button
            onClick={handleNext}
            className="p-3.5 rounded-full border border-white/10 dark:border-white/10 light:border-black/10 text-white dark:text-white light:text-black hover:border-harvest-orange hover:text-harvest-orange transition-all cursor-pointer bg-transparent"
            title="Next Recommendation"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

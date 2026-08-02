import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, TrendingUp } from 'lucide-react';
import MagneticCard from './MagneticCard';
import StatCounter from './StatCounter';
import { usePortfolio } from '../context/PortfolioContext';

const tags = ['Web Development', 'AI/ML', 'Logic Building', 'Game Dev'];

const About: React.FC = () => {
  const { eli5Mode } = usePortfolio();
  return (
    <section
      id="about-section"
      className="relative py-24 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-left">
          <motion.h2
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white dark:text-white light:text-black tracking-tight flex items-center gap-3"
          >
            About Me
          </motion.h2>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Bio & Pills */}
          <div className="lg:col-span-7 text-left space-y-8">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-white/70 dark:text-white/70 light:text-black/70 font-sans text-sm sm:text-base md:text-lg leading-relaxed"
            >
              {eli5Mode ? (
                <span>
                  I am a second-year college student at{' '}
                  <span className="text-white dark:text-white light:text-black font-semibold">GLA University</span> who loves to build things. I am teaching computers to solve problems, make games, and write clean code!
                </span>
              ) : (
                <span>
                  I'm a second-year B.Tech Computer Science student at{' '}
                  <span className="text-white dark:text-white light:text-black font-semibold">GLA University, Mathura</span>,
                  specializing in Artificial Intelligence and Machine Learning. My interest in tech started with the fundamentals of the web and grew into a deeper focus on software logic, algorithms, and system design.
                </span>
              )}
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/70 dark:text-white/70 light:text-black/70 font-sans text-sm sm:text-base md:text-lg leading-relaxed"
            >
              {eli5Mode ? (
                <span>
                  I enjoy solving coding puzzles and making neat projects. Right now, I am spending my time learning how to feed data to computers so they can make smart guesses, and competing in hackathons to test my skills.
                </span>
              ) : (
                <span>
                  I enjoy solving complex problems with clean, practical solutions — and I do most of my learning by building: through hackathons, side projects, and continuous experimentation with AI/ML concepts.
                </span>
              )}
            </motion.p>

            {/* Tag Pills */}
            <div className="space-y-3">
              <span className="text-xs font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/40 block">
                Fields of Interest
              </span>
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag, idx) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{
                      scale: 1.05,
                      borderColor: 'rgba(255, 123, 0, 0.6)',
                      boxShadow: '0 0 12px rgba(255, 123, 0, 0.25)',
                    }}
                    className="px-4 py-2 rounded-full border border-white/10 dark:border-white/10 light:border-black/10 text-white/80 dark:text-white/80 light:text-black/80 font-sans text-xs sm:text-sm font-medium backdrop-blur-md cursor-default bg-white/3 dark:bg-white/3 light:bg-black/2"
                  >
                    {tag}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Animated Stats counter strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10 dark:border-white/10 light:border-black/10">
              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-display font-black text-harvest-orange">
                  <StatCounter end={11} />
                </div>
                <div className="text-[10px] sm:text-xs font-display font-semibold uppercase tracking-widest text-white/50 dark:text-white/50 light:text-black/50 mt-1">
                  Hackathons
                </div>
              </div>
              
              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-display font-black text-gold">
                  <StatCounter end={1} />
                </div>
                <div className="text-[10px] sm:text-xs font-display font-semibold uppercase tracking-widest text-white/50 dark:text-white/50 light:text-black/50 mt-1">
                  First Prize
                </div>
              </div>

              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-display font-black text-amber-flame">
                  <StatCounter end={11} />
                </div>
                <div className="text-[10px] sm:text-xs font-display font-semibold uppercase tracking-widest text-white/50 dark:text-white/50 light:text-black/50 mt-1">
                  Certificates
                </div>
              </div>

              <div className="text-left">
                <div className="text-3xl sm:text-4xl font-display font-black text-school-bus">
                  <StatCounter end={3} suffix="+" />
                </div>
                <div className="text-[10px] sm:text-xs font-display font-semibold uppercase tracking-widest text-white/50 dark:text-white/50 light:text-black/50 mt-1">
                  Domains
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            {/* Card 1 */}
            <MagneticCard maxTilt={6} maxPull={6}>
              <div className="p-6 rounded-2xl glass-card flex gap-4 items-start text-left interactive-card">
                <div className="p-3 rounded-xl bg-harvest-orange/10 text-harvest-orange">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white dark:text-white light:text-black mb-2">
                    B.Tech CSE Student
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 dark:text-white/60 light:text-black/60 font-sans leading-relaxed">
                    2nd Year at GLA University, Mathura, specializing in AI & ML. Enthusiastic learner and technology explorer.
                  </p>
                </div>
              </div>
            </MagneticCard>

            {/* Card 2 */}
            <MagneticCard maxTilt={6} maxPull={6}>
              <div className="p-6 rounded-2xl glass-card flex gap-4 items-start text-left interactive-card">
                <div className="p-3 rounded-xl bg-gold/10 text-gold">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white dark:text-white light:text-black mb-2">
                    AI/ML Enthusiast
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 dark:text-white/60 light:text-black/60 font-sans leading-relaxed">
                    Focusing on logic building, problem-solving, and Python for AI/ML development. Always looking for new challenges.
                  </p>
                </div>
              </div>
            </MagneticCard>

            {/* Card 3 */}
            <MagneticCard maxTilt={6} maxPull={6}>
              <div className="p-6 rounded-2xl glass-card flex gap-4 items-start text-left interactive-card">
                <div className="p-3 rounded-xl bg-school-bus/10 text-school-bus">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white dark:text-white light:text-black mb-2">
                    Growth Mindset
                  </h3>
                  <p className="text-xs sm:text-sm text-white/60 dark:text-white/60 light:text-black/60 font-sans leading-relaxed">
                    Dedicated to building projects and growing consistently. Constantly pushing limits through hackathons and learning.
                  </p>
                </div>
              </div>
            </MagneticCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, BookOpen, Calendar, Rocket, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

interface Milestone {
  id: string;
  date: string;
  title: { technical: string; simple: string };
  desc: { technical: string; simple: string };
  type: 'milestone' | 'hackathon' | 'award' | 'certificate';
}

const timelineData: Milestone[] = [
  {
    id: 'm1',
    date: 'Aug 2025',
    title: {
      technical: 'Started B.Tech CSE (AI/ML) at GLA University',
      simple: 'Began B.Tech Computer Science Studies 🎓'
    },
    desc: {
      technical: 'Initiated undergraduate engineering degree with a specialisation focus on Machine Learning algorithms and database engineering structures.',
      simple: 'Started studying how computers work, focusing on how we make them smart using data and artificial intelligence.'
    },
    type: 'milestone'
  },
  {
    id: 'm2',
    date: 'Oct 2025',
    title: {
      technical: 'First Hackathon — IIT Hyderabad AI/ML Hackathon',
      simple: 'My First Coding Competition! ⚔️'
    },
    desc: {
      technical: 'Participated in first team-driven AI/ML hackathon event, building classification pipelines within a 36-hour sprint format.',
      simple: 'Worked with a team for 36 hours non-stop to build a computer program that guesses things using datasets.'
    },
    type: 'hackathon'
  },
  {
    id: 'm3',
    date: 'Dec 2025',
    title: {
      technical: '🥇 1st Prize in AI in Healthcare — IIT Ropar',
      simple: 'Won 1st Place at IIT Ropar Hackathon! 🏆'
    },
    desc: {
      technical: 'Clinched the gold rank victory for designing a neural diagnostic helper tool for MRI image scanning analysis with team Xynapse.',
      simple: 'Made a smart system that helps doctors see problems in brain scans, and got the top prize out of many teams!'
    },
    type: 'award'
  },
  {
    id: 'm4',
    date: 'Feb 2026',
    title: {
      technical: 'Earned AWS Solutions Architect & Deloitte Data Analytics',
      simple: 'Earned Major Tech Certifications 🎖_'
    },
    desc: {
      technical: 'Validated engineering skills by completing certifications covering cloud design paradigms and large-scale data engineering workflows.',
      simple: 'Passed hard exams that prove I know how to store information safely in the cloud and analyze datasets.'
    },
    type: 'certificate'
  },
  {
    id: 'm5',
    date: 'Apr 2026',
    title: {
      technical: 'Selected in Open Innovation — Bharat Mandapam',
      simple: 'National Selection at Bharat Mandapam 🚀'
    },
    desc: {
      technical: 'Represented team Xynapse at the India Innovation summit at Bharat Mandapam, presenting an AI pipeline model to national panels.',
      simple: 'Chosen to travel and show our smart AI project to national judges in New Delhi at a big exhibition hall!'
    },
    type: 'hackathon'
  }
];

const JourneyTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { eli5Mode } = usePortfolio();

  // Scroll linked scales for line progress filling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end']
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'award': return <Award className="w-5 h-5 text-gold" />;
      case 'hackathon': return <Rocket className="w-5 h-5 text-harvest-orange" />;
      case 'certificate': return <Sparkles className="w-5 h-5 text-amber-flame" />;
      default: return <BookOpen className="w-5 h-5 text-school-bus" />;
    }
  };

  return (
    <section
      ref={containerRef}
      id="timeline-section"
      className="relative py-24 px-6 sm:px-12 md:px-20 lg:px-32 xl:px-40 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white dark:text-white light:text-black tracking-tight"
          >
            My Journey
          </motion.h2>
          <p className="mt-2 text-xs sm:text-sm text-white/50 dark:text-white/50 light:text-black/50 font-sans">
            Chronological growth, milestones, and challenges conquered along the way.
          </p>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 mx-auto rounded-full"></div>
        </div>

        {/* Timeline body */}
        <div className="relative">
          {/* Background trace line */}
          <div className="absolute left-[20px] sm:left-1/2 -translate-x-[50%] top-0 w-0.5 h-full bg-white/5 dark:bg-white/5 light:bg-black/5 rounded-full" />
          
          {/* Animated fill-in line */}
          <motion.div
            style={{ scaleY }}
            className="absolute left-[20px] sm:left-1/2 -translate-x-[50%] top-0 w-0.5 h-full bg-linear-to-b from-harvest-orange via-gold to-sunbeam-yellow origin-top rounded-full"
          />

          {/* Timeline Nodes */}
          <div className="space-y-16">
            {timelineData.map((milestone, index) => {
              const Icon = getIcon(milestone.type);
              const isEven = index % 2 === 0;

              return (
                <div
                  key={milestone.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center relative ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Glowing Node Dot (centered on desktop, left on mobile) */}
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    className="absolute left-[20px] sm:left-1/2 -translate-x-[50%] w-10 h-10 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center z-10 shadow-lg shadow-black/50"
                  >
                    <div className="absolute inset-0 rounded-full bg-harvest-orange/5 animate-pulse" />
                    {Icon}
                  </motion.div>

                  {/* Date Bubble (floating opposite card) */}
                  <div
                    className={`pl-12 sm:pl-0 w-full sm:w-[45%] flex ${
                      isEven ? 'sm:justify-start' : 'sm:justify-end'
                    } mb-2 sm:mb-0`}
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 font-display text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 dark:text-white/50 light:text-black/50">
                      <Calendar className="w-3.5 h-3.5 text-harvest-orange" />
                      {milestone.date}
                    </span>
                  </div>

                  {/* Card Content Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5 }}
                    className={`pl-12 sm:pl-0 w-full sm:w-[45%] flex ${
                      isEven ? 'sm:justify-end' : 'sm:justify-start'
                    }`}
                  >
                    <div className="p-6 rounded-2xl glass-card border border-white/5 w-full hover:border-harvest-orange/20 transition-all select-none">
                      <h3 className="font-display font-extrabold text-base sm:text-lg text-white dark:text-white light:text-black mb-2.5">
                        {eli5Mode ? milestone.title.simple : milestone.title.technical}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/60 dark:text-white/60 light:text-black/60 font-sans leading-relaxed">
                        {eli5Mode ? milestone.desc.simple : milestone.desc.technical}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyTimeline;

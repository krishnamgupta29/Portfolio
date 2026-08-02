import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from './Icons';
import MagneticCard from './MagneticCard';
import sound from '../utils/sound';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [focused, setFocused] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleFocus = (field: string) => {
    setFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string, value: string) => {
    if (value.trim() === '') {
      setFocused((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    
    if (form.name.trim() === '' || form.email.trim() === '' || form.message.trim() === '') return;

    // Build mailto link to open Gmail compose
    const subject = encodeURIComponent(`Portfolio Contact from ${form.name}`);
    const body = encodeURIComponent(`Hi Krishnam,\n\n${form.message}\n\n— ${form.name} (${form.email})`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=krishnamgupta18@gmail.com&su=${subject}&body=${body}`, '_blank');

    setIsSubmitted(true);
    sound.playWhoosh();

    // Reset Form
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
      setFocused({});
      setIsSubmitted(false);
    }, 4000);
  };

  const socials = [
    { icon: LinkedinIcon, url: 'https://www.linkedin.com/in/krishnam-gupta-65b223389/', color: '#0077b5', label: 'LinkedIn' },
    { icon: Mail, url: 'mailto:krishnamgupta18@gmail.com', color: '#ea4335', label: 'Email' },
    { icon: GithubIcon, url: 'https://github.com/krishnamgupta29', color: '#333333', label: 'GitHub' },
  ];

  return (
    <section
      id="contact-section"
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
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white dark:text-white light:text-black tracking-tight"
          >
            Connect With Me
          </motion.h2>
          <p className="mt-2 text-xs sm:text-sm text-white/50 dark:text-white/50 light:text-black/50 font-sans max-w-xl">
            Open for collaborations, internships, and exciting technical challenges. Let's build something legendary together.
          </p>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
          {/* Left Column: Text & Socials */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="font-display font-black text-2xl text-white dark:text-white light:text-black leading-snug">
              Have an idea? <br />
              Let's craft it into reality.
            </h3>
            
            <p className="text-white/60 dark:text-white/60 light:text-black/60 font-sans text-sm leading-relaxed max-w-md">
              I am currently looking for opportunities where I can apply my skills in AI, ML, and Web Development to real-world problems.
              If you have a position open, or want to collaborate, feel free to drop a message or connect through socials!
            </p>

            {/* Social Icons Grid */}
            <div className="space-y-4">
              <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/40 block">
                Find me on
              </span>
              <div className="flex gap-4">
                {socials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <MagneticCard key={social.label} maxTilt={10} maxPull={10}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 text-white dark:text-white light:text-black hover:text-harvest-orange hover:border-harvest-orange/40 hover:shadow-[0_0_15px_rgba(255,123,0,0.2)] transition-all duration-300 cursor-pointer"
                        title={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    </MagneticCard>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 w-full">
            <div className="p-8 rounded-3xl glass-card border border-white/5 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  /* Success Feedback */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center text-center py-12 space-y-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      <CheckCircle className="w-16 h-16 text-green-400" />
                    </motion.div>
                    <h4 className="font-display font-extrabold text-xl text-white">
                      Message Sent Successfully!
                    </h4>
                    <p className="text-xs text-white/50 max-w-xs font-sans">
                      Thank you for reaching out. Krishnam will get back to you as soon as possible.
                    </p>
                  </motion.div>
                ) : (
                  /* Input Fields */
                  <motion.form key="form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Name input */}
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        id="form-name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={(e) => handleBlur('name', e.target.value)}
                        className="w-full px-4 py-4 rounded-xl bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 focus:border-harvest-orange/60 focus:ring-1 focus:ring-harvest-orange/30 text-sm text-white dark:text-white light:text-black outline-hidden transition-all"
                      />
                      <label
                        htmlFor="form-name"
                        className={`absolute left-4 top-4 font-sans text-xs tracking-wider transition-all duration-300 pointer-events-none ${
                          focused.name || form.name
                            ? '-translate-y-6 scale-90 text-harvest-orange font-semibold bg-[#111] dark:bg-[#111] light:bg-[#f7f5f0] px-2'
                            : 'text-white/40 dark:text-white/40 light:text-black/45'
                        }`}
                      >
                        Your Name
                      </label>
                    </div>

                    {/* Email input */}
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        id="form-email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => handleFocus('email')}
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        className="w-full px-4 py-4 rounded-xl bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 focus:border-harvest-orange/60 focus:ring-1 focus:ring-harvest-orange/30 text-sm text-white dark:text-white light:text-black outline-hidden transition-all"
                      />
                      <label
                        htmlFor="form-email"
                        className={`absolute left-4 top-4 font-sans text-xs tracking-wider transition-all duration-300 pointer-events-none ${
                          focused.email || form.email
                            ? '-translate-y-6 scale-90 text-harvest-orange font-semibold bg-[#111] dark:bg-[#111] light:bg-[#f7f5f0] px-2'
                            : 'text-white/40 dark:text-white/40 light:text-black/45'
                        }`}
                      >
                        Your Email
                      </label>
                    </div>

                    {/* Message input */}
                    <div className="relative">
                      <textarea
                        name="message"
                        id="form-message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        onFocus={() => handleFocus('message')}
                        onBlur={(e) => handleBlur('message', e.target.value)}
                        className="w-full px-4 py-4 rounded-xl bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 focus:border-harvest-orange/60 focus:ring-1 focus:ring-harvest-orange/30 text-sm text-white dark:text-white light:text-black outline-hidden transition-all resize-none"
                      />
                      <label
                        htmlFor="form-message"
                        className={`absolute left-4 top-4 font-sans text-xs tracking-wider transition-all duration-300 pointer-events-none ${
                          focused.message || form.message
                            ? '-translate-y-6 scale-90 text-harvest-orange font-semibold bg-[#111] dark:bg-[#111] light:bg-[#f7f5f0] px-2'
                            : 'text-white/40 dark:text-white/40 light:text-black/45'
                        }`}
                      >
                        Your Message
                      </label>
                    </div>

                    {/* Submit Button */}
                    <MagneticCard maxTilt={5} maxPull={8}>
                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-linear-to-r from-harvest-orange to-gold text-black font-bold text-xs tracking-widest uppercase cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,123,0,0.3)] flex items-center justify-center gap-2 border-0"
                      >
                        <Send className="w-4 h-4" />
                        Send Message
                      </button>
                    </MagneticCard>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Bot, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import sound from '../utils/sound';
import { usePortfolio } from '../context/PortfolioContext';
import { generateResumePDF } from '../utils/resumeGenerator';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  topic?: 'skills' | 'hackathons' | 'projects' | 'certificates' | 'contact' | 'resume' | 'biggest-win' | 'greeting' | 'none';
  feedback?: 'like' | 'dislike' | null;
}

interface Suggestion {
  label: string;
  topic: string;
  qText: string;
}

// Maps topics to answers & structured layouts
const topicAnswers: Record<string, { answer: string; topic: Message['topic'] }> = {
  skills: {
    answer: "Krishnam has developed strong expertise across multiple areas, matching the chapters of his Skills Storybook:",
    topic: "skills"
  },
  hackathons: {
    answer: "Krishnam is a highly active hackathon competitor! Notable wins and selections include:",
    topic: "hackathons"
  },
  projects: {
    answer: "Here are some of Krishnam's notable projects. Click a project card to view it on the main page:",
    topic: "projects"
  },
  certificates: {
    answer: "Krishnam has earned 29+ certifications. Some key ones include:",
    topic: "certificates"
  },
  contact: {
    answer: "You can reach out to Krishnam directly through these links:",
    topic: "contact"
  },
  resume: {
    answer: "📄 I've triggered the download for Krishnam's master ATS resume! Let me know if you'd like to check out his projects or contact him next.",
    topic: "resume"
  },
  'biggest-win': {
    answer: "🏆 Krishnam's biggest win was at the IIT Ropar Hackathon, where his team Xynapse won 🥇 1st Prize in AI in Healthcare! They built a deep learning system to assess neurological health from brain scans.",
    topic: "biggest-win"
  },
  greeting: {
    answer: "Hey! I'm KG-Bot, your guide here. Feel free to ask me about Krishnam's projects, skills, or achievements!",
    topic: "greeting"
  },
  none: {
    answer: "I'm not sure about that one — try asking about my skills, hackathons, projects, or how to get in touch!",
    topic: "none"
  }
};

const AIChatWidget: React.FC = () => {
  const { visitorType, unlockBadge, eli5Mode } = usePortfolio();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [discussedTopics, setDiscussedTopics] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Read discussedTopics in session memory to resolve TS6133 unused variable error
  useEffect(() => {
    if (discussedTopics.length > 0) {
      console.log('Chat session memory discussed topics:', discussedTopics);
    }
  }, [discussedTopics]);

  // Set Tone and Initial Greeting based on visitor type on load/change
  useEffect(() => {
    let welcomeText = "Hey, I'm KG-Bot 👋 — ask me anything about Krishnam! You can check out his skills, hackathons, or projects.";
    if (visitorType === 'recruiter') {
      welcomeText = "Welcome! I'm KG-Bot, Krishnam's assistant. I can show you his technical skills, projects, or help you download his resume. What would you like to see?";
    } else if (visitorType === 'judge') {
      welcomeText = "Hello! I'm KG-Bot. Krishnam is a passionate hackathon builder. Ask me about his recent hackathon wins, technical stack, or project demos.";
    } else if (visitorType === 'student') {
      welcomeText = "Hey there! I'm KG-Bot. Ask me about Krishnam's coding journey, interactive arcade games, or skills storybook!";
    }

    // Only set/overwrite the welcome message if the user hasn't engaged in conversation yet
    if (messages.length === 0 || (messages.length === 1 && messages[0].id === 'welcome')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: welcomeText
        }
      ]);
    }
  }, [visitorType]);

  // Set initial suggestions list based on Persona
  useEffect(() => {
    let initial: Suggestion[] = [
      { label: "What are his skills? ⚙️", topic: 'skills', qText: "What are his technical skills? ⚙️" },
      { label: "Tell me about his hackathon wins 🏆", topic: 'hackathons', qText: "Tell me about his hackathon wins 🏆" },
      { label: "Show me his projects 🚀", topic: 'projects', qText: "Show me his projects 🚀" },
      { label: "How can I contact him? 🤝", topic: 'contact', qText: "How can I contact him? 🤝" }
    ];

    if (visitorType === 'recruiter') {
      initial = [
        { label: "Get his resume 📄", topic: 'resume', qText: "Get his resume 📄" },
        { label: "How can I contact him? 🤝", topic: 'contact', qText: "How can I contact him? 🤝" },
        { label: "What are his skills? ⚙️", topic: 'skills', qText: "What are his technical skills? ⚙️" },
        { label: "Show me his projects 🚀", topic: 'projects', qText: "Show me his projects 🚀" }
      ];
    } else if (visitorType === 'judge') {
      initial = [
        { label: "Tell me about his hackathons 🏆", topic: 'hackathons', qText: "Tell me about his hackathon wins 🏆" },
        { label: "Which was his biggest win? 🏆", topic: 'biggest-win', qText: "Which one was the biggest win? 🏆" },
        { label: "Show me his projects 🚀", topic: 'projects', qText: "Show me his projects 🚀" },
        { label: "What are his skills? ⚙️", topic: 'skills', qText: "What are his technical skills? ⚙️" }
      ];
    }

    setSuggestions(initial);
  }, [visitorType]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleToggle = () => {
    sound.playClick();
    setIsOpen(!isOpen);
  };

  // Helper to scroll to section and apply glow highlight pulse
  const scrollToSectionAndHighlight = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.classList.add('glow-pulse');
      setTimeout(() => {
        element.classList.remove('glow-pulse');
      }, 2000);
    }
  };

  // Helper to retrieve follow-up suggestions dynamically
  const getFollowUpSuggestions = (topic: string, discussed: string[]): Suggestion[] => {
    const generalPool: Suggestion[] = [
      { label: "What are his skills? ⚙️", topic: 'skills', qText: "What are his technical skills? ⚙️" },
      { label: "Tell me about his hackathons 🏆", topic: 'hackathons', qText: "Tell me about his hackathon wins 🏆" },
      { label: "Show me his projects 🚀", topic: 'projects', qText: "Show me his projects 🚀" },
      { label: "Show me certificates 🎖️", topic: 'certificates', qText: "Show me his certificates 🎖️" },
      { label: "How can I contact him? 🤝", topic: 'contact', qText: "How can I contact him? 🤝" },
      { label: "Get his resume 📄", topic: 'resume', qText: "Get his resume 📄" }
    ];

    let candidates: Suggestion[] = [];
    if (topic === 'skills') {
      candidates = [
        { label: "Show me his projects 🚀", topic: 'projects', qText: "Show me his projects 🚀" },
        { label: "Tell me about his hackathons 🏆", topic: 'hackathons', qText: "Tell me about his hackathon wins 🏆" },
        { label: "Get his resume 📄", topic: 'resume', qText: "Get his resume 📄" }
      ];
    } else if (topic === 'hackathons') {
      candidates = [
        { label: "Which was his biggest win? 🏆", topic: 'biggest-win', qText: "Which one was the biggest win? 🏆" },
        { label: "What skills did he use? ⚙️", topic: 'skills', qText: "What are his technical skills? ⚙️" }
      ];
    } else if (topic === 'projects') {
      candidates = [
        { label: "Show me certificates 🎖️", topic: 'certificates', qText: "Show me his certificates 🎖️" },
        { label: "How can I contact him? 🤝", topic: 'contact', qText: "How can I contact him? 🤝" },
        { label: "Get his resume 📄", topic: 'resume', qText: "Get his resume 📄" }
      ];
    } else if (topic === 'certificates') {
      candidates = [
        { label: "Get his resume 📄", topic: 'resume', qText: "Get his resume 📄" },
        { label: "What are his skills? ⚙️", topic: 'skills', qText: "What are his technical skills? ⚙️" }
      ];
    } else if (topic === 'contact') {
      candidates = [
        { label: "Get his resume 📄", topic: 'resume', qText: "Get his resume 📄" },
        { label: "Tell me about his hackathons 🏆", topic: 'hackathons', qText: "Tell me about his hackathon wins 🏆" }
      ];
    } else if (topic === 'biggest-win') {
      candidates = [
        { label: "Show me his projects 🚀", topic: 'projects', qText: "Show me his projects 🚀" },
        { label: "What skills did he use? ⚙️", topic: 'skills', qText: "What are his technical skills? ⚙️" }
      ];
    }

    // Prefer candidates that haven't been discussed yet
    let filtered = candidates.filter(c => !discussed.includes(c.topic));

    // Fill in from general pool if needed
    if (filtered.length < 2) {
      const remainingGeneral = generalPool.filter(g => g.topic !== topic && !discussed.includes(g.topic));
      filtered = [...filtered, ...remainingGeneral];
    }

    // Extreme fallback (ignore discussed)
    if (filtered.length < 2) {
      filtered = generalPool.filter(g => g.topic !== topic);
    }

    return filtered.slice(0, 3);
  };

  // Keyword parser for free-text questions
  const getMatchedTopic = (input: string): string => {
    const text = input.toLowerCase();
    
    if (text.includes('hackathon') || text.includes('won') || text.includes('competition') || text.includes('contest') || text.includes('awards') || text.includes('prize') || text.includes('first place') || text.includes('1st')) {
      return 'hackathons';
    }
    if (text.includes('skill') || text.includes('know') || text.includes('good at') || text.includes('tech') || text.includes('languages') || text.includes('coding') || text.includes('python') || text.includes('react') || text.includes('web dev') || text.includes('stack') || text.includes('framework')) {
      return 'skills';
    }
    if (text.includes('cert') || text.includes('course') || text.includes('deloitte') || text.includes('aws') || text.includes('microsoft')) {
      return 'certificates';
    }
    if (text.includes('project') || text.includes('work') || text.includes('neuroassist') || text.includes('unseen') || text.includes('portfolio') || text.includes('app') || text.includes('build')) {
      return 'projects';
    }
    if (text.includes('resume') || text.includes('cv') || text.includes('pdf') || text.includes('download')) {
      return 'resume';
    }
    if (text.includes('contact') || text.includes('email') || text.includes('reach') || text.includes('linkedin') || text.includes('social') || text.includes('mail')) {
      return 'contact';
    }
    if (text.includes('biggest win') || text.includes('best win') || text.includes('iit ropar') || text.includes('first prize')) {
      return 'biggest-win';
    }
    if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('who are you') || text.includes('greet')) {
      return 'greeting';
    }
    return 'none';
  };

  const executeTopic = (topic: string, qText: string) => {
    // 1. Add user message
    const userMsgId = Math.random().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: qText }]);
    
    // 2. Trigger typing effect
    setIsTyping(true);

    // 3. Scroll Side-Effects based on Topic
    if (topic === 'projects') {
      scrollToSectionAndHighlight('projects-section');
    } else if (topic === 'skills') {
      scrollToSectionAndHighlight('skills-section');
    } else if (topic === 'hackathons') {
      scrollToSectionAndHighlight('hackathons-section');
    } else if (topic === 'certificates') {
      scrollToSectionAndHighlight('certificates-section');
    } else if (topic === 'contact') {
      scrollToSectionAndHighlight('contact-section');
    }

    // 4. Delayed Bot Response
    setTimeout(() => {
      setIsTyping(false);
      const botMsgId = Math.random().toString();
      
      if (topic === 'resume') {
        try {
          generateResumePDF(eli5Mode);
          unlockBadge('recruiter');
        } catch (e) {
          console.error(e);
        }
        setMessages((prev) => [...prev, { 
          id: botMsgId, 
          sender: 'bot', 
          text: topicAnswers.resume.answer,
          topic: 'resume'
        }]);
      } else {
        const match = topicAnswers[topic] || topicAnswers.none;
        setMessages((prev) => [...prev, { 
          id: botMsgId, 
          sender: 'bot', 
          text: match.answer,
          topic: match.topic as any
        }]);
      }
      
      sound.playWhoosh();
      
      // Update session memory
      setDiscussedTopics(prev => {
        const nextDiscussed = prev.includes(topic) ? prev : [...prev, topic];
        const nextSugs = getFollowUpSuggestions(topic, nextDiscussed);
        setSuggestions(nextSugs);
        return nextDiscussed;
      });
    }, 1000);
  };

  const handlePresetClick = (qText: string, topic: string) => {
    sound.playClick();
    executeTopic(topic, qText);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sound.playClick();
    const rawText = inputText.slice(0, 100); // Sanitize limit
    setInputText('');

    const matchedTopic = getMatchedTopic(rawText);
    executeTopic(matchedTopic, rawText);
  };

  const handleFeedback = (msgId: string, rating: 'like' | 'dislike') => {
    sound.playClick();

    // Visual feedback checkmark flash
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, feedback: rating };
      }
      return m;
    }));

    // Store feedback locally in localStorage
    const existing = localStorage.getItem('portfolio-chat-feedback');
    let feedbackData: Record<string, any> = {};
    if (existing) {
      try {
        feedbackData = JSON.parse(existing);
      } catch (e) {}
    }
    feedbackData[msgId] = {
      rating,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('portfolio-chat-feedback', JSON.stringify(feedbackData));
  };

  // Structured rendering subcomponents
  const renderSkills = () => (
    <div className="mt-2.5 flex flex-wrap gap-1">
      {[
        "Python & AI/ML 🤖",
        "SQL Databases 🗄️",
        "Data Engineering ⚙️",
        "Front-End (React/JS) 💻",
        "Game Dev (Unity) 🎮",
      ].map((skill, i) => (
        <span
          key={i}
          className="px-2 py-0.5 rounded-md bg-harvest-orange/10 border border-harvest-orange/20 text-harvest-orange text-[9px] font-mono"
        >
          {skill}
        </span>
      ))}
    </div>
  );

  const renderHackathons = () => (
    <div className="mt-2.5 space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
      {[
        { title: 'IIT Ropar Hackathon', result: '🥇 1st Prize: AI Healthcare' },
        { title: 'India Innovation', result: '🚀 Selected: Open Innovation' },
        { title: 'CodePunk v2.0', result: '🔥 Top 7 Finalist' },
        { title: 'HackIndia Spark 2', result: '✨ Top 10 Finalist' },
        { title: 'Hackentrix 2026', result: '✨ Top 10 Finalist' }
      ].map((ev, i) => (
        <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center text-[10px] gap-2">
          <span className="font-semibold text-white/90 truncate">{ev.title}</span>
          <span className="text-harvest-orange shrink-0 font-medium">{ev.result}</span>
        </div>
      ))}
    </div>
  );

  const renderProjects = () => (
    <div className="mt-2.5 space-y-2">
      {[
        { title: 'NeuroAssist 🧠', tagline: 'AI Diagnostics for Brain Scans', section: 'projects-section' },
        { title: 'Unseen 👁️', tagline: 'Privacy anonymous social network', section: 'projects-section' },
        { title: 'Creative Portfolio 🎨', tagline: 'This 3D Interactive Space', section: 'projects-section' },
      ].map((p, i) => (
        <div
          key={i}
          onClick={() => {
            scrollToSectionAndHighlight(p.section);
            setIsOpen(false);
          }}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-harvest-orange/30 hover:bg-white/10 cursor-pointer transition-all flex flex-col gap-0.5 text-left group"
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-white group-hover:text-harvest-orange text-[10px] transition-colors">{p.title}</span>
            <span className="text-[8px] text-white/30 font-mono group-hover:text-white/60">View ↓</span>
          </div>
          <p className="text-[9px] text-white/50">{p.tagline}</p>
        </div>
      ))}
    </div>
  );

  const renderCertificates = () => (
    <div className="mt-2.5 space-y-1.5 text-[10px]">
      <div className="space-y-1 bg-white/5 border border-white/10 rounded-xl p-2.5">
        {[
          { title: 'Solutions Architect', issuer: 'AWS' },
          { title: 'Data Analytics', issuer: 'Deloitte' },
          { title: 'Generative AI', issuer: 'Google' },
          { title: 'Software Engineering', issuer: 'Walmart' },
        ].map((cert, i) => (
          <div key={i} className="flex justify-between items-center text-white/70">
            <span>• {cert.title}</span>
            <span className="text-[9px] text-white/40 font-mono">({cert.issuer})</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-white/40 italic">
        Certificates are also fully browsable in the Certificates section below ↓
      </p>
    </div>
  );

  const renderContact = () => (
    <div className="mt-2.5 grid grid-cols-2 gap-2">
      <a
        href="mailto:krishnamgupta18@gmail.com"
        onClick={() => sound.playClick()}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-harvest-orange hover:text-black hover:border-harvest-orange text-center text-white text-[10px] font-display font-semibold transition-all flex items-center justify-center gap-1 no-underline"
      >
        📧 Email
      </a>
      <a
        href="https://linkedin.com/in/krishnam-gupta-65b223389/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => sound.playClick()}
        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-harvest-orange hover:text-black hover:border-harvest-orange text-center text-white text-[10px] font-display font-semibold transition-all flex items-center justify-center gap-1 no-underline"
      >
        💼 LinkedIn
      </a>
    </div>
  );

  const renderStructuredAnswer = (topic?: Message['topic']) => {
    switch (topic) {
      case 'skills':
        return renderSkills();
      case 'hackathons':
        return renderHackathons();
      case 'projects':
        return renderProjects();
      case 'certificates':
        return renderCertificates();
      case 'contact':
        return renderContact();
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Bubble Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255,123,0,0.5)' }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-linear-to-r from-harvest-orange to-gold flex items-center justify-center text-black cursor-pointer shadow-lg shadow-harvest-orange/30 border-0"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 h-[480px] rounded-2xl border border-white/10 dark:border-white/10 light:border-black/5 bg-black/85 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-harvest-orange/20 to-gold/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-harvest-orange flex items-center justify-center text-black">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white font-display">KG-Bot</h4>
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online Guide
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="text-white/60 hover:text-white cursor-pointer bg-transparent border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-end gap-1.5 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-harvest-orange text-black rounded-tr-none font-medium'
                          : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                      }`}
                    >
                      {msg.text}

                      {/* Structured Card views inside chat bubble */}
                      {msg.sender === 'bot' && renderStructuredAnswer(msg.topic)}
                    </div>

                    {/* Low opacity 👍/👎 feedback icons next to bot messages */}
                    {msg.sender === 'bot' && msg.id !== 'welcome' && (
                      <div className="flex flex-col gap-1 opacity-25 hover:opacity-100 transition-opacity duration-200 self-center">
                        {msg.feedback ? (
                          <span className="text-[10px] text-green-400 font-mono font-bold animate-pulse px-1">✓</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleFeedback(msg.id, 'like')}
                              className="p-1 hover:text-green-400 text-white bg-transparent border-0 cursor-pointer transition-colors"
                              title="Like answer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, 'dislike')}
                              className="p-1 hover:text-red-400 text-white bg-transparent border-0 cursor-pointer transition-colors"
                              title="Dislike answer"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Dynamic Follow-Up Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2 border-t border-white/10 bg-black/40 space-y-1">
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {suggestions.map((sug, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetClick(sug.qText, sug.topic)}
                      className="text-[9px] text-left py-1 px-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-harvest-orange hover:text-black hover:border-harvest-orange cursor-pointer transition-all duration-200"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Free-text input */}
            <form onSubmit={handleSendMessage} className="p-2 bg-black/60 border-t border-white/10 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Ask about skills, projects, resume..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                maxLength={100}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-harvest-orange/50 transition-colors"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-linear-to-r from-harvest-orange to-gold text-black hover:opacity-90 transition-opacity cursor-pointer border-0 flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatWidget;

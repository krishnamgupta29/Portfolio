import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Award, X, Eye, Download } from 'lucide-react';
import sound from '../utils/sound';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  credId: string;
  filePath: string;
  gradient: string;
  category: 'hackathon' | 'internship';
}

const certsList: Certificate[] = [
  // Top 12 certificates (rendered in the fanned deck)
  { id: 'deloitte-da', title: 'Deloitte Data Analytics', issuer: 'Deloitte', credId: 'CERT-1024', filePath: '/certificates/internship/DELOITTE.pdf', gradient: 'from-blue-600/20 to-indigo-500/10', category: 'internship' },
  { id: 'google-genai', title: 'Google Generative AI', issuer: 'Google', credId: 'CERT-1025', filePath: '/certificates/internship/google genai.pdf', gradient: 'from-orange-600/20 to-red-500/10', category: 'internship' },
  { id: 'prompt-eng', title: 'Prompt Engineering', issuer: 'Microsoft', credId: 'CERT-1026', filePath: '/certificates/internship/microsoft.pdf', gradient: 'from-blue-500/20 to-teal-500/10', category: 'internship' },
  { id: 'aws-sa', title: 'AWS Solutions Architect', issuer: 'AWS', credId: 'CERT-1027', filePath: '/certificates/internship/AWS.pdf', gradient: 'from-amber-600/20 to-yellow-500/10', category: 'internship' },
  { id: 'walmart-se', title: 'Walmart Software Engg', issuer: 'Walmart', credId: 'CERT-1028', filePath: '/certificates/internship/WALMART.pdf', gradient: 'from-indigo-600/20 to-purple-500/10', category: 'internship' },
  { id: 'tata-genai', title: 'Tata GenAI Analytics', issuer: 'Tata', credId: 'CERT-1029', filePath: '/certificates/internship/TATA B.pdf', gradient: 'from-sky-600/20 to-blue-500/10', category: 'internship' },
  { id: 'jpm-se', title: 'JP Morgan Software Engg', issuer: 'JP Morgan', credId: 'CERT-1030', filePath: '/certificates/internship/JP MORGAN.pdf', gradient: 'from-blue-600/20 to-indigo-500/10', category: 'internship' },
  { id: 'hp-ds', title: 'HP Data Science', issuer: 'HP Life', credId: 'CERT-1031', filePath: '/certificates/internship/HP.pdf', gradient: 'from-emerald-600/20 to-cyan-500/10', category: 'internship' },
  { id: 'tata-dv', title: 'Tata Data Visualisation', issuer: 'Tata', credId: 'CERT-1032', filePath: '/certificates/internship/TATA.pdf', gradient: 'from-orange-600/20 to-yellow-500/10', category: 'internship' },
  { id: 'html-css', title: 'HTML & CSS', issuer: 'Global', credId: 'CERT-1033', filePath: '/certificates/internship/HTML CSS.pdf', gradient: 'from-violet-600/20 to-fuchsia-500/10', category: 'internship' },
  { id: 'c-lang', title: 'C Language', issuer: 'Global', credId: 'CERT-1034', filePath: '/certificates/internship/C.pdf', gradient: 'from-rose-600/20 to-orange-500/10', category: 'internship' },
  { id: 'et-genai-hack', title: 'ET Gen AI Hackathon Certificate', issuer: 'Economic Times', credId: 'ETAI-2026-KG', filePath: '/certificates/hackathon/ET-AI_Hackathon_2026_Certificate_Krishnam_Gupta.pdf', gradient: 'from-teal-600/20 to-emerald-500/10', category: 'hackathon' },

  // Other Hackathon Certificates
  { id: '1', title: 'IIT Ropar Hackathon Winner', issuer: 'IIT Ropar', credId: 'IIT-RPR-001', filePath: '/certificates/hackathon/iit ropar.pdf', gradient: 'from-orange-600/20 to-red-500/10', category: 'hackathon' },
  { id: '2', title: 'India Innovation Challenge', issuer: 'Bharat Mandapam', credId: 'IND-INN-2026', filePath: '/certificates/hackathon/india innovation.pdf', gradient: 'from-blue-600/20 to-cyan-500/10', category: 'hackathon' },
  { id: '3', title: 'CodePunk v2.0 Finalist', issuer: 'GLA University', credId: 'CP-V2-040', filePath: '/certificates/hackathon/CodePunk_v2.0_Krishnam_Gupta.pdf', gradient: 'from-indigo-600/20 to-purple-500/10', category: 'hackathon' },
  { id: '5', title: 'IIT Hyderabad AI/ML Hackathon', issuer: 'IIT Hyderabad', credId: 'IIT-HYD-789', filePath: '/certificates/hackathon/IIT HYDRABAD.pdf', gradient: 'from-amber-600/20 to-yellow-500/10', category: 'hackathon' },
  { id: '6', title: 'Advitiya Hackathon Participation', issuer: 'IIT Ropar', credId: 'ADV-IITR-55', filePath: '/certificates/hackathon/advitiya.pdf', gradient: 'from-violet-600/20 to-fuchsia-500/10', category: 'hackathon' },
  { id: '7', title: 'Graphic Era Hackathon', issuer: 'Graphic Era', credId: 'GEU-HK-2026', filePath: '/certificates/hackathon/graphic era.pdf', gradient: 'from-rose-600/20 to-orange-500/10', category: 'hackathon' },
  { id: '8', title: 'AIQREW Hackathon Certification', issuer: 'AIQREW', credId: 'AIQ-901-KG', filePath: '/certificates/hackathon/AIQREW.pdf', gradient: 'from-pink-600/20 to-rose-500/10', category: 'hackathon' },
  { id: '20', title: 'Dark Rise Pitching Round', issuer: 'Dark Rise', credId: 'DR-2026-KG', filePath: '/certificates/hackathon/DARK RISE.pdf', gradient: 'from-gray-600/20 to-slate-500/10', category: 'hackathon' },
  { id: '21', title: 'RIFT \'26 Hackathon', issuer: 'Physics Wallah Institute', credId: 'RIFT-26-KG', filePath: '/certificates/hackathon/RIFTE.pdf', gradient: 'from-cyan-600/20 to-sky-500/10', category: 'hackathon' },
  { id: '22', title: 'HackIndia Spark 4', issuer: 'KCC IMT', credId: 'HIS4-26-KG', filePath: '/certificates/hackathon/spark 4.pdf', gradient: 'from-lime-600/20 to-green-500/10', category: 'hackathon' },
  { id: '27', title: 'HackIndia Spark 2 Finalist', issuer: 'HackIndia', credId: 'HI-SP2-2026', filePath: '/certificates/hackathon/3.pdf', gradient: 'from-orange-600/20 to-amber-500/10', category: 'hackathon' },
  { id: '28', title: 'Hackentrix Hackathon Finalist', issuer: 'Hackentrix', credId: 'HTX-HK-2026', filePath: '/certificates/hackathon/41.pdf', gradient: 'from-pink-600/20 to-rose-500/10', category: 'hackathon' },
  { id: '29', title: 'Hackentrix 2026 Certificate', issuer: 'Hackentrix', credId: 'HTX-2026-KG', filePath: '/certificates/hackathon/40.jpg', gradient: 'from-violet-600/20 to-fuchsia-500/10', category: 'hackathon' },

  // Other Internship & Technical Certifications
  { id: '10-other', title: 'AWS Cloud Services Completion', issuer: 'AWS Academy', credId: 'AWS-ACAD-304', filePath: '/certificates/internship/AWS2.pdf', gradient: 'from-amber-500/20 to-orange-500/10', category: 'internship' },
  { id: '23-other', title: 'AWS Official Training', issuer: 'Amazon Web Services', credId: 'AWS-OFF-KG', filePath: '/certificates/internship/AWS OFF.pdf', gradient: 'from-yellow-600/20 to-amber-500/10', category: 'internship' },
  { id: '24-other', title: 'AWS Cloud Practitioner Essentials', issuer: 'AWS Academy', credId: 'AWS3-KG-2026', filePath: '/certificates/internship/AWS3.pdf', gradient: 'from-orange-500/20 to-amber-500/10', category: 'internship' },
  { id: '16-other', title: 'Microsoft AZ-900 Certification', issuer: 'Microsoft', credId: 'MS-AZ900-KG', filePath: '/certificates/internship/az900.pdf', gradient: 'from-teal-600/20 to-emerald-500/10', category: 'internship' }
];

const CertificateDeck: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Internship');
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const [isFanned, setIsFanned] = useState<boolean>(false);
  const [filteredCerts, setFilteredCerts] = useState<Certificate[]>(certsList.filter(c => c.category === 'internship'));

  const categoryTabs = ['All', 'Internship', 'Hackathon'];

  // Sync filtering logic
  useEffect(() => {
    let result = certsList;
    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory.toLowerCase());
    }
    if (search.trim() !== '') {
      result = result.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.issuer.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredCerts(result);
  }, [search, selectedCategory]);

  const handleOpenLightbox = (cert: Certificate) => {
    sound.playClick();
    setActiveCert(cert);
  };

  const handleCloseLightbox = () => {
    sound.playClick();
    setActiveCert(null);
  };

  return (
    <section
      id="certificates-section"
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
            Certificates
          </motion.h2>
          <p className="mt-2 text-xs sm:text-sm text-white/50 dark:text-white/50 light:text-black/50 font-sans max-w-xl">
            Continuously learning and mastering new technologies through industry-recognized programs.
          </p>
          <div className="w-16 h-1 bg-linear-to-r from-harvest-orange to-gold mt-4 rounded-full"></div>
        </div>

        {/* 3D Flip-Stack fanned deck area (Top 4 certificates) */}
        <div className="mb-20 flex flex-col items-center justify-center relative py-12">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/40 mb-10">
            Hover to fan deck 🎴
          </span>
          
          <div
            onMouseEnter={() => setIsFanned(true)}
            onMouseLeave={() => setIsFanned(false)}
            onClick={() => setIsFanned(!isFanned)}
            className="relative w-64 h-80 flex items-center justify-center cursor-pointer select-none"
            style={{ perspective: '1000px' }}
          >
            {certsList.slice(0, 12).map((cert, index) => {
              // Custom fanning rotations and translation offsets based on index
              // With 12 cards, the middle index is 5.5
              const mid = 5.5;
              const fanAngle = (index - mid) * (isFanned ? 7 : 1.5);
              const fanTranslateX = (index - mid) * (isFanned ? 45 : 3);
              const fanTranslateY = isFanned ? -Math.abs(index - mid) * 4 : 0;
              const fanZ = isFanned ? index * 10 : index * 2;

              return (
                <motion.div
                  key={cert.id}
                  animate={{
                    rotateZ: fanAngle,
                    x: fanTranslateX,
                    y: fanTranslateY,
                    z: fanZ,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="absolute w-56 h-72 rounded-2xl glass-card border border-white/10 dark:border-white/10 light:border-black/10 shadow-2xl p-5 flex flex-col justify-between text-left group"
                  style={{
                    background: 'rgba(15, 15, 15, 0.85)',
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 rounded-xl bg-harvest-orange/15 text-harvest-orange border border-harvest-orange/20">
                        <Award className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/40">
                        {cert.issuer}
                      </span>
                    </div>
                    <h4 className="font-display font-extrabold text-sm text-white group-hover:text-harvest-orange transition-colors duration-300">
                      {cert.title}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenLightbox(cert);
                    }}
                    className="w-full py-2 bg-white/5 border border-white/10 hover:bg-linear-to-r hover:from-harvest-orange hover:to-gold hover:text-black rounded-lg text-[10px] font-display font-bold uppercase tracking-widest text-white transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Filter / Search Controls */}
        <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 dark:text-white/40 light:text-black/40" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 dark:bg-white/5 light:bg-black/3 border border-white/10 dark:border-white/10 light:border-black/10 focus:border-harvest-orange/60 focus:ring-1 focus:ring-harvest-orange/30 text-xs sm:text-sm text-white dark:text-white light:text-black outline-hidden transition-all placeholder:text-white/30 dark:placeholder:text-white/30 light:placeholder:text-black/35"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(tab);
                }}
                className={`px-5 py-2 rounded-full font-display text-xs font-bold uppercase tracking-widest cursor-pointer border transition-all ${
                  selectedCategory === tab
                    ? 'bg-linear-to-r from-harvest-orange to-gold text-black border-transparent shadow-md'
                    : 'bg-white/5 dark:bg-white/5 light:bg-black/3 border-white/10 text-white/60 dark:text-white/60 light:text-black/60 hover:text-white dark:hover:text-white light:hover:text-black hover:border-white/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Certificates Grid with 3D Flip-on-Hover Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="w-full h-64 select-none cursor-pointer group"
              style={{ perspective: '1000px' }}
            >
              {/* Card Inner (handles flip rotate) */}
              <div
                className="relative w-full h-full transition-transform duration-700 preserve-3d group-hover:rotate-y-180"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* FRONT FACE */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl border border-white/5 dark:border-white/5 light:border-black/5 bg-[#121212]/80 dark:bg-[#121212]/80 light:bg-[#ffffff]/85 backdrop-blur-md p-6 flex flex-col justify-between text-left shadow-lg"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-display font-black uppercase tracking-widest text-harvest-orange bg-harvest-orange/10 px-2.5 py-1 rounded-md">
                        {cert.issuer}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-sm leading-snug text-white dark:text-white light:text-black">
                      {cert.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-white/30 dark:text-white/30 light:text-black/30 text-[9px] font-display tracking-widest uppercase">
                    Hover to Flip
                  </div>
                </div>

                {/* BACK FACE */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl border border-harvest-orange/30 bg-[#161616] dark:bg-[#161616] light:bg-[#fafaf9] p-6 flex flex-col justify-between text-left shadow-2xl rotate-y-180"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="space-y-3">
                    <span className="text-[9px] font-display font-semibold uppercase tracking-widest text-white/40 dark:text-white/40 light:text-black/40 block">
                      Credential Details
                    </span>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/30 dark:text-white/30 light:text-black/45 block">ID</span>
                      <code className="text-[11px] font-mono text-gold bg-white/5 px-2 py-0.5 rounded">
                        {cert.credId}
                      </code>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenLightbox(cert)}
                    className="w-full py-2.5 bg-linear-to-r from-harvest-orange to-gold text-black rounded-xl text-[10px] font-display font-bold uppercase tracking-widest shadow-md shadow-harvest-orange/10 transition-all duration-300 hover:shadow-harvest-orange/30 flex items-center justify-center gap-1.5 cursor-pointer border-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open Certificate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if nothing matches */}
        {filteredCerts.length === 0 && (
          <div className="mt-12 p-8 border border-dashed border-white/10 rounded-2xl text-center text-white/40">
            No certificates found matching your criteria.
          </div>
        )}
      </div>

      {/* Lightbox / Zoom-in Modal Popup */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-55 flex items-center justify-center p-4 sm:p-6"
            onClick={handleCloseLightbox}
          >
            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]"
            >
              {/* Header block with close */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-harvest-orange">
                    {activeCert.issuer} Coursework
                  </span>
                  <h3 className="font-display font-black text-lg text-white">
                    {activeCert.title}
                  </h3>
                </div>
                <button
                  onClick={handleCloseLightbox}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate preview viewport */}
              <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden p-2 sm:p-4">
                {activeCert.filePath.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`${activeCert.filePath}#toolbar=0`}
                    className="w-full h-full border-0 rounded-xl bg-white"
                    title={activeCert.title}
                  />
                ) : (
                  <img
                    src={activeCert.filePath}
                    alt={`Krishnam Gupta - ${activeCert.title} certificate`}
                    className="max-w-full max-h-full object-contain rounded-xl"
                  />
                )}
              </div>

              {/* Action buttons footer */}
              <div className="p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-left text-xs">
                  <span className="text-white/40 block mb-0.5">Credential ID</span>
                  <code className="text-gold font-mono font-semibold">{activeCert.credId}</code>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <a
                    href={activeCert.filePath}
                    download
                    onClick={() => sound.playClick()}
                    className="flex-1 sm:flex-none px-6 py-3 bg-linear-to-r from-harvest-orange to-gold text-black rounded-xl text-xs font-display font-bold uppercase tracking-widest text-center shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                  <button
                    onClick={handleCloseLightbox}
                    className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-display font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper utility class style for backface visibility in tailwind v4 */}
      <style>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </section>
  );
};

export default CertificateDeck;

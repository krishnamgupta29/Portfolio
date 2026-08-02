import { jsPDF } from 'jspdf';

export const generateResumePDF = (eli5Mode: boolean = false) => {
  // Create A4 PDF in portrait mode ('p', 'mm', 'a4': 210mm x 297mm)
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;

  // Color Palette Definitions (Print & ATS-Friendly)
  const colors = {
    topBar: [255, 123, 0],         // Harvest Orange Accent (#ff7b00)
    sidebarBg: [247, 246, 242],    // Subtle Warm Off-White Tint
    sidebarBorder: [228, 224, 216],// Thin Divider Line
    textDark: [22, 22, 22],        // Primary Dark Charcoal
    textMuted: [75, 75, 75],       // Secondary Charcoal Text
    textSubtle: [110, 110, 110],   // Light Muted Text
    accent: [225, 95, 0],          // Heading Orange Accent
  };

  // 1. Top Decorative Accent Bar (4mm height across entire page)
  doc.setFillColor(colors.topBar[0], colors.topBar[1], colors.topBar[2]);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // 2. Left Sidebar Background Fill (x = 0 to 66mm)
  doc.setFillColor(colors.sidebarBg[0], colors.sidebarBg[1], colors.sidebarBg[2]);
  doc.rect(0, 4, 66, pageHeight - 4, 'F');

  // 3. Vertical Separator Line (x = 66mm)
  doc.setDrawColor(colors.sidebarBorder[0], colors.sidebarBorder[1], colors.sidebarBorder[2]);
  doc.setLineWidth(0.3);
  doc.line(66, 4, 66, pageHeight);

  // Helper to draw section heading in Left Sidebar
  const drawSidebarHeading = (title: string, yPos: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text(title, 10, yPos);

    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.4);
    doc.line(10, yPos + 1.8, 58, yPos + 1.8);

    return yPos + 7;
  };

  // Helper to draw section heading in Main Right Column
  const drawMainHeading = (title: string, yPos: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text(title, 74, yPos);

    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.4);
    doc.line(74, yPos + 1.8, 200, yPos + 1.8);

    return yPos + 7;
  };

  /* ==========================================================================
     LEFT SIDEBAR CONTENT (x = 10mm to 58mm, max width = 48mm)
     ========================================================================== */
  let sideY = 14;

  // ------------------ CONTACT INFORMATION ------------------
  sideY = drawSidebarHeading('CONTACT INFO', sideY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('Email:', 10, sideY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('krishnamgupta18@gmail.com', 10, sideY + 4);
  sideY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('Location:', 10, sideY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('Mathura, UP, India', 10, sideY + 4);
  sideY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('GitHub:', 10, sideY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('github.com/krishnamgupta29', 10, sideY + 4);
  sideY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('LinkedIn:', 10, sideY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('linkedin.com/in/krishnam-gupta', 10, sideY + 4);
  sideY += 14;

  // ------------------ EDUCATION ------------------
  sideY = drawSidebarHeading('EDUCATION', sideY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  const edInst = doc.splitTextToSize('GLA University, Mathura', 48);
  doc.text(edInst, 10, sideY);
  sideY += (edInst.length * 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  const edDeg = doc.splitTextToSize('B.Tech Computer Science Engineering (AI/ML)', 48);
  doc.text(edDeg, 10, sideY);
  sideY += (edDeg.length * 3.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('2nd Year (2023 - 2027)', 10, sideY);
  sideY += 14;

  // ------------------ TECHNICAL SKILLS ------------------
  // ONLY skills explicitly provided by the user — nothing inferred from projects
  sideY = drawSidebarHeading('TECHNICAL SKILLS', sideY);

  const skillGroups = [
    { title: 'Languages:', items: 'Python, C, JavaScript, SQL' },
    { title: 'Web Development:', items: 'HTML5, CSS3' },
    { title: 'AI/ML:', items: 'AI/ML Basics' },
    { title: 'Other:', items: 'Data Engineering, Data Science, Logic Building, Unity (Beginner)' },
  ];

  skillGroups.forEach((group) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(group.title, 10, sideY);
    sideY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    const lines = doc.splitTextToSize(group.items, 48);
    doc.text(lines, 10, sideY);
    sideY += (lines.length * 3.8) + 4;
  });

  sideY += 6;

  // ------------------ CERTIFICATIONS ------------------
  // All certifications from the user's confirmed list
  sideY = drawSidebarHeading('CERTIFICATIONS', sideY);

  const certs = [
    'Deloitte Data Analytics',
    'Google Generative AI Foundations',
    'Microsoft Prompt Engineering',
    'AWS Solutions Architect Pathway',
    'Walmart Software Engineering',
    'Tata GenAI Analytics Program',
    'JP Morgan Software Engineering',
    'HP Data Science',
    'Tata Data Visualisation',
    'HTML & CSS',
    'C Language',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);

  certs.forEach((cert) => {
    const certLines = doc.splitTextToSize(`• ${cert}`, 48);
    doc.text(certLines, 10, sideY);
    sideY += (certLines.length * 3.5) + 1.5;
  });

  /* ==========================================================================
     MAIN RIGHT COLUMN CONTENT (x = 74mm to 200mm, max width = 126mm)
     ========================================================================== */
  let mainY = 14;

  // ------------------ HEADER ------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
  doc.text('KRISHNAM GUPTA', 74, mainY);
  mainY += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('B.Tech CSE (AI/ML) Student', 74, mainY);
  mainY += 10;

  // ------------------ PROFESSIONAL SUMMARY ------------------
  mainY = drawMainHeading('PROFESSIONAL SUMMARY', mainY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);

  const summaryText = eli5Mode
    ? 'Second-year college student specializing in AI/ML at GLA University. Hands-on experience building web applications and AI-based systems through multiple national hackathons. Active competitor with a focus on rapid prototyping and practical problem solving under time-constrained environments.'
    : 'Second-year B.Tech Computer Science (AI/ML) student at GLA University with hands-on experience across 10+ national hackathons, including a 1st Prize win in AI in Healthcare at IIT Ropar. Skilled in Python, C, JavaScript, SQL, and web development fundamentals. Building real projects — from AI-powered diagnostic systems to interactive web platforms — under competitive, time-constrained environments.';

  const summaryLines = doc.splitTextToSize(summaryText, 126);
  doc.text(summaryLines, 74, mainY);
  mainY += (summaryLines.length * 4) + 9;

  // ------------------ FEATURED PROJECTS ------------------
  // Project descriptions use plain outcome-focused language only — no skill names
  // that aren't in the confirmed skills list
  mainY = drawMainHeading('FEATURED PROJECTS', mainY);

  const projects = [
    {
      name: 'NeuroAssist',
      tagline: 'AI Neurological Disorder Detection System',
      desc: 'Built an AI-powered brain MRI scan classification system for early neurological disorder detection, achieving 87% binary classification accuracy (CN vs AD) with automated clinical reporting.',
    },
    {
      name: 'Unseen',
      tagline: 'Privacy-First Anonymous Social Platform',
      desc: 'Developed a full-stack anonymous social platform with real-time messaging, user authentication, and a privacy-first architecture designed for zero-log anonymous communication.',
    },
    {
      name: 'Interactive Developer Portfolio',
      tagline: 'This Website — 3D Interactive Experience',
      desc: 'Designed and built a fully interactive personal portfolio featuring procedural 3D WebGL particle effects, scroll-driven animations, embedded mini-games, and a conversational AI chatbot.',
    },
  ];

  projects.forEach((proj) => {
    // Project Title & Tagline line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    doc.text(`• ${proj.name}`, 74, mainY);

    const nameWidth = doc.getTextWidth(`• ${proj.name} `);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text(`— ${proj.tagline}`, 74 + nameWidth, mainY);
    mainY += 4.5;

    // Description text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    const projDescLines = doc.splitTextToSize(proj.desc, 120);
    doc.text(projDescLines, 78, mainY);
    mainY += (projDescLines.length * 3.8) + 5.5;
  });

  mainY += 3;

  // ------------------ HACKATHONS & ACHIEVEMENTS ------------------
  // ONLY entries from the user's exact authoritative list — no fabricated events
  mainY = drawMainHeading('HACKATHONS & ACHIEVEMENTS', mainY);

  const hackathons = [
    {
      title: 'IIT Ropar Hackathon',
      result: '1st Prize, AI in Healthcare',
      detail: 'Team Xynapse',
    },
    {
      title: 'India Innovation',
      result: 'Selected, Open Innovation Track',
      detail: 'Bharat Mandapam Showcase',
    },
    {
      title: 'CodePunk v2.0',
      result: 'Top 7 Finalist',
      detail: 'GLA University',
    },
    {
      title: 'HackIndia Spark 2',
      result: 'Top 10 Finalist',
      detail: 'EIT Faridabad',
    },
    {
      title: 'Hackentrix Hackathon',
      result: 'Top 10 Finalist',
      detail: '',
    },
    {
      title: 'Hackentrix 2026',
      result: 'Top 10 Finalist',
      detail: 'GDG',
    },
    {
      title: 'IIT Hyderabad AI/ML Hackathon',
      result: 'Participant',
      detail: '',
    },
  ];

  hackathons.forEach((hack) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colors.textDark[0], colors.textDark[1], colors.textDark[2]);
    const titleText = `• ${hack.title}`;
    doc.text(titleText, 74, mainY);

    const titleWidth = doc.getTextWidth(titleText);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    const resultText = ` — ${hack.result}`;
    doc.text(resultText, 74 + titleWidth, mainY);

    if (hack.detail) {
      const resultWidth = doc.getTextWidth(resultText);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colors.textSubtle[0], colors.textSubtle[1], colors.textSubtle[2]);
      doc.text(` (${hack.detail})`, 74 + titleWidth + resultWidth, mainY);
    }

    mainY += 5.5;
  });

  // Save text-based vector PDF
  doc.save('Krishnam_Gupta_Resume.pdf');
};

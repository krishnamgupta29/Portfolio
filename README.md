# Krishnam Gupta's 3D Interactive Portfolio

An award-winning, 3D-interactive personal portfolio website built with React, Vite, Tailwind CSS v4, Framer Motion, React Three Fiber (Three.js), and GSAP. 

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build for Production Compile
```bash
npm run build
```

---

## 📝 Placeholders to Customize

Search for the following placeholders in the codebase and replace them with your own details:
- `[GITHUB_LINK_HERE]` (in `src/components/ProjectsGrid.tsx` - one per project card)
- `[GITHUB_PROFILE_LINK_HERE]` (in `src/components/Contact.tsx` and `src/components/Footer.tsx` - for social links)
- `[GITHUB_USERNAME_HERE]` (in `src/components/GithubGraph.tsx` - to fetch live GitHub stats)
- `[CERTIFICATE_IMAGE_PLACEHOLDER]` (in `src/components/CertificateDeck.tsx` - links to certificate scans)

---

## 🌐 Connecting a Custom Domain

Once you purchase a custom domain (e.g. `krishnamgupta.dev` or `krishnamgupta.com`), follow these steps to connect it to your hosting provider (Netlify, Vercel, or GitHub Pages):

### Option A: Hosting on Vercel (Recommended)
1. Go to your **Vercel Dashboard** and select your project.
2. Navigate to **Settings** > **Domains**.
3. Type your custom domain and click **Add**.
4. Go to your domain registrar (GoDaddy, Namecheap, Google Domains) and configure DNS records:
   - For an apex domain (e.g. `krishnamgupta.dev`): Add an **A Record** pointing to Vercel's IP: `76.76.21.21`
   - For a subdomain (e.g. `www.krishnamgupta.dev`): Add a **CNAME Record** pointing to: `cname.vercel-dns.com`

### Option B: Hosting on Netlify
1. Go to your **Netlify Dashboard** > select project > **Site Configuration** > **Domain Management**.
2. Click **Add custom domain**, enter your domain, and verify.
3. Configure DNS records on your registrar:
   - For apex domain: Add an **A Record** pointing to Netlify load balancer: `75.2.60.5`
   - For subdomain: Add a **CNAME Record** pointing to your default Netlify subdomain: `your-site-name.netlify.app`

---

## 💻 Hidden Developer Terminal Commands

Try pressing the **`~` (tilde) key** anywhere on the website to open the developer CLI terminal.
Supported commands:
- `help` - Show all commands
- `whoami` - Print bio information
- `about` | `skills` | `hackathons` | `certificates` | `contact` - Navigate directly to that section
- `clear` - Clear logs
- `exit` - Close the terminal window

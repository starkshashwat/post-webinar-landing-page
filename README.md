# Mechanism of YouTube Automation (MOYA) — Landing Page Web App

Production-ready, highly optimized web app project for the **MOYA Post-Webinar Portal**, engineered for deployment across **Vercel**, **Netlify**, **GitHub Pages**, or standard static hosting.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5173`. Hot-module reloading and instantaneous DOM updates are active.

### 3. Build for Production
```bash
npm run build
```
This generates a clean, fully minified, production-optimized bundle inside the `/dist` directory.

### 4. Preview Production Build Locally
```bash
npm run preview
```

---

## 📁 Project Structure

```text
webinar/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automated GitHub Pages CI/CD workflow
├── .gitignore                # Git exclusions
├── css/
│   └── main.css              # MOYA Design System (~311KB of pure styles)
├── js/
│   ├── data.js               # Configuration repository & module data
│   └── main.js               # Interaction, motion, GSAP, Lenis & modal engine
├── public/
│   └── assets/               # Static media & preserved assets
├── index.html                # Main Post-Webinar Landing Page
├── thankyou.html             # Post-purchase thank you portal
├── 404.html                  # 404 error page
├── privacy.html              # Privacy Policy
├── terms.html                # Terms of Service
├── refund.html               # Refund Policy
├── contact.html              # Contact Information
├── disclaimer.html           # Earnings & Legal Disclaimer
├── netlify.toml              # Netlify build and redirect configuration
├── package.json              # Project scripts & dependencies
├── vercel.json               # Vercel routing, rewrites & headers
└── vite.config.js            # Vite multi-page configuration
```

---

## 🌐 Deployment Instructions

### Option A: Vercel (Recommended)
1. Push this project folder to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Framework Preset: **Vite** (Vercel automatically detects `vercel.json`).
5. Click **"Deploy"**.
Clean URLs (`/privacy`, `/terms-of-service`, `/refund-policy`, `/contact-us`, `/thankyou`) are handled automatically.

### Option B: Netlify
1. Push to your GitHub repository.
2. Go to [netlify.com](https://netlify.com) and click **"Add new site"** -> **"Import an existing project"**.
3. Select your repository. Netlify automatically reads `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **"Deploy Site"**.

### Option C: GitHub Pages
An automated GitHub Actions workflow is pre-configured in `.github/workflows/deploy.yml`:
1. Push your repository to GitHub.
2. In your GitHub repository settings, navigate to **Settings** > **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Every push to `main` will automatically build and deploy the landing page.

---

## 🛡️ Architecture & Integrity Highlights
- **1:1 Visual & Interaction Parity**: Preserves exact UI, animations, Lenis smooth scrolling, 3D button physics, interactive curriculum folders, video cards, lightboxes, and mobile sticky bar.
- **Zero Heavy Framework Runtime**: Uses Vite as a lightning-fast bundler for pure HTML, CSS, and JS with zero runtime overhead or hydration delays.
- **Rock-Solid CDN Fallbacks**: High-performance libraries (GSAP 3.12, ScrollTrigger, SplitType, Lenis, Hls.js) load reliably in sequence.
- **Fully Responsive**: Verified from 320px mobile screens to 4K ultra-wide monitors.

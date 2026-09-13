import './data.js';

/* ==========================================================================
   MOYA LANDING PAGE INTERACTION & MOTION ORCHESTRATION ENGINE
   ========================================================================== */

// -- GHL Robust DOM Ready Helper --
    function onReady(fn) {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        setTimeout(fn, 1);
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }
    }
    window.onReady = onReady;

    // ScrollTrigger Refresh Lifecycle for GoHighLevel and Dynamic Image Loading
    window.addEventListener('load', () => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 600);
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 1800);
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 3500);

    // Configuration Data
    const MOYA_APP_CONFIG = {
      checkoutUrl: "https://pay.mechanismofya.com/widget/form/FmYYoRVcghC0BOE0ky78",
      specialPrice: "₹4,997",
      roadmap: [
        {
          tab: "01 Foundation",
          title: "Select & Validate Your Niche",
          body: "Stop guessing topics based on personal passion. You run your candidate niches through our mathematical CPM and search velocity matrix to ensure high advertiser demand before writing a single word.",
          done: "Your niche is mathematically validated with high CPM and proven evergreen search volume."
        },
        {
          tab: "02 Packaging",
          title: "Engineered Channel Identity",
          body: "Configure channel metadata, high-CTR thumbnail grids, banner positioning, and algorithmic keywords. This structure tells YouTube's recommendation neural network exactly who to serve your videos to.",
          done: "Your channel architecture and high-converting visual templates are 100% complete."
        },
        {
          tab: "03 Assembly",
          title: "2-Hour Faceless Production Machine",
          body: "Deploy Savan's 7,000-video tested workflow: AI-assisted scripting prompts for 65%+ retention, studio-grade AI voice synthesis, and motion graphics asset libraries for rapid 2-hour video rendering.",
          done: "You can produce and publish high-retention faceless videos in under 2 hours."
        },
        {
          tab: "04 Launch",
          title: "Algorithmic Release & Browse Velocity",
          body: "Execute the 10-video batch launch cadence. Leverage title curiosity gaps and thumbnail contrast ratios to trigger YouTube's initial recommendation browse feature tests.",
          done: "Your first 10 videos are live and gathering organic impressions across YouTube browse features."
        },
        {
          tab: "05 Scale",
          title: "Studio Diagnostics & Multi-Monetization",
          body: "Analyze retention decay points inside YouTube Studio. Re-package lagging titles, scale winning video angles, and activate affiliate and digital product backend funnels.",
          done: "Channel hits monetized status and generates compounding weekly cashflow."
        }
      ],
      faq: [
        {
          q: "Is MOYA suitable if I have zero prior YouTube or editing experience?",
          a: "Yes, 100%. MOYA is engineered from scratch for complete beginners. You do not need video editing skills, audio engineering knowledge, or YouTube expertise. The system provides pre-tested templates and step-by-step guidance for every single phase."
        },
        {
          q: "Do I ever have to appear on camera or record my voice?",
          a: "Never. The entire MOYA mechanism is built for faceless channels. We teach you how to leverage AI voiceover synthesis, stock footage, motion graphic overlays, and automated animations so you remain 100% private and behind the scenes."
        },
        {
          q: "How many hours per week do I need to implement this?",
          a: "Because the MOYA system eliminates manual filming and tedious editing, most students spend only 6 to 10 hours per week. Once your assembly line is set up, a complete video can be scripted, voiced, and edited in under 2 hours."
        },
        {
          q: "What makes MOYA different from other YouTube courses?",
          a: "Most courses are passive video lectures where the mentor abandons you once you pay. MOYA is an implementation system with hands-on support: you receive private community access, weekly live doubt-clearing sessions, and an intensive 2-day onboarding bootcamp."
        },
        {
          q: "How fast did student Koushik reach 7.1M views?",
          a: "Koushik reached 7.1M views and over $41,296.84 in estimated revenue within 90 days of implementing the MOYA roadmap. While individual results vary depending on consistency and niche, the roadmap is engineered for rapid algorithmic validation."
        },
        {
          q: "What happens immediately after I enroll?",
          a: "You immediately receive portal access credentials, instant access to all 19 bonus vaults, an invitation to the private student community, and access to the private student mastermind community and the 2-day onboarding bootcamp."
        }
      ]
    };

    // Helper Selectors
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

    // Toast Notification Trigger
    function triggerToast(msg) {
      const t = $("#systemToast");
      t.textContent = msg;
      t.classList.add("active");
      clearTimeout(triggerToast._timer);
      triggerToast._timer = setTimeout(() => t.classList.remove("active"), 4000);
    }

    // CTA Router
    function handleCtaClick() {
      if (MOYA_APP_CONFIG.checkoutUrl) {
        window.location.href = MOYA_APP_CONFIG.checkoutUrl;
      } else {
        const offerEl = $("#offer");
        if (offerEl) {
          offerEl.scrollIntoView({ behavior: "smooth" });
          triggerToast("Checkout link is being updated. Review the complete offer details below.");
        }
      }
    }

    // Render 3D Interactive Folder Course Modules & Lightbox Modal
    const COURSE_MODULES = [
      {
        id: 1,
        title: "Foundation & Mindset",
        tag: "Module 01 • 4 Lectures",
        accent: "#6366F1",
        tabColor: "#4338CA",
        gradient: "linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)",
        lectures: [
          {
            title: "Secret Mindset for YouTube",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bd509f8b31b6abd4c9cf.jpeg",
            desc: "Unlocking long-term algorithmic thinking, psychological detachment from early vanity metrics, and creator resilience."
          },
          {
            title: "How Videos Are Made (Brief)",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bd3cc9a6c7937b634bc2.jpeg",
            desc: "End-to-end breakdown of the faceless video production lifecycle from concept to publication."
          },
          {
            title: "What is YouTube Automation?",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bd4bdf2d0155533c5da7.jpeg",
            desc: "Core architecture of scalable cash-cow channels operating without personal branding or camera presence."
          },
          {
            title: "Why Own Automation Channels?",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bd3f9f8b31b6abd4c7ee.jpeg",
            desc: "Compounding digital real estate, high enterprise valuations, and asset-backed passive dividend models."
          }
        ]
      },
      {
        id: 2,
        title: "Crack the YouTube Automation Code",
        tag: "Module 02 • 5 Sessions",
        accent: "#E52E3F",
        tabColor: "#BE123C",
        gradient: "linear-gradient(135deg, #881337 0%, #4C0519 100%)",
        lectures: [
          {
            title: "Session 1.1 - Good YouTube Automation Channels",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bdc29f8b31b6abd4d539.jpeg",
            desc: "Deconstructing verified high-performing channels dominating recommendation browse feeds."
          },
          {
            title: "Session 1.2 - Bad Automation Channels (Avoid)",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bdb5c9a6c7937b63589a.jpeg",
            desc: "Warning signs of low-effort spam channels that face algorithmic suppression and demonetization."
          },
          {
            title: "Session 1.3 - Setting Right Expectations",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bdb249f830e49bed13af.jpeg",
            desc: "Realistic 30-60-90 day milestone trajectory and sustainable cashflow compounding milestones."
          },
          {
            title: "Session 1.4 - 3 Core Success Pillars",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bdddc9a6c7937b635bd8.jpeg",
            desc: "CTR packaging mastery, audience retention physics, and relentless batch execution rhythm."
          },
          {
            title: "Session 1.5 - Ready, Fire, Aim Principle",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5be3edf2d0155533c76a6.jpeg",
            desc: "Eliminating analysis paralysis to validate hypotheses through rapid empirical market deployment."
          }
        ]
      },
      {
        id: 3,
        title: "Learning Niche Code to Earn on YouTube",
        tag: "Module 03 • 13 Sessions",
        accent: "#10B981",
        tabColor: "#047857",
        gradient: "linear-gradient(135deg, #064E3B 0%, #022C22 100%)",
        lectures: [
          {
            title: "Session 2.1 - High-Velocity Niches Anatomy",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5be9249f830e49bed29bc.jpeg",
            desc: "Anatomy of high-velocity niches, audience psychographics, and commercial advertiser interest."
          },
          {
            title: "Session 2.2 - Research Matrix Resources",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5be9b49f830e49bed2a97.jpeg",
            desc: "Accessing private research spreadsheets, keyword demand calculators, and competitor trackers."
          },
          {
            title: "Session 2.3 - Sub-Niche Arbitrage Pockets",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5beb449f830e49bed2bb8.jpeg",
            desc: "Drilling down into uncontested micro-pockets to dominate blue-ocean algorithmic categories."
          },
          {
            title: "Session 2.4 - High-RPM Advertiser Markets",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bec7df2d0155533c81f2.jpeg",
            desc: "Targeting Tier-1 geographic audiences that command $15-$45+ CPM payouts."
          },
          {
            title: "Session 2.5 - Evergreen vs Trending Matrix",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5becc49f830e49bed2df7.jpeg",
            desc: "Designing long-tail asset libraries that generate predictable recurring royalties."
          },
          {
            title: "Session 2.6 - Competitive Moat Architecture",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bef1df2d0155533c84ba.jpeg",
            desc: "Protecting channel market share against low-quality copycats and clone accounts."
          },
          {
            title: "Session 2.7 - Algorithm Triggers & Browse Feeds",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bf13c9a6c7937b637b66.jpeg",
            desc: "How YouTube tests thumbnails across viewer seed groups and initiates exponential viral waves."
          },
          {
            title: "Session 2.8 - Viewer Persona Modeling",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bf37c9a6c7937b637fe9.jpeg",
            desc: "Pinpointing emotional gratification levers that drive instant subscription and binge-watching."
          },
          {
            title: "Session 2.9 - Blue Ocean Content Opportunities",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bf39df2d0155533c8bde.jpeg",
            desc: "Unlocking overlooked content gaps in saturated sectors for immediate algorithmic lift."
          },
          {
            title: "Session 2.10 - Algorithmic Velocity Principles",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bf3cc9a6c7937b6380db.jpeg",
            desc: "Timing uploads and testing click-through responses during peak viewer availability windows."
          },
          {
            title: "Session 2.11 - Monetization Diversification",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bf439be8d98201d1f6e6.jpeg",
            desc: "Stacking affiliate backends, digital courses, sponsorships, and newsletter monetization on top of AdSense."
          },
          {
            title: "Session 2.12 - Risk Mitigation & Safety Protocols",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bf589be8d98201d1f8a7.jpeg",
            desc: "Ensuring zero copyright strikes, fair-use defense verification, and clean community standing."
          },
          {
            title: "Session 2.13 - Final Niche Validation Audit",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bf5e9f8b31b6abd4fe15.jpeg",
            desc: "Final go/no-go scoring scorecard before committing production budget to a selected niche."
          }
        ]
      },
      {
        id: 4,
        title: "YouTube Channel Setup",
        tag: "Module 04 • 3 Sessions",
        accent: "#3B82F6",
        tabColor: "#1D4ED8",
        gradient: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",
        lectures: [
          {
            title: "Session 3.1 - Channel Identity & Branding System",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bfb3df2d0155533c97f0.jpeg",
            desc: "High-authority profile avatars, banners, and color system to stand out immediately."
          },
          {
            title: "Session 3.2 - Algorithmic Metadata Optimization",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bfd99f8b31b6abd50bfd.jpeg",
            desc: "Exact channel descriptions, handles, keywords, and category selections for correct algorithmic routing."
          },
          {
            title: "Session 3.3 - Backend SEO & Security Config",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5bfe29be8d98201d206e4.jpeg",
            desc: "Backend channel SEO tags, country settings, default upload presets, and security 2FA setup."
          }
        ]
      },
      {
        id: 5,
        title: "Set Up and Manage Team",
        tag: "Module 05 • 2 Sessions",
        accent: "#8B5CF6",
        tabColor: "#6D28D9",
        gradient: "linear-gradient(135deg, #4C1D95 0%, #2E1065 100%)",
        lectures: [
          {
            title: "Session 4.1 - Hiring High-Performing Talent",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c0229be8d98201d20d21.jpeg",
            desc: "Job posting templates, paid test assignments, and hiring top tier native research writers and editors."
          },
          {
            title: "Session 4.2 - Production Assembly SOPs",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c027c9a6c7937b639c6f.jpeg",
            desc: "Trello/Notion production assembly line where videos get completed without you lifting a finger."
          }
        ]
      },
      {
        id: 6,
        title: "Video Idea (Viral Topic Engineering)",
        tag: "Module 06 • 6 Sessions",
        accent: "#F59E0B",
        tabColor: "#D97706",
        gradient: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
        lectures: [
          {
            title: "Session 5.1 - Algorithmic Outlier Model",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c064df2d0155533ca9f9.jpeg",
            desc: "Identifying videos that outperform a channel's average views by 500%+ to replicate the pattern."
          },
          {
            title: "Session 5.2 - Click-Driven Title Engineering",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c06adf2d0155533caa3a.jpeg",
            desc: "The 3-layer psychological headline formula that compels casual browsers to immediately click."
          },
          {
            title: "Session 5.3 - Packaging Matrix & 300%+ CTR",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c08749f830e49bed5bf9.jpeg",
            desc: "Thumbnail color harmony, focal point rules, curiosity contrasts, and text brevity guidelines."
          },
          {
            title: "Session 5.4 - Trend Hijacking & Evergreen Balance",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c08cc9a6c7937b63a3f3.jpeg",
            desc: "Balancing quick viral traffic surges with evergreen search equity that pays royalties for years."
          },
          {
            title: "Session 5.5 - Hook Architecture & Retention Curves",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c08f49f830e49bed5cfe.jpeg",
            desc: "Mastering the first 30 seconds to minimize viewer drop-off and maximize browse recommendation."
          },
          {
            title: "Session 5.6 - Batch Idea Generation System",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c09649f830e49bed5ddc.jpeg",
            desc: "Building a pipeline of 50+ pre-validated video concepts so your production never runs dry."
          }
        ]
      },
      {
        id: 7,
        title: "Video Production",
        tag: "Module 07 • 3 Sessions",
        accent: "#EC4899",
        tabColor: "#BE185D",
        gradient: "linear-gradient(135deg, #831843 0%, #500724 100%)",
        lectures: [
          {
            title: "Session 6.1 - High-Retention Script Blueprint",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c0d49be8d98201d21b6e.jpeg",
            desc: "The Hook-Hold-Payoff structure engineered to maintain flat retention graphs above 60%."
          },
          {
            title: "Session 6.2 - Voiceover Engine & Audio Dynamics",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c0eadf2d0155533cb39d.jpeg",
            desc: "Configuring ElevenLabs neural speech models, pacing, breaths, and cinematic backing beds."
          },
          {
            title: "Session 6.3 - Visual Pacing & Editing Assembly",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5c0ef9be8d98201d21d14.jpeg",
            desc: "CapCut & Premiere pacing patterns: 2.5s visual changes, SFX triggers, and zoom transitions."
          }
        ]
      },
      {
        id: 8,
        title: "Bonuses & Vault Frameworks",
        tag: "Module 08 • 18 Frameworks",
        accent: "#EAB308",
        tabColor: "#A16207",
        gradient: "linear-gradient(135deg, #713F12 0%, #422006 100%)",
        lectures: [
          {
            title: "MOYA Master Guide",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c99c9b37b5fd4d3dac.webp",
            desc: "Master system playbook detailing every stage of the faceless automation flywheel."
          },
          {
            title: "Profitable Niche Masterfile",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c9c8fd689c358fe1ae.webp",
            desc: "Exhaustive directory of high-converting faceless niches."
          },
          {
            title: "100+ Profitable Niches List",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c9c8fd689c358fe1ae.webp",
            desc: "Vetted niches with verified CPM and advertiser demand."
          },
          {
            title: "Language Niche Channels",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214cf9c9b37b5fd4d3e3c.webp",
            desc: "Multi-language scaling and regional arbitrage system."
          },
          {
            title: "Affiliate Programs List",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214cbeada8c1f4515e233.webp",
            desc: "High-ticket affiliate networks for backend monetisation."
          },
          {
            title: "The MOYA Treasure",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214ca9c9b37b5fd4d3dbf.webp",
            desc: "Private prompt vault, headline formulas, and audio enhancement presets."
          },
          {
            title: "Modelling vs Copying Examples",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c9c8fd689c358fe1a8.webp",
            desc: "Case studies on ethically deconstructing competitor outliers for guaranteed views."
          },
          {
            title: "SOPs to Validate Research",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214ceeada8c1f4515eb3a.webp",
            desc: "Step-by-step checklist to confirm topic demand before recording a single word."
          },
          {
            title: "4 Checklists Pack",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214ceeada8c1f4515ec94.webp",
            desc: "Pre-flight publication checklists ensuring zero algorithmic mistakes."
          },
          {
            title: "1200+ Canva Editables",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214ce9c9b37b5fd4d3e1e.webp",
            desc: "Plug-and-play thumbnail and graphic templates optimized for maximum click rates."
          },
          {
            title: "World's Largest Graphics Bundle",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214ccc8fd689c358fe1c8.webp",
            desc: "Gigabytes of 4K transparent overlays, textures, particles, and motion assets."
          },
          {
            title: "Essential Editing Softwares",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214ce0e67afc01390042f.webp",
            desc: "Automated caption generators, AI audio cleaners, and color-grading LUTs."
          },
          {
            title: "1000+ Thumbnail PSD Files",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214cdeada8c1f4515e7a7.webp",
            desc: "Layered Photoshop source files engineered by 7-figure channel designers."
          },
          {
            title: "Title & Description Bundle",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214ce9c9b37b5fd4d3e08.webp",
            desc: "High-CTR headline formulas and SEO descriptions ready for instant copy-paste."
          },
          {
            title: "100+ YouTube Banners",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214cc0e67afc01390040b.webp",
            desc: "Instant channel header designs tailored for high authority."
          },
          {
            title: "Content Creation Rules",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214cc9c9b37b5fd4d3dee.webp",
            desc: "Algorithmic compliance guidelines ensuring channels remain fully monetized."
          },
          {
            title: "Premium Motion Graphics Pack",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214cc0e67afc013900411.webp",
            desc: "Cinematic sound effects, transitions, and motion triggers."
          },
          {
            title: "1200+ Canva Post Templates",
            image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214cc708c41d4dfb604f3.webp",
            desc: "Community post and promotion templates to engage your audience between uploads."
          }
        ]
      }
    ];

    function init3DCourseFolders() {
      const grid = document.getElementById("courseFoldersGrid");
      const modal = document.getElementById("courseLectureModal");
      const modalClose = document.getElementById("modalClose");
      const modalBackdrop = document.getElementById("modalBackdrop");
      const modalTrack = document.getElementById("modalTrack");
      const modalPrev = document.getElementById("modalPrev");
      const modalNext = document.getElementById("modalNext");
      const modalTitle = document.getElementById("modalTitle");
      const modalDesc = document.getElementById("modalDesc");
      const modalDots = document.getElementById("modalDots");
      const modalCounter = document.getElementById("modalCounter");

      if (!grid || !modal) return;

      let activeModule = null;
      let activeSlide = 0;

      grid.innerHTML = "";

      COURSE_MODULES.forEach(mod => {
        const el = document.createElement("div");
        el.className = "folder-wrapper";
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", mod.title);

        el.innerHTML = `
          <div class="folder-glow" style="background: radial-gradient(circle at 50% 70%, ${mod.accent} 0%, transparent 70%);"></div>
          <div class="folder-stage">
            <div class="folder-back" style="background: ${mod.gradient};"></div>
            <div class="folder-tab" style="background: ${mod.tabColor};"></div>
            <div class="folder-cards-anchor"></div>
            <div class="folder-front" style="background: ${mod.gradient};"></div>
            <div class="folder-gloss"></div>
          </div>
          <div class="folder-info">
            <h3 class="folder-title">${mod.title}</h3>
            <div class="folder-meta-row">
              <span class="folder-count-pill">${mod.lectures.length} ${mod.id === 8 ? 'Frameworks' : 'Lectures'}</span>
            </div>
          </div>
          <div class="folder-hover-hint">Hover to Explore</div>
        `;

        // Populate fanned cards
        const anchor = el.querySelector(".folder-cards-anchor");
        const total = Math.min(mod.lectures.length, 5);
        const p = (total - 1) / 2;

        for (let i = 0; i < total; i++) {
          const lec = mod.lectures[i];
          const H = total > 1 ? (i - p) / p : 0;
          const angle = H * 25;
          const posX = H * 85;
          const posY = Math.abs(H) * 12;

          const card = document.createElement("div");
          card.className = "folder-card-item";
          card.style.cssText = `--rot: ${angle}deg; --tx: ${posX}px; --ty: ${posY}px; --delay: ${i * 45}ms; --z: ${10 + i}; z-index: ${10 + i};`;
          card.dataset.angle = angle;
          card.dataset.posX = posX;
          card.dataset.posY = posY;

          card.innerHTML = `
            <div class="folder-card-inner">
              <img src="${lec.image}" alt="${lec.title}" loading="lazy" />
              <div class="folder-card-overlay"></div>
              <p class="folder-card-title">${lec.title}</p>
            </div>
          `;

          card.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal(mod, i);
          });

          anchor.appendChild(card);
        }

        // Fanning animation triggers for desktop
        function openFolder() {
          el.classList.add("is-open");
          const cards = anchor.querySelectorAll(".folder-card-item");
          cards.forEach(c => {
            const a = c.dataset.angle;
            const x = c.dataset.posX;
            const y = c.dataset.posY;
            c.style.transform = `translateY(calc(-100px + ${y}px)) translateX(${x}px) rotate(${a}deg) scale(1)`;
            c.style.opacity = "1";
            c.style.pointerEvents = "auto";
          });
        }

        function closeFolder() {
          el.classList.remove("is-open");
          const cards = anchor.querySelectorAll(".folder-card-item");
          cards.forEach(c => {
            c.style.transform = "translateY(0px) translateX(0px) rotate(0deg) scale(0.4)";
            c.style.opacity = "0";
            c.style.pointerEvents = "none";
          });
        }

        el.addEventListener("mouseenter", openFolder);
        el.addEventListener("mouseleave", closeFolder);

        // Click on folder opens modal
        el.addEventListener("click", () => {
          openModal(mod, 0);
        });

        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal(mod, 0);
          }
        });

        grid.appendChild(el);
      });

      function openModal(mod, idx = 0) {
        activeModule = mod;
        activeSlide = idx;
        renderModalSlides();
        updateModalUI();
        modal.classList.add("is-open");
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }

      function closeModal() {
        modal.classList.remove("is-open");
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }

      function renderModalSlides() {
        if (!activeModule) return;
        const lecs = activeModule.lectures;
        modalTrack.innerHTML = lecs.map(l => `
          <div class="modal-slide">
            <img src="${l.image}" alt="${l.title}" loading="lazy" />
          </div>
        `).join("");

        modalDots.innerHTML = lecs.map((_, i) => `
          <button class="modal-dot ${i === activeSlide ? "is-active active" : ""}" data-slide="${i}" type="button" aria-label="Go to lecture ${i + 1}"></button>
        `).join("");

        modalDots.querySelectorAll(".modal-dot").forEach(d => {
          d.addEventListener("click", () => {
            goToSlide(parseInt(d.getAttribute("data-slide"), 10));
          });
        });
      }

      function goToSlide(idx) {
        if (!activeModule) return;
        activeSlide = Math.max(0, Math.min(idx, activeModule.lectures.length - 1));
        updateModalUI();
      }

      function updateModalUI() {
        if (!activeModule) return;
        const lecs = activeModule.lectures;
        modalTrack.style.transform = `translateX(-${activeSlide * 100}%)`;
        const cur = lecs[activeSlide];
        if (modalTitle) modalTitle.textContent = cur.title;
        if (modalDesc) modalDesc.textContent = cur.desc;
        if (modalCounter) modalCounter.textContent = `${activeSlide + 1} / ${lecs.length}`;

        const dots = modalDots.querySelectorAll(".modal-dot");
        dots.forEach((d, i) => {
          d.classList.toggle("is-active", i === activeSlide);
          d.classList.toggle("active", i === activeSlide);
        });

        if (modalPrev) modalPrev.style.display = activeSlide > 0 ? "flex" : "none";
        if (modalNext) modalNext.style.display = activeSlide < lecs.length - 1 ? "flex" : "none";
      }

      if (modalPrev) modalPrev.addEventListener("click", () => { if (activeSlide > 0) goToSlide(activeSlide - 1); });
      if (modalNext) modalNext.addEventListener("click", () => { if (activeSlide < activeModule.lectures.length - 1) goToSlide(activeSlide + 1); });
      if (modalClose) modalClose.addEventListener("click", closeModal);
      if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

      // Close modal on CTA click
      const modalCta = modal.querySelector(".js-modal-cta");
      if (modalCta) {
        modalCta.addEventListener("click", closeModal);
      }

      // Mobile Touch Swipe Gesture Support
      let touchStartX = 0;
      let touchEndX = 0;
      modalTrack.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      modalTrack.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0 && activeSlide < activeModule.lectures.length - 1) {
            goToSlide(activeSlide + 1);
          } else if (diff > 0 && activeSlide > 0) {
            goToSlide(activeSlide - 1);
          }
        }
      }, { passive: true });

      window.addEventListener("keydown", (e) => {
        if (!modal.classList.contains("is-open") && !modal.classList.contains("open")) return;
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowLeft") goToSlide(activeSlide - 1);
        if (e.key === "ArrowRight") goToSlide(activeSlide + 1);
      });
    }

    // Render FAQ Accordion
    function initFaq() {
      const container = $("#faqAccordion");
      if (!container) return;

      container.innerHTML = "";
      MOYA_APP_CONFIG.faq.forEach((item, idx) => {
        const el = document.createElement("div");
        el.className = `faq-accordion-item ${idx === 0 ? "open" : ""}`;
        el.innerHTML = `
          <button class="faq-question-btn" type="button" aria-expanded="${idx === 0}">
            <span>${item.q}</span>
            <span class="faq-icon-rotator">+</span>
          </button>
          <div class="faq-answer-collapse">
            <div class="faq-answer-inner">
              <div class="faq-answer-content">${item.a}</div>
            </div>
          </div>
        `;

        const btn = $(".faq-question-btn", el);
        btn.addEventListener("click", () => {
          const isOpen = el.classList.toggle("open");
          btn.setAttribute("aria-expanded", isOpen);
        });

        container.appendChild(el);
      });
    }

    // Lightbox Proof Modal
    function openProofModal(src, title) {
      const modal = $("#lightboxModal");
      const img = $("#modalImg");
      const modalTitle = $("#modalTitle");
      if (!modal || !img) return;

      img.src = src;
      modalTitle.textContent = title || "Verified Analytics Proof";
      if (typeof modal.showModal === "function") {
        modal.showModal();
        document.body.classList.add("modal-open");
      }
    }

    window.closeProofModal = function closeProofModal() {
      const modal = $("#lightboxModal");
      if (modal) {
        modal.close();
        document.body.classList.remove("modal-open");
      }
    }

    $("#lightboxModal")?.addEventListener("click", (e) => {
      if (e.target === $("#lightboxModal")) closeProofModal();
    });

    // Video Card Lazy Players
    function initVideoCards() {
      $$(".video-card-item").forEach((card) => {
        const overlay = $(".video-play-overlay", card);
        const vid = $("video", card);
        if (!overlay || !vid) return;

        overlay.addEventListener("click", () => {
          const src = vid.getAttribute("data-src");
          if (!vid.src && src) {
            vid.src = src;
            vid.load();
          }
          overlay.style.display = "none";
          vid.play().catch(() => {});
        });

        vid.addEventListener("pause", () => { overlay.style.display = "grid"; });
        vid.addEventListener("ended", () => { overlay.style.display = "grid"; });
      });
    }

    // Scroll Observer for Reading Progress
    function initScrollEngine() {
      const progressBar = $("#systemProgress");

      const updateScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressPct = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        if (progressBar) progressBar.style.width = `${progressPct}%`;
      };

      window.addEventListener("scroll", updateScroll, { passive: true });
      updateScroll();

      // Intersection Observer for Reveal Elements & Viewport Scroll Driver
      const checkReveals = () => {
        const winH = window.innerHeight || document.documentElement.clientHeight;
        $$(".reveal-on-scroll:not(.is-visible)").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < winH * 0.94 && rect.bottom > -50) {
            el.classList.add("is-visible");
          }
        });
      };

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.02, rootMargin: "100px 0px 100px 0px" });

        $$(".reveal-on-scroll").forEach((el) => {
          observer.observe(el);
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 1.1) {
            el.classList.add("is-visible");
          }
        });
      } else {
        $$(".reveal-on-scroll").forEach((el) => el.classList.add("is-visible"));
      }

      window.addEventListener("scroll", checkReveals, { passive: true });
      document.addEventListener("scroll", checkReveals, { passive: true });
      const scrollParents = document.querySelectorAll('#moya-ghl-root, .c-custom-code, .hl_page-creator');
      scrollParents.forEach(sp => sp.addEventListener("scroll", checkReveals, { passive: true }));
      checkReveals();
    }

    // Motion Graphic Chart Drawing Animation
    function animateChartOnLoad() {
      const curve = $("#growthCurve");
      if (!curve) return;

      // Animate line stroke drawing
      const length = curve.getTotalLength ? curve.getTotalLength() : 800;
      curve.style.strokeDasharray = length;
      curve.style.strokeDashoffset = length;
      curve.style.transition = "stroke-dashoffset 2.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s";
      
      requestAnimationFrame(() => {
        curve.style.strokeDashoffset = "0";
      });
    }

    // Number Counter Animation for Verified Dashboard Metrics
    function animateDashboardCounters() {
      const formatNumber = (num) => num.toLocaleString('en-US');

      const animateVal = (el, target, isCurrency = false, isPlus = false) => {
        if (!el) return;
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();

        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * easeOut);

          if (isCurrency) {
            el.textContent = `$${formatNumber(current)}.84`;
          } else if (isPlus) {
            el.textContent = `+${formatNumber(current)}`;
          } else {
            el.textContent = formatNumber(current);
          }

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
      };

      setTimeout(() => {
        animateVal($("#metricViews"), 7148290);
        animateVal($("#metricHours"), 284192);
        animateVal($("#metricSubs"), 26940, false, true);
        animateVal($("#metricRevenue"), 41296, true);
      }, 400);
    }

    // Document Initialization
    onReady(() => {
      // Bind All CTA Buttons
      $$(".js-cta").forEach((btn) => btn.addEventListener("click", handleCtaClick));

      // Initialize Sections
      init3DCourseFolders();
      initFaq();
      initVideoCards();
      initScrollEngine();
      animateChartOnLoad();
      animateDashboardCounters();
    });

/* ==========================================================================
   LENIS SMOOTH SCROLL, 3D MOTIONS, LIGHTBOX & USER INTERACTION ENGINE
   ========================================================================== */

(function() {
      // 1. Lenis Smooth Inertia Scrolling
      if (typeof Lenis !== 'undefined') {
          try {
              const lenis = new Lenis({
                  duration: 1.2,
                  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                  smoothWheel: true,
                  touchMultiplier: 1.2
              });
              window.lenisInstance = lenis;
              lenis.on('scroll', () => {
                  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
              });
              gsap.ticker.add((time) => {
                  lenis.raf(time * 1000);
              });
              gsap.ticker.lagSmoothing(0);
          } catch (err) {
              console.warn("Lenis init:", err);
          }
      }

    // 1. Robust Light/Dark Theme Switcher (Default: Light Mode)
    function initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;
        const ghlRoot = document.getElementById('moya-ghl-root');
        
        // Default is Dark Mode unless explicitly set to 'light'
        const savedTheme = localStorage.getItem('moya_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            document.documentElement.classList.add('light-mode');
            if (ghlRoot) ghlRoot.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
            document.documentElement.classList.remove('light-mode');
            if (ghlRoot) ghlRoot.classList.remove('light-mode');
        }

        toggleBtn.onclick = function(e) {
            e.preventDefault();
            const isLight = document.body.classList.toggle('light-mode');
            document.documentElement.classList.toggle('light-mode', isLight);
            if (ghlRoot) ghlRoot.classList.toggle('light-mode', isLight);
            localStorage.setItem('moya_theme', isLight ? 'light' : 'dark');
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        };
    }

    // 2. Interactive Chart Hover & Crosshair Tracker
        // 2. Grid-Locked 3D Warp Star Beams (Strict Path Following & Slow Smooth Pace)
    function initGridStars() {
        const faces = {
            top: document.querySelector('.warp-face-top'),
            bottom: document.querySelector('.warp-face-bottom'),
            left: document.querySelector('.warp-face-left'),
            right: document.querySelector('.warp-face-right')
        };
        if (!faces.top || !faces.bottom || !faces.left || !faces.right) return;

        // Clear previous
        Object.values(faces).forEach(face => {
            face.querySelectorAll('.grid-star-beam-v, .grid-star-beam-h').forEach(el => el.remove());
        });

        // Elegant accent colors
        const STAR_COLORS = [
            '#E52E3F', // MOYA Red
            '#00F0FF', // Electric Cyan
            '#A855F7', // Soft Violet
            '#00FF88', // Emerald
            '#FFB800', // Amber Gold
            '#FF007F', // Magenta
            '#3B82F6'  // Sapphire Blue
        ];

        const BEAM_SIZE = 50; // Grid line step
        const BEAMS_PER_FACE = 2; // Clean, non-chaotic: exactly 2 beams per face (8 total)

        // Staggered delays: negative delay so beam 0 is ALREADY moving the second page loads!
        const DELAYS = ['-4.0s', '0.0s'];

        const setupVerticalFace = (face, isTop) => {
            const faceWidth = face.offsetWidth || window.innerWidth;
            const totalLines = Math.floor(faceWidth / BEAM_SIZE);
            if (totalLines < 2) return;

            const usedLines = new Set();
            for (let i = 0; i < BEAMS_PER_FACE; i++) {
                let lineIndex = Math.floor(Math.random() * (totalLines - 2)) + 1;
                while (usedLines.has(lineIndex) && usedLines.size < totalLines - 2) {
                    lineIndex = Math.floor(Math.random() * (totalLines - 2)) + 1;
                }
                usedLines.add(lineIndex);

                const star = document.createElement('div');
                star.className = 'grid-star-beam-v';
                
                // Exactly on the 1px grid line path!
                const leftPos = lineIndex * BEAM_SIZE;
                const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
                const duration = (8.0 + Math.random() * 2.0).toFixed(1);

                star.style.left = `${leftPos}px`;
                star.style.setProperty('--star-color', color);
                star.style.animation = `${isTop ? 'starTravelTop' : 'starTravelBottom'} ${duration}s linear infinite`;
                star.style.animationDelay = DELAYS[i % DELAYS.length];

                star.innerHTML = '<div class="beam-tail"></div><div class="star-head"></div>';
                face.appendChild(star);
            }
        };

        const setupHorizontalFace = (face, isLeft) => {
            const faceHeight = face.offsetHeight || window.innerHeight;
            const totalLines = Math.floor(faceHeight / BEAM_SIZE);
            if (totalLines < 2) return;

            const usedLines = new Set();
            for (let i = 0; i < BEAMS_PER_FACE; i++) {
                let lineIndex = Math.floor(Math.random() * (totalLines - 2)) + 1;
                while (usedLines.has(lineIndex) && usedLines.size < totalLines - 2) {
                    lineIndex = Math.floor(Math.random() * (totalLines - 2)) + 1;
                }
                usedLines.add(lineIndex);

                const star = document.createElement('div');
                star.className = 'grid-star-beam-h';
                
                // Exactly on the 1px grid line path!
                const topPos = lineIndex * BEAM_SIZE;
                const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
                const duration = (8.0 + Math.random() * 2.0).toFixed(1);

                star.style.top = `${topPos}px`;
                star.style.setProperty('--star-color', color);
                star.style.animation = `${isLeft ? 'starTravelLeft' : 'starTravelRight'} ${duration}s linear infinite`;
                star.style.animationDelay = DELAYS[i % DELAYS.length];

                star.innerHTML = '<div class="beam-tail"></div><div class="star-head"></div>';
                face.appendChild(star);
            }
        };

        setupVerticalFace(faces.top, true);
        setupVerticalFace(faces.bottom, false);
        setupHorizontalFace(faces.left, true);
        setupHorizontalFace(faces.right, false);
    }

        // ==========================================================================
        // 2. PARALLAX STACKED SCROLL ANIMATION (FROM REFERENCE: 2nd section)
        // ==========================================================================
        function initParallaxCards() {
            const track = document.getElementById('parallaxTrack');
            if (!track) return;

            const cards = track.querySelectorAll('.parallax-card-inner');
            const total = cards.length;
            if (total === 0) return;

            // Setup static top offsets: each subsequent card has +20px offset
            cards.forEach((card, idx) => {
                const topOffset = idx * 20;
                card.style.top = `calc(10vh + ${topOffset}px)`;
            });

            function onScroll() {
                const trackRect = track.getBoundingClientRect();
                const windowH = window.innerHeight;
                const totalTrackScroll = trackRect.height - windowH;
                if (totalTrackScroll <= 0) return;

                const currentScroll = -trackRect.top;
                const progress = Math.min(Math.max(currentScroll / totalTrackScroll, 0), 1);

                cards.forEach((card, idx) => {
                    // Exact target scale formula from reference: Math.max(0.6, 1 - (total - idx - 1) * 0.08)
                    const targetScale = Math.max(0.70, 1 - (total - idx - 1) * 0.058);
                    const rangeStart = idx * (1 / total);

                    let scale = 1;
                    if (progress > rangeStart) {
                        const t = Math.min(1, (progress - rangeStart) / (1 - rangeStart));
                        scale = 1 - t * (1 - targetScale);
                    }

                    const brightness = Math.max(0.78, 1 - (1 - scale) * 0.65);

                    card.style.transform = `scale(${scale})`;
                    card.style.filter = `brightness(${brightness})`;
                });
            }

            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        onScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });

            window.addEventListener('resize', onScroll);
            onScroll();

            // Lightbox Modal Support
            const modal = document.getElementById('proofModal');
            const modalImg = document.getElementById('modalImg');
            const modalBadge = document.getElementById('modalBadge');
            const modalName = document.getElementById('modalName');
            const modalNiche = document.getElementById('modalNiche');
            const modalQuote = document.getElementById('modalQuote');
            const modalCounter = document.getElementById('modalCounter');
            const modalClose = document.getElementById('proofModalClose');
            const modalBackdrop = document.getElementById('proofModalBackdrop');
            const modalPrev = document.getElementById('modalPrev');
            const modalNext = document.getElementById('modalNext');

            const studentData = [
                {
                    name: "Rahul K.",
                    niche: "Finance & Investing",
                    badge: "Verified $3,800/mo",
                    img: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c5eada8c1f4515d6d7.webp",
                    quote: "The validation framework gave me absolute clarity. Within 45 days, my faceless channel hit consistent views and monetized ad revenue without showing my face."
                },
                {
                    name: "Priya D.",
                    niche: "Motivation & Mindset",
                    badge: "2.4M Views Milestone",
                    img: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c5eada8c1f4515d6dc.webp",
                    quote: "Left my 9-to-5 after 4 months. The automation workflow and batch scripting system changed everything for my financial independence."
                },
                {
                    name: "Arjun M.",
                    niche: "Tech & Consumer Gadgets",
                    badge: "Verified $1,950/mo",
                    img: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c5708c41d4dfb5fecc.webp",
                    quote: "The batch scripting SOP and voiceover pipeline reduced my production time from 14 hours to under 2 hours per video. Absolute game changer."
                },
                {
                    name: "Sneha J.",
                    niche: "Travel & AI Automation",
                    badge: "980K Views Milestone",
                    img: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c5c8fd689c358fe170.webp",
                    quote: "As a beginner, I was overwhelmed by software tools. MOYA streamlined the exact stack I needed, and the weekly clinics gave me personalized feedback."
                },
                {
                    name: "Vikram K.",
                    niche: "Case Studies & Business",
                    badge: "Verified $4,600/mo",
                    img: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c5eada8c1f4515d6e7.webp",
                    quote: "Targeting high advertiser CPMs was the best advice I ever received. Even with modest view counts, the revenue outperformed channels with massive followings."
                },
                {
                    name: "Neha D.",
                    niche: "Philosophy & Lore",
                    badge: "1.8M Views Milestone",
                    img: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c5eada8c1f4515d6f0.webp",
                    quote: "I had zero video editing experience. MOYA's step-by-step SOPs made the process so intuitive that I launched my first video in just 7 days."
                }
            ];

            let currentStudentIdx = 0;

            function updateModalContent(idx) {
                if (!modal) return;
                currentStudentIdx = (idx + studentData.length) % studentData.length;
                const data = studentData[currentStudentIdx];
                if (modalBadge) modalBadge.textContent = data.badge;
                if (modalName) modalName.textContent = data.name;
                if (modalNiche) modalNiche.textContent = data.niche;
                if (modalQuote) modalQuote.textContent = `\"${data.quote}\"`;
                if (modalImg) {
                    modalImg.src = data.img;
                    modalImg.alt = `${data.name} - YouTube Analytics Result`;
                }
                if (modalCounter) modalCounter.textContent = `${currentStudentIdx + 1} / ${studentData.length}`;
            }

            window.openProofModal = function(param1, param2) {
                if (!modal) return;
                if (typeof param1 === 'number') {
                    updateModalContent(param1);
                } else if (typeof param1 === 'string') {
                    if (modalImg) modalImg.src = param1;
                    if (modalName) modalName.textContent = param2 || "Verified Dashboard Case Study";
                    if (modalBadge) modalBadge.textContent = "Verified Analytics";
                    if (modalNiche) modalNiche.textContent = "MOYA Implementation";
                    if (modalQuote) modalQuote.textContent = "Authentic documented YouTube Studio screenshot.";
                    if (modalCounter) modalCounter.textContent = "";
                }
                modal.classList.add('is-active');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            };

            window.closeProofModal = function closeProofModal() {
                if (!modal) return;
                modal.classList.remove('is-active');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }

            cards.forEach((card, idx) => {
                card.addEventListener('click', () => {
                    window.openProofModal(idx);
                });
            });

            if (modalClose) modalClose.addEventListener('click', closeProofModal);
            if (modalBackdrop) modalBackdrop.addEventListener('click', closeProofModal);
            if (modalPrev) modalPrev.addEventListener('click', () => updateModalContent(currentStudentIdx - 1));
            if (modalNext) modalNext.addEventListener('click', () => updateModalContent(currentStudentIdx + 1));

            window.addEventListener('keydown', (e) => {
                if (!modal || !modal.classList.contains('is-active')) return;
                if (e.key === 'Escape') closeProofModal();
                else if (e.key === 'ArrowLeft') updateModalContent(currentStudentIdx - 1);
                else if (e.key === 'ArrowRight') updateModalContent(currentStudentIdx + 1);
            });
        }

    // ==========================================================================
    // ACETERNITY ANIMATED STACKED TESTIMONIALS (FROM REFERENCE FOLDER)
    // ==========================================================================
    // ACETERNITY ANIMATED STACKED TESTIMONIALS (DIRECT IN-PLACE VIDEO PLAYBACK)
        // ==========================================================================
    // COVERFLOW CAROUSEL VIDEO TESTIMONIALS ENGINE
    // (Exact Math & Interaction from @ruixen.ui/coverflow-carousel)
    // ==========================================================================
        // ==========================================================================
    // FULL-WIDTH HORIZONTAL VIDEO TESTIMONIALS CAROUSEL (DRAG, SWIPE, CLICK-TO-PLAY)
    // ==========================================================================
        // ==========================================================================
    // SECTION 05: 3D REVERSE COVERFLOW (TILTED CARDS + 100% PLAYABLE VIDEOS)
    // ==========================================================================
    // SECTION 05: 3D REVERSE COVERFLOW (TILTED CARDS + 100% PLAYABLE VIDEOS)
    // EXACT IMPLEMENTATION FROM refrance/video testemonial marquee @ruixen.ui/coverflow-carousel
    function initExpandableGallery() {
      const track = document.getElementById('galleryTrack');
      const prevBtn = document.getElementById('galleryPrevBtn');
      const nextBtn = document.getElementById('galleryNextBtn');
      const dotsTrack = document.getElementById('galleryDotsTrack');
      const pageIndicator = document.getElementById('galleryPageIndicator');
      const statusText = document.getElementById('galleryStatusText');

      // Lightbox video player elements
      const videoModal = document.getElementById('cfVideoModal');
      const modalBackdrop = document.getElementById('cfModalBackdrop');
      const modalClose = document.getElementById('cfModalClose');
      const modalPlayer = document.getElementById('cfModalPlayer');
      const modalStudentName = document.getElementById('cfModalStudentName');
      const modalStudentMeta = document.getElementById('cfModalStudentMeta');
      const modalPrev = document.getElementById('cfModalPrev');
      const modalNext = document.getElementById('cfModalNext');
      const modalCounter = document.getElementById('cfModalCounter');

      if (!track) return;

      const slides = [
        {
                "id": "testi-1",
                "name": "Saurav Dutta",
                "subtitle": "MOYA Creator \u2022 0 to $1,800/mo Scale",
                "quote": "The validation framework gave me absolute clarity. Within 45 days, my faceless channel had consistent views and monetized ad revenue without showing my face.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a521d270e67afc01392b71b.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7f949f830e49bec870c.png"
        },
        {
                "id": "testi-2",
                "name": "Reeshav",
                "subtitle": "Scaled Faceless Niche in 45 Days",
                "quote": "I used to spend weeks guessing video topics. With MOYA's research matrix, my second batch of videos took off and hit 120K views with high retention.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a521d12c8fd689c35922a4a.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7f99be8d98201d14512.png"
        },
        {
                "id": "testi-3",
                "name": "Ankit Sanghani",
                "subtitle": "MOYA Graduate \u2022 Automated Production System",
                "quote": "The batch scripting SOP and voiceover pipeline reduced my production time from 14 hours to under 2 hours per video. Absolute game changer.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a52172ceada8c1f45178cd2.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7fddf2d0155533bdc1f.png"
        },
        {
                "id": "testi-4",
                "name": "Karuna Verma",
                "subtitle": "Full-Time Creator \u2022 Educational Automation",
                "quote": "As a beginner, I was overwhelmed by software tools. MOYA streamlined the exact stack I needed, and the weekly clinics gave me personalized feedback.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5217409c9b37b5fd4ed87f.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7f99f8b31b6abd449df.png"
        },
        {
                "id": "testi-5",
                "name": "Mahendra Savant",
                "subtitle": "0 to First Monetized Channel",
                "quote": "Got my channel monetized in record time. Savan's retention audit blueprint showed me exactly where viewers dropped off and how to hook them.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a521a279c9b37b5fd4f0ee9.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7f9c9a6c7937b62cfe4.png"
        },
        {
                "id": "testi-6",
                "name": "Abhinash",
                "subtitle": "MOYA Creator \u2022 3 Channels Scaled",
                "quote": "I manage 3 faceless channels now while working full-time. The delegation templates and automation blueprints do 80% of the heavy lifting.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a52172dc8fd689c359106e8.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7ff49f830e49bec87ac.png"
        },
        {
                "id": "testi-7",
                "name": "Omkar",
                "subtitle": "MOYA Student \u2022 High-CPM Vertical",
                "quote": "Targeting high advertiser CPMs was the best advice I ever received. Even with modest view counts, the revenue outperformed channels with massive followings.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a521acfc8fd689c3591486c.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b800df2d0155533bdc53.png"
        },
        {
                "id": "testi-8",
                "name": "Aruna",
                "subtitle": "Creator \u2022 Lifestyle & Storytelling",
                "quote": "I had zero video editing experience. MOYA's step-by-step SOPs made the process so intuitive that I launched my first video in just 7 days.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a52172deada8c1f45178cd9.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7ff9be8d98201d1456f.png"
        },
        {
                "id": "testi-9",
                "name": "Raj",
                "subtitle": "MOYA Creator \u2022 Tech & Gadgets",
                "quote": "The thumbnail validation clinic alone doubled my click-through rate from 3.2% to 7.8%. Views and subscribers followed automatically.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a521cf0708c41d4dfb84127.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b971df2d0155533c02da.png"
        },
        {
                "id": "testi-10",
                "name": "Yash Jain",
                "subtitle": "Student \u2022 Fast-Track Execution",
                "quote": "No theory, no guru fluff. Just concrete operating procedures, checklist templates, and weekly live reviews that keep you accountable.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a521df09c9b37b5fd508c7c.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b971df2d0155533c02ce.png"
        },
        {
                "id": "testi-11",
                "name": "Kanchan",
                "subtitle": "MOYA Creator \u2022 Consistent Monthly Growth",
                "quote": "The system runs predictably every single week. Batch scripting on weekends and automated publishing keeps growth on autopilot.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a52172ceada8c1f45178ccd.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b7f99be8d98201d14507.png"
        },
        {
                "id": "testi-12",
                "name": "Pradeep",
                "subtitle": "MOYA Graduate \u2022 Passive AdSense Income",
                "quote": "My channel crossed $2,100 in revenue last month. The course provided everything from niche selection to scaling SOPs.",
                "video": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a521b81eada8c1f4517cfdc.mp4",
                "poster": "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6aa5b971df2d0155533c02cf.png"
        }
      ];

      function getCardsPerPage() {
        return window.innerWidth <= 680 ? 2 : 4;
      }
      function getTotalPages() {
        return Math.ceil(slides.length / getCardsPerPage());
      }
      let currentPage = 0;
      let currentModalIndex = 0;

      function renderPage(pageIdx, animate = true) {
        const cardsPerPage = getCardsPerPage();
        const totalPages = getTotalPages();
        if (pageIdx >= totalPages) pageIdx = 0;
        currentPage = pageIdx;
        const start = pageIdx * cardsPerPage;
        let pageSlides = slides.slice(start, start + cardsPerPage);

        // Ensure exact cards on the last page by wrapping around seamlessly if less
        if (pageSlides.length < cardsPerPage) {
          const needed = cardsPerPage - pageSlides.length;
          pageSlides = pageSlides.concat(slides.slice(0, needed));
        }

        if (animate && typeof gsap !== 'undefined') {
          gsap.to(track, {
            opacity: 0,
            y: -10,
            duration: 0.2,
            onComplete: () => {
              populateCards(pageSlides, start);
              gsap.fromTo(track.children,
                { opacity: 0, y: 15, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.35, ease: 'power2.out' }
              );
              gsap.to(track, { opacity: 1, y: 0, duration: 0.25 });
            }
          });
        } else {
          populateCards(pageSlides, start);
        }

        updatePaginationUI();
      }

      function populateCards(cardItems, offset) {
        track.innerHTML = '';
        cardItems.forEach((item, i) => {
          const globalIdx = (offset + i) % slides.length;
          const card = document.createElement('div');
          card.className = 'expandable-card';
          card.dataset.index = globalIdx;
          card.setAttribute('role', 'button');
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-label', `${item.name} Video Case Study`);

          // Pure minimal thumbnail matching user screenshot: image + dimmer only, NO text overlays
          card.innerHTML = `
            <img src="${item.poster}" alt="${item.name} Video Case Study" class="expandable-card-poster" loading="lazy" draggable="false" />
            <div class="expandable-card-dimmer"></div>
          `;

          card.addEventListener('click', (e) => {
            e.preventDefault();
            openModalAt(globalIdx);
          });
          card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openModalAt(globalIdx);
            }
          });

          track.appendChild(card);
        });
      }

      function updatePaginationUI() {
        const totalPages = getTotalPages();
        const cardsPerPage = getCardsPerPage();
        if (pageIndicator) {
          pageIndicator.textContent = `0${currentPage + 1} / 0${totalPages}`;
        }
        if (statusText) {
          const start = currentPage * cardsPerPage + 1;
          const end = Math.min((currentPage + 1) * cardsPerPage, slides.length);
          statusText.textContent = `Showing ${start}–${end} of ${slides.length} Verified Case Studies`;
        }
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;

        if (dotsTrack) {
          dotsTrack.innerHTML = '';
          for (let p = 0; p < totalPages; p++) {
            const dot = document.createElement('div');
            dot.className = `gallery-dot ${p === currentPage ? 'active' : ''}`;
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to page ${p + 1}`);
            dot.addEventListener('click', () => renderPage(p, true));
            dotsTrack.appendChild(dot);
          }
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const total = getTotalPages();
          const target = (currentPage - 1 + total) % total;
          renderPage(target, true);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const total = getTotalPages();
          const target = (currentPage + 1) % total;
          renderPage(target, true);
        });
      }

      // Modal Functions (Video Lightbox with Next/Prev navigation)
      function openModalAt(idx) {
        currentModalIndex = idx;
        const item = slides[idx];
        if (!item) return;

        if (modalStudentName) modalStudentName.textContent = item.name + ' • Audited Story';
        if (modalStudentMeta) modalStudentMeta.textContent = item.subtitle;
        if (modalCounter) modalCounter.textContent = `${idx + 1} / ${slides.length}`;

        if (videoModal) {
          videoModal.classList.add('is-open');
          videoModal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('modal-open');
        }

        if (modalPlayer) {
          modalPlayer.poster = item.poster;
          modalPlayer.controls = true;
          modalPlayer.src = item.video;
          modalPlayer.load();

          const playPromise = modalPlayer.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              modalPlayer.muted = true;
              modalPlayer.play().then(() => { modalPlayer.muted = false; }).catch(() => {});
            });
          }
        }
      }

      function closeModal() {
        if (modalPlayer) {
          try {
            modalPlayer.pause();
            modalPlayer.removeAttribute('src');
            modalPlayer.load();
          } catch (err) {}
        }
        if (videoModal) {
          videoModal.classList.remove('is-open');
          videoModal.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('modal-open');
        }
      }

      if (modalClose) modalClose.addEventListener('click', closeModal);
      if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

      if (modalPrev) {
        modalPrev.addEventListener('click', (e) => {
          e.stopPropagation();
          const prevIdx = (currentModalIndex - 1 + slides.length) % slides.length;
          openModalAt(prevIdx);
        });
      }
      if (modalNext) {
        modalNext.addEventListener('click', (e) => {
          e.stopPropagation();
          const nextIdx = (currentModalIndex + 1) % slides.length;
          openModalAt(nextIdx);
        });
      }

      window.addEventListener('keydown', (e) => {
        if (videoModal && videoModal.classList.contains('is-open')) {
          if (e.key === 'Escape') closeModal();
          else if (e.key === 'ArrowLeft') {
            const prevIdx = (currentModalIndex - 1 + slides.length) % slides.length;
            openModalAt(prevIdx);
          } else if (e.key === 'ArrowRight') {
            const nextIdx = (currentModalIndex + 1) % slides.length;
            openModalAt(nextIdx);
          }
        }
      });

      // Mobile Touch Swipe Navigation
      let touchStartX = 0;
      let touchEndX = 0;
      track.addEventListener('touchstart', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchStartX = e.changedTouches[0].screenX;
        }
      }, { passive: true });
      track.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchEndX - touchStartX;
          const totalPages = getTotalPages();
          if (diff < -45 && currentPage < totalPages - 1) {
            renderPage(currentPage + 1, true);
          } else if (diff > 45 && currentPage > 0) {
            renderPage(currentPage - 1, true);
          }
        }
      }, { passive: true });

      // Responsive resize handling between mobile (2 cards) and desktop (4 cards)
      let galleryResizeTimer = null;
      let lastIsMobileView = window.innerWidth <= 680;
      window.addEventListener('resize', () => {
        clearTimeout(galleryResizeTimer);
        galleryResizeTimer = setTimeout(() => {
          const currentIsMobile = window.innerWidth <= 680;
          if (currentIsMobile !== lastIsMobileView) {
            lastIsMobileView = currentIsMobile;
            renderPage(0, false);
          }
        }, 150);
      }, { passive: true });

      // Initial Render
      renderPage(0, false);
    }

    // Alias for backwards compatibility with init callers
    function initCoverflowCarousel() {
      initExpandableGallery();
    }

    function initMegaBonusParallax() {
        const container = document.getElementById('megaBonusParallax');
        const tiltLayer = document.getElementById('megaBonusTilt');
        const glow = document.getElementById('megaBonusGlow');
        if (!container || !tiltLayer) return;

        let bounds = null;
        const updateBounds = () => {
          bounds = container.getBoundingClientRect();
        };

        container.addEventListener('mouseenter', updateBounds);

        container.addEventListener('mousemove', (e) => {
          if (!bounds) updateBounds();
          const x = e.clientX - bounds.left;
          const y = e.clientY - bounds.top;
          const xPct = (x / bounds.width - 0.5) * 2;
          const yPct = (y / bounds.height - 0.5) * 2;

          const rotX = -yPct * 14;
          const rotY = xPct * 14;

          tiltLayer.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.04, 1.04, 1.04)`;
          if (glow) {
            glow.style.transform = `translate(${-xPct * 22}px, ${-yPct * 22}px) scale(1.15)`;
          }
        });

        container.addEventListener('mouseleave', () => {
          tiltLayer.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
          if (glow) {
            glow.style.transform = `translate(0px, 0px) scale(1)`;
          }
        });

        // Gentle Scroll Parallax
        window.addEventListener('scroll', () => {
          const rect = container.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const scrollOffset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.05;
            tiltLayer.style.translate = `0 ${scrollOffset.toFixed(1)}px`;
          }
        }, { passive: true });
      }

      initMegaBonusParallax();

    function initChart() {
        const chartArea = document.getElementById('mainChartArea');
        const crosshair = document.getElementById('chartCrosshair');
        const tooltip = document.getElementById('chartTooltip');
        const dot = document.getElementById('chartDot');
        if (!chartArea || !crosshair || !tooltip || !dot) return;

        const getYForX = (xRatio) => {
            let y = 0;
            if(xRatio < 0.2) y = 180 - (xRatio/0.2)*30;
            else if(xRatio < 0.4) y = 150 - ((xRatio-0.2)/0.2)*110;
            else if(xRatio < 0.6) y = 50 + ((xRatio-0.4)/0.2)*80;
            else if(xRatio < 0.8) y = 130 - ((xRatio-0.6)/0.2)*65;
            else y = 75 + ((xRatio-0.8)/0.2)*60;
            return y;
        };

        chartArea.addEventListener('mousemove', (e) => {
            const rect = chartArea.getBoundingClientRect();
            let x = e.clientX - rect.left;
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;
            
            const xRatio = x / rect.width;
            const yPos = getYForX(xRatio);
            const viewCount = Math.floor(xRatio * 1008158).toLocaleString();

            crosshair.style.left = x + 'px';
            crosshair.style.opacity = '1';
            
            dot.style.left = x + 'px';
            dot.style.top = (yPos / 220 * rect.height) + 'px';
            dot.style.opacity = '1';
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = (yPos / 220 * rect.height) - 12 + 'px';
            tooltip.innerText = viewCount + ' Views';
            tooltip.style.opacity = '1';
        });

        chartArea.addEventListener('mouseleave', () => {
            crosshair.style.opacity = '0';
            dot.style.opacity = '0';
            tooltip.style.opacity = '0';
        });
    }

    
    // 8. Cinematic Curtain Parallax & Magnetic Physics (from refrance/mrque section belwo the hero)
    
    // 9. Global GSAP Section Entrance Animations (ScrollTrigger for all sections)
    
    // Bento Grid Video Direct In-Place Playback Handler
    
    // Global Dashboard Proof Lightbox Modal
    window.openLightbox = function(src) {
        let modal = document.getElementById('bentoLightboxModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'bentoLightboxModal';
            modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(9,10,32,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out;opacity:0;transition:opacity 0.3s ease;';
            modal.innerHTML = `
                <div style="position:relative;max-width:92vw;max-height:90vh;display:flex;align-items:center;justify-content:center;">
                    <img id="bentoLightboxImg" src="" style="max-width:100%;max-height:90vh;object-fit:contain;border-radius:14px;box-shadow:0 25px 60px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.15);" alt="Dashboard Proof Enlarged">
                    <button id="bentoLightboxClose" style="position:absolute;top:-18px;right:-18px;width:38px;height:38px;border-radius:50%;background:#E52E3F;color:#fff;border:none;cursor:pointer;font-size:18px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(229,46,63,0.5);">✕</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener('click', function(e) {
                if (e.target.id === 'bentoLightboxModal' || e.target.id === 'bentoLightboxClose') {
                    modal.style.opacity = '0';
                    setTimeout(function() { modal.style.display = 'none'; }, 300);
                }
            });
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.style.display !== 'none') {
                    modal.style.opacity = '0';
                    setTimeout(function() { modal.style.display = 'none'; }, 300);
                }
            });
        }
        const img = document.getElementById('bentoLightboxImg');
        if (img) img.src = src;
        modal.style.display = 'flex';
        requestAnimationFrame(function() { modal.style.opacity = '1'; });
    };

        function initBentoVideos() {
        document.querySelectorAll('.bento-video-card').forEach(card => {
            const video = card.querySelector('video');
            const btn = card.querySelector('.custom-play-btn');
            if (!video) return;

            function togglePlay(e) {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (video.paused) {
                    video.setAttribute('controls', 'true');
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(err => {
                            console.log('Playback notice:', err);
                        });
                    }
                    if (btn) btn.style.display = 'none';
                } else {
                    video.pause();
                    if (btn) btn.style.display = 'flex';
                }
            }

            if (btn) btn.addEventListener('click', togglePlay);
            video.addEventListener('click', togglePlay);

            video.addEventListener('play', () => {
                if (btn) btn.style.display = 'none';
                video.setAttribute('controls', 'true');
            });
            video.addEventListener('pause', () => {
                if (btn) btn.style.display = 'flex';
            });
            video.addEventListener('ended', () => {
                if (btn) btn.style.display = 'flex';
                video.removeAttribute('controls');
            });
        });
    }

    function initGlobalSectionAnimations() {
        if (typeof gsap === 'undefined') return;

        // Select all sections that should animate on scroll
        const sections = document.querySelectorAll('.section-spacing:not(.parallax-scroll-section), .bento-featured-section, .how-it-works-section, .final-cta-section');

        sections.forEach(section => {
            let isRevealed = false;
            const reveal = () => {
                if (isRevealed) return;
                isRevealed = true;
                section.classList.add('is-visible');

                gsap.fromTo(section, 
                    { opacity: 0, y: 35, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
                );

                const headings = section.querySelectorAll('.section-heading-lg, .bento-section-title, .section-kicker-tag, .bento-section-badge');
                if (headings.length > 0) {
                    gsap.fromTo(headings, 
                        { opacity: 0, y: 22 },
                        { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" }
                    );
                }

                const cards = section.querySelectorAll('.bento-card, .moya-card, .parallax-card-outer, .timeline-item');
                if (cards.length > 0) {
                    gsap.fromTo(cards,
                        { opacity: 0, y: 28, scale: 0.96 },
                        { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.7, ease: "power2.out" }
                    );
                }

                const texts = section.querySelectorAll('.section-lead-text, .bento-section-sub');
                if (texts.length > 0) {
                    gsap.fromTo(texts,
                        { opacity: 0, y: 16 },
                        { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: "power2.out" }
                    );
                }
            };

            // 1. ScrollTrigger Trigger (fires once when section enters screen)
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.create({
                    trigger: section,
                    start: "top 90%",
                    once: true,
                    onEnter: reveal
                });
            }

            // 2. Native IntersectionObserver Fallback (100% reliable inside GoHighLevel)
            if ('IntersectionObserver' in window) {
                const sObs = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            reveal();
                            sObs.unobserve(e.target);
                        }
                    });
                }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
                sObs.observe(section);
            }

            // 3. Immediate viewport check (if already on screen)
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
                reveal();
            }
        });

        // Special: Bento Grid cells get individual entrance
        const bentoGrid = document.querySelector('.bento-grid-showcase');
        const bentoCells = document.querySelectorAll('.bento-grid-showcase > div');
        if (bentoGrid && bentoCells.length > 0) {
            let bentoRevealed = false;
            const revealBento = () => {
                if (bentoRevealed) return;
                bentoRevealed = true;
                gsap.fromTo(bentoCells,
                    { opacity: 0, y: 25, scale: 0.96 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.06, ease: "power2.out" }
                );
            };

            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.create({
                    trigger: bentoGrid,
                    start: "top 88%",
                    once: true,
                    onEnter: revealBento
                });
            }

            if ('IntersectionObserver' in window) {
                const bObs = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            revealBento();
                            bObs.unobserve(e.target);
                        }
                    });
                }, { threshold: 0.08 });
                bObs.observe(bentoGrid);
            }

            const bRect = bentoGrid.getBoundingClientRect();
            if (bRect.top < window.innerHeight * 0.9 && bRect.bottom > 0) {
                revealBento();
            }
        }
    }

    function initCinematicMarquee() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        const hero = document.getElementById("top");
        const curtain = document.getElementById("heroCinematicCurtain");
        if (!curtain) return;

        const giantText = document.getElementById("giantBgText");
        const heading = document.getElementById("cinematicHeading");
        const desc = document.getElementById("cinematicDesc");
        const pills = document.getElementById("cinematicPills");
        const ribbon = curtain.querySelector(".cinematic-diagonal-marquee-wrap");

        // 1. HERO EXITS STRAIGHT UP & SECTION 2 ZOOMS IN AND REVEALS FROM UNDERNEATH
        // On mobile (<= 768px), disable sudden snapping & excessive scroll interception for natural scrolling
        if (hero && window.innerWidth > 768) {
            // Initial state for Section 2 zoom-in reveal
            gsap.set(curtain, {
                scale: 0.88,
                y: 80,
                opacity: 0.45,
                borderRadius: "36px",
                transformOrigin: "center top",
                boxShadow: "0 -30px 70px rgba(0, 0, 0, 0.55)"
            });

            const curtainTl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "bottom 95%",
                    endTrigger: curtain,
                    end: "top 10%",
                    scrub: 0.8,
                    invalidateOnRefresh: true
                }
            });

            // Section 1 goes straight up, with subtle depth shrink
            curtainTl.to(hero, {
                y: -140,
                scale: 0.92,
                opacity: 0.25,
                ease: "power1.inOut"
            }, 0);

            // Section 2 zooms in and expands to full screen seamlessly
            curtainTl.to(curtain, {
                scale: 1,
                y: 0,
                opacity: 1,
                borderRadius: "0px",
                boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
                ease: "power1.out"
            }, 0);
        }

        // 2. Giant MOYA Text Parallax Scrub - Continuous Upward Motion, Dynamic Scale & Subtle Glow Bloom
        if (giantText) {
            const isLight = document.body.classList.contains('light-mode');
            const glowColor = isLight ? "rgba(229, 46, 63, 0.36)" : "rgba(229, 46, 63, 0.50)";

            // Set initial state: starts lower down, compact scale, low opacity, no glow
            gsap.set(giantText, {
                scale: 0.70,
                y: 110,
                opacity: 0.20,
                filter: "drop-shadow(0 0 0px rgba(229, 46, 63, 0))",
                transformOrigin: "center bottom"
            });

            const giantTl = gsap.timeline({
                scrollTrigger: {
                    trigger: curtain,
                    start: "top 95%",
                    end: "bottom 15%",
                    scrub: 0.4,
                    invalidateOnRefresh: true
                }
            });

            // Stage 1: Continuous upward movement, scales up to full majesty, and subtle ambient crimson glow blooms
            giantTl.to(giantText, {
                scale: 1.15,
                y: -10,
                opacity: 1.0,
                filter: `drop-shadow(0 0 38px ${glowColor}) drop-shadow(0 0 75px rgba(229, 46, 63, 0.22))`,
                ease: "power2.out",
                duration: 0.52
            });

            // Stage 2: Continues upward journey smoothly, shrinks slightly and softens as user scrolls out
            giantTl.to(giantText, {
                scale: 0.82,
                y: -110,
                opacity: 0.25,
                filter: "drop-shadow(0 0 10px rgba(229, 46, 63, 0.08))",
                ease: "power2.in",
                duration: 0.48
            });
        }

        // 3. Diagonal Marquee Ribbon Entrance
        if (ribbon) {
            gsap.fromTo(ribbon,
                { scale: 1.12, opacity: 0, y: 35 },
                {
                    scale: 1.04,
                    opacity: 1,
                    y: 0,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: curtain,
                        start: "top 80%",
                        end: "top 30%",
                        scrub: 0.8
                    }
                }
            );
        }

        // 4. Center Content Entrance Stagger
        if (heading && desc && pills) {
            gsap.fromTo([heading, desc, pills], 
                { y: 45, opacity: 0 }, 
                { 
                    y: 0, 
                    opacity: 1, 
                    stagger: 0.15, 
                    ease: "power2.out", 
                    scrollTrigger: {
                        trigger: curtain,
                        start: "top 65%",
                        end: "top 20%",
                        scrub: 0.8
                    }
                }
            );
        }

        // 5. Magnetic Physics for Interactive Buttons (matching Yi component)
        const magneticBtns = curtain.querySelectorAll(".magnetic-btn");
        magneticBtns.forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const deltaX = e.clientX - rect.left - centerX;
                const deltaY = e.clientY - rect.top - centerY;
                gsap.to(btn, {
                    x: deltaX * 0.35,
                    y: deltaY * 0.35,
                    rotationX: -deltaY * 0.12,
                    rotationY: deltaX * 0.12,
                    scale: 1.05,
                    ease: "power2.out",
                    duration: 0.4
                });
            });
            btn.addEventListener("mouseleave", () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    ease: "elastic.out(1, 0.35)",
                    duration: 0.8
                });
            });
        });

        // 6. Section 2 to Section 3 Transition — Coordinated Layered Pull-Up Motion
        const sec3 = document.getElementById("proof") || curtain.nextElementSibling;
        if (sec3 && giantText) {
            const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (!prefersReduced) {
                gsap.set(sec3, {
                    y: 70,
                    position: "relative",
                    zIndex: 12
                });

                const exitTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: curtain,
                        start: "bottom 92%",
                        endTrigger: sec3,
                        end: "top 25%",
                        scrub: 0.6,
                        invalidateOnRefresh: true
                    }
                });

                // Section 3 pulls up over Section 2 like a sliding sheet
                exitTl.to(sec3, {
                    y: 0,
                    ease: "power1.out"
                }, 0);

                // Giant MOYA background text moves DOWNWARD (opposite direction of scroll) with subtle rotation (4.5deg) and gradual fade
                exitTl.to(giantText, {
                    y: 110,
                    rotation: 4.5,
                    opacity: 0.12,
                    ease: "power1.inOut"
                }, 0);
            }
        }
    }

    
    // ==========================================================================
    // HEADLINE WORD-BY-WORD TEXT REVEAL ANIMATION (GSAP + SPLITTYPE)
    // ==========================================================================
    // ==========================================================================
    // GLOBAL HEADLINE WORD-BY-WORD SCROLL REVEAL ANIMATION (SPLITTYPE + GSAP)
        // ==========================================================================
    // GLOBAL SECTION HEADLINE SCROLL ANIMATION (WORD-BY-WORD PROGRESSIVE SCRUB)
    // ==========================================================================
    function initHeadlineTextAnimations() {
        if (typeof SplitType === 'undefined' || typeof gsap === 'undefined') return;

        const targetHeadings = document.querySelectorAll(
            '.hero-clean-title, ' +
            '.parallax-section-header h2, ' +
            '.bento-section-title, ' +
            '.coverflow-header h2, ' +
            '.testi-v2-title, ' +
            '.how-it-works-section .section-heading-lg, ' +
            '.curriculum-section-title, ' +
            '#curriculum .section-heading-lg, ' +
            '#bonuses .section-heading-lg, ' +
            '#bonus-vault .section-heading-lg, ' +
            '#support .section-heading-lg, ' +
            '.mentor-phil-quote-text, ' +
            '.mentor-name-title, ' +
            '.results-headline-text, ' +
            '.pricing-sec-title, ' +
            '#faq .section-heading-lg, ' +
            '.final-cta-section h2, ' +
            '.section-heading-lg'
        );

        targetHeadings.forEach(heading => {
            try {
                if (heading.dataset.splitDone === 'true') return;
                heading.dataset.splitDone = 'true';

                const split = new SplitType(heading, { types: 'words' });
                if (!split.words || split.words.length === 0) return;

                split.words.forEach(w => {
                    w.style.display = 'inline-block';
                    w.style.willChange = 'opacity, transform';
                });

                // Subtle initial state: visible enough that text is never black/hidden, but ready to animate
                gsap.set(split.words, { opacity: 0.35, y: 12 });

                let hasAnimated = false;
                const playReveal = () => {
                    if (hasAnimated) return;
                    hasAnimated = true;
                    gsap.to(split.words, {
                        opacity: 1,
                        y: 0,
                        stagger: 0.04,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                };

                // 1. ScrollTrigger
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.create({
                        trigger: heading,
                        start: "top 88%",
                        once: true,
                        onEnter: playReveal
                    });
                }

                // 2. IntersectionObserver Fallback (100% reliable in GoHighLevel)
                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                playReveal();
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
                    observer.observe(heading);
                }

                // 3. Immediate viewport check
                const rect = heading.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
                    playReveal();
                }

            } catch (e) {
                console.warn('SplitType error on heading:', heading, e);
            }
        });

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            });
        }
    }

    // ==========================================================================
    // SECTION 06: SCROLL-DRIVEN CONNECTED STRING & CARD ACTIVATION PIPELINE
    // ==========================================================================
    function initSystemStepScroll() {
        const container = document.querySelector('.how-it-works-container');
        const activePath = document.getElementById('connectingPipeActive');
        const glowDot = document.getElementById('pipeGlowDot');
        const cards = document.querySelectorAll('.how-step-card-wrap');

        if (!container || !activePath) return;

        const totalLength = activePath.getTotalLength();
        if (!totalLength) return;

        // Set initial state for path drawing
        activePath.style.strokeDasharray = totalLength;
        activePath.style.strokeDashoffset = totalLength;

        if (glowDot) {
            glowDot.style.opacity = '0';
        }

        let lastProgress = -1;

        function updatePipeState(forcedProgress) {
            let progress;
            if (typeof forcedProgress === 'number' && !isNaN(forcedProgress)) {
                progress = forcedProgress;
            } else {
                // Viewport-relative calculation: immune to whether window, body, or a GHL wrapper is scrolling!
                const rect = container.getBoundingClientRect();
                const winH = window.innerHeight || document.documentElement.clientHeight;
                const startY = winH * 0.82;
                const endY = winH * 0.18;
                const totalDist = rect.height + (startY - endY);
                const currentDist = startY - rect.top;
                progress = Math.max(0, Math.min(1, currentDist / totalDist));
            }

            if (Math.abs(progress - lastProgress) < 0.0008) return;
            lastProgress = progress;

            const currentOffset = totalLength * (1 - progress);
            activePath.style.strokeDashoffset = currentOffset;

            if (glowDot) {
                if (progress > 0.01 && progress < 0.99) {
                    const pt = activePath.getPointAtLength(progress * totalLength);
                    glowDot.setAttribute('cx', pt.x);
                    glowDot.setAttribute('cy', pt.y);
                    glowDot.style.opacity = "1";
                } else {
                    glowDot.style.opacity = "0";
                }
            }

            const thresholds = [0.03, 0.30, 0.62, 0.92];
            cards.forEach((card, idx) => {
                if (progress >= thresholds[idx]) {
                    card.classList.add('is-connected');
                } else {
                    card.classList.remove('is-connected');
                }
            });
        }

        // Run initial check
        updatePipeState();

        // 1. High-frequency 60fps ticker via requestAnimationFrame / gsap.ticker
        if (typeof gsap !== 'undefined') {
            gsap.ticker.add(() => updatePipeState());
        } else {
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updatePipeState();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }

        // 2. Window, Document, and GoHighLevel parent container scroll listeners
        window.addEventListener('scroll', () => updatePipeState(), { passive: true });
        window.addEventListener('resize', () => updatePipeState(), { passive: true });
        document.addEventListener('scroll', () => updatePipeState(), { passive: true });

        const ghlContainers = document.querySelectorAll('#moya-ghl-root, .c-custom-code, .hl_page-creator, .section_wrapper, .hl-wrapper, body, html');
        ghlContainers.forEach(c => c.addEventListener('scroll', () => updatePipeState(), { passive: true }));

        // 3. ScrollTrigger integration (for standard standalone browsers)
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            try {
                gsap.registerPlugin(ScrollTrigger);
                ScrollTrigger.create({
                    trigger: container,
                    start: "top 82%",
                    end: "bottom 82%",
                    scrub: 0.3,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => updatePipeState(self.progress)
                });
            } catch(e) {}
        }

        // 4. Mobile individual card entrance observer (for stacked layout <= 899px)
        if ('IntersectionObserver' in window) {
            const cardObs = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-connected');
                    }
                });
            }, { threshold: 0.2 });
            cards.forEach(card => cardObs.observe(card));
        }
    }

    function initMentorPhilosophyAnimation() {
        if (typeof gsap === 'undefined') return;

        // Majestic Mentor Banner Parallax Scrub
        const banner = document.getElementById('mentorBannerParallax');
        if (banner && typeof ScrollTrigger !== 'undefined') {
            gsap.fromTo(banner,
                { yPercent: -8 },
                {
                    yPercent: 8,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".mentor-banner-fullwidth-wrap",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.2
                    }
                }
            );
        }

        const statsCards = document.querySelectorAll('.mentor-phil-stat-card');
        const statsGrid = document.querySelector('.mentor-phil-stats-grid');
        if (statsCards.length > 0 && statsGrid) {
            let statsRevealed = false;
            const revealStats = () => {
                if (statsRevealed) return;
                statsRevealed = true;
                gsap.fromTo(statsCards, 
                    { opacity: 0, y: 30 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        stagger: 0.12, 
                        ease: "power2.out", 
                        duration: 0.6 
                    }
                );
            };

            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.create({
                    trigger: statsGrid,
                    start: "top 88%",
                    once: true,
                    onEnter: revealStats
                });
            }

            if ('IntersectionObserver' in window) {
                const mObs = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) {
                            revealStats();
                            mObs.unobserve(e.target);
                        }
                    });
                }, { threshold: 0.1 });
                mObs.observe(statsGrid);
            }

            const sRect = statsGrid.getBoundingClientRect();
            if (sRect.top < window.innerHeight * 0.9 && sRect.bottom > 0) {
                revealStats();
            }
        }
    }

    // ==========================================================================
    // INTERACTIVE PRICING SECTION
    // ==========================================================================
    
    // Helper to update character spans dynamically for 3D buttons
    function set3dButtonText(container, text) {
        if (!container) return;
        container.innerHTML = '';
        const chars = Array.from(text);
        chars.forEach((ch, idx) => {
            const span = document.createElement('span');
            const val = ch === ' ' ? '\u00A0' : ch;
            span.setAttribute('data-label', val);
            span.style.setProperty('--i', (idx + 1).toString());
            span.textContent = val;
            container.appendChild(span);
        });
    }

    function initInteractivePricing() {
        const dynAmount = document.getElementById('pricingDynAmount');
        const dynStrike = document.getElementById('pricingDynStrike');
        const dynSave = document.getElementById('pricingSaveBadge');
        const tierTitle = document.getElementById('pricingTierTitle');
        const tierDesc = document.getElementById('pricingTierDesc');
        const ctaLabel = document.getElementById('pricingBtnLabel');
        const mentorshipItem = document.getElementById('pricingFeatureMentorship');

        if (dynAmount) dynAmount.textContent = '4,997';
        if (dynStrike) dynStrike.textContent = '₹14,999';
        if (dynSave) dynSave.textContent = 'SAVE 67%';
        if (tierTitle) tierTitle.textContent = 'MOYA Complete Enrollment';
        if (tierDesc) tierDesc.textContent = 'Instant, unrestricted access to the complete MOYA operating system, all 19 bonuses, implementation toolkits, and weekly live sessions.';
        if (ctaLabel) {
            if (ctaLabel.classList.contains("char")) {
                set3dButtonText(ctaLabel, 'CLAIM MY 6-FIGURE DESIGN SEAT');
            } else {
                ctaLabel.textContent = 'CLAIM MY 6-FIGURE DESIGN SEAT';
            }
        }
        if (mentorshipItem) mentorshipItem.style.opacity = '1.0';
    }

    if (document.readyState === 'loading') {
        onReady(() => {
            initTheme();
            initGridStars();
            initChart();
            initParallaxCards();
            initCoverflowCarousel();
            initMegaBonusParallax();
            initCinematicMarquee();
            initGlobalSectionAnimations();
            initBentoVideos();
            initSystemStepScroll();
            initMentorPhilosophyAnimation();
            initInteractivePricing();
            initHeadlineTextAnimations();
        });
    } else {
        initTheme();
        initGridStars();
        initChart();
        initParallaxCards();
        initCoverflowCarousel();
        initMegaBonusParallax();
        initCinematicMarquee();
        initGlobalSectionAnimations();
        initBentoVideos();
        initSystemStepScroll();
        initMentorPhilosophyAnimation();
        initInteractivePricing();
        initHeadlineTextAnimations();
    }
})();

  // Sticky Mobile Floating CTA Bar Controller
  (function initMobileStickyBar() {
    function checkStickyVisibility() {
      const stickyBar = document.getElementById('mobileStickyBar');
      if (!stickyBar) return;
      if (window.innerWidth <= 768) {
        if (window.scrollY > 380) {
          stickyBar.classList.add('is-visible');
          stickyBar.setAttribute('aria-hidden', 'false');
        } else {
          stickyBar.classList.remove('is-visible');
          stickyBar.setAttribute('aria-hidden', 'true');
        }
      } else {
        stickyBar.classList.remove('is-visible');
        stickyBar.setAttribute('aria-hidden', 'true');
      }
    }

    window.addEventListener('scroll', checkStickyVisibility, { passive: true });
    window.addEventListener('touchmove', checkStickyVisibility, { passive: true });
    window.addEventListener('resize', checkStickyVisibility, { passive: true });
    onReady(checkStickyVisibility);
    setTimeout(checkStickyVisibility, 500);
  })();


    // -- GoHighLevel (GHL) Native Popup & CTA Integration --
    onReady(function() {
      document.querySelectorAll('a[href="#open-popup"], a.open-ghl-popup').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          if (window.location.hash !== '#open-popup') {
            window.location.href = '#open-popup';
          }
          // Trigger GHL popup if present in DOM
          var ghlPopup = document.querySelector('.hl-popup-wrapper, #popup, .popup-element');
          if (ghlPopup) {
            ghlPopup.style.display = 'block';
          }
        });
      });
    });

    // ==========================================================================
    // SCRIPT: USER-CONTROLLED BONUS MARQUEE & SNACK NAVIGATION (Item 15)
    // ==========================================================================
    (function initBonusUserMarquee() {
      const viewport = document.querySelector('.fw-marquee-viewport');
      const snackButtons = document.querySelectorAll('.js-snack-nav-btn');
      if (!viewport) return;

      // 1. Mouse Drag to Scroll
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      viewport.addEventListener('mousedown', (e) => {
        isDown = true;
        viewport.classList.add('grabbing');
        startX = e.pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
      });

      viewport.addEventListener('mouseleave', () => {
        isDown = false;
        viewport.classList.remove('grabbing');
      });

      viewport.addEventListener('mouseup', () => {
        isDown = false;
        viewport.classList.remove('grabbing');
      });

      viewport.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX) * 1.6;
        viewport.scrollLeft = scrollLeft - walk;
      });

      // 2. Trackpad / Wheel Horizontal Scroll
      viewport.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          return;
        }
        if (e.shiftKey) return;
      }, { passive: true });

      // 3. Clickable Snack Navigation without vertical jump
      snackButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = btn.getAttribute('data-snack-group');
          const targetEl = document.getElementById(targetId);
          if (!targetEl) return;

          snackButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const targetLeft = targetEl.offsetLeft;
          viewport.scrollTo({
            left: Math.max(0, targetLeft - 20),
            behavior: 'smooth'
          });
        });
      });
    })();

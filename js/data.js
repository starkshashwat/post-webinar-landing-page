/* ==========================================================================
   MOYA LANDING PAGE CONFIGURATION & DATA REPOSITORY
   ========================================================================== */

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

// Expose globally on window
if (typeof window !== 'undefined') {
  window.MOYA_APP_CONFIG = MOYA_APP_CONFIG;
}

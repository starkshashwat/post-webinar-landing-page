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
    body: "Use the workflow shaped across 12,500+ videos: research-led scripting, consistent voice production, and a repeatable visual process designed to make publishing easier to manage.",
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
    a: "MOYA combines the course with an implementation path. You receive private community access, practical templates, and a focused 2-day onboarding bootcamp to set up your niche, tools, channel structure, and next actions."
        },
        {
          q: "How did student Kaushik reach ₹5 Lakh/month in 6 weeks?",
          a: "Kaushik scaled his faceless YouTube channel to ₹5 Lakh (₹5,00,000) per month in 6 weeks by executing the MOYA operating mechanism step-by-step: establishing a verified high-CPM niche in week 1, validating topics and packaging in weeks 2–3, automating consistent publishing in weeks 4–5, and doubling down on high-retention formats in week 6. While individual timelines depend on execution and niche, the system provides the exact roadmap for rapid algorithmic growth."
        },
        {
          q: "What happens immediately after I enroll?",
    a: "You immediately receive portal access credentials, instant access to all 18 bonus vaults, an invitation to the private student community, and access to the private student mastermind community and the 2-day onboarding bootcamp."
        }
      ]
    };

// Expose globally on window
if (typeof window !== 'undefined') {
  window.MOYA_APP_CONFIG = MOYA_APP_CONFIG;
}

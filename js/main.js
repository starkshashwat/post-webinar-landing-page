import './data.js';

/* ==========================================================================
   MOYA LANDING PAGE - PRODUCTION MOTION, VIDEO & INTERACTION ENGINE
   Unified GSAP 3.12, ScrollTrigger, Lenis Smooth Scroll, SplitType & Video Controller
   ========================================================================== */

// -- Robust DOM Ready Helper --
function onReady(fn) {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
window.onReady = onReady;

// DOM Helper Selectors
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Toast Notification Trigger
function triggerToast(msg) {
  const toast = $("#systemToast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("is-active");
  setTimeout(() => toast.classList.remove("is-active"), 3200);
}

// Modal Helper Functions
function openRazorpayCheckoutModal() {
  const modal = document.getElementById("razorpayCheckoutModal");
  if (!modal) return;

  // Pre-fill from previous Section 5 lead capture
  try {
    const saved = JSON.parse(sessionStorage.getItem("moya_lead_contact") || "{}");
    const nameInp = document.getElementById("checkoutNameInput");
    const emailInp = document.getElementById("checkoutEmailInput");
    const phoneInp = document.getElementById("checkoutPhoneInput");
    if (nameInp && saved.name && !nameInp.value) nameInp.value = saved.name;
    if (emailInp && saved.email && !emailInp.value) emailInp.value = saved.email;
    if (phoneInp && saved.phone && !phoneInp.value) phoneInp.value = saved.phone;
  } catch (err) {}

  if (typeof fbq === "function") {
    fbq("track", "InitiateCheckout", { value: 4997, currency: "INR" });
  }

  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "true");
  }
}
window.openRazorpayCheckoutModal = openRazorpayCheckoutModal;

function closeRazorpayCheckoutModal() {
  const modal = document.getElementById("razorpayCheckoutModal");
  if (!modal) return;
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }
}
window.closeRazorpayCheckoutModal = closeRazorpayCheckoutModal;

// CTA Router - Opens Razorpay Checkout Form on ALL Enrollment & Action Buttons
function handleCtaClick(e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  openRazorpayCheckoutModal();
}
window.handleCtaClick = handleCtaClick;

// ==========================================================================
// CENTRALIZED VIDEO CONTROLLER (SINGLETON SOURCE OF TRUTH)
// ==========================================================================
class VideoController {
  constructor() {
    this.videos = new Set();
    this.activeVideo = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Discover all unique video elements directly across the document (avoids duplicate binding from parent/child wrappers)
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => this.registerVideo(video));

    // Global listener to ensure single playing video at any given time
    document.addEventListener('play', (e) => {
      if (e.target && e.target.tagName === 'VIDEO') {
        this.onVideoStarted(e.target);
      }
    }, true);

    // Keyboard ESC pauses active video
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeVideo) {
        this.pauseVideo(this.activeVideo);
      }
    });
  }

  registerVideo(video) {
    if (!video || this.videos.has(video)) return;
    this.videos.add(video);

    const wrap = video.closest('.cinematic-clean-video-frame, .bento-video-wrapper, .video-card-item') || video.parentElement;
    const playBtn = wrap ? wrap.querySelector('.custom-play-btn, .video-play-overlay') : null;

    const startPlayback = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.playVideo(video, playBtn);
    };

    if (playBtn) {
      playBtn.addEventListener('click', startPlayback);
      playBtn.style.pointerEvents = 'auto';
      playBtn.style.cursor = 'pointer';
    }

    video.addEventListener('click', (e) => {
      if (!video.hasAttribute('controls') || video.paused) {
        if (!video.hasAttribute('controls')) {
          this.playVideo(video, playBtn);
        }
      }
    });

    video.addEventListener('play', () => {
      if (playBtn) playBtn.style.display = 'none';
      video.setAttribute('controls', 'true');
      const card = video.closest('.bento-card, .cinematic-center-video-wrapper, .cinematic-clean-video-frame');
      if (card) card.classList.add('is-playing');
      // Only enable cinema mode for inline in-page videos, NEVER for the lightbox modal player which has its own backdrop
      if (video.id !== 'cfModalPlayer') {
        document.body.classList.add('is-cinema-mode');
      }
    });

    video.addEventListener('pause', () => {
      // When paused, native controls handle play/pause UI.
      // Do NOT show duplicate custom-play-btn on top of native pause controls!
      const card = video.closest('.bento-card, .cinematic-center-video-wrapper, .cinematic-clean-video-frame');
      if (card) card.classList.remove('is-playing');
      if (this.activeVideo === video) this.activeVideo = null;
      document.body.classList.remove('is-cinema-mode');
    });

    video.addEventListener('ended', () => {
      // Only when video completely ends, reset controls and restore custom play button
      video.removeAttribute('controls');
      if (playBtn) playBtn.style.display = 'flex';
      video.currentTime = 0;
      const card = video.closest('.bento-card, .cinematic-center-video-wrapper, .cinematic-clean-video-frame');
      if (card) card.classList.remove('is-playing');
      if (this.activeVideo === video) this.activeVideo = null;
      document.body.classList.remove('is-cinema-mode');
    });
  }

  onVideoStarted(video) {
    if (this.activeVideo && this.activeVideo !== video) {
      try {
        this.activeVideo.pause();
      } catch (err) {}
    }
    this.activeVideo = video;
  }

  playVideo(video, playBtn) {
    if (this.activeVideo && this.activeVideo !== video) {
      try {
        this.activeVideo.pause();
      } catch (err) {}
    }
    this.activeVideo = video;
    video.setAttribute('controls', 'true');
    if (playBtn) playBtn.style.display = 'none';

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Video playback notice (handling autoplay/gesture restriction):', err.name);
        if (err.name === 'NotAllowedError') {
          video.muted = true;
          video.play().catch(() => {
            if (!video.hasAttribute('controls') && playBtn) playBtn.style.display = 'flex';
          });
        }
      });
    }
  }

  pauseVideo(video, playBtn) {
    try {
      video.pause();
    } catch (err) {}
    if (this.activeVideo === video) this.activeVideo = null;
    document.body.classList.remove('is-cinema-mode');
  }

  pauseAll() {
    this.videos.forEach(v => {
      try {
        if (!v.paused) v.pause();
      } catch (err) {}
    });
    const modalPlayer = document.getElementById('cfModalPlayer');
    if (modalPlayer) {
      try {
        modalPlayer.pause();
      } catch (err) {}
    }
    document.querySelectorAll('.bento-card.is-playing, .cinematic-center-video-card.is-playing').forEach(c => c.classList.remove('is-playing'));
    document.body.classList.remove('is-cinema-mode');
    this.activeVideo = null;
  }
}
window.videoController = new VideoController();

// ==========================================================================
// LENIS SMOOTH SCROLL ENGINE & ANCHOR NAVIGATION
// ==========================================================================
function initLenisScroll() {
  if (typeof Lenis === 'undefined') return;

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);

  // On touch/mobile devices, use native hardware momentum scrolling with rAF throttling for 60 FPS
  if (isTouchDevice) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
          const progressBar = document.getElementById('systemProgress');
          if (progressBar) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progressPct = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            progressBar.style.width = `${progressPct}%`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Smooth Anchor Navigation on mobile
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#' || targetId.startsWith('#open-popup')) return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navHeader = document.querySelector('.moya-header') || document.querySelector('header');
          const navHeight = navHeader ? navHeader.offsetHeight + 18 : 78;
          const targetY = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      });
    });
    return;
  }

  try {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false
    });
    window.lenisInstance = lenis;

    // Sync Lenis scroll events directly with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', () => {
        ScrollTrigger.update();
        const progressBar = document.getElementById('systemProgress');
        if (progressBar) {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progressPct = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
          progressBar.style.width = `${progressPct}%`;
        }
      });

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      // Safe, standard lag smoothing prevents stutter during brief frame drops
      gsap.ticker.lagSmoothing(500, 33);
    }

    // Smooth Anchor Navigation taking fixed navbar into account
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#' || targetId.startsWith('#open-popup')) return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navHeader = document.querySelector('.moya-header') || document.querySelector('header');
          const navHeight = navHeader ? navHeader.offsetHeight + 18 : 78;
          lenis.scrollTo(targetEl, {
            offset: -navHeight,
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
          });
        }
      });
    });

  } catch (err) {
    console.warn('Lenis initialization error:', err);
  }
}

// ==========================================================================
// GLOBAL BIDIRECTIONAL SCROLL-LINKED TYPOGRAPHY ENGINE (SPLITTYPE + GSAP)
// Downward scroll: words build sequentially (0 -> 65%), lead text de-blurs (55% -> 100%)
// Upward scroll: reverses cleanly back to initial state (100% -> 0%)
// Respects prefers-reduced-motion: reduce
// ==========================================================================
function initHeadlineTextAnimations() {
  if (typeof gsap === "undefined") return;

  // Dedicated lightweight load animation for Hero Headline
  const heroTitle = document.querySelector('.hero-clean-title');
  if (heroTitle && heroTitle.dataset.splitDone !== "true") {
    heroTitle.dataset.splitDone = "true";
    gsap.fromTo(heroTitle,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
    );
  }

  if (typeof SplitType === "undefined" || typeof ScrollTrigger === "undefined") return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sectionPairs = [
    { section: '#heroCinematicCurtain', heading: 'h2, .cinematic-headline-center', lead: 'p, .cinematic-curtain-sub' },
    { section: '#proof', heading: '.parallax-section-header h2', lead: '.parallax-section-header p' },
    { section: '#featured-koushik', heading: '.bento-section-title', lead: '.bento-section-sub' },
    { section: '#featured-reeshav', heading: '.bento-section-title', lead: '.bento-section-sub' },
    { section: '#reviews', heading: '.coverflow-header h2', lead: '.coverflow-header .section-lead-text' },
    { section: '#community-reviews', heading: '.testi-v2-header h2, .testi-v2-title', lead: '.testi-v2-desc' },
    { section: '#system', heading: '.section-heading-lg', lead: '.section-lead-text' },
    { section: '#curriculum', heading: '.curriculum-section-title, .section-heading-lg', lead: '.section-lead-text' },
    { section: '#bonuses', heading: '.section-heading-lg', lead: '.section-lead-text' },
    { section: '#bonus-vault', heading: '.mb-title, .section-heading-lg', lead: '.mb-desc, .section-lead-text' },
    { section: '#support', heading: '.section-heading-lg', lead: '.section-lead-text' },
    { section: '#mentor', heading: '.mentor-phil-quote-text', lead: '.mentor-phil-author' },
    { section: '#mentor', heading: '.mentor-name-title', lead: '.mentor-bio-lead' },
    { section: '#creator-results', heading: '.results-headline-text', lead: null },
    { section: '#offer', heading: '.pricing-sec-title, .section-heading-lg', lead: '.pricing-sec-subtitle, .section-lead-text' },
    { section: '#faq', heading: '.section-heading-lg', lead: '.section-lead-text' },
    { section: '.final-cta-section', heading: 'h2', lead: 'p' }
  ];

  sectionPairs.forEach(cfg => {
    try {
      const sec = document.querySelector(cfg.section);
      if (!sec) return;
      const heading = sec.querySelector(cfg.heading);
      if (!heading || heading.dataset.splitDone === "true") return;
      heading.dataset.splitDone = "true";

      const lead = cfg.lead ? sec.querySelector(cfg.lead) : null;

      if (prefersReducedMotion) {
        heading.style.opacity = '1';
        if (lead) lead.style.opacity = '1';
        return;
      }

      // Split heading into semantic words
      const split = new SplitType(heading, { types: "words", tagName: "span" });
      const words = split.words;
      if (!words || words.length === 0) return;

      words.forEach(w => {
        w.style.display = "inline-block";
        w.style.willChange = "opacity, transform";
      });

      // Master timeline linked directly to scroll progress (bidirectional scrub)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heading,
          start: "top 88%",
          end: "top 42%",
          scrub: 0.8, // 100% bidirectional & reversible!
          invalidateOnRefresh: true,
          onLeave: () => {
            words.forEach(w => w.style.willChange = "auto");
            if (lead) lead.style.willChange = "auto";
          },
          onEnterBack: () => {
            words.forEach(w => w.style.willChange = "opacity, transform");
            if (lead) lead.style.willChange = "opacity, transform";
          }
        }
      });

      // Phase 1: Headline words stagger reveal (0% -> ~65%) - Pure Opacity & Transform (No blur)
      tl.fromTo(words,
        { opacity: 0.12, y: 16 },
        { opacity: 1, y: 0, stagger: 0.04, ease: "power1.out" },
        0
      );

      // Phase 2: Lead description smoothly de-blurs & slides into place (~55% -> 100%)
      if (lead) {
        lead.style.willChange = "opacity, transform";
        tl.fromTo(lead,
          { opacity: 0.15, y: 12, filter: "blur(2.5px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", ease: "power1.out" },
          0.55
        );
      }
    } catch (e) {
      console.warn("Scroll typography init error for:", cfg.section, e);
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }
}

// ==========================================================================
// UNIFIED GLOBAL MOTION & SECTION-TO-SECTION PARALLAX ARCHITECTURE
// ==========================================================================
function initGlobalMotionArchitecture() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();

  // Desktop Animation System (>= 1025px)
  mm.add("(min-width: 1025px)", () => {
    
    // --- Hero -> Section 2 Transition (Cinematic Zoom-Up Entry) ---
    const hero = document.getElementById("top");
    const curtain = document.getElementById("heroCinematicCurtain");
    const centerVideo = document.querySelector(".cinematic-center-video-wrapper");
    const giantText = document.getElementById("giantBgText");
    const heading = document.getElementById("cinematicHeading");
    const desc = document.getElementById("cinematicDesc");
    const pills = document.querySelectorAll("#cinematicPills .footer-glass-pill");

    if (hero && curtain) {
      // Curtain starts recessed from depth
      gsap.set(curtain, {
        scale: 0.88,
        y: 60,
        opacity: 0.5,
        borderRadius: "24px",
        transformOrigin: "center top"
      });

      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "bottom 95%",
          endTrigger: curtain,
          end: "top 12%",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });

      // Pure transform and opacity: Zero blur filter to preserve 60 FPS
      heroTl.to(hero, {
        scale: 0.92,
        y: -40,
        opacity: 0.3,
        ease: "power1.inOut"
      }, 0);

      heroTl.to(curtain, {
        scale: 1,
        y: 0,
        opacity: 1,
        borderRadius: "0px",
        ease: "power2.out"
      }, 0);
    }

    // --- Sequential Mid-Screen Reveal for Elements in Section 2 ---
    if (heading) {
      gsap.fromTo(heading,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            once: true
          }
        }
      );
    }

    if (desc) {
      gsap.fromTo(desc,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: desc,
            start: "top 85%",
            once: true
          }
        }
      );
    }

    if (pills && pills.length > 0) {
      gsap.fromTo(pills,
        { opacity: 0, y: 16, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: "#cinematicPills",
            start: "top 88%",
            once: true
          }
        }
      );
    }

    if (centerVideo) {
      gsap.fromTo(centerVideo,
        { opacity: 0, y: 32, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: centerVideo,
            start: "top 82%",
            once: true
          }
        }
      );
    }

    // --- Dynamic Kinetic Typography: Giant 'MOYA' Watermark Scrub ---
    if (giantText && centerVideo) {
      const isLight = document.body.classList.contains("light-mode");
      const glowColor = isLight ? "rgba(229, 46, 63, 0.25)" : "rgba(229, 46, 63, 0.4)";

      gsap.set(giantText, {
        scale: 1.5,
        y: 20,
        opacity: 0.35,
        transformOrigin: "center top"
      });

      gsap.to(giantText, {
        scale: 1.0,
        y: 0,
        opacity: 0.95,
        filter: `drop-shadow(0 0 30px ${glowColor})`,
        ease: "power2.out",
        scrollTrigger: {
          trigger: centerVideo,
          start: "top 75%",
          end: "bottom 30%",
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      });
    }

    // --- Bento Grids: True Scroll-Progress Scrub (Zero blur, 100% reversible) ---
    ["featured-koushik", "featured-reeshav"].forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      const grid = section.querySelector(".bento-grid-showcase");
      if (!grid) return;

      const heroBrick = section.querySelector(".bento-slot-center-hero");
      const leftBricks = section.querySelectorAll(".bento-slot-integrations, .bento-slot-marquee, .bento-slot-journey");
      const rightBricks = section.querySelectorAll(".bento-slot-tags, .bento-slot-stat");

      const bentoTl = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: "top 88%",
          end: "top 32%",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });

      if (heroBrick) {
        bentoTl.fromTo(heroBrick,
          { opacity: 0.25, scale: 0.94, y: 24 },
          { opacity: 1, scale: 1, y: 0, ease: "power1.out" },
          0
        );
      }

      if (leftBricks.length > 0) {
        bentoTl.fromTo(leftBricks,
          { opacity: 0.2, x: -32, y: 20 },
          { opacity: 1, x: 0, y: 0, stagger: 0.08, ease: "power1.out" },
          0.04
        );
      }

      if (rightBricks.length > 0) {
        bentoTl.fromTo(rightBricks,
          { opacity: 0.2, x: 32, y: 20 },
          { opacity: 1, x: 0, y: 0, stagger: 0.08, ease: "power1.out" },
          0.04
        );
      }
    });

    // --- System SVG Pipe & Progressive Step Disclosure (Fluid Natural Scrub) ---
    const systemSection = document.getElementById("system");
    const systemContainer = document.querySelector(".how-it-works-container");
    const activePath = document.getElementById("connectingPipeActive");
    const glowDot = document.getElementById("pipeGlowDot");
    const stepCards = Array.from(document.querySelectorAll(".how-step-card-wrap"));

    if (systemSection && systemContainer && activePath && stepCards.length > 0) {
      const totalLength = activePath.getTotalLength ? activePath.getTotalLength() : 0;
      if (totalLength > 0) {
        activePath.style.strokeDasharray = totalLength;
        activePath.style.strokeDashoffset = totalLength;

        // Steps 02, 03, 04 start locked & hidden until tracker reaches them
        stepCards.forEach((card, idx) => {
          if (idx > 0) {
            gsap.set(card, { opacity: 0.12, scale: 0.94, y: 24, pointerEvents: "none" });
          }
        });

        // Thresholds calibrated to when glowing tracker touches each step
        const thresholds = [
          { start: 0.00, reach: 0.06 }, // Step 01 (Research)
          { start: 0.20, reach: 0.34 }, // Step 02 (Architecture)
          { start: 0.50, reach: 0.65 }, // Step 03 (Production)
          { start: 0.78, reach: 0.92 }  // Step 04 (Monetize)
        ];

        ScrollTrigger.create({
          trigger: systemContainer,
          start: "top 75%",
          end: "bottom 85%",
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            activePath.style.strokeDashoffset = totalLength * (1 - progress);

            if (glowDot && activePath.getPointAtLength) {
              const currentPoint = activePath.getPointAtLength(totalLength * progress);
              glowDot.setAttribute("cx", currentPoint.x);
              glowDot.setAttribute("cy", currentPoint.y);
            }

            stepCards.forEach((card, idx) => {
              const t = thresholds[idx];
              if (idx === 0) {
                // Step 01 active from entry
                const stepP = Math.min(1, Math.max(0, (progress - t.start) / (t.reach - t.start || 0.06)));
                card.style.opacity = Math.max(0.4, stepP);
                if (progress >= t.reach) {
                  card.classList.add("is-connected");
                } else {
                  card.classList.remove("is-connected");
                }
              } else {
                // Steps 02, 03, 04: Progressive Disclosure
                if (progress < t.start) {
                  card.style.opacity = "0.12";
                  card.style.transform = "scale(0.94) translateY(24px)";
                  card.style.pointerEvents = "none";
                  card.classList.remove("is-connected");
                } else if (progress >= t.reach) {
                  card.style.opacity = "1";
                  card.style.transform = "scale(1) translateY(0px)";
                  card.style.pointerEvents = "auto";
                  if (!card.classList.contains("is-connected")) {
                    card.classList.add("is-connected");
                  }
                } else {
                  // Smooth progressive reveal as dot approaches the step
                  const norm = (progress - t.start) / (t.reach - t.start);
                  const op = 0.12 + norm * 0.88;
                  const sc = 0.94 + norm * 0.06;
                  const ty = 24 * (1 - norm);
                  card.style.opacity = op.toFixed(2);
                  card.style.transform = `scale(${sc.toFixed(3)}) translateY(${ty.toFixed(1)}px)`;
                  card.style.pointerEvents = norm > 0.6 ? "auto" : "none";
                  card.classList.remove("is-connected");
                }
              }
            });
          }
        });
      }
    }

    // --- Support Section: Sequential Card Stagger (Scroll-linked scrub) ---
    const supportSec = document.getElementById("support");
    if (supportSec) {
      const loopCards = supportSec.querySelectorAll(".support-loop-card");
      const pillarCards = supportSec.querySelectorAll(".support-pillar-card");
      const supportTl = gsap.timeline({
        scrollTrigger: {
          trigger: supportSec.querySelector(".support-loop-layout") || supportSec,
          start: "top 85%",
          end: "top 35%",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
      if (loopCards.length > 0) {
        supportTl.fromTo(loopCards,
          { opacity: 0.15, y: 28, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.1, ease: "power1.out" },
          0
        );
      }
      if (pillarCards.length > 0) {
        supportTl.fromTo(pillarCards,
          { opacity: 0.15, y: 20 },
          { opacity: 1, y: 0, stagger: 0.1, ease: "power1.out" },
          0.2
        );
      }
    }

    // --- Bonuses Section: Marquee & Nav Entrance ---
    const bonusesSec = document.getElementById("bonuses");
    if (bonusesSec) {
      const snackNav = bonusesSec.querySelector(".bonus-snack-nav");
      const marqueeViewport = bonusesSec.querySelector(".fw-marquee-viewport");
      const bonusTl = gsap.timeline({
        scrollTrigger: {
          trigger: bonusesSec,
          start: "top 85%",
          end: "top 45%",
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
      if (snackNav) {
        bonusTl.fromTo(snackNav,
          { opacity: 0.2, y: 20 },
          { opacity: 1, y: 0, ease: "power1.out" },
          0
        );
      }
      if (marqueeViewport) {
        bonusTl.fromTo(marqueeViewport,
          { opacity: 0.25, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, ease: "power1.out" },
          0.1
        );
      }
    }

    // --- Mentor Image Genuine Scroll Parallax ---
    const mentorBanner = document.getElementById("mentorBannerParallax");
    const mentorSec = document.getElementById("mentor");
    if (mentorBanner && mentorSec) {
      gsap.fromTo(mentorBanner,
        { y: -45 },
        {
          y: 45,
          ease: "none",
          scrollTrigger: {
            trigger: mentorSec,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    }
  });

  // Mobile Animation System (<= 1024px) Fallbacks: 100% Fluid Native Momentum Scrolling
  mm.add("(max-width: 1024px)", () => {
    const hero = document.getElementById("top");
    const curtain = document.getElementById("heroCinematicCurtain");
    const centerVideo = document.querySelector(".cinematic-center-video-wrapper");
    const giantText = document.getElementById("giantBgText");
    const heading = document.getElementById("cinematicHeading");
    const desc = document.getElementById("cinematicDesc");
    const pills = document.querySelectorAll("#cinematicPills .footer-glass-pill");

    // Clean lightweight mobile transition: immediate trigger, zero lag
    if (heading) {
      gsap.fromTo(heading,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          ease: "power2.out",
          scrollTrigger: { trigger: heading, start: "top 96%", once: true }
        }
      );
    }

    if (desc) {
      gsap.fromTo(desc,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          ease: "power2.out",
          scrollTrigger: { trigger: desc, start: "top 96%", once: true }
        }
      );
    }

    if (pills && pills.length > 0) {
      gsap.fromTo(pills,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: { trigger: "#cinematicPills", start: "top 96%", once: true }
        }
      );
    }

    if (centerVideo) {
      gsap.fromTo(centerVideo,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: centerVideo,
            start: "top 94%",
            once: true
          }
        }
      );
    }

    // Dynamic 'MOYA' scale on mobile: prominent, bold watermark settling at full scale (1.05)
    if (giantText && centerVideo) {
      gsap.set(giantText, {
        scale: 1.18,
        opacity: 0.4,
        transformOrigin: "center top"
      });

      gsap.to(giantText, {
        scale: 1.0,
        opacity: 0.95,
        ease: "power2.out",
        scrollTrigger: {
          trigger: centerVideo,
          start: "top 90%",
          end: "bottom 30%",
          scrub: 0.4
        }
      });
    }

    // Mobile Bento Grids: Fluid Bidirectional Scrub (Zero Lag)
    ["featured-koushik", "featured-reeshav"].forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      const cards = section.querySelectorAll(".bento-grid-showcase > div");
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0.2, y: 20 },
          {
            opacity: 1,
            y: 0,
            ease: "power1.out",
            scrollTrigger: {
              trigger: card,
              start: "top 94%",
              end: "top 68%",
              scrub: 0.5,
              invalidateOnRefresh: true
            }
          }
        );
      });
    });

    // Mobile 4-Step Operating Mechanism: Sequential Reveal
    const mobileStepCards = document.querySelectorAll("#system .how-step-card-wrap");
    mobileStepCards.forEach((card, idx) => {
      gsap.fromTo(card,
        { opacity: idx === 0 ? 0.6 : 0.18, y: 22, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "top 58%",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onEnter: () => card.classList.add("is-connected"),
            onLeaveBack: () => { if (idx > 0) card.classList.remove("is-connected"); }
          }
        }
      );
    });

    // Mobile Mentor Image Subtle Parallax
    const mobileMentorBanner = document.getElementById("mentorBannerParallax");
    const mobileMentorSec = document.getElementById("mentor");
    if (mobileMentorBanner && mobileMentorSec) {
      gsap.fromTo(mobileMentorBanner,
        { y: -22 },
        {
          y: 22,
          ease: "none",
          scrollTrigger: {
            trigger: mobileMentorSec,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    }
  });
}

// Parallax Stacked Cards in Section 3 (#proof)
function initParallaxCards() {
  const proofSection = document.getElementById('proof');
  const track = document.getElementById('parallaxTrack');
  if (!track || !proofSection) return;

  const steps = Array.from(track.querySelectorAll('.parallax-sticky-step'));
  const total = steps.length;
  if (total === 0) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Basic fallback if GSAP is unavailable
    if (window.innerWidth > 768) {
      steps.forEach((step, idx) => {
        step.style.top = `${208 + idx * 32}px`;
        step.style.zIndex = `${11 + idx}`;
      });
    }
    return;
  }

  const mm = gsap.matchMedia();

  // Desktop (min-width: 769px) - EXACT LOCKED DESKTOP BEHAVIOR
  mm.add('(min-width: 769px)', () => {
    const baseTop = 208;
    const stepOffset = 32;

    const header = proofSection.querySelector('.parallax-section-header');
    if (header) {
      header.style.transform = '';
    }

    steps.forEach((step, idx) => {
      step.style.position = '';
      step.style.top = `${baseTop + idx * stepOffset}px`;
      step.style.zIndex = `${11 + idx}`;
      step.style.transform = '';
      step.style.opacity = '';
    });

    // Gentle depth enhancement for stacked cards (no CPU thrashing)
    steps.forEach((step, idx) => {
      if (idx < total - 1) {
        const cardInner = step.querySelector('.parallax-card-inner');
        const nextStep = steps[idx + 1];
        if (cardInner && nextStep) {
          ScrollTrigger.create({
            trigger: nextStep,
            start: 'top 85%',
            end: 'top 45%',
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              const scale = 1 - p * 0.025; // gentle 2.5% depth scale
              const brightness = 1 - p * 0.12; // subtle 12% dimming of under-card
              cardInner.style.transform = `scale(${scale})`;
              cardInner.style.filter = `brightness(${brightness})`;
            }
          });
        }
      }
    });

    // Parallax Entrance of Section 3 (#featured-koushik) over #proof
    const sec3 = document.getElementById('featured-koushik');
    if (sec3) {
      gsap.fromTo(sec3,
        { y: 50 },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sec3,
            start: 'top bottom',
            end: 'top 70%',
            scrub: 0.3
          }
        }
      );
    }

    return () => {
      steps.forEach((step) => {
        step.style.top = '';
        step.style.zIndex = '';
        step.style.transform = '';
        step.style.opacity = '';
        const cardInner = step.querySelector('.parallax-card-inner');
        if (cardInner) {
          cardInner.style.transform = '';
          cardInner.style.filter = '';
        }
      });
    };
  });

  // Mobile (max-width: 768px) - NATIVE CSS STICKY (NO GSAP PINNING NEEDED)
  mm.add('(max-width: 768px)', () => {
    const header = proofSection.querySelector('.parallax-section-header');
    if (header) {
      header.style.transform = '';
    }

    // Clear any residual desktop inline styles
    steps.forEach((step) => {
      step.style.top = '';
      step.style.zIndex = '';
      step.style.position = '';
      step.style.transform = '';
      step.style.opacity = '';
      const cardInner = step.querySelector('.parallax-card-inner');
      if (cardInner) {
        cardInner.style.transform = '';
        cardInner.style.filter = '';
      }
    });

    return () => {
      steps.forEach((step) => {
        gsap.set(step, { clearProps: 'transform,opacity,visibility,top,zIndex' });
        const cardInner = step.querySelector('.parallax-card-inner');
        if (cardInner) {
          gsap.set(cardInner, { clearProps: 'transform,filter' });
        }
      });
    };
  });

  // Proof Modal Lightbox Support
  const modal = document.getElementById('proofModal');
  const modalImg = document.getElementById('modalImg');
  const modalBadge = document.getElementById('modalBadge');
  const modalName = document.getElementById('modalName');
  const modalNiche = document.getElementById('modalNiche');
  const modalQuote = document.getElementById('modalQuote');
  const modalCounter = document.getElementById('modalCounter');
  const modalClose = modal ? modal.querySelector('.proof-modal-close') : null;
  const modalBackdrop = modal ? modal.querySelector('.proof-modal-backdrop') : null;
  const modalPrev = modal ? modal.querySelector('.proof-modal-nav-prev') : null;
  const modalNext = modal ? modal.querySelector('.proof-modal-nav-next') : null;

  const proofCards = document.querySelectorAll('.parallax-card-inner');
  let currentModalIndex = 0;

  function updateModalContent(idx) {
    if (!modal) return;
    currentModalIndex = (idx + proofCards.length) % proofCards.length;
    const card = proofCards[currentModalIndex];
    if (!card) return;

    const img = card.querySelector('.parallax-card-img-box img, .parallax-mockup-img, img');
    const badge = card.querySelector('.parallax-card-badge, .parallax-badge-pill');
    const name = card.querySelector('.parallax-card-meta, .parallax-header-name');
    const niche = card.querySelector('.parallax-card-niche, .parallax-header-niche');
    const quote = card.querySelector('.parallax-quote-text');

    if (modalImg && img) modalImg.src = img.src;
    if (modalBadge && badge) modalBadge.textContent = badge.textContent.trim();
    if (modalName && name) modalName.textContent = name.textContent.trim();
    if (modalNiche && niche) modalNiche.textContent = niche.textContent.trim();
    if (modalQuote && quote) modalQuote.textContent = quote.textContent.trim();
    if (modalCounter) modalCounter.textContent = `${currentModalIndex + 1} of ${proofCards.length}`;
  }

  window.openProofModal = function(param1, param2) {
    if (typeof param1 === 'string' && (param1.startsWith('http') || param1.includes('/'))) {
      window.openLightbox(param1);
      return;
    }
    const idx = typeof param1 === 'number' ? param1 : 0;
    updateModalContent(idx);
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    }
  };

  window.closeProofModal = function closeProofModal() {
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }
    const gLightbox = document.getElementById('globalLightbox');
    if (gLightbox) {
      gLightbox.classList.remove('is-open');
      document.body.classList.remove('modal-open');
    }
  };

  proofCards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.hero-cta') || e.target.closest('a')) return;
      window.openProofModal(idx);
    });
  });

  if (modalClose) modalClose.addEventListener('click', window.closeProofModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', window.closeProofModal);
  if (modalPrev) modalPrev.addEventListener('click', () => updateModalContent(currentModalIndex - 1));
  if (modalNext) modalNext.addEventListener('click', () => updateModalContent(currentModalIndex + 1));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeProofModal();
  });
}

// Global Image Lightbox
window.openLightbox = function(src) {
  let lightbox = document.getElementById('globalLightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'globalLightbox';
    lightbox.className = 'global-lightbox-overlay';
    lightbox.innerHTML = `
      <div class="global-lightbox-backdrop"></div>
      <div class="global-lightbox-content">
        <img src="" alt="Proof Preview" class="global-lightbox-img" />
        <button class="global-lightbox-close" aria-label="Close Lightbox">&times;</button>
      </div>
    `;
    document.body.appendChild(lightbox);

    const close = () => {
      lightbox.classList.remove('is-open');
      document.body.classList.remove('modal-open');
    };
    lightbox.querySelector('.global-lightbox-backdrop').addEventListener('click', close);
    lightbox.querySelector('.global-lightbox-close').addEventListener('click', close);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
    });
  }

  const img = lightbox.querySelector('.global-lightbox-img');
  if (img) img.src = src;
  lightbox.classList.add('is-open');
  document.body.classList.add('modal-open');
};

// ==========================================================================
// PRESERVED DOM COMPONENTS & INITIALIZATION
// ==========================================================================

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

      // Staggered scroll-linked entrance for curriculum modules (bidirectional scrub)
      if (typeof ScrollTrigger !== "undefined" && typeof gsap !== "undefined") {
        const folders = grid.querySelectorAll(".folder-wrapper");
        if (folders.length > 0) {
          gsap.fromTo(folders,
            { opacity: 0.15, y: 32, scale: 0.94 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.06,
              ease: "power1.out",
              scrollTrigger: {
                trigger: grid,
                start: "top 85%",
                end: "top 38%",
                scrub: 0.6,
                invalidateOnRefresh: true
              }
            }
          );
        }
      }

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

    // Number Counter Animation for Mentor Section Statistics
    function initMentorStatsCounters() {
      const statsContainer = document.querySelector('.mentor-phil-stats-grid');
      if (!statsContainer) return;

      const statCards = statsContainer.querySelectorAll('.mentor-phil-stat-num');
      if (statCards.length === 0) return;

      const formatNumber = (num) => num.toLocaleString('en-US');

      const animateCounter = (el) => {
        const rawTarget = el.getAttribute('data-target');
        if (!rawTarget) return;
        const target = parseFloat(rawTarget);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800; // ms
        const startTime = performance.now();

        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(target * easeOut);

          el.textContent = `${prefix}${formatNumber(current)}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = `${prefix}${formatNumber(target)}${suffix}`;
          }
        };
        requestAnimationFrame(step);
      };

      if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        ScrollTrigger.create({
          trigger: statsContainer,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            statCards.forEach((card, idx) => {
              setTimeout(() => animateCounter(card), idx * 100);
            });
          }
        });
      } else {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              statCards.forEach((card, idx) => {
                setTimeout(() => animateCounter(card), idx * 100);
              });
              observer.disconnect();
            }
          });
        }, { threshold: 0.2 });
        observer.observe(statsContainer);
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
        }
        document.body.classList.remove('modal-open');
        document.body.classList.remove('is-cinema-mode');
        if (window.videoController) {
          window.videoController.activeVideo = null;
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

      // Scroll-linked entrance for testimonial cards track (bidirectional scrub)
      if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
        const reviewSection = document.getElementById('reviews');
        if (reviewSection) {
          gsap.fromTo(track,
            { opacity: 0.2, y: 36 },
            {
              opacity: 1,
              y: 0,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: reviewSection,
                start: 'top 85%',
                end: 'top 40%',
                scrub: 0.6,
                invalidateOnRefresh: true
              }
            }
          );
        }
      }
    }

    // ==========================================================================
    // BENTO LIVING MOTION GRAPHICS THEATER CONTROLLER
    // Handles interactive tabs and smooth auto-cycling for the 60% stage visuals
    // ==========================================================================
    function initBentoMotionTheater() {
      const cards = document.querySelectorAll(".bento-motion-theater-card");
      if (!cards || cards.length === 0) return;

      const MODES = ["viewfinder", "faceless", "radar"];

      cards.forEach(card => {
        const tabs = card.querySelectorAll(".bento-motion-tab");
        const panels = card.querySelectorAll(".bento-motion-panel");
        const metas = card.querySelectorAll(".motion-meta-item");
        let currentIdx = 0;
        let autoCycleTimer = null;
        let isHovered = false;

        function switchMode(targetMode) {
          card.setAttribute("data-active-tab", targetMode);

          tabs.forEach(tab => {
            const isMatch = tab.getAttribute("data-target-mode") === targetMode;
            tab.classList.toggle("active", isMatch);
            tab.setAttribute("aria-selected", isMatch ? "true" : "false");
          });

          panels.forEach(panel => {
            panel.classList.toggle("active", panel.getAttribute("data-mode") === targetMode);
          });

          metas.forEach(meta => {
            meta.classList.toggle("active", meta.getAttribute("data-meta-mode") === targetMode);
          });

          const foundIdx = MODES.indexOf(targetMode);
          if (foundIdx !== -1) currentIdx = foundIdx;
        }

        tabs.forEach(tab => {
          tab.addEventListener("click", (e) => {
            e.stopPropagation();
            const mode = tab.getAttribute("data-target-mode");
            if (mode) switchMode(mode);
          });
        });

        // Auto-cycle every 4.5s unless hovered
        function startAutoCycle() {
          if (autoCycleTimer) clearInterval(autoCycleTimer);
          autoCycleTimer = setInterval(() => {
            if (!isHovered) {
              currentIdx = (currentIdx + 1) % MODES.length;
              switchMode(MODES[currentIdx]);
            }
          }, 4500);
        }

        card.addEventListener("mouseenter", () => { isHovered = true; });
        card.addEventListener("mouseleave", () => { isHovered = false; });

        startAutoCycle();
      });
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
        let parallaxTicking = false;
        window.addEventListener('scroll', () => {
          if (!parallaxTicking && window.innerWidth > 1024) {
            window.requestAnimationFrame(() => {
              const rect = container.getBoundingClientRect();
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                const scrollOffset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * 0.05;
                tiltLayer.style.translate = `0 ${scrollOffset.toFixed(1)}px`;
              }
              parallaxTicking = false;
            });
            parallaxTicking = true;
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

    // ==========================================================================
    // EDITORIAL PRICING SECTION CONTROLLER
    // Price count-up, magnetic CTA hover, and feature row hover interactions
    // ==========================================================================
    function initEditorialPricingSection() {
      const section = document.getElementById("offer");
      if (!section) return;

      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const counter = section.querySelector("#counter");
      const cta = section.querySelector("#cta");

      if (isReduced) {
        if (counter) counter.textContent = "4,997";
        return;
      }

      // 1. Price Count-Up Animation
      if (counter && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: 4997,
          duration: 1.35,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true
          },
          onUpdate: () => {
            counter.textContent = Math.round(obj.v).toLocaleString("en-IN");
          }
        });
      }

      // 2. Feature Rows Hover Animation
      const rows = section.querySelectorAll(".feature");
      rows.forEach(row => {
        const noEl = row.querySelector(".feature-no");
        if (!noEl) return;
        row.addEventListener("mouseenter", () => {
          gsap.to(noEl, { color: "#ff5263", duration: 0.25 });
        });
        row.addEventListener("mouseleave", () => {
          gsap.to(noEl, { color: "#606b7c", duration: 0.25 });
        });
      });

      // 3. CTA Magnetic Movement
      if (cta && typeof gsap !== "undefined") {
        cta.addEventListener("mousemove", e => {
          const r = cta.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;

          gsap.to(cta, {
            x: x * 0.055,
            y: y * 0.08,
            duration: 0.22,
            ease: "power2.out"
          });
        });

        cta.addEventListener("mouseleave", () => {
          gsap.to(cta, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.45)"
          });
        });
      }
    }


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

    (function initBonusUserMarquee() {
      const viewport = document.querySelector('.fw-marquee-viewport');
      const track = document.getElementById('bonusMarqueeTrack') || (viewport ? viewport.querySelector('.fw-marquee-track') : null);
      const snackButtons = document.querySelectorAll('.js-snack-nav-btn');
      if (!viewport || !track) return;

      // Prevent HTML5 ghost image dragging throughout the marquee
      viewport.addEventListener('dragstart', (e) => e.preventDefault());
      track.addEventListener('dragstart', (e) => e.preventDefault());
      viewport.querySelectorAll('img').forEach((img) => {
        img.setAttribute('draggable', 'false');
        img.addEventListener('dragstart', (e) => e.preventDefault());
      });

      let isDown = false;
      let startX = 0;
      let initialScrollLeft = 0;
      let hasDragged = false;
      let isHovered = false;
      let isPausedBySnackClick = false;
      let snackResumeTimer = null;
      let isProgrammaticScrolling = false;
      const speed = 0.85;

      // 1. Continuous auto-scroll animation loop
      function step() {
        if (!isDown && !isHovered && !isPausedBySnackClick && !isProgrammaticScrolling) {
          viewport.scrollLeft += speed;
          const halfWidth = track.scrollWidth / 2;
          if (halfWidth > 0 && viewport.scrollLeft >= halfWidth) {
            viewport.scrollLeft -= halfWidth;
          }
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);

      // 2. Mouse Hover Listeners
      viewport.addEventListener('mouseenter', () => { isHovered = true; });
      viewport.addEventListener('mouseleave', () => {
        isHovered = false;
        if (!isDown) {
          viewport.classList.remove('is-dragging');
        }
      });

      // 3. Desktop Mouse Grab & Pan (Zero Ghost Dragging)
      viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left-click
        isDown = true;
        hasDragged = false;
        isHovered = true;
        viewport.classList.add('is-dragging');
        startX = e.pageX;
        initialScrollLeft = viewport.scrollLeft;
        viewport.style.scrollBehavior = 'auto'; // Immediate 1:1 response during drag
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const dx = e.pageX - startX;
        if (Math.abs(dx) > 4) {
          hasDragged = true;
        }
        viewport.scrollLeft = initialScrollLeft - dx;
      });

      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        viewport.classList.remove('is-dragging');
        viewport.style.scrollBehavior = 'smooth';
      });

      // 4. Mobile & Tablet Touch Swipe Pan
      viewport.addEventListener('touchstart', (e) => {
        isDown = true;
        hasDragged = false;
        isHovered = true;
        startX = e.touches[0].pageX;
        initialScrollLeft = viewport.scrollLeft;
        viewport.style.scrollBehavior = 'auto';
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const dx = e.touches[0].pageX - startX;
        if (Math.abs(dx) > 4) {
          hasDragged = true;
        }
        viewport.scrollLeft = initialScrollLeft - dx;
      }, { passive: true });

      viewport.addEventListener('touchend', () => {
        isDown = false;
        isHovered = false;
        viewport.style.scrollBehavior = 'smooth';
      });

      // 5. Card Click to Enlarge / Zoom (Distinguishing Click vs Pan)
      const cards = track.querySelectorAll('.fw-marquee-card');
      cards.forEach((card) => {
        card.addEventListener('click', (e) => {
          if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          // User clicked cleanly! Highlight card and open enlarged lightbox preview
          cards.forEach((c) => c.classList.remove('is-active-focus'));
          card.classList.add('is-active-focus');

          const img = card.querySelector('img');
          if (img && img.src && typeof window.openLightbox === 'function') {
            window.openLightbox(img.src);
          }
        });
      });

      // 6. Clickable Snack 1, Snack 2, Snack 3 Navigation
      snackButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = btn.getAttribute('data-snack-group');
          const targetEl = document.getElementById(targetId);
          if (!targetEl) return;

          snackButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          // Pause marquee immediately
          isPausedBySnackClick = true;
          isProgrammaticScrolling = true;
          if (snackResumeTimer) clearTimeout(snackResumeTimer);

          // Calculate target scroll position
          const targetOffset = targetEl.offsetLeft - (window.innerWidth <= 768 ? 16 : 40);
          viewport.style.scrollBehavior = 'smooth';
          viewport.scrollTo({
            left: Math.max(0, targetOffset),
            behavior: 'smooth'
          });

          // Stay paused at target snack for 3 seconds so user can clearly view it, then resume scrolling
          snackResumeTimer = setTimeout(() => {
            isPausedBySnackClick = false;
            isProgrammaticScrolling = false;
          }, 3000);
        });
      });
    })();

// ==========================================================================
// SECTION 5 AUTO-POPUP LEAD CAPTURE ENGINE
// ==========================================================================
function initSection5LeadCapture() {
  const section5 = document.getElementById("system");
  const modal = document.getElementById("leadCaptureModal");
  const form = document.getElementById("leadCaptureForm");
  const closeBtn = document.getElementById("closeLeadModal");
  const msgEl = document.getElementById("leadFormMsg");

  if (!section5 || !modal) return;

  // Close handlers
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (typeof modal.close === "function") modal.close();
      else modal.removeAttribute("open");
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      if (typeof modal.close === "function") modal.close();
      else modal.removeAttribute("open");
    }
  });

  // Auto-trigger when Section 5 (#system) enters viewport
  // Persistent rule: triggers upon scrolling to Section 5 on every visit/refresh (unless already submitted in this session)
  const isAlreadySubmitted = sessionStorage.getItem("moya_lead_submitted") === "true";
  let hasTriggeredInCurrentView = false;
  if (!isAlreadySubmitted) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTriggeredInCurrentView) {
          hasTriggeredInCurrentView = true;
          observer.disconnect();

          setTimeout(() => {
            if (typeof modal.showModal === "function") {
              modal.showModal();
            } else {
              modal.setAttribute("open", "true");
            }
          }, 800);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(section5);
  }

  // Form submit handler
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("leadSubmitBtn");
      const name = document.getElementById("leadNameInput")?.value?.trim() || "";
      const email = document.getElementById("leadEmailInput")?.value?.trim() || "";
      const phone = document.getElementById("leadPhoneInput")?.value?.trim() || "";
      const income = form.querySelector('input[name="income"]:checked')?.value || "$0 - $250 / mo";

      if (!name || (!email && !phone)) {
        if (msgEl) {
          msgEl.className = "moya-form-msg error";
          msgEl.textContent = "Please provide your name and phone number.";
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector(".btn-text");
        if (btnText) btnText.textContent = "Securing Access...";
      }

      try {
        // Fire Meta Pixel Lead event
        if (typeof fbq === "function") {
          fbq("track", "Lead");
        }

        // Save in sessionStorage for Razorpay checkout prefill & suppression
        sessionStorage.setItem("moya_lead_contact", JSON.stringify({ name, email, phone, income }));
        sessionStorage.setItem("moya_lead_submitted", "true");

        // Send to backend API
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, income })
        });

        if (msgEl) {
          msgEl.className = "moya-form-msg success";
          msgEl.textContent = "✓ Access granted! Check your WhatsApp/Email.";
        }

        setTimeout(() => {
          if (typeof modal.close === "function") modal.close();
          else modal.removeAttribute("open");
        }, 1200);
      } catch (err) {
        console.error("Lead sync error:", err);
        if (msgEl) {
          msgEl.className = "moya-form-msg success";
          msgEl.textContent = "✓ Access granted! Proceed below.";
        }
        setTimeout(() => {
          if (typeof modal.close === "function") modal.close();
          else modal.removeAttribute("open");
        }, 1200);
      }
    });
  }
}

// Helper: Sanitize Error Messages for End Users (Production Security)
function getSafeUserErrorMessage(rawMsg, fallback) {
  const defaultMsg = fallback || "Unable to process payment right now. Please retry in a few moments.";
  if (!rawMsg || typeof rawMsg !== "string") return defaultMsg;
  const lower = rawMsg.toLowerCase();
  const dangerousKeywords = [
    "key", "secret", "env", "token", "razorpay", "ghl", "api", "internal",
    "config", "exception", "undefined", "null", "syntax", "auth", "credential",
    "500", "503", "404", "stack", "node_modules", "backend"
  ];
  if (dangerousKeywords.some(kw => lower.includes(kw))) {
    return defaultMsg;
  }
  return rawMsg;
}

// ==========================================================================
// RAZORPAY CHECKOUT & PAYMENT TRACKING ENGINE
// ==========================================================================
function initRazorpayCheckoutFlow() {
  const modal = document.getElementById("razorpayCheckoutModal");
  const form = document.getElementById("razorpayPaymentForm");
  const closeBtn = document.getElementById("closeCheckoutModal");
  const msgEl = document.getElementById("checkoutFormMsg");
  const couponInput = document.getElementById("checkoutCouponInput");
  const applyBtn = document.getElementById("applyCouponBtn");
  const couponMsgEl = document.getElementById("couponStatusMsg");
  const displayPriceEl = document.getElementById("checkoutDisplayPrice");
  const discountBadgeEl = document.getElementById("checkoutDiscountBadge");

  let appliedCouponCode = null;
  let currentPayableAmount = 4997;
  const originalBasePrice = 4997;

  if (!modal) return;

  // Coupon Apply Handler
  async function handleApplyCoupon() {
    const code = couponInput ? couponInput.value.trim() : "";
    if (!code) {
      if (couponMsgEl) {
        couponMsgEl.className = "moya-coupon-msg error";
        couponMsgEl.textContent = "Please enter a coupon code.";
      }
      return;
    }

    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.textContent = "Checking...";
    }

    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code })
      });
      const data = await res.json();

      if (data.valid) {
        appliedCouponCode = data.code;
        currentPayableAmount = data.finalAmount;

        if (displayPriceEl) {
          displayPriceEl.innerHTML = `₹${data.finalAmount.toLocaleString('en-IN')} <span class="price-strikethrough">₹${originalBasePrice.toLocaleString('en-IN')}</span>`;
        }
        if (discountBadgeEl) {
          discountBadgeEl.textContent = `COUPON APPLIED (-₹${data.discount.toLocaleString('en-IN')})`;
          discountBadgeEl.classList.add("coupon-applied");
        }
        const submitBtn = document.getElementById("checkoutPayBtn");
        if (submitBtn) {
          const btnText = submitBtn.querySelector(".btn-text");
          if (btnText) btnText.textContent = `Enroll Now & Pay ₹${data.finalAmount.toLocaleString('en-IN')}`;
        }

        if (applyBtn) {
          applyBtn.textContent = "Applied ✓";
          applyBtn.classList.add("is-applied");
          applyBtn.disabled = true;
        }
        if (couponInput) {
          couponInput.disabled = true;
        }

        if (couponMsgEl) {
          couponMsgEl.className = "moya-coupon-msg success";
          couponMsgEl.innerHTML = `<span>${data.message}</span> <span class="coupon-remove-link" id="removeCouponLink">Remove</span>`;

          const removeLink = document.getElementById("removeCouponLink");
          if (removeLink) {
            removeLink.addEventListener("click", handleRemoveCoupon);
          }
        }
      } else {
        appliedCouponCode = null;
        if (couponMsgEl) {
          couponMsgEl.className = "moya-coupon-msg error";
          couponMsgEl.textContent = getSafeUserErrorMessage(data.message, "Invalid or expired coupon code.");
        }
        if (applyBtn) {
          applyBtn.disabled = false;
          applyBtn.textContent = "Apply Code";
        }
      }
    } catch (err) {
      console.warn("Coupon remote check notice, checking fallback:", err.message);
      const FESTIVAL_DEFAULTS = {
        'MOYA55': 4000,
        'MOYA44': 3000,
        'MOYA22': 2000,
        'MOYA11': 1000
      };
      const cleanUpper = code.trim().toUpperCase();
      if (FESTIVAL_DEFAULTS[cleanUpper]) {
        const discount = FESTIVAL_DEFAULTS[cleanUpper];
        const finalAmt = Math.max(1, originalBasePrice - discount);
        appliedCouponCode = cleanUpper;
        currentPayableAmount = finalAmt;

        if (displayPriceEl) {
          displayPriceEl.innerHTML = `₹${finalAmt.toLocaleString('en-IN')} <span class="price-strikethrough">₹${originalBasePrice.toLocaleString('en-IN')}</span>`;
        }
        if (discountBadgeEl) {
          discountBadgeEl.textContent = `₹${discount.toLocaleString('en-IN')} OFF APPLIED`;
          discountBadgeEl.classList.add("coupon-applied");
        }
        const submitBtn = document.getElementById("checkoutPayBtn");
        if (submitBtn) {
          const btnText = submitBtn.querySelector(".btn-text");
          if (btnText) btnText.textContent = `Enroll Now & Pay ₹${finalAmt.toLocaleString('en-IN')}`;
        }
        if (applyBtn) {
          applyBtn.disabled = true;
          applyBtn.textContent = "Applied ✓";
          applyBtn.classList.add("is-applied");
        }
        if (couponInput) {
          couponInput.disabled = true;
        }

        if (couponMsgEl) {
          couponMsgEl.className = "moya-coupon-msg success";
          couponMsgEl.innerHTML = `<span>✓ Coupon "${cleanUpper}" applied! Flat ₹${discount.toLocaleString('en-IN')} OFF.</span> <span class="coupon-remove-link" id="removeCouponLink">Remove</span>`;

          const removeLink = document.getElementById("removeCouponLink");
          if (removeLink) {
            removeLink.addEventListener("click", handleRemoveCoupon);
          }
        }
      } else {
        if (couponMsgEl) {
          couponMsgEl.className = "moya-coupon-msg error";
          couponMsgEl.textContent = "Invalid or expired coupon code.";
        }
        if (applyBtn) {
          applyBtn.disabled = false;
          applyBtn.textContent = "Apply Code";
        }
      }
    }
  }

  function handleRemoveCoupon() {
    appliedCouponCode = null;
    currentPayableAmount = originalBasePrice;

    if (displayPriceEl) {
      displayPriceEl.innerHTML = `₹${originalBasePrice.toLocaleString('en-IN')} <span class="price-strikethrough">₹14,997</span>`;
    }
    if (discountBadgeEl) {
      discountBadgeEl.textContent = "OFFICIAL PASS";
      discountBadgeEl.classList.remove("coupon-applied");
    }
    const submitBtn = document.getElementById("checkoutPayBtn");
    if (submitBtn) {
      const btnText = submitBtn.querySelector(".btn-text");
      if (btnText) btnText.textContent = `Enroll Now & Pay ₹${originalBasePrice.toLocaleString('en-IN')}`;
    }

    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.textContent = "Apply Code";
      applyBtn.classList.remove("is-applied");
    }
    if (couponInput) {
      couponInput.disabled = false;
      couponInput.value = "";
    }
    if (couponMsgEl) {
      couponMsgEl.className = "moya-coupon-msg";
      couponMsgEl.innerHTML = "";
    }
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", handleApplyCoupon);
  }

  if (couponInput) {
    couponInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApplyCoupon();
      }
    });
  }

  // Auto-check URL parameters (e.g. ?coupon=MOYA55 or ?code=MOYA55)
  const urlParams = new URLSearchParams(window.location.search);
  const promoParam = urlParams.get('coupon') || urlParams.get('code');
  if (promoParam && couponInput) {
    couponInput.value = promoParam.trim();
    setTimeout(handleApplyCoupon, 400);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeRazorpayCheckoutModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeRazorpayCheckoutModal();
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("checkoutPayBtn");
      const name = document.getElementById("checkoutNameInput")?.value?.trim() || "";
      const email = document.getElementById("checkoutEmailInput")?.value?.trim() || "";
      const phone = document.getElementById("checkoutPhoneInput")?.value?.trim() || "";

      if (!name || !email || !phone) {
        if (msgEl) {
          msgEl.className = "moya-form-msg error";
          msgEl.textContent = "Please fill in your name, email, and phone number.";
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector(".btn-text");
        if (btnText) btnText.textContent = "Initializing Secure Checkout...";
      }

      try {
        // Save in sessionStorage
        sessionStorage.setItem("moya_lead_contact", JSON.stringify({ name, email, phone }));

        // 1. Create Order via backend API (with live coupon support)
        const orderRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            couponCode: appliedCouponCode
          })
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.order) {
          throw new Error(orderData.error || "Failed to initialize payment gateway");
        }

        const order = orderData.order;
        const keyId = orderData.keyId;
        const finalPayable = orderData.finalAmount || currentPayableAmount;

        // 2. Launch Razorpay Checkout Popup
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Mechanism of YouTube Automation",
          description: appliedCouponCode
            ? `MOYA Complete Access (Coupon ${appliedCouponCode} Applied)`
            : "MOYA Complete Access + 19 Bonus Vaults",
          image: "https://assets.cdn.filesafe.space/jsuZqhDRfnfSBFMgdfs2/media/6a5214c89c9b37b5fd4d3d92.webp",
          order_id: order.id,
          prefill: {
            name: name,
            email: email,
            contact: phone
          },
          theme: {
            color: "#ff3346"
          },
          handler: async function (response) {
            if (msgEl) {
              msgEl.className = "moya-form-msg success";
              msgEl.textContent = "Payment successful! Verifying enrollment...";
            }

            try {
              // 3. Verify Payment on Backend
              await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  name,
                  email,
                  phone,
                  couponCode: appliedCouponCode,
                  paidAmount: finalPayable
                })
              });

              // Save payment details in sessionStorage for instant, resilient retrieval
              try {
                sessionStorage.setItem("moya_last_payment", JSON.stringify({
                  amount: finalPayable,
                  paymentId: response.razorpay_payment_id || "",
                  email: email,
                  coupon: appliedCouponCode || "",
                  timestamp: Date.now()
                }));
              } catch (storageErr) {}

              if (typeof fbq === "function") {
                fbq("track", "Purchase", { value: finalPayable, currency: "INR" });
              }

              const thankYouParams = new URLSearchParams({
                amount: finalPayable,
                payment_id: response.razorpay_payment_id || "",
                customer_email: email,
                coupon: appliedCouponCode || ""
              });

              window.location.href = `/thankyou.html?${thankYouParams.toString()}`;
            } catch (err) {
              console.error("Verification error:", err);
              try {
                sessionStorage.setItem("moya_last_payment", JSON.stringify({
                  amount: finalPayable,
                  paymentId: response.razorpay_payment_id || "",
                  email: email,
                  coupon: appliedCouponCode || "",
                  timestamp: Date.now()
                }));
              } catch (storageErr) {}

              const fallbackParams = new URLSearchParams({
                amount: finalPayable,
                payment_id: response.razorpay_payment_id || "",
                customer_email: email,
                coupon: appliedCouponCode || ""
              });

              window.location.href = `/thankyou.html?${fallbackParams.toString()}`;
            }
          },
          modal: {
            ondismiss: function () {
              if (submitBtn) {
                submitBtn.disabled = false;
                const btnText = submitBtn.querySelector(".btn-text");
                if (btnText) btnText.textContent = `Enroll Now & Pay ₹${finalPayable.toLocaleString('en-IN')}`;
              }
              // Restore checkout modal so user can review/edit details or retry!
              if (typeof modal.showModal === "function") {
                modal.showModal();
              } else {
                modal.setAttribute("open", "true");
              }
              // Log dismissed/cancelled as potential drop-off
              fetch("/api/razorpay/payment-failed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: order.id,
                  paymentId: "",
                  error: { description: "User closed Razorpay popup without paying", reason: "checkout_dismissed" },
                  name,
                  email,
                  phone
                })
              }).catch(() => {});
            }
          }
        };

        if (typeof window.Razorpay !== "function") {
          throw new Error("Razorpay SDK not loaded. Please check your connection.");
        }

        const rzp = new window.Razorpay(options);

        // Capture payment failure directly
        rzp.on("payment.failed", function (response) {
          console.warn("Payment failed:", response.error);

          // Restore checkout modal so user can see error and retry
          if (typeof modal.showModal === "function") {
            modal.showModal();
          } else {
            modal.setAttribute("open", "true");
          }

          if (msgEl) {
            msgEl.className = "moya-form-msg error";
            msgEl.textContent = response.error.description || "Payment failed. Please try UPI or another card.";
          }

          if (submitBtn) {
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector(".btn-text");
            if (btnText) btnText.textContent = `Retry Payment (₹${finalPayable.toLocaleString('en-IN')})`;
          }

          // Send to backend failed payment logger
          fetch("/api/razorpay/payment-failed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              paymentId: response.error?.metadata?.payment_id || "",
              error: {
                description: response.error.description,
                reason: response.error.reason,
                code: response.error.code
              },
              name,
              email,
              phone
            })
          }).catch(() => {});
        });

        // Close checkout dialog so Razorpay iframe renders with 100% full unobstructed front focus!
        if (typeof modal.close === "function") {
          modal.close();
        } else {
          modal.removeAttribute("open");
        }

        rzp.open();
      } catch (err) {
        console.error("Checkout init error:", err);
        if (msgEl) {
          msgEl.className = "moya-form-msg error";
          msgEl.textContent = getSafeUserErrorMessage(err.message, "Payment gateway is currently completing a secure update. Please retry in a moment.");
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          const btnText = submitBtn.querySelector(".btn-text");
          if (btnText) btnText.textContent = `Enroll Now & Pay ₹${currentPayableAmount.toLocaleString('en-IN')}`;
        }
      }
    });
  }
}

// ==========================================================================
// FESTIVE GAMIFIED SPIN WHEEL ENGINE (REUSABLE FOR ALL FESTIVALS)
// 100% Guaranteed Win, Sales-Boosting Probability (Max ₹4,000, 0% for ₹1,000)
// ==========================================================================
// ==========================================================================
// MAHA NAVRATRI GAMIFIED SPIN WHEEL ENGINE (FIGMA UI KIT 7-410 OVERHAUL)
// Authentic Game Physics: Natural Angular Jitter, Web Audio Ticker Clicks,
// Spring-Deflection Pointer, Glowing LED Chaser Bulbs & 100% Win Guarantee
// ==========================================================================
function initFestiveSpinGame() {
  const launcherWidget = document.getElementById("festiveSpinWidget");
  const launcherBtn = document.getElementById("openSpinModalBtn");
  const launcherLabel = document.getElementById("spinLauncherLabel");
  const spinModal = document.getElementById("festiveSpinModal");
  const closeBtn = document.getElementById("closeSpinModalBtn");
  const backdrop = document.getElementById("closeSpinModalBackdrop");
  const wheelContainer = document.querySelector(".spin-wheel-container");
  const pointerEl = document.getElementById("spinWheelPointer");
  const canvas = document.getElementById("festiveSpinCanvas");
  const spinTriggerBtn = document.getElementById("spinTriggerBtn");
  const prizeCard = document.getElementById("spinPrizeCard");
  const prizeDisplayAmount = document.getElementById("prizeDisplayAmount");
  const prizeCouponCode = document.getElementById("prizeCouponCode");
  const prizeCopyBtn = document.getElementById("prizeCopyBtn");
  const prizeClaimBtn = document.getElementById("prizeClaimBtn");
  const confettiCanvas = document.getElementById("festiveConfettiCanvas");

  if (!canvas || !spinModal || !spinTriggerBtn) return;

  const ctx = canvas.getContext("2d");
  const numSlices = 8;
  const sliceAngle = (2 * Math.PI) / numSlices;
  let currentRotation = 0;
  let isSpinning = false;
  let wonCoupon = null;

  // High-DPI Retina Display Setup
  const dpr = window.devicePixelRatio || 2;
  const canvasSize = 316;
  canvas.width = Math.round(canvasSize * dpr);
  canvas.height = Math.round(canvasSize * dpr);
  ctx.scale(dpr, dpr);

  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const radius = canvasSize / 2 - 4;

  // Wheel Segments (Auspicious Festive Palette: Ruby, Indigo, Amber, Emerald)
  // Slices: 0: 4000, 1: 2000, 2: 3000, 3: 1000, 4: 4000, 5: 2000, 6: 3000, 7: 1000
  const slices = [
    { text: "₹4,000 OFF", gradStart: "#991b1b", gradEnd: "#580b18", stroke: "#fbbf24", textCol: "#ffffff", sub: "SHUBH" },
    { text: "₹2,000 OFF", gradStart: "#1e1b4b", gradEnd: "#0f0e26", stroke: "#c7d2fe", textCol: "#ffffff", sub: "BLESSING" },
    { text: "₹3,000 OFF", gradStart: "#b45309", gradEnd: "#78350f", stroke: "#fde68a", textCol: "#ffffff", sub: "LUCKY" },
    { text: "₹1,000 OFF", gradStart: "#064e3b", gradEnd: "#022c22", stroke: "#86efac", textCol: "#ffffff", sub: "OFFER" },
    { text: "₹4,000 OFF", gradStart: "#991b1b", gradEnd: "#580b18", stroke: "#fbbf24", textCol: "#ffffff", sub: "SHUBH" },
    { text: "₹2,000 OFF", gradStart: "#1e1b4b", gradEnd: "#0f0e26", stroke: "#c7d2fe", textCol: "#ffffff", sub: "BLESSING" },
    { text: "₹3,000 OFF", gradStart: "#b45309", gradEnd: "#78350f", stroke: "#fde68a", textCol: "#ffffff", sub: "LUCKY" },
    { text: "₹1,000 OFF", gradStart: "#064e3b", gradEnd: "#022c22", stroke: "#86efac", textCol: "#ffffff", sub: "OFFER" }
  ];

  // Synthesized Web Audio Ticker Clicks (Zero-latency, no external MP3 dependencies)
  let audioCtx = null;
  function playTickSound(pitch = 1, volume = 0.14) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(520 * pitch, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.016);

      gain.gain.setValueAtTime(volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.016);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.018);
    } catch (e) {}
  }

  // Draw Wheel with 3D Depth, Radial Gradients & Chrome Perimeter Pins
  function drawWheel(angleOffset = 0) {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const angle = angleOffset + i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();

      // Radial slice gradient from center to rim
      const grad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
      grad.addColorStop(0, slices[i].gradStart);
      grad.addColorStop(1, slices[i].gradEnd);
      ctx.fillStyle = grad;
      ctx.fill();

      // Spoke border line between slices
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
      ctx.stroke();

      // Render Slice Typography
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      // Rupee / Amount Text
      ctx.fillStyle = slices[i].textCol;
      ctx.font = "900 14px 'Plus Jakarta Sans', sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
      ctx.shadowBlur = 4;
      ctx.fillText(slices[i].text, radius - 20, 0);

      // Subtle Auspicious Subtag
      ctx.font = "800 8px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = slices[i].stroke;
      ctx.fillText(slices[i].sub, radius - 20, 14);
      ctx.restore();
    }

    // Outer Perimeter Peg Pins (Metallic chrome rivets colliding with ticker)
    for (let p = 0; p < numSlices; p++) {
      const pegAngle = angleOffset + p * sliceAngle;
      const pegX = centerX + (radius - 5) * Math.cos(pegAngle);
      const pegY = centerY + (radius - 5) * Math.sin(pegAngle);

      ctx.beginPath();
      ctx.arc(pegX, pegY, 3.5, 0, 2 * Math.PI);
      const pegGrad = ctx.createRadialGradient(pegX - 1, pegY - 1, 0.5, pegX, pegY, 3.5);
      pegGrad.addColorStop(0, "#ffffff");
      pegGrad.addColorStop(0.5, "#fbbf24");
      pegGrad.addColorStop(1, "#78350f");
      ctx.fillStyle = pegGrad;
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
      ctx.stroke();
    }
  }

  drawWheel(0);

  // Check if user already won a coupon in this browser session/storage
  try {
    const savedWon = JSON.parse(localStorage.getItem("moya_festive_won_coupon") || "null");
    if (savedWon && savedWon.code && savedWon.discount) {
      wonCoupon = savedWon;
      if (launcherLabel) {
        launcherLabel.textContent = `🎉 ${savedWon.code}: ₹${savedWon.discount.toLocaleString('en-IN')} OFF CLAIMED`;
      }
      if (launcherBtn) {
        launcherBtn.classList.add("is-pinned");
      }
    }
  } catch (e) {}

  // Open & Close Modal Handlers
  function openSpinModal() {
    if (wonCoupon && prizeCard && prizeDisplayAmount && prizeCouponCode) {
      // If already spun, directly show the unlocked Navratri card
      prizeDisplayAmount.textContent = `₹${wonCoupon.discount.toLocaleString('en-IN')} OFF`;
      prizeCouponCode.textContent = wonCoupon.code;
      prizeCard.classList.add("is-visible");
      prizeCard.setAttribute("aria-hidden", "false");
    }
    spinModal.classList.add("is-open");
    spinModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeSpinModal() {
    spinModal.classList.remove("is-open");
    spinModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  if (launcherBtn) launcherBtn.addEventListener("click", openSpinModal);
  if (closeBtn) closeBtn.addEventListener("click", closeSpinModal);
  if (backdrop) backdrop.addEventListener("click", closeSpinModal);

  // Sales-Boosting Winning Algorithm (Strictly Enforced):
  // 🎯 70% chance -> ₹4,000 OFF (MOYA55, Slices 0 or 4)
  // 🎯 20% chance -> ₹3,000 OFF (MOYA44, Slices 2 or 6)
  // 🎯 10% chance -> ₹2,000 OFF (MOYA22, Slices 1 or 5)
  // ❌  0% chance -> ₹1,000 OFF (MOYA11, Decoy only - never landed!)
  function selectWinningPrize() {
    const rand = Math.random() * 100;
    if (rand < 70) {
      // 70% of visitors win ₹4,000 OFF scholarship!
      const pickSlice = Math.random() < 0.5 ? 0 : 4;
      return { discount: 4000, code: "MOYA55", sliceIndex: pickSlice };
    } else if (rand < 90) {
      // 20% win ₹3,000 OFF
      const pickSlice = Math.random() < 0.5 ? 2 : 6;
      return { discount: 3000, code: "MOYA44", sliceIndex: pickSlice };
    } else {
      // 10% win ₹2,000 OFF
      const pickSlice = Math.random() < 0.5 ? 1 : 5;
      return { discount: 2000, code: "MOYA22", sliceIndex: pickSlice };
    }
  }

  // Spin Wheel Execution with Natural Angular Jitter & Suspenseful Physics
  spinTriggerBtn.addEventListener("click", () => {
    if (isSpinning) return;
    if (wonCoupon) {
      if (prizeCard) {
        prizeCard.classList.add("is-visible");
        prizeCard.setAttribute("aria-hidden", "false");
      }
      return;
    }

    // Warm up Web Audio context on user gesture
    playTickSound(1.2, 0.05);

    isSpinning = true;
    spinTriggerBtn.disabled = true;
    if (wheelContainer) wheelContainer.classList.add("is-spinning");

    const winningPrize = selectWinningPrize();
    const winningIndex = winningPrize.sliceIndex;

    // Pointer is at TOP: 270 degrees (3 * PI / 2)
    // To give an organic, genuine game feel, land with natural angular jitter inside slice (+/- 25% of slice)
    const sliceMidAngle = winningIndex * sliceAngle + sliceAngle / 2;
    const naturalJitter = (Math.random() - 0.5) * (sliceAngle * 0.52);
    const targetSliceAngle = sliceMidAngle + naturalJitter;

    const pointerAngle = (3 * Math.PI) / 2;
    const finalOffset = pointerAngle - targetSliceAngle;

    // 7 full suspenseful revolutions + offset
    const totalSpins = 7;
    const startAngle = currentRotation % (2 * Math.PI);
    const targetAngle = totalSpins * (2 * Math.PI) + finalOffset;
    const spinDuration = 4600; // ms
    const startTime = performance.now();

    // Track peg collisions to trigger realistic ticker tick bounce & audio click
    let lastPegIndex = -1;

    // Smooth Quintic Ease-Out Curve for authentic physical deceleration
    function easeOutQuint(t) {
      return 1 - Math.pow(1 - t, 5);
    }

    function animateSpin(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      const eased = easeOutQuint(progress);

      currentRotation = startAngle + (targetAngle - startAngle) * eased;
      drawWheel(currentRotation);

      // Detect which peg passed the top pointer
      // Pointer is at 270 deg (1.5 * PI). Normalized rotation relative to pointer:
      const normalizedAngle = (pointerAngle - currentRotation) % (2 * Math.PI);
      const positiveAngle = normalizedAngle < 0 ? normalizedAngle + 2 * Math.PI : normalizedAngle;
      const currentPeg = Math.floor(positiveAngle / sliceAngle);

      if (currentPeg !== lastPegIndex) {
        lastPegIndex = currentPeg;

        // Trigger dynamic spring bounce on ticker pointer
        if (pointerEl) {
          pointerEl.classList.remove("is-ticking");
          void pointerEl.offsetWidth; // Force CSS reflow
          pointerEl.classList.add("is-ticking");
        }

        // Taper sound pitch & volume as wheel slows down
        const speedFactor = 1 - progress;
        const tickPitch = 0.8 + speedFactor * 0.5;
        const tickVol = Math.max(0.04, 0.16 * speedFactor);
        playTickSound(tickPitch, tickVol);
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Spin Completed!
        isSpinning = false;
        if (wheelContainer) wheelContainer.classList.remove("is-spinning");
        wonCoupon = { code: winningPrize.code, discount: winningPrize.discount };

        // Save in persistent browser storage
        try {
          localStorage.setItem("moya_festive_won_coupon", JSON.stringify(wonCoupon));
        } catch (e) {}

        // Launch celebratory confetti with festive gold & vermilion sparkles
        launchFestiveConfetti();

        // Reveal Navratri Victory Card
        setTimeout(() => {
          if (prizeDisplayAmount) {
            prizeDisplayAmount.textContent = `₹${wonCoupon.discount.toLocaleString('en-IN')} OFF`;
          }
          if (prizeCouponCode) {
            prizeCouponCode.textContent = wonCoupon.code;
          }
          if (prizeCard) {
            prizeCard.classList.add("is-visible");
            prizeCard.setAttribute("aria-hidden", "false");
          }
          if (launcherLabel) {
            launcherLabel.textContent = `🎉 ${wonCoupon.code}: ₹${wonCoupon.discount.toLocaleString('en-IN')} OFF CLAIMED`;
          }
          if (launcherBtn) {
            launcherBtn.classList.add("is-pinned");
          }
        }, 550);
      }
    }

    requestAnimationFrame(animateSpin);
  });

  // Copy Coupon Code Button
  if (prizeCopyBtn) {
    prizeCopyBtn.addEventListener("click", () => {
      if (!wonCoupon) return;
      navigator.clipboard.writeText(wonCoupon.code).then(() => {
        prizeCopyBtn.textContent = "Copied! ✓";
        triggerToast(`Code "${wonCoupon.code}" copied to clipboard!`);
        setTimeout(() => {
          prizeCopyBtn.textContent = "Copy Code";
        }, 2500);
      }).catch(() => {
        triggerToast(`Your Code: ${wonCoupon.code}`);
      });
    });
  }

  // Claim Navratri Offer & Enroll Now Button -> Auto-applies to Checkout Modal at ₹997
  if (prizeClaimBtn) {
    prizeClaimBtn.addEventListener("click", () => {
      if (!wonCoupon) return;
      closeSpinModal();

      // Open Razorpay Checkout Modal
      openRazorpayCheckoutModal();

      // Pre-fill and auto-trigger coupon application
      const checkoutCouponInput = document.getElementById("checkoutCouponInput");
      const applyCouponBtn = document.getElementById("applyCouponBtn");
      if (checkoutCouponInput) {
        checkoutCouponInput.value = wonCoupon.code;
      }
      if (applyCouponBtn) {
        setTimeout(() => {
          applyCouponBtn.click();
        }, 300);
      }
    });
  }

  // Confetti Particle Engine with Auspicious Colors
  function launchFestiveConfetti() {
    if (!confettiCanvas) return;
    const cctx = confettiCanvas.getContext("2d");
    confettiCanvas.width = confettiCanvas.offsetWidth;
    confettiCanvas.height = confettiCanvas.offsetHeight;

    const particles = [];
    const colors = ["#fbbf24", "#f59e0b", "#e11d48", "#f43f5e", "#fde68a", "#10b981", "#ffffff"];

    for (let p = 0; p < 85; p++) {
      particles.push({
        x: confettiCanvas.width / 2,
        y: confettiCanvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let confettiStart = performance.now();
    function renderConfetti(now) {
      cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      const elapsed = now - confettiStart;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity
        p.rotation += p.rSpeed;
        p.alpha = Math.max(0, 1 - elapsed / 3400);

        cctx.save();
        cctx.translate(p.x, p.y);
        cctx.rotate((p.rotation * Math.PI) / 180);
        cctx.fillStyle = p.color;
        cctx.globalAlpha = p.alpha;
        cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        cctx.restore();
      });

      if (elapsed < 3400) {
        requestAnimationFrame(renderConfetti);
      } else {
        cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    requestAnimationFrame(renderConfetti);
  }
}

// ==========================================================================
// MASTER APPLICATION INITIALIZER
// ==========================================================================
onReady(() => {
  // 1. Bind ALL Enrollment & Action CTAs across the entire page to open Razorpay Checkout Modal
  $$(".js-cta, .js-cta-checkout, #cta, .hero-cta-primary, .moya-mobile-sticky-btn, .modal-cta-btn, .moya-btn-primary, a[href='#offer']:not(.nav-item)").forEach((btn) => {
    btn.addEventListener("click", handleCtaClick);
  });

  // 2. Initialize Core Components
  init3DCourseFolders();
  initFaq();
  initTheme();
  initGridStars();
  initChart();
  initExpandableGallery();
  initMegaBonusParallax();
  initEditorialPricingSection();
  initBentoMotionTheater();
  animateChartOnLoad();
  animateDashboardCounters();

  // 3. Initialize Section 5 Lead Capture, Razorpay Checkout & Festive Spin Game
  initSection5LeadCapture();
  initRazorpayCheckoutFlow();
  initFestiveSpinGame();

  // 4. Initialize Video Controller
  window.videoController.init();

  // 5. Initialize Lenis Smooth Scroll Engine & Navigation
  initLenisScroll();

  // 6. Initialize Parallax Cards & Section-to-Section Motion Architecture
  initParallaxCards();
  initGlobalMotionArchitecture();
  initHeadlineTextAnimations();
  initMentorStatsCounters();

  // 7. Lifecycle ScrollTrigger Refresh on font/image load
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  }
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 500);
  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 1800);
});

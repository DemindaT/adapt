import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Styles ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800;12..96,900&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; height: 100dvh; overflow: hidden; background: #050507; -webkit-text-size-adjust: 100%; }
  #root { width: 100%; height: 100%; height: 100dvh; }

  @media (pointer: fine) {
    *, *::before, *::after { cursor: none !important; }
  }

  .cursor-dot {
    position: fixed; top: 0; left: 0; width: 6px; height: 6px;
    background: white; border-radius: 50%; pointer-events: none; z-index: 9999;
    mix-blend-mode: difference; will-change: transform;
  }
  .cursor-ring {
    position: fixed; top: 0; left: 0; width: 38px; height: 38px;
    border: 1.5px solid rgba(56,135,255,0.65); border-radius: 50%;
    pointer-events: none; z-index: 9998; will-change: transform;
    transition: width .35s ease, height .35s ease, background .35s ease, border-color .35s ease;
  }
  .cursor-ring.hov { width: 64px; height: 64px; background: rgba(56,135,255,0.07); border-color: rgba(56,135,255,1); }

  ::-webkit-scrollbar { display: none; }
  * { scrollbar-width: none; }

  .fd { font-family: 'Bricolage Grotesque', sans-serif; }
  .fb { font-family: 'Plus Jakarta Sans', sans-serif; }
  .fm { font-family: 'JetBrains Mono','Courier New',monospace; }
  .fs { font-family: 'Fraunces', Georgia, serif; }

  /* ── World overlay ── */
  .world-rail { cursor: grab; }
  .world-rail:active { cursor: grabbing; }
  .world-rail::-webkit-scrollbar { display: none; }

  .pillar-card { position: relative; overflow: hidden; flex-shrink: 0; transition: transform .5s cubic-bezier(.23,1,.32,1); }
  .pillar-card .pc-media { transition: transform .9s cubic-bezier(.23,1,.32,1), filter .6s ease; }
  .pillar-card:hover .pc-media { transform: scale(1.06); filter: brightness(1.12); }
  .pillar-card .pc-cta { opacity: 0; transform: translateY(10px); transition: opacity .4s ease, transform .4s ease; }
  .pillar-card:hover .pc-cta { opacity: 1; transform: translateY(0); }

  .sol-card { position: relative; overflow: hidden; transition: transform .4s cubic-bezier(.23,1,.32,1), border-color .4s ease, background .4s ease; }
  .sol-card:hover { transform: translateY(-4px); }

  .fork-half { position: relative; overflow: hidden; transition: flex .7s cubic-bezier(.23,1,.32,1); }

  @keyframes grain {
    0%,100% { transform: translate(0,0); }
    50% { transform: translate(-2%,1%); }
  }
  @keyframes drawPath { to { stroke-dashoffset: 0; } }

  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 20px rgba(56,135,255,.4), 0 0 40px rgba(56,135,255,.12); }
    50%      { box-shadow: 0 0 55px rgba(56,135,255,.9), 0 0 110px rgba(56,135,255,.3); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(-14px) rotate(.5deg); }
  }
  @keyframes floatReverse {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(14px) rotate(-.5deg); }
  }
  @keyframes ping {
    0%   { transform: scale(1); opacity: .55; }
    100% { transform: scale(2.1); opacity: 0; }
  }
  @keyframes scanUp {
    from { top: 100%; } to { top: -2px; }
  }
  @keyframes slideBar {
    0%   { transform: scaleY(0); transform-origin: top; }
    50%  { transform: scaleY(1); transform-origin: top; }
    51%  { transform: scaleY(1); transform-origin: bottom; }
    100% { transform: scaleY(0); transform-origin: bottom; }
  }
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes spinSlowRev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
  @keyframes drawLine {
    from { stroke-dashoffset: 400; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes barRise {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
  }
  @keyframes orbit2 {
    from { transform: rotate(120deg) translateX(55px) rotate(-120deg); }
    to   { transform: rotate(480deg) translateX(55px) rotate(-480deg); }
  }
  @keyframes orbit3 {
    from { transform: rotate(240deg) translateX(42px) rotate(-240deg); }
    to   { transform: rotate(600deg) translateX(42px) rotate(-600deg); }
  }
  @keyframes particleDrift {
    0%   { transform: translateY(0) translateX(0) scale(1); opacity: .6; }
    33%  { transform: translateY(-30px) translateX(15px) scale(1.1); }
    66%  { transform: translateY(-10px) translateX(-10px) scale(.9); }
    100% { transform: translateY(0) translateX(0) scale(1); opacity: .6; }
  }
  @keyframes counterUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes ripple {
    0%   { transform: scale(.5); opacity: .8; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  .cta-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .cta-glow:hover {
    animation: none;
    box-shadow: 0 0 80px rgba(56,135,255,1), 0 0 160px rgba(56,135,255,.5);
    letter-spacing: .28em !important;
    transition: letter-spacing .4s ease, box-shadow .2s ease;
  }

  .cap-card {
    position: relative; overflow: hidden;
    transition: transform .4s ease, box-shadow .4s ease;
  }
  .cap-card:hover { transform: translateY(-4px) scale(1.01); }

  .underline-input {
    width: 100%; background: transparent; border: none;
    border-bottom: 1px solid rgba(255,255,255,.18); color: white;
    outline: none; padding: 10px 0;
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700;
    transition: border-color .3s ease;
  }
  .underline-input:focus { border-bottom-color: rgba(56,135,255,.9); }
  .underline-input::placeholder { color: rgba(255,255,255,.18); }

  .dot-nav-btn {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,.22); border: none;
    transition: all .35s ease; display: block; cursor: pointer;
  }
  .dot-nav-btn.active { width: 6px; height: 22px; border-radius: 3px; background: rgba(56,135,255,.9); }

  .chip {
    display: inline-block; padding: 5px 14px;
    border: 1px solid rgba(56,135,255,.3); font-size: 10px;
    letter-spacing: .18em; color: rgba(56,135,255,.8);
    background: rgba(56,135,255,.06);
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 500;
  }

  .mob-menu {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(5,5,7,.97); backdrop-filter: blur(30px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 40px;
  }

  @media (max-width: 768px) {
    .desktop-only { display: none !important; }
    .mob-show { display: flex !important; }
    .nav-links-desktop { display: none !important; }
    .process-layout { flex-direction: column !important; }
    .contact-layout { flex-direction: column !important; gap: 24px !important; }
    .contact-footer { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; margin-top: 28px !important; }
    .cf-tag { display: none !important; }
    nav { padding: 15px 20px !important; }
  }
  @media (min-width: 769px) {
    .mob-show { display: none !important; }
  }
  /* small phones */
  @media (max-width: 400px) {
    nav { padding: 13px 16px !important; }
    .mob-menu { gap: 26px !important; }
  }
  /* short landscape / small height */
  @media (max-height: 560px) {
    nav { padding: 10px 20px !important; }
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const FRAME_NAMES = ["HERO", "MANIFESTO", "PILLARS", "SOLUTIONS", "WORK", "PROCESS", "PROOF", "CONTACT"];

// ── Content Pillars (editorial, high-fashion) ──
const PILLARS = [
  {
    id: "editorial", num: "01", title: "Editorial Product Content",
    tagline: "Product as protagonist.",
    desc: "Magazine-grade product imagery that frames your pieces like a fashion feature — not a catalogue.",
    accent: "#3887ff", grad: "linear-gradient(150deg,#0e1d3a,#060a16)",
    deep: {
      intro: "We treat every product like the cover story. Considered lighting, set design, and styling that makes the ordinary feel collectible.",
      deliverables: ["Hero & detail still life", "On-model editorial sets", "Flat-lay & texture studies", "Seasonal lookbooks"],
      outcome: "Premium perception that justifies premium pricing.",
    },
  },
  {
    id: "occasion", num: "02", title: "Occasion Styling",
    tagline: "Dress the moment.",
    desc: "Styling stories built around real occasions — so customers see themselves wearing it, not just looking at it.",
    accent: "#60a5fa", grad: "linear-gradient(150deg,#0c1a30,#05080f)",
    deep: {
      intro: "Context sells. We build styling narratives around weddings, dinners, travel and seasons that turn a single product into a dozen reasons to buy.",
      deliverables: ["Occasion lookbooks", "Styling guides & pairings", "Seasonal capsule stories", "Gifting edits"],
      outcome: "Higher basket size through aspirational context.",
    },
  },
  {
    id: "shortform", num: "03", title: "Short-Form Video",
    tagline: "Engineered to spread.",
    desc: "Scroll-stopping reels and TikToks built on hooks, pacing and trends that the algorithm rewards.",
    accent: "#38bdf8", grad: "linear-gradient(150deg,#0a1f2e,#05080d)",
    deep: {
      intro: "Native, fast, and made to be watched twice. We script the hook, shoot for vertical, and cut for retention.",
      deliverables: ["Hook-led reels & TikToks", "Trend-jacking edits", "UGC-style spots", "Series formats"],
      outcome: "Organic reach that compounds week over week.",
    },
  },
  {
    id: "behind", num: "04", title: "Behind the Brand",
    tagline: "The human layer.",
    desc: "Founder story, craft, and process content that builds the trust no ad budget can buy.",
    accent: "#818cf8", grad: "linear-gradient(150deg,#141a38,#070912)",
    deep: {
      intro: "People buy from people. We document the makers, the materials and the moments that make your brand worth believing in.",
      deliverables: ["Founder & team films", "Craft & process docs", "Studio day-in-the-life", "Values & mission pieces"],
      outcome: "Loyalty rooted in authenticity, not discounts.",
    },
  },
  {
    id: "proof", num: "05", title: "Social Proof & Creator Styling",
    tagline: "Borrowed credibility.",
    desc: "Creator collaborations and customer proof that turn strangers into believers.",
    accent: "#6366f1", grad: "linear-gradient(150deg,#12153a,#070814)",
    deep: {
      intro: "We orchestrate creators and customers into a steady drumbeat of proof — styled, on-brand, and built to convert.",
      deliverables: ["Creator styling direction", "UGC sourcing & rights", "Review & testimonial edits", "Reposting frameworks"],
      outcome: "Trust at scale from voices that aren't yours.",
    },
  },
  {
    id: "softsell", num: "06", title: "Soft-Sell Conversion Content",
    tagline: "Sell without shouting.",
    desc: "Content that converts through desire and education — never the hard pitch.",
    accent: "#22d3ee", grad: "linear-gradient(150deg,#0a2228,#05090c)",
    deep: {
      intro: "The close that doesn't feel like one. Value-first content that answers objections and makes buying the obvious next step.",
      deliverables: ["Education & how-to content", "Objection-handling posts", "Comparison & value stories", "Subtle CTA frameworks"],
      outcome: "Conversion lift without eroding brand equity.",
    },
  },
];

// ── Marketing Solutions (structured, sleek) ──
const SOLUTIONS = [
  { id: "brand", num: "01", title: "Marketing & Brand Strategy", cat: "FOUNDATION", desc: "Positioning, audience, and the strategic spine every other play hangs on.", deliverables: ["Market & competitor audit", "Positioning & messaging", "Audience & ICP mapping", "Brand guardrails"], outcome: "A clear, ownable position in the market." },
  { id: "rhythm", num: "02", title: "Posting Rhythm Strategy", cat: "CONTENT OPS", desc: "A sustainable cadence and content system across every channel.", deliverables: ["Channel cadence plan", "Content pillars & calendar", "Format mix & ratios", "Workflow & approvals"], outcome: "Consistency that builds momentum, not burnout." },
  { id: "web", num: "03", title: "Website & E-Commerce Strategy", cat: "DIGITAL", desc: "Store architecture, UX, and merchandising tuned to convert.", deliverables: ["Site & funnel architecture", "PDP & merchandising", "CRO roadmap", "Tech stack guidance"], outcome: "A storefront that sells while you sleep." },
  { id: "paid", num: "04", title: "Paid Advertising Strategy", cat: "ACQUISITION", desc: "Full-funnel paid media built on creative testing and clean measurement.", deliverables: ["Channel & budget plan", "Creative testing matrix", "Audience architecture", "Scaling framework"], outcome: "Profitable, predictable acquisition." },
  { id: "influencer", num: "05", title: "Influencer & Creator Strategy", cat: "PARTNERSHIPS", desc: "Creator programs that generate proof, reach, and content at once.", deliverables: ["Creator tiering & sourcing", "Brief & deliverable specs", "Seeding & gifting ops", "Performance tracking"], outcome: "A repeatable creator engine." },
  { id: "crm", num: "06", title: "CRM & Retention Strategy", cat: "LIFECYCLE", desc: "Email, SMS, and loyalty flows that turn buyers into regulars.", deliverables: ["Lifecycle flow mapping", "Email & SMS automation", "Loyalty & VIP design", "Segmentation strategy"], outcome: "More revenue from customers you already have." },
  { id: "pr", num: "07", title: "PR & Brand Credibility", cat: "AUTHORITY", desc: "Earned media and credibility markers that make the brand undeniable.", deliverables: ["Press & angle strategy", "Media & editor outreach", "Founder thought leadership", "Awards & features"], outcome: "Third-party validation at scale." },
  { id: "creative", num: "08", title: "Creative Direction & Campaign Building", cat: "CREATIVE", desc: "Big-idea campaigns with a coherent visual and narrative system.", deliverables: ["Campaign concepting", "Art & creative direction", "Asset production plan", "Channel adaptation"], outcome: "Campaigns that feel like culture, not ads." },
  {
    id: "flagship", num: "09", title: "Flagship Store Marketing Strategy", cat: "RETAIL · FLAGSHIP", flagship: true,
    desc: "The signature engagement — an end-to-end retail launch across four phases.",
    deliverables: ["Pre-launch demand build", "Launch-day activation", "Post-launch retention", "In-store experience design"],
    outcome: "A physical flagship that prints both revenue and brand.",
    phases: [
      { key: "pre", label: "Pre-launch Phase", desc: "Build demand before the doors open.", points: ["Teaser & waitlist campaign", "Local + creator seeding", "Press & VIP guest list", "Opening-week media plan"] },
      { key: "launch", label: "Launch Phase", desc: "Make opening day unmissable.", points: ["Launch event & activation", "Live content capture", "Footfall-driving offers", "Real-time social coverage"] },
      { key: "post", label: "Post-launch Phase", desc: "Convert the spike into a habit.", points: ["Retargeting & retention flows", "UGC & review harvesting", "Loyalty enrolment push", "Performance review & iterate"] },
      { key: "exp", label: "Store Experience Ideas", desc: "Design moments worth posting.", points: ["Signature photo moments", "Sensory & spatial design", "In-store events calendar", "Clienteling & personalisation"] },
    ],
  },
  { id: "kpi", num: "10", title: "Measurement & KPI Framework", cat: "REPORTING", desc: "The dashboard and cadence that proves what's working.", deliverables: ["North-star & KPI tree", "Dashboard & reporting", "Attribution approach", "Review cadence & rituals"], outcome: "Decisions driven by data, not vibes." },
];

const CAPS = [
  {
    num: "01", cat: "STRATEGY", title: "Market Win-Analysis",
    copy: "We reverse-engineer your competition and map an airtight path to the top before a single dollar is spent.",
    accent: "#3887ff",
    grad: "linear-gradient(135deg,rgba(88,28,135,.8) 0%,rgba(15,5,30,.9) 100%)",
    border: "#3887ff",
    icon: "◈",
  },
  {
    num: "02", cat: "SOCIAL & CONTENT", title: "Viral Short-Form",
    copy: "Algorithm-shattering storytelling that turns passive scrollers into a cult following. Engineered to spread.",
    accent: "#60a5fa",
    grad: "linear-gradient(135deg,rgba(30,58,138,.8) 0%,rgba(5,10,30,.9) 100%)",
    border: "#60a5fa",
    icon: "⬡",
  },
  {
    num: "03", cat: "VISUALS", title: "Cinema-Grade Production",
    copy: "Commercial studio production and high-end lighting that makes any product look luxury. Every frame, intentional.",
    accent: "#f472b6",
    grad: "linear-gradient(135deg,rgba(112,26,117,.8) 0%,rgba(20,5,25,.9) 100%)",
    border: "#f472b6",
    icon: "◉",
  },
  {
    num: "04", cat: "DIGITAL", title: "Next-Gen Web Development",
    copy: "Exactly like the experience you're inside right now. Fast, animated, unforgettable — web as a weapon.",
    accent: "#34d399",
    grad: "linear-gradient(135deg,rgba(6,78,59,.8) 0%,rgba(3,15,12,.9) 100%)",
    border: "#34d399",
    icon: "⬢",
  },
  {
    num: "05", cat: "THE STREETS", title: "Offline Ground Campaigns",
    copy: "Pop-ups, murals, experiential events, and unmissable physical activations. We bring your brand to the real world.",
    accent: "#fb923c",
    grad: "linear-gradient(135deg,rgba(124,45,18,.8) 0%,rgba(20,8,3,.9) 100%)",
    border: "#fb923c",
    icon: "◆",
  },
];

const PROJECTS = [
  {
    id: "01", sector: "F&B / Consumer Goods", tag: "Brand Strategy + Social",
    headline: "From Local Roast to National Obsession",
    stats: [{ v: "340%", l: "Social Growth" }, { v: "2.1M", l: "Impressions" }, { v: "4.2x", l: "Revenue" }],
    accent: "#3887ff",
    grad: "linear-gradient(160deg,#120830 0%,#0a0420 100%)",
    type: "chart",
  },
  {
    id: "02", sector: "B2B / SaaS Platform", tag: "Web Dev + UX Design",
    headline: "The Dashboard That Closed $4M in Deals",
    stats: [{ v: "89%", l: "Conversion Lift" }, { v: "0.4s", l: "Load Time" }, { v: "$4M", l: "Pipeline" }],
    accent: "#60a5fa",
    grad: "linear-gradient(160deg,#08142a 0%,#030a18 100%)",
    type: "code",
  },
  {
    id: "03", sector: "Fashion / Streetwear", tag: "Cinema Content + Viral",
    headline: "8.4M Views Before the First Ad Spend",
    stats: [{ v: "8.4M", l: "Organic Views" }, { v: "#1", l: "Trending x3" }, { v: "280%", l: "Followers" }],
    accent: "#f87171",
    grad: "linear-gradient(160deg,#200408 0%,#0e0203 100%)",
    type: "film",
  },
  {
    id: "04", sector: "Experiential / Action Sports", tag: "Launch Strategy + Community Build",
    headline: "Monetizing the Concrete: 10K Visitors in Month One",
    stats: [{ v: "10K+", l: "Foot Traffic" }, { v: "120%", l: "Sponsorship Goal" }, { v: "Zero", l: "Ad Spend" }],
    accent: "#34d399",
    grad: "linear-gradient(160deg,#04241a 0%,#020e0a 100%)",
    type: "arc",
  },
  {
    id: "05", sector: "Health Tech / Wearables", tag: "E-Commerce + Product Launch",
    headline: "Strapping In 50K New Users Without Breaking a Sweat",
    stats: [{ v: "50K", l: "Active Users" }, { v: "-35%", l: "Cart Abandonment" }, { v: "$1M", l: "Q1 Sales" }],
    accent: "#ec4899",
    grad: "linear-gradient(160deg,#2a0820 0%,#120410 100%)",
    type: "pulse",
  },
];

const STEPS = [
  { num: "01", title: "ARCHITECT", icon: "◈", desc: "We dissect your market, audit the competition, and build a custom growth blueprint before a single pixel is placed." },
  { num: "02", title: "EXECUTE",   icon: "◇", desc: "Studios ignite. Code is written. Visuals are shot. Campaigns are structured. Every arm of ADAPT fires simultaneously." },
  { num: "03", title: "DOMINATE",  icon: "◆", desc: "We launch across all fronts — digital screens to physical streets — and iterate relentlessly until market dominance is yours." },
];

const TESTIMONIALS = [
  { quote: "They didn't just build us a website — they built us a presence. Six months later, investors ask why our brand feels Fortune 500.", author: "Founder, F&B Brand", result: "+340% growth" },
  { quote: "The campaign hit 14 cities in 3 weeks. I still don't fully know how they pulled it off. The numbers don't lie.", author: "CMO, Athletic Brand", result: "62K activations" },
  { quote: "The content went viral twice before we even boosted it. Every frame looked like a Netflix production. Game over.", author: "Founder, Fashion Label", result: "8.4M organic views" },
];

const BIG_STATS = [
  { v: "47+", l: "Brands Dominated" },
  { v: "$28M", l: "Revenue Generated" },
  { v: "5", l: "Active Cities" },
  { v: "100%", l: "Execution Rate" },
];

const CHIPS_CONTACT = ["Code & Web", "Content & Growth", "Real-world Campaigns", "All of It"];
const ULTIMATUM_WORDS = "Most agencies give you data without creativity. Others give you pretty designs without strategy. We don't compromise. We build the tech, shoot the visuals, run the campaigns, and command the streets. One squad. Absolute market dominance.".split(" ");
const MARQUEE_ITEMS = ["STRATEGY", "⬡", "SOCIAL", "⬡", "CINEMA", "⬡", "WEB DEV", "⬡", "GROUND CAMPAIGNS", "⬡", "BRAND IDENTITY", "⬡", "VIRAL CONTENT", "⬡", "MARKET DOMINANCE", "⬡"];

// ─── Canvas Background ────────────────────────────────────────────────────────
function AnimatedBackground({ frame }: { frame: number }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t = useRef(0);
  const fRef = useRef(frame);
  useEffect(() => { fRef.current = frame; }, [frame]);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const orb = (cx: number, cy: number, r: number, c0: string) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, c0); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const f = fRef.current / 6;
      ctx.fillStyle = "#050507"; ctx.fillRect(0, 0, W, H);
      orb((0.15 + Math.sin(t.current * .00055) * .12 + f * .3) * W, (0.28 + Math.cos(t.current * .0004) * .12) * H, W * .48, "rgba(40,90,235,.18)");
      orb((0.80 + Math.cos(t.current * .00045) * .14 - f * .2) * W, (0.62 + Math.sin(t.current * .0006) * .12) * H, W * .4, "rgba(25,65,175,.14)");
      orb((0.50 + Math.sin(t.current * .00038 + 2.1) * .2) * W, (0.10 + Math.cos(t.current * .0005 + 1.3) * .08 + f * .55) * H, W * .26, "rgba(56,135,255,.12)");
      ctx.strokeStyle = "rgba(56,135,255,.017)"; ctx.lineWidth = .5;
      for (let x = 0; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      t.current++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvs} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

// ─── Cursor ───────────────────────────────────────────────────────────────────
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -200, y: -200 });
  const rp = useRef({ x: -200, y: -200 });
  const hovRef = useRef(false);
  const [hov, setHov] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; if (dot.current) dot.current.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 3}px)`; };
    let r: number;
    const loop = () => { rp.current.x += (pos.current.x - rp.current.x) * .09; rp.current.y += (pos.current.y - rp.current.y) * .09; const s = hovRef.current ? 64 : 38; if (ring.current) ring.current.style.transform = `translate(${rp.current.x - s / 2}px,${rp.current.y - s / 2}px)`; r = requestAnimationFrame(loop); };
    loop();
    const on = () => { hovRef.current = true; setHov(true); };
    const off = () => { hovRef.current = false; setHov(false); };
    const attach = () => document.querySelectorAll("a,button,[data-h]").forEach(el => { el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off); });
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });
    attach();
    window.addEventListener("mousemove", move);
    return () => { cancelAnimationFrame(r); window.removeEventListener("mousemove", move); obs.disconnect(); };
  }, []);

  return (<><div ref={dot} className="cursor-dot" /><div ref={ring} className={`cursor-ring${hov ? " hov" : ""}`} /></>);
}

// ─── NavBar ───────────────────────────────────────────────────────────────────
function NavBar({ frame, goTo }: { frame: number; goTo: (i: number) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(24px)", background: "rgba(5,5,7,.5)", borderBottom: "1px solid rgba(56,135,255,.06)" }}>
        <button data-h onClick={() => goTo(0)} className="fd" style={{ fontSize: "13px", letterSpacing: ".32em", fontWeight: 900, color: "white", background: "none", border: "none" }}>ADAPT</button>
        <div className="nav-links-desktop fb" style={{ display: "flex", gap: "36px" }}>
          {[["Pillars", 2], ["Solutions", 3], ["Work", 4], ["Process", 5], ["Contact", 7]].map(([n, i]) => (
            <button key={n} data-h onClick={() => goTo(i as number)} style={{ fontSize: "11px", letterSpacing: ".18em", color: "rgba(255,255,255,.36)", background: "none", border: "none", transition: "color .3s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.36)")}>{n}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button data-h onClick={() => goTo(7)} className="fd desktop-only" style={{ fontSize: "10px", letterSpacing: ".22em", color: "rgba(56,135,255,.9)", background: "transparent", border: "1px solid rgba(56,135,255,.38)", padding: "9px 22px", fontWeight: 700, transition: "all .3s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,135,255,.1)"; e.currentTarget.style.borderColor = "rgba(56,135,255,.8)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(56,135,255,.38)"; }}>GET STARTED</button>
          <button data-h className="mob-show" onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", gap: "5px", padding: "4px" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: "22px", height: "1.5px", background: "white" }} />)}
          </button>
        </div>
        <div className="fm desktop-only" style={{ position: "absolute", bottom: "-28px", left: "50%", transform: "translateX(-50%)", fontSize: "11px", letterSpacing: ".4em", color: "rgba(130,180,255,.7)" }}>
          {String(frame + 1).padStart(2, "0")} / {FRAME_NAMES.length.toString().padStart(2, "0")} — {FRAME_NAMES[frame]}
        </div>
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mob-menu">
            <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "white", fontSize: "24px" }}>✕</button>
            {[["Pillars", 2], ["Solutions", 3], ["Work", 4], ["Process", 5], ["Contact", 7]].map(([n, i]) => (
              <button key={n} data-h onClick={() => { goTo(i as number); setMenuOpen(false); }} className="fd" style={{ fontSize: "clamp(30px,7.5vw,48px)", fontWeight: 900, color: "white", background: "none", border: "none", letterSpacing: "-.02em" }}>{n}</button>
            ))}
            <button data-h onClick={() => { goTo(7); setMenuOpen(false); }} className="fd" style={{ fontSize: "14px", letterSpacing: ".22em", color: "rgba(56,135,255,.9)", background: "rgba(56,135,255,.1)", border: "1px solid rgba(56,135,255,.4)", padding: "14px 36px", fontWeight: 700, marginTop: "16px" }}>GET STARTED</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Dot Nav ──────────────────────────────────────────────────────────────────
function DotNav({ frame, goTo }: { frame: number; goTo: (i: number) => void }) {
  return (
    <div className="desktop-only" style={{ position: "fixed", right: "30px", top: "50%", transform: "translateY(-50%)", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      {FRAME_NAMES.map((name, i) => <button key={i} data-h onClick={() => goTo(i)} className={`dot-nav-btn${frame === i ? " active" : ""}`} title={name} />)}
    </div>
  );
}

// ─── Marquee ─────────────────────────────────────────────────────────────────
function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(56,135,255,.08)", borderBottom: "1px solid rgba(56,135,255,.08)", padding: "13px 0", background: "rgba(8,4,20,.5)" }}>
      <div style={{ display: "flex", animation: "marquee 28s linear infinite", width: "max-content" }}>
        {items.map((t, i) => <span key={i} className="fm" style={{ fontSize: "10px", letterSpacing: ".3em", color: "rgba(56,135,255,.55)", marginRight: "40px", whiteSpace: "nowrap" }}>{t}</span>)}
      </div>
    </div>
  );
}

// ─── Frame 0: Hero ────────────────────────────────────────────────────────────
function HeroFrame({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 24px", position: "relative" }}>
      <div className="desktop-only" style={{ position: "absolute", width: "520px", height: "520px", borderRadius: "50%", border: "1px solid rgba(56,135,255,.06)", animation: "spinSlow 40s linear infinite", pointerEvents: "none" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => <div key={deg} style={{ position: "absolute", width: "5px", height: "5px", borderRadius: "50%", background: "rgba(56,135,255,.4)", top: "50%", left: "50%", transform: `rotate(${deg}deg) translateX(259px) translateY(-50%)` }} />)}
      </div>
      <div className="desktop-only" style={{ position: "absolute", width: "340px", height: "340px", borderRadius: "50%", border: "1px solid rgba(56,135,255,.04)", animation: "spinSlowRev 28s linear infinite", pointerEvents: "none" }} />

      <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "32px" }}>◆ ALL-IN-ONE EXECUTION SQUAD ◆</div>
        <h1 className="fd" style={{ fontSize: "clamp(60px,14vw,200px)", fontWeight: 900, lineHeight: .87, letterSpacing: "-.035em", color: "white", marginBottom: "36px" }}>
          WE BUILD<br />
          <span style={{ WebkitTextStroke: "2px rgba(56,135,255,.55)", WebkitTextFillColor: "transparent", display: "inline-block" }}>ADAPT.</span>
        </h1>
        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", justifyContent: "center" }}>
          <button data-h className="cta-glow fd" onClick={onNext} style={{ fontSize: "11px", letterSpacing: ".22em", color: "white", background: "rgba(56,135,255,.1)", border: "1px solid rgba(56,135,255,.55)", padding: "18px 48px", fontWeight: 700 }}>[ ESCAPE THE ORDINARY ]</button>
          <button data-h className="fb" onClick={onNext} style={{ fontSize: "11px", letterSpacing: ".1em", color: "rgba(255,255,255,.45)", background: "transparent", border: "1px solid rgba(255,255,255,.12)", padding: "18px 36px", fontWeight: 400, transition: "all .3s" }} onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(255,255,255,.3)"; }} onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; }}>See Our Work ↓</button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }} style={{ position: "absolute", bottom: "36px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <span className="fm" style={{ fontSize: "10px", letterSpacing: ".38em", color: "rgba(255,255,255,.22)" }}>SCROLL</span>
        <div style={{ width: "1px", height: "52px", background: "rgba(56,135,255,.5)", animation: "slideBar 2s ease-in-out infinite" }} />
      </motion.div>
    </div>
  );
}

// ─── Frame 1: Manifesto ───────────────────────────────────────────────────────
function ManifestoFrame({ active }: { active: boolean }) {
  const [idx, setIdx] = useState(-1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (active) { setIdx(-1); setTimeout(() => { timer.current = setInterval(() => { setIdx(p => { if (p >= ULTIMATUM_WORDS.length - 1) { clearInterval(timer.current!); return p; } return p + 1; }); }, 85); }, 300); }
    else { if (timer.current) clearInterval(timer.current); }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [active]);
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 52px", position: "relative" }}>
      <div className="fm" style={{ position: "absolute", top: "88px", left: "52px", fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)" }}>THE MANIFESTO</div>
      <div style={{ position: "absolute", left: "52px", top: "50%", transform: "translateY(-50%)", width: "2px", height: "120px", background: "linear-gradient(to bottom,transparent,rgba(56,135,255,.6),transparent)" }} />
      <div style={{ maxWidth: "900px" }}>
        <p className="fd" style={{ fontSize: "clamp(24px,3.5vw,50px)", fontWeight: 800, lineHeight: 1.45, letterSpacing: "-.01em" }}>
          {ULTIMATUM_WORDS.map((w, i) => (
            <span key={i} style={{ display: "inline-block", marginRight: ".28em", color: i <= idx ? "#fff" : "rgba(255,255,255,.06)", textShadow: i <= idx ? "0 0 28px rgba(56,135,255,.4)" : "none", transition: "color .3s ease, text-shadow .3s ease" }}>{w}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

// ─── Capability Card Visuals ──────────────────────────────────────────────────
function StrategyViz({ active }: { active: boolean }) {
  const bars = [35, 52, 41, 68, 55, 82, 90, 78, 100];
  return (
    <div style={{ height: "72px", display: "flex", alignItems: "flex-end", gap: "5px", padding: "0 4px" }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: "2px 2px 0 0",
          background: `linear-gradient(to top,rgba(56,135,255,.9),rgba(56,135,255,.3))`,
          height: `${h}%`, transformOrigin: "bottom",
          transform: active ? "scaleY(1)" : "scaleY(0)",
          transition: `transform 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 0.06}s`,
          boxShadow: active ? "0 0 8px rgba(56,135,255,.5)" : "none",
        }} />
      ))}
    </div>
  );
}

function SocialViz({ active }: { active: boolean }) {
  const items = [{ emoji: "▲", val: "18.2K", change: "+342%" }, { emoji: "❤", val: "6.4K", change: "+189%" }, { emoji: "◆", val: "2.1M", change: "reach" }];
  return (
    <div style={{ display: "flex", gap: "8px", height: "72px", alignItems: "center" }}>
      {items.map((it, i) => (
        <div key={i} style={{
          flex: 1, background: "rgba(96,165,250,.06)", border: "1px solid rgba(96,165,250,.2)",
          borderRadius: "6px", padding: "8px", display: "flex", flexDirection: "column", gap: "2px",
          opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(12px)",
          transition: `all 0.5s cubic-bezier(0.23,1,0.32,1) ${i * 0.1}s`,
        }}>
          <span style={{ fontSize: "11px", color: "rgba(96,165,250,.8)" }}>{it.emoji}</span>
          <span className="fd" style={{ fontSize: "13px", fontWeight: 800, color: "white", lineHeight: 1 }}>{it.val}</span>
          <span className="fm" style={{ fontSize: "9px", color: "rgba(96,165,250,.6)", letterSpacing: ".1em" }}>{it.change}</span>
        </div>
      ))}
    </div>
  );
}

function VisualsViz({ active }: { active: boolean }) {
  return (
    <div style={{ height: "72px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ position: "relative", width: "72px", height: "72px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,rgba(255,220,255,.95),rgba(200,80,200,.7),rgba(140,40,180,.5))", boxShadow: active ? "0 0 40px rgba(244,114,182,.5),0 0 80px rgba(244,114,182,.2)" : "0 4px 20px rgba(0,0,0,.4)", transition: "box-shadow 0.6s ease", animation: active ? "float 4s ease-in-out infinite" : "none" }} />
        {active && [0, 1, 2].map(i => <div key={i} style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: "1px solid rgba(244,114,182,.3)", animation: `ripple 2.4s ease-out ${i * 0.8}s infinite` }} />)}
      </div>
    </div>
  );
}

function DigitalViz({ active }: { active: boolean }) {
  const lines = [
    { t: "$ build --turbo", c: "rgba(52,211,153,.9)" },
    { t: "> compiling modules…", c: "rgba(255,255,255,.4)" },
    { t: "> optimising assets…", c: "rgba(255,255,255,.4)" },
    { t: "✓ 99.2kB  0.74s", c: "rgba(52,211,153,.9)" },
  ];
  return (
    <div style={{ height: "72px", background: "rgba(0,0,0,.6)", borderRadius: "4px", border: "1px solid rgba(52,211,153,.2)", padding: "8px 10px", overflow: "hidden", position: "relative" }}>
      {lines.map((l, i) => (
        <div key={i} className="fm" style={{ fontSize: "11px", color: l.c, marginBottom: "4px", letterSpacing: ".03em", opacity: active ? 1 : 0, transform: active ? "none" : `translateY(${i * 4}px)`, transition: `all 0.35s ease ${i * 0.1}s` }}>{l.t}</div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, height: "1px", background: "rgba(52,211,153,.4)", animation: active ? "scanUp 2.5s linear infinite" : "none", opacity: active ? 1 : 0 }} />
    </div>
  );
}

function StreetsViz({ active }: { active: boolean }) {
  const pins = [{ x: 20, y: 55 }, { x: 45, y: 30 }, { x: 65, y: 50 }, { x: 80, y: 20 }, { x: 35, y: 65 }];
  return (
    <div style={{ height: "72px", position: "relative", overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 100 72" style={{ position: "absolute", inset: 0 }}>
        <path d="M0,36 Q25,20 50,36 T100,36" fill="none" stroke="rgba(251,146,60,.15)" strokeWidth="1" />
        <path d="M0,50 Q30,30 60,45 T100,30" fill="none" stroke="rgba(251,146,60,.1)" strokeWidth="1" />
        {pins.map((p, i) => (
          <g key={i} style={{ opacity: active ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.12}s` }}>
            <circle cx={p.x} cy={p.y} r="4" fill="rgba(251,146,60,.9)" />
            <circle cx={p.x} cy={p.y} r="4" fill="transparent" stroke="rgba(251,146,60,.4)" strokeWidth="2" style={{ animation: active ? `ripple 2s ease-out ${i * 0.3}s infinite` : "none" }} />
          </g>
        ))}
      </svg>
    </div>
  );
}

const CAP_VIZZES = [StrategyViz, SocialViz, VisualsViz, DigitalViz, StreetsViz];

// ─── useMobile hook ───────────────────────────────────────────────────────────
function useMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 769);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 769);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

// ─── MobileCarousel ───────────────────────────────────────────────────────────
function MobileCarousel<T>({ items, renderItem, autoInterval = 3500, perSlide = 2 }: {
  items: T[];
  renderItem: (item: T, globalIdx: number) => React.ReactNode;
  autoInterval?: number;
  perSlide?: number;
}) {
  // Chunk into slides
  const slides: T[][] = [];
  for (let i = 0; i < items.length; i += perSlide) slides.push(items.slice(i, i + perSlide));

  const [sIdx, setSIdx] = useState(0);
  const startX = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => {
    setSIdx((i + slides.length) % slides.length);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setSIdx(p => (p + 1) % slides.length), autoInterval);
  }, [slides.length, autoInterval]);

  useEffect(() => {
    timer.current = setInterval(() => setSIdx(p => (p + 1) % slides.length), autoInterval);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [slides.length, autoInterval]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <div
        onTouchStart={e => { startX.current = e.touches[0].clientX; }}
        onTouchEnd={e => { const dx = startX.current - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) dx > 0 ? go(sIdx + 1) : go(sIdx - 1); }}
        style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={sIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: "6px" }}
          >
            {slides[sIdx].map((item, i) => (
              <div key={i} style={{ flex: "0 0 calc(50% - 3px)", minHeight: 0, overflow: "hidden" }}>
                {renderItem(item, sIdx * perSlide + i)}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Slide dots */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "10px 0 2px", flexShrink: 0 }}>
        {slides.map((_, i) => (
          <div key={i} onClick={() => go(i)} data-h style={{
            width: sIdx === i ? "22px" : "6px", height: "6px", borderRadius: "3px",
            background: sIdx === i ? "rgba(56,135,255,.9)" : "rgba(255,255,255,.2)",
            transition: "all .35s ease", cursor: "pointer",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Frame 2: Capabilities ────────────────────────────────────────────────────
function CapCard({ c, active, hov, onHov }: { c: typeof CAPS[0]; active: boolean; hov: boolean; onHov: (v: boolean) => void }) {
  const Viz = CAP_VIZZES[CAPS.indexOf(c)];
  return (
    <div
      className="cap-card"
      data-h
      style={{ background: c.grad, border: `1px solid ${c.accent}28`, padding: "24px", display: "flex", flexDirection: "column", gap: "14px", height: "100%", position: "relative" }}
      onMouseEnter={() => onHov(true)}
      onMouseLeave={() => onHov(false)}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right,${c.accent},transparent)`, opacity: hov ? 1 : 0.5, transition: "opacity .4s" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="fm" style={{ fontSize: "11px", letterSpacing: ".3em", color: c.accent, opacity: .7 }}>{c.num}</span>
        <span style={{ fontSize: "18px", color: c.accent, opacity: hov ? 1 : .4, transition: "opacity .4s, transform .4s", transform: hov ? "scale(1.2)" : "scale(1)" }}>{c.icon}</span>
      </div>
      <Viz active={active} />
      <div>
        <div className="fm" style={{ fontSize: "10px", letterSpacing: ".22em", color: c.accent, opacity: .6, marginBottom: "6px" }}>{c.cat}</div>
        <h3 className="fd" style={{ fontSize: "clamp(17px,1.7vw,21px)", fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: "8px", letterSpacing: "-.01em" }}>{c.title}</h3>
        <p className="fb" style={{ fontSize: "13px", color: "rgba(255,255,255,.42)", lineHeight: 1.65, fontWeight: 300 }}>{c.copy}</p>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: `linear-gradient(to top,${c.accent}18,transparent)`, opacity: hov ? 1 : 0, transition: "opacity .4s", pointerEvents: "none" }} />
    </div>
  );
}

function CapabilitiesFrame({ active }: { active: boolean }) {
  const [hov, setHov] = useState(-1);
  const mobile = useMobile();

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", flexWrap: "wrap", gap: "12px", flexShrink: 0 }}>
      <div>
        <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "10px" }}>CAPABILITIES</div>
        <h2 className="fd" style={{ fontSize: "clamp(30px,5vw,64px)", fontWeight: 900, color: "white", lineHeight: .93, letterSpacing: "-.025em" }}>
          EVERY WEAPON.<br />ONE ARSENAL.
        </h2>
      </div>
      {!mobile && <p className="fb" style={{ fontSize: "12px", color: "rgba(255,255,255,.3)", maxWidth: "180px", lineHeight: 1.8, textAlign: "right", fontWeight: 300 }}>Five disciplines. Zero compromise. Maximum market penetration.</p>}
    </div>
  );

  if (mobile) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "80px 20px 16px" }}>
        {header}
        <MobileCarousel
          items={CAPS}
          autoInterval={3500}
          renderItem={(c, i) => (
            <div style={{ padding: "4px 2px", height: "100%" }}>
              <CapCard c={c} active={active} hov={false} onHov={() => {}} />
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "88px 48px 32px" }}>
      {header}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: "2px", flex: 1, minHeight: 0 }}>
        {CAPS.map((c, i) => (
          <motion.div key={c.num} initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0 }} animate={active ? { x: 0, opacity: 1 } : { x: i % 2 === 0 ? -60 : 60, opacity: 0 }} transition={{ duration: 0.65, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} style={{ position: "relative" }}>
            <CapCard c={c} active={active} hov={hov === i} onHov={v => setHov(v ? i : -1)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Work Card Visuals ────────────────────────────────────────────────────────
function ChartViz({ accent }: { accent: string }) {
  const bars = [28, 35, 42, 55, 48, 72, 68, 85, 100];
  return (
    <div style={{ height: "64px", display: "flex", alignItems: "flex-end", gap: "4px", padding: "4px 0" }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(to top,${accent},${accent}44)`, borderRadius: "2px 2px 0 0", transformOrigin: "bottom", animation: `barRise 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 0.07}s both` }} />
      ))}
    </div>
  );
}

function CodeViz({ accent }: { accent: string }) {
  const lines = [
    { t: "const ui = buildDashboard()", w: "80%" },
    { t: "→ revenue: $4,200,000", w: "70%", highlight: true },
    { t: "→ conversion: +89%", w: "65%", highlight: true },
    { t: "→ loadTime: 0.4s", w: "55%" },
  ];
  return (
    <div style={{ background: "rgba(0,0,0,.5)", borderRadius: "4px", padding: "8px 10px", border: `1px solid ${accent}30`, height: "64px", overflow: "hidden" }}>
      {lines.map((l, i) => (
        <div key={i} className="fm" style={{ fontSize: "10px", color: l.highlight ? accent : "rgba(255,255,255,.35)", letterSpacing: ".03em", marginBottom: "3px", animation: `fadeUp 0.4s ease ${i * 0.1}s both`, width: l.w }}>{l.t}</div>
      ))}
    </div>
  );
}

function MapViz({ accent }: { accent: string }) {
  const pins = [{ x: "15%", y: "30%" }, { x: "35%", y: "60%" }, { x: "55%", y: "20%" }, { x: "70%", y: "50%" }, { x: "85%", y: "35%" }];
  return (
    <div style={{ height: "64px", position: "relative", background: "rgba(0,0,0,.3)", borderRadius: "4px", overflow: "hidden" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <path d="M10,45 Q30,20 60,35 T100%,25" fill="none" stroke={`${accent}25`} strokeWidth="1.5" />
      </svg>
      {pins.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: "8px", height: "8px", borderRadius: "50%", background: accent, transform: "translate(-50%,-50%)", boxShadow: `0 0 8px ${accent}80`, animation: `fadeUp 0.4s ease ${i * 0.12}s both` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${accent}60`, animation: `ripple 2s ease-out ${i * 0.4}s infinite` }} />
        </div>
      ))}
    </div>
  );
}

function FilmViz({ accent }: { accent: string }) {
  return (
    <div style={{ height: "64px", display: "flex", gap: "3px", overflow: "hidden", borderRadius: "4px" }}>
      {[100, 60, 90, 45, 80, 70].map((op, i) => (
        <div key={i} style={{ flex: 1, background: `rgba(0,0,0,.7)`, border: `1px solid ${accent}${Math.floor(op / 100 * 80).toString(16).padStart(2, "0")}`, borderRadius: "2px", position: "relative", animation: `fadeUp 0.4s ease ${i * 0.08}s both`, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${accent}18,transparent)` }} />
          <div style={{ position: "absolute", top: "4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: `${accent}80` }} />
          <div style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: `${accent}80` }} />
        </div>
      ))}
    </div>
  );
}

function ArcViz({ accent }: { accent: string }) {
  // glowing ramp / arched growth curve with staggered data points
  const pts = [[40, 96], [95, 70], [150, 50], [205, 36], [262, 22]];
  return (
    <div style={{ height: "64px" }}>
      <svg width="100%" height="100%" viewBox="0 0 300 110" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
        <path d="M16,108 Q150,-26 286,108" fill="none" stroke={`${accent}26`} strokeWidth="1" />
        <path d="M16,108 Q150,-26 286,108" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="430" strokeDashoffset="430" style={{ filter: `drop-shadow(0 0 5px ${accent})`, animation: "drawPath 1.1s ease forwards" }} />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={accent} style={{ opacity: 0, filter: `drop-shadow(0 0 5px ${accent})`, animation: `fadeScale .3s ease ${0.3 + i * 0.15}s forwards` }} />
        ))}
      </svg>
    </div>
  );
}

function PulseViz({ accent }: { accent: string }) {
  // heartbeat / sine wave transitioning into an upward arrow
  return (
    <div style={{ height: "64px" }}>
      <svg width="100%" height="100%" viewBox="0 0 300 90" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
        <path d="M6,52 L46,52 L60,52 L70,26 L84,72 L98,40 L110,52 L150,52 L168,52 L210,16 L268,16"
          fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="520" strokeDashoffset="520" style={{ filter: `drop-shadow(0 0 5px ${accent})`, animation: "drawPath 1.3s ease forwards" }} />
        {/* arrow head */}
        <path d="M250,8 L270,14 L256,28" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0, filter: `drop-shadow(0 0 5px ${accent})`, animation: "fadeScale .3s ease 1.15s forwards" }} />
      </svg>
    </div>
  );
}

// ─── Frame 3: Work ────────────────────────────────────────────────────────────
function WorkCard({ p, hov, onHov }: { p: typeof PROJECTS[0]; hov: boolean; onHov: (v: boolean) => void }) {
  const vizMap: Record<string, () => JSX.Element> = {
    chart: () => <ChartViz accent={p.accent} />,
    code:  () => <CodeViz accent={p.accent} />,
    map:   () => <MapViz accent={p.accent} />,
    film:  () => <FilmViz accent={p.accent} />,
    arc:   () => <ArcViz accent={p.accent} />,
    pulse: () => <PulseViz accent={p.accent} />,
  };
  return (
    <div
      data-h
      style={{ background: p.grad, border: `1px solid ${p.accent}20`, borderRadius: "2px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", height: "100%", position: "relative", overflow: "hidden", cursor: "pointer", transition: "transform .4s", transform: hov ? "scale(1.012)" : "scale(1)" }}
      onMouseEnter={() => onHov(true)}
      onMouseLeave={() => onHov(false)}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(to right,${p.accent},transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="fm" style={{ fontSize: "11px", letterSpacing: ".3em", color: p.accent, opacity: .7 }}>{p.id}</span>
        <span className="fm" style={{ fontSize: "9px", letterSpacing: ".16em", color: p.accent, opacity: .6, border: `1px solid ${p.accent}40`, padding: "3px 8px" }}>{p.sector}</span>
      </div>
      {vizMap[p.type]()}
      <div>
        <div className="fm" style={{ fontSize: "9px", letterSpacing: ".2em", color: "rgba(255,255,255,.3)", marginBottom: "6px" }}>{p.tag}</div>
        <h3 className="fd" style={{ fontSize: "clamp(15px,1.5vw,20px)", fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: "12px", letterSpacing: "-.01em" }}>{p.headline}</h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {p.stats.map((s, si) => (
            <div key={si}>
              <div className="fd" style={{ fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 900, color: p.accent, lineHeight: 1 }}>{s.v}</div>
              <div className="fm" style={{ fontSize: "9px", letterSpacing: ".18em", color: "rgba(255,255,255,.38)", marginTop: "2px" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, right: 0, width: "100px", height: "100px", background: `radial-gradient(circle at 100% 100%,${p.accent}22,transparent)`, opacity: hov ? 1 : 0, transition: "opacity .4s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: p.accent, transform: `scaleX(${hov ? 1 : 0})`, transformOrigin: "left", transition: "transform .5s cubic-bezier(.23,1,.32,1)" }} />
    </div>
  );
}

function WorkFrame({ active }: { active: boolean }) {
  const [hov, setHov] = useState(-1);
  const mobile = useMobile();

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px", flexWrap: "wrap", gap: "12px", flexShrink: 0 }}>
      <div>
        <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "10px" }}>SELECTED WORK</div>
        <h2 className="fd" style={{ fontSize: "clamp(30px,5vw,64px)", fontWeight: 900, color: "white", lineHeight: .93, letterSpacing: "-.025em" }}>PROOF OVER<br />PROMISES.</h2>
      </div>
      <div className="chip fm">47 BRANDS DOMINATED</div>
    </div>
  );

  if (mobile) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "80px 20px 16px" }}>
        {header}
        <MobileCarousel
          items={PROJECTS}
          autoInterval={4000}
          renderItem={(p) => (
            <div style={{ padding: "4px 2px", height: "100%" }}>
              <WorkCard p={p} hov={false} onHov={() => {}} />
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "88px 48px 32px" }}>
      {header}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "2px", flex: 1, minHeight: 0 }}>
        {PROJECTS.map((p, i) => (
          <motion.div key={p.id} initial={{ y: i < 2 ? -40 : 40, opacity: 0 }} animate={active ? { y: 0, opacity: 1 } : { y: i < 2 ? -40 : 40, opacity: 0 }} transition={{ duration: 0.65, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }} style={{ position: "relative" }}>
            <WorkCard p={p} hov={hov === i} onHov={v => setHov(v ? i : -1)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Particles ────────────────────────────────────────────────────────────────
function Particles({ count = 18 }: { count?: number }) {
  const pts = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
      dur: Math.random() * 6 + 5,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {pts.current.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: "50%",
          background: "rgba(56,135,255,.7)",
          animation: `particleDrift ${p.dur}s ease-in-out ${p.delay}s infinite`,
          opacity: p.opacity,
          boxShadow: "0 0 4px rgba(56,135,255,.4)",
        }} />
      ))}
    </div>
  );
}

// ─── Process per-step animated visual ─────────────────────────────────────────
function StepVisual({ step }: { step: number }) {
  const A = "#3887ff";
  // re-mounts on step change (key) so CSS animations replay
  if (step === 0) {
    // ARCHITECT — blueprint grid + drawing route + plotted nodes
    return (
      <svg width="100%" height="100%" viewBox="0 0 320 130" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }}>
        {[0, 26, 52, 78, 104, 130].map(y => <line key={"h" + y} x1="0" y1={y} x2="320" y2={y} stroke={`${A}1a`} strokeWidth=".5" />)}
        {[0, 53, 106, 160, 213, 266, 320].map(x => <line key={"v" + x} x1={x} y1="0" x2={x} y2="130" stroke={`${A}1a`} strokeWidth=".5" />)}
        <path d="M10,110 L80,80 L150,92 L215,40 L300,18" fill="none" stroke={A} strokeWidth="2.5"
          strokeDasharray="420" strokeDashoffset="420" style={{ filter: `drop-shadow(0 0 5px ${A})`, animation: "drawPath 1.1s ease forwards" }} />
        {[[10, 110], [80, 80], [150, 92], [215, 40], [300, 18]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={A} style={{ opacity: 0, filter: `drop-shadow(0 0 5px ${A})`, animation: `fadeScale .3s ease ${0.25 + i * 0.16}s forwards` }} />
        ))}
      </svg>
    );
  }
  if (step === 1) {
    // EXECUTE — parallel build bars rising + scan
    const bars = [44, 70, 56, 92, 64, 100, 80, 96];
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "10px", padding: "0 8px" }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: "26px", height: `${h}%`, borderRadius: "3px 3px 0 0",
            background: `linear-gradient(to top, ${A}, ${A}33)`, transformOrigin: "bottom",
            transform: "scaleY(0)", animation: `barRise .5s cubic-bezier(.23,1,.32,1) ${i * 0.07}s forwards`,
            boxShadow: `0 0 10px ${A}55` }} />
        ))}
      </div>
    );
  }
  // DOMINATE — expanding broadcast rings from a core
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: A, boxShadow: `0 0 24px ${A}`, position: "relative", zIndex: 2 }} />
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ position: "absolute", width: "44px", height: "44px", borderRadius: "50%", border: `2px solid ${A}`, animation: `ripple 1.8s ease-out ${i * 0.35}s infinite` }} />
      ))}
    </div>
  );
}

// ─── Frame 4: Process ─────────────────────────────────────────────────────────
function ProcessFrame({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const A = "rgba(56,135,255,";

  useEffect(() => {
    if (active && !paused) { timer.current = setInterval(() => setStep(p => (p + 1) % STEPS.length), 2000); }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [active, paused]);
  useEffect(() => { if (active) setStep(0); }, [active]);

  const s = STEPS[step];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(80px,11vh,96px) clamp(20px,5vw,56px) clamp(40px,7vh,56px)", position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Particles count={14} />

      {/* Label */}
      <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "clamp(20px,4vh,40px)", position: "relative", zIndex: 1 }}>THE PROCESS</div>

      {/* Stage */}
      <div style={{ position: "relative", zIndex: 1, width: "min(760px,100%)", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
        {/* Ghost numeral */}
        <div className="fd" aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.span key={step} initial={{ opacity: 0, scale: 1.3, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: "clamp(180px,38vw,420px)", fontWeight: 900, color: `${A}.05)`, letterSpacing: "-.06em", lineHeight: 1 }}>
              0{step + 1}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Text + visual */}
        <div style={{ position: "relative", textAlign: "center" }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -26 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <div style={{ fontSize: "clamp(26px,5vw,40px)", marginBottom: "8px" }}>{s.icon}</div>
              <div className="fm" style={{ fontSize: "11px", letterSpacing: ".34em", color: `${A}.75)`, marginBottom: "12px" }}>STEP {s.num}</div>
              <h3 className="fd" style={{ fontSize: "clamp(40px,8vw,92px)", fontWeight: 900, color: "white", letterSpacing: "-.03em", lineHeight: .95, marginBottom: "16px" }}>{s.title}</h3>
              <p className="fb" style={{ fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(255,255,255,.5)", lineHeight: 1.7, maxWidth: "440px", margin: "0 auto", fontWeight: 300 }}>{s.desc}</p>
            </motion.div>
          </AnimatePresence>

          {/* Animated visual band */}
          <div style={{ height: "clamp(90px,16vh,130px)", marginTop: "clamp(20px,4vh,36px)" }}>
            <StepVisual key={step} step={step} />
          </div>
        </div>
      </div>

      {/* Stepper progress (clickable) */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "10px", width: "min(420px,90%)", marginTop: "clamp(16px,3vh,28px)" }}>
        {STEPS.map((st, i) => (
          <button key={i} data-h onClick={() => setStep(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ height: "3px", borderRadius: "2px", background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "2px", background: `${A}1)`, boxShadow: `0 0 8px ${A}.6)`,
                width: step === i ? "100%" : step > i ? "100%" : "0%",
                transition: step === i && !paused ? "width 2s linear" : "width .3s ease" }} />
            </div>
            <span className="fm" style={{ fontSize: "10px", letterSpacing: ".18em", color: step === i ? "white" : "rgba(255,255,255,.35)", transition: "color .3s", textAlign: "left" }}>{st.num} {st.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Proof Visuals ────────────────────────────────────────────────────────────
function ProofStatViz({ idx }: { idx: number }) {
  const colors = ["rgba(56,135,255,1)", "rgba(52,211,153,1)", "rgba(96,165,250,1)", "rgba(251,146,60,1)"];
  const c = colors[idx];
  if (idx === 0) return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "40px" }}>
      {[50, 65, 75, 85, 70, 90, 100].map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(to top,${c},${c}44)`, borderRadius: "2px 2px 0 0", animation: `barRise 0.5s ease ${i * 0.06}s both` }} />
      ))}
    </div>
  );
  if (idx === 1) return (
    <svg width="100%" height="40" viewBox="0 0 120 40">
      <path d="M0,38 Q20,30 40,22 T80,8 T120,2" fill="none" stroke={c} strokeWidth="2.5" strokeDasharray="200" style={{ animation: "drawLine 1.2s ease both" }} />
      <circle cx="120" cy="2" r="4" fill={c} style={{ animation: "fadeUp .4s ease .8s both" }} />
    </svg>
  );
  if (idx === 2) return (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", height: "40px" }}>
      {[0, 1, 2].map(i => <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, boxShadow: `0 0 12px ${c}`, animation: `ripple 2s ease-out ${i * 0.5}s infinite` }} />)}
    </div>
  );
  return (
    <div style={{ height: "40px", background: "rgba(0,0,0,.4)", borderRadius: "4px", border: `1px solid ${c}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="fm" style={{ fontSize: "11px", color: c, letterSpacing: ".2em", animation: "fadeUp .4s ease both" }}>RATE: 100%</div>
    </div>
  );
}

// ─── Frame 5: Proof ───────────────────────────────────────────────────────────
function ProofFrame({ active }: { active: boolean }) {
  const [tIdx, setTIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (active) { timer.current = setInterval(() => setTIdx(p => (p + 1) % TESTIMONIALS.length), 4200); }
    else { if (timer.current) clearInterval(timer.current); }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [active]);

  const statColors = ["rgba(56,135,255,1)", "rgba(52,211,153,1)", "rgba(96,165,250,1)", "rgba(251,146,60,1)"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "clamp(80px,10vw,88px) clamp(20px,4vw,48px) clamp(20px,4vw,44px)", justifyContent: "space-between", position: "relative" }}>
      <Particles count={12} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "12px" }}>THE PROOF</div>
        <h2 className="fd" style={{ fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, color: "white", lineHeight: .93, letterSpacing: "-.025em" }}>
          RESULTS THAT<br />SPEAK FOR THEMSELVES.
        </h2>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        {BIG_STATS.map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 24 }} animate={active ? { opacity: 1, y: 0 } : {}} transition={{ duration: .7, delay: i * .1, ease: [.16, 1, .3, 1] }} style={{ flex: "1 1 130px", padding: "20px 22px", background: "rgba(8,8,16,.75)", border: `1px solid ${statColors[i]}20`, backdropFilter: "blur(16px)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right,${statColors[i]},transparent)` }} />
            {active && <ProofStatViz idx={i} />}
            <div className="fd" style={{ fontSize: "clamp(30px,3.5vw,48px)", fontWeight: 900, color: "white", lineHeight: 1, letterSpacing: "-.03em", marginTop: "8px" }}>{s.v}</div>
            <div className="fm" style={{ fontSize: "10px", letterSpacing: ".28em", color: statColors[i], opacity: .7, marginTop: "5px" }}>{s.l}</div>
          </motion.div>
        ))}
      </div>

      {/* Testimonial */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={tIdx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: .5, ease: [.16, 1, .3, 1] }} style={{ background: "rgba(8,8,16,.8)", border: "1px solid rgba(56,135,255,.14)", backdropFilter: "blur(20px)", padding: "28px 32px", borderRadius: "2px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,rgba(56,135,255,.6),transparent)" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "2px", background: "linear-gradient(to bottom,rgba(56,135,255,.6),transparent)" }} />
            <div style={{ fontSize: "32px", color: "rgba(56,135,255,.4)", lineHeight: 1, marginBottom: "12px" }}>"</div>
            <p className="fb" style={{ fontSize: "clamp(14px,1.4vw,18px)", color: "rgba(255,255,255,.82)", lineHeight: 1.7, fontWeight: 300, marginBottom: "20px", fontStyle: "italic" }}>
              {TESTIMONIALS[tIdx].quote}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div className="fb" style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,.6)" }}>{TESTIMONIALS[tIdx].author.split(",")[0]}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "center" }}>
          {TESTIMONIALS.map((_, i) => <div key={i} onClick={() => setTIdx(i)} data-h style={{ width: tIdx === i ? "24px" : "6px", height: "6px", borderRadius: "3px", background: tIdx === i ? "rgba(56,135,255,.9)" : "rgba(255,255,255,.2)", transition: "all .4s ease", cursor: "pointer" }} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Frame 6: Contact ─────────────────────────────────────────────────────────
function ContactFrame() {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState("");
  const [picks, setPicks] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const toggle = (c: string) => setPicks(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const submit = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("https://formsubmit.co/ajax/contact@adaptdo.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `New ADAPT enquiry — ${brand || "Unknown brand"}`,
          Brand: brand,
          "Looking for": picks.length ? picks.join(", ") : "Not specified",
          Email: email,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setDone(true);
    } catch {
      setError("Something went wrong — email us directly at contact@adaptdo.com");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "88px 48px 40px", overflow: "hidden auto", position: "relative" }}>
      <Particles count={10} />
      <div className="contact-layout" style={{ display: "flex", gap: "64px", flex: 1, position: "relative", zIndex: 1 }}>
        {/* Left */}
        <div style={{ flex: "0 0 auto", maxWidth: "400px" }}>
          <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "18px" }}>LET'S BUILD</div>
          <h2 className="fd" style={{ fontSize: "clamp(40px,6.5vw,88px)", fontWeight: 900, color: "white", lineHeight: .88, letterSpacing: "-.035em", marginBottom: "28px" }}>
            WANT TO MAKE<br />
            <span style={{ WebkitTextStroke: "2px rgba(56,135,255,.48)", WebkitTextFillColor: "transparent" }}>THEM JEALOUS?</span>
          </h2>
          <p className="fb" style={{ fontSize: "14px", color: "rgba(255,255,255,.38)", lineHeight: 1.75, fontWeight: 300, maxWidth: "300px", marginBottom: "36px" }}>
            Tell us about your brand. We'll tell you exactly how we'll make it undeniable.
          </p>
          {[{ l: "EMAIL", v: "contact@adaptdo.com" }, { l: "ADDRESS", v: "Colombo, Sri Lanka" }].map(c => (
            <div key={c.l} style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "10px" }}>
              <span className="fm" style={{ fontSize: "10px", letterSpacing: ".24em", color: "rgba(130,180,255,.9)", width: "78px" }}>{c.l}</span>
              <span className="fb" style={{ fontSize: "13px", color: "rgba(255,255,255,.48)", fontWeight: 300 }}>{c.v}</span>
            </div>
          ))}
        </div>

        {/* Right */}
        <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "500px" }}>
          {!done ? (
            <>
              <div style={{ display: "flex", gap: "6px", marginBottom: "36px" }}>
                {[0, 1, 2].map(i => <div key={i} style={{ flex: 1, height: "2px", borderRadius: "1px", background: step > i ? "rgba(56,135,255,1)" : step === i ? "rgba(56,135,255,.4)" : "rgba(255,255,255,.08)", boxShadow: step > i ? "0 0 8px rgba(56,135,255,.7)" : "none", transition: "all .5s ease" }} />)}
              </div>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .4 }}>
                    <div className="fm" style={{ fontSize: "14px", letterSpacing: ".22em", color: "rgba(140,185,255,1)", fontWeight: 700, marginBottom: "16px" }}>01 / BRAND NAME</div>
                    <input className="underline-input fd" style={{ fontSize: "clamp(20px,2.8vw,36px)" }} placeholder="Your Brand Name" value={brand} onChange={e => setBrand(e.target.value)} onKeyDown={e => e.key === "Enter" && brand.trim() && setStep(1)} autoFocus />
                    <button data-h onClick={() => brand.trim() && setStep(1)} className="fb" style={{ marginTop: "22px", fontSize: "10px", letterSpacing: ".28em", color: brand.trim() ? "rgba(56,135,255,.9)" : "rgba(255,255,255,.2)", background: "none", border: "none", transition: "color .3s", fontWeight: 500 }}>CONTINUE →</button>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .4 }}>
                    <div className="fm" style={{ fontSize: "14px", letterSpacing: ".22em", color: "rgba(140,185,255,1)", fontWeight: 700, marginBottom: "16px" }}>02 / WHAT DO YOU NEED?</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
                      {CHIPS_CONTACT.map(c => {
                        const on = picks.includes(c);
                        return <button key={c} data-h onClick={() => toggle(c)} className="fb" style={{ fontSize: "11px", letterSpacing: ".08em", color: on ? "white" : "rgba(255,255,255,.42)", background: on ? "rgba(56,135,255,.18)" : "transparent", border: `1px solid ${on ? "rgba(56,135,255,.75)" : "rgba(255,255,255,.14)"}`, padding: "10px 18px", boxShadow: on ? "0 0 18px rgba(56,135,255,.2)" : "none", transition: "all .3s", fontWeight: 500 }}>{c}</button>;
                      })}
                    </div>
                    <button data-h onClick={() => picks.length && setStep(2)} className="fb" style={{ fontSize: "10px", letterSpacing: ".28em", color: picks.length ? "rgba(56,135,255,.9)" : "rgba(255,255,255,.2)", background: "none", border: "none", transition: "color .3s", fontWeight: 500 }}>CONTINUE →</button>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .4 }}>
                    <div className="fm" style={{ fontSize: "14px", letterSpacing: ".22em", color: "rgba(140,185,255,1)", fontWeight: 700, marginBottom: "16px" }}>03 / YOUR EMAIL</div>
                    <input className="underline-input fd" type="email" style={{ fontSize: "clamp(18px,2.4vw,30px)", marginBottom: "24px", display: "block" }} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} autoFocus />
                    <button data-h className="cta-glow fd" onClick={submit} disabled={sending} style={{ fontSize: "11px", letterSpacing: ".22em", color: "white", background: "rgba(56,135,255,.12)", border: "1px solid rgba(56,135,255,.6)", padding: "16px 40px", fontWeight: 700, opacity: sending ? .6 : 1 }}>{sending ? "SENDING…" : "LAUNCH →"}</button>
                    {error && <p className="fb" style={{ marginTop: "16px", fontSize: "12px", color: "#ff7a7a", fontWeight: 400 }}>{error}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .6, ease: [.16, 1, .3, 1] }}>
              <div style={{ fontSize: "44px", marginBottom: "18px" }}>⚡</div>
              <h3 className="fd" style={{ fontSize: "clamp(26px,3.5vw,44px)", fontWeight: 900, color: "white", marginBottom: "12px", letterSpacing: "-.02em" }}>We'll be in touch.</h3>
              <p className="fb" style={{ fontSize: "15px", color: "rgba(255,255,255,.4)", lineHeight: 1.7, fontWeight: 300 }}>Get ready, <span style={{ color: "rgba(56,135,255,.9)", fontWeight: 600 }}>{brand}</span>. We're about to change everything.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="contact-footer" style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", position: "relative", zIndex: 1 }}>
        <span className="fd" style={{ fontSize: "17px", fontWeight: 900, color: "white", letterSpacing: "-.02em" }}>ADAPT</span>
        <p className="fb cf-tag" style={{ fontSize: "11px", color: "rgba(255,255,255,.24)", lineHeight: 1.6, maxWidth: "400px", textAlign: "center", fontWeight: 300 }}>⚡ Yeah, we designed and built this entire experience. Want yours this premium? You know what to do.</p>
        <span className="fm" style={{ fontSize: "11px", color: "rgba(255,255,255,.18)", letterSpacing: ".22em" }}>© 2026 ADAPT.CO</span>
      </div>
    </div>
  );
}

// ─── Frame 2: Content Pillars (editorial grid, hover-reveal) ──────────────────
function PillarTile({ p, active, idx }: { p: typeof PILLARS[0]; active: boolean; idx: number }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, filter: "blur(6px)" }}
      animate={active ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 36, filter: "blur(6px)" }}
      transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="pillar-card" data-h
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", height: "100%", minHeight: "150px", borderRadius: "5px", border: `1px solid ${p.accent}2e`, background: p.grad, overflow: "hidden", cursor: "pointer" }}
    >
      {/* media glow */}
      <div className="pc-media" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 25%, ${p.accent}2e, transparent 62%)` }} />
      {/* number */}
      <div className="fm" style={{ position: "absolute", top: "16px", left: "18px", fontSize: "10px", letterSpacing: ".3em", color: p.accent, zIndex: 2 }}>{p.num}</div>
      <div className="fm pc-cta" style={{ position: "absolute", top: "16px", right: "18px", fontSize: "10px", letterSpacing: ".2em", color: "white", border: `1px solid ${p.accent}`, padding: "5px 10px", zIndex: 2 }}>DETAIL</div>

      {/* base title */}
      <div style={{ position: "absolute", left: "18px", right: "18px", bottom: "18px", zIndex: 1 }}>
        <div className="fm" style={{ fontSize: "11px", letterSpacing: ".22em", color: p.accent, marginBottom: "8px", opacity: hov ? 0 : 1, transition: "opacity .3s" }}>{p.tagline.toUpperCase()}</div>
        <h3 className="fd" style={{ fontSize: "clamp(19px,1.9vw,26px)", fontWeight: 800, color: "white", lineHeight: 1.05, letterSpacing: "-.02em" }}>{p.title}</h3>
      </div>

      {/* hover-reveal detail */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3,
        background: "linear-gradient(to top, rgba(8,5,3,.96) 30%, rgba(8,5,3,.7) 70%, transparent)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "20px 18px",
        opacity: hov ? 1 : 0, transform: hov ? "translateY(0)" : "translateY(14px)",
        transition: "opacity .45s ease, transform .45s cubic-bezier(.23,1,.32,1)", pointerEvents: "none",
      }}>
        <h3 className="fd" style={{ fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 800, color: "white", marginBottom: "12px", letterSpacing: "-.02em" }}>{p.title}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
          {p.deep.deliverables.map((d, i) => (
            <div key={d} className="fb" style={{ fontSize: "11.5px", color: "rgba(255,255,255,.72)", display: "flex", gap: "9px", alignItems: "center", transform: hov ? "translateX(0)" : "translateX(-8px)", opacity: hov ? 1 : 0, transition: `all .4s ease ${0.06 * i + 0.1}s` }}>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: p.accent, flexShrink: 0 }} />{d}
            </div>
          ))}
        </div>
        <div className="fm" style={{ fontSize: "11px", letterSpacing: ".06em", color: p.accent, lineHeight: 1.5 }}>↳ {p.deep.outcome}</div>
      </div>
    </motion.div>
  );
}

function PillarsFrame({ active }: { active: boolean }) {
  const mobile = useMobile();
  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px", flexWrap: "wrap", gap: "12px", flexShrink: 0 }}>
      <div>
        <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "10px" }}>THE CREATIVE FLOOR</div>
        <h2 className="fd" style={{ fontSize: "clamp(32px,5.2vw,68px)", fontWeight: 900, color: "white", lineHeight: .96, letterSpacing: "-.03em" }}>Content Pillars</h2>
      </div>
      {!mobile && <p className="fb" style={{ fontSize: "12px", color: "rgba(255,255,255,.32)", maxWidth: "210px", lineHeight: 1.8, textAlign: "right", fontWeight: 300 }}>Editorial, high-fashion content that makes your brand impossible to scroll past. <span style={{ color: "#3887ff" }}>Hover to look inside.</span></p>}
    </div>
  );

  if (mobile) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "80px 20px 16px" }}>
        {header}
        <MobileCarousel items={PILLARS} perSlide={2} autoInterval={4000}
          renderItem={(p, i) => <div style={{ height: "100%" }}><PillarTile p={p} active={active} idx={i % 2} /></div>} />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "88px 48px 32px" }}>
      {header}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "repeat(2,1fr)", gap: "10px", minHeight: 0 }}>
        {PILLARS.map((p, i) => <PillarTile key={p.id} p={p} active={active} idx={i} />)}
      </div>
    </div>
  );
}

// ─── Frame 3: Marketing Solutions (interactive index) ─────────────────────────
function SolutionsFrame({ active }: { active: boolean }) {
  const mobile = useMobile();
  const [sel, setSel] = useState(0);
  const [paused, setPaused] = useState(false);
  const accent = "#8b9fe8";
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active && !paused && !mobile) {
      timer.current = setInterval(() => setSel(p => (p + 1) % SOLUTIONS.length), 3600);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [active, paused, mobile]);

  const header = (
    <div style={{ marginBottom: "18px", flexShrink: 0 }}>
      <div className="fm" style={{ fontSize: "15px", letterSpacing: ".26em", color: "rgba(140,185,255,1)", marginBottom: "10px" }}>THE STRATEGY ROOM</div>
      <h2 className="fd" style={{ fontSize: "clamp(32px,5.2vw,68px)", fontWeight: 900, color: "white", lineHeight: .94, letterSpacing: "-.03em" }}>Marketing Solutions</h2>
    </div>
  );

  if (mobile) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "80px 20px 16px" }}>
        {header}
        <MobileCarousel items={SOLUTIONS} perSlide={2} autoInterval={4200}
          renderItem={(s) => (
            <div style={{ height: "100%", background: s.flagship ? "linear-gradient(135deg,rgba(139,159,232,.16),rgba(20,28,60,.5))" : "rgba(255,255,255,.025)", border: `1px solid ${s.flagship ? accent + "80" : "rgba(255,255,255,.08)"}`, borderRadius: "5px", padding: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="fm" style={{ fontSize: "11px", letterSpacing: ".3em", color: accent }}>{s.num}</span>
                <span className="fm" style={{ fontSize: "10px", letterSpacing: ".2em", color: s.flagship ? accent : "rgba(255,255,255,.3)" }}>{s.cat}{s.flagship ? " ★" : ""}</span>
              </div>
              <h3 className="fd" style={{ fontSize: "17px", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: "-.02em" }}>{s.title}</h3>
              <p className="fb" style={{ fontSize: "12.5px", color: "rgba(255,255,255,.5)", lineHeight: 1.55, fontWeight: 300 }}>{s.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
                {(s.flagship ? s.phases.map((ph: any) => ph.label) : s.deliverables).slice(0, 4).map((d: string) => (
                  <span key={d} className="fm" style={{ fontSize: "10px", letterSpacing: ".08em", color: "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.1)", padding: "4px 8px", borderRadius: "2px" }}>{d}</span>
                ))}
              </div>
            </div>
          )} />
      </div>
    );
  }

  const s = SOLUTIONS[sel];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "88px 48px 32px" }}>
      {header}
      <div style={{ flex: 1, display: "flex", gap: "20px", minHeight: 0 }}>
        {/* Index list */}
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          style={{ flex: "0 0 38%", display: "flex", flexDirection: "column", gap: "1px", overflow: "hidden auto" }}>
          {SOLUTIONS.map((it, i) => {
            const on = sel === i;
            return (
              <button key={it.id} data-h onMouseEnter={() => setSel(i)} onClick={() => setSel(i)}
                style={{ textAlign: "left", background: on ? `${accent}14` : "transparent", border: "none", borderLeft: `2px solid ${on ? accent : "transparent"}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", transition: "background .3s, border-color .3s" }}>
                <span className="fm" style={{ fontSize: "11px", letterSpacing: ".2em", color: on ? accent : "rgba(255,255,255,.3)", transition: "color .3s" }}>{it.num}</span>
                <span className="fd" style={{ fontSize: "clamp(14px,1.3vw,17px)", fontWeight: on ? 800 : 500, color: on ? "white" : "rgba(255,255,255,.45)", letterSpacing: "-.01em", transition: "all .3s", display: "flex", alignItems: "center", gap: "8px" }}>
                  {it.title}{it.flagship && <span style={{ fontSize: "11px", color: accent }}>★</span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, background: "rgba(255,255,255,.025)", border: `1px solid ${accent}26`, borderRadius: "6px", padding: "28px 30px", position: "relative", overflow: "hidden auto" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "180px", height: "180px", background: `radial-gradient(circle at 100% 0%, ${accent}1f, transparent 65%)`, pointerEvents: "none" }} />
          <AnimatePresence mode="wait">
            <motion.div key={sel} initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: .45, ease: [.16, 1, .3, 1] }} style={{ position: "relative" }}>
              <div className="fm" style={{ fontSize: "11px", letterSpacing: ".3em", color: accent, marginBottom: "12px" }}>{s.num} · {s.cat}</div>
              <h3 className="fd" style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 900, color: "white", lineHeight: 1.02, letterSpacing: "-.03em", marginBottom: "12px" }}>{s.title}</h3>
              <p className="fb" style={{ fontSize: "15px", color: "rgba(255,255,255,.55)", lineHeight: 1.6, fontWeight: 300, marginBottom: "24px", maxWidth: "520px" }}>{s.desc}</p>

              {s.flagship ? (
                <FlagshipTimeline phases={s.phases} accent={accent} />
              ) : (
                <>
                  <div className="fm" style={{ fontSize: "11px", letterSpacing: ".3em", color: "rgba(255,255,255,.4)", marginBottom: "14px" }}>WHAT YOU GET</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px", marginBottom: "24px" }}>
                    {s.deliverables.map((d, i) => (
                      <motion.div key={d} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: .4 }}
                        style={{ background: "rgba(0,0,0,.25)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "4px", padding: "12px 14px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <span className="fm" style={{ color: accent, fontSize: "10px", marginTop: "1px" }}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="fb" style={{ fontSize: "13px", color: "rgba(255,255,255,.8)", fontWeight: 300 }}>{d}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div style={{ borderLeft: `2px solid ${accent}`, paddingLeft: "16px" }}>
                    <div className="fm" style={{ fontSize: "10px", letterSpacing: ".3em", color: accent, marginBottom: "6px" }}>THE OUTCOME</div>
                    <p className="fd" style={{ fontSize: "clamp(16px,1.8vw,22px)", color: "white", fontWeight: 700, lineHeight: 1.3, letterSpacing: "-.01em" }}>{s.outcome}</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Flagship Phase Timeline ──────────────────────────────────────────────────
function FlagshipTimeline({ phases, accent }: { phases: any[]; accent: string }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ marginTop: "8px" }}>
      {/* Node track */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <div style={{ position: "absolute", top: "9px", left: "4%", right: "4%", height: "2px", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "absolute", top: "9px", left: "4%", height: "2px", width: `${(active / (phases.length - 1)) * 92}%`, background: accent, boxShadow: `0 0 10px ${accent}`, transition: "width .45s cubic-bezier(.23,1,.32,1)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {phases.map((p, i) => (
            <button key={p.key} data-h onClick={() => setActive(i)} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", flex: 1, cursor: "pointer" }}>
              <span style={{ width: i <= active ? "20px" : "15px", height: i <= active ? "20px" : "15px", borderRadius: "50%", background: i <= active ? accent : "rgba(255,255,255,.12)", border: `2px solid ${i <= active ? accent : "rgba(255,255,255,.2)"}`, boxShadow: i === active ? `0 0 16px ${accent}` : "none", transition: "all .4s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#0a0a12", fontWeight: 900 }}>{i < active ? "✓" : ""}</span>
              <span className="fm" style={{ fontSize: "9px", letterSpacing: ".1em", color: i === active ? "white" : "rgba(255,255,255,.4)", textAlign: "center", transition: "color .4s", maxWidth: "80px", lineHeight: 1.4 }}>{p.label.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Active phase detail */}
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .35, ease: [.16, 1, .3, 1] }}
          style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${accent}30`, borderRadius: "4px", padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
            <h4 className="fd" style={{ fontSize: "clamp(18px,2.2vw,26px)", fontWeight: 800, color: "white", letterSpacing: "-.02em" }}>{phases[active].label}</h4>
            <span className="fm" style={{ fontSize: "10px", letterSpacing: ".24em", color: accent }}>{active + 1}/{phases.length}</span>
          </div>
          <p className="fb" style={{ fontSize: "12.5px", color: "rgba(255,255,255,.5)", marginBottom: "14px", fontWeight: 300 }}>{phases[active].desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
            {phases[active].points.map((pt: string, i: number) => (
              <div key={pt} className="fb" style={{ fontSize: "11.5px", color: "rgba(255,255,255,.74)", display: "flex", gap: "9px", alignItems: "flex-start", background: "rgba(0,0,0,.25)", padding: "9px 11px", borderRadius: "3px", border: "1px solid rgba(255,255,255,.05)" }}>
                <span className="fm" style={{ color: accent, fontSize: "11px", marginTop: "1px" }}>{String(i + 1).padStart(2, "0")}</span>{pt}
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Transition variants ──────────────────────────────────────────────────────
const frameVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? "100vh" : "-100vh", opacity: 0, scale: 0.98 }),
  center: { y: 0, opacity: 1, scale: 1 },
  exit:  (dir: number) => ({ y: dir > 0 ? "-100vh" : "100vh", opacity: 0, scale: 0.98 }),
};
const frameTrans = { duration: 0.5, ease: [0.65, 0, 0.35, 1] };

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [frame, setFrame] = useState(0);
  const [dir, setDir] = useState(1);
  const lock = useRef(false);

  const goTo = useCallback((i: number) => {
    if (lock.current || i === frame || i < 0 || i >= FRAME_NAMES.length) return;
    lock.current = true;
    setDir(i > frame ? 1 : -1);
    setFrame(i);
    setTimeout(() => { lock.current = false; }, 560);
  }, [frame]);

  const goNext = useCallback(() => goTo(frame + 1), [frame, goTo]);
  const goPrev = useCallback(() => goTo(frame - 1), [frame, goTo]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if (Math.abs(e.deltaY) < 20) return; if (e.deltaY > 0) goNext(); else goPrev(); };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev]);

  useEffect(() => {
    let startY = 0, startX = 0;
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      const dx = startX - e.changedTouches[0].clientX;
      // Only switch frames when swipe is predominantly vertical
      if (Math.abs(dy) > Math.abs(dx) * 1.5 && Math.abs(dy) > 55) {
        if (dy > 0) goNext(); else goPrev();
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [goNext, goPrev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", " "].includes(e.key)) { e.preventDefault(); goNext(); }
      if (["ArrowUp", "ArrowLeft"].includes(e.key)) { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const frames = [
    <HeroFrame onNext={goNext} />,
    <ManifestoFrame active={frame === 1} />,
    <PillarsFrame active={frame === 2} />,
    <SolutionsFrame active={frame === 3} />,
    <WorkFrame active={frame === 4} />,
    <ProcessFrame active={frame === 5} />,
    <ProofFrame active={frame === 6} />,
    <ContactFrame />,
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <AnimatedBackground frame={frame} />
      <Cursor />
      <NavBar frame={frame} goTo={goTo} />
      <DotNav frame={frame} goTo={goTo} />

      {/* Marquee on hero */}
      <AnimatePresence>
        {frame <= 1 && (
          <motion.div key="mq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .4 }} style={{ position: "fixed", bottom: "72px", left: 0, right: 0, zIndex: 50 }}>
            <Marquee />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Frames — simultaneous transition, no blank gap */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", color: "white", zIndex: 1 }}>
        <AnimatePresence custom={dir}>
          <motion.div
            key={frame}
            custom={dir}
            variants={frameVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={frameTrans}
            style={{ position: "absolute", inset: 0, paddingTop: "68px", willChange: "transform, opacity" }}
          >
            {frames[frame]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, height: "2px", background: "rgba(255,255,255,.04)" }}>
        <motion.div animate={{ width: `${((frame + 1) / FRAME_NAMES.length) * 100}%` }} transition={frameTrans} style={{ height: "100%", background: "linear-gradient(to right,rgba(56,135,255,.5),rgba(56,135,255,1))", boxShadow: "0 0 8px rgba(56,135,255,.5)" }} />
      </div>

      {/* Mobile swipe hint */}
      <AnimatePresence>
        {frame === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 3 }} className="mob-show" style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 99, flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <span className="fm" style={{ fontSize: "10px", letterSpacing: ".36em", color: "rgba(255,255,255,.25)" }}>SWIPE UP</span>
            <div style={{ width: "1px", height: "28px", background: "rgba(56,135,255,.5)", animation: "slideBar 2s ease-in-out infinite" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

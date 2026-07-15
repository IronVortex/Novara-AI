import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "../../constants/index.js";
import {
  IconMessageSquare,
  IconVolumeUp,
  IconUpload,
  IconSearch,
  IconCode,
  IconZap,
  IconSparkle,
  IconArrowLeft,
} from "../../components/common/Icons.jsx";
import "./landing.css";

const FEATURES = [
  {
    icon: <IconMessageSquare size={22} />,
    title: "Instant clarity",
    copy: "Ask anything and get structured answers with markdown, code, math, and tables — rendered beautifully.",
  },
  {
    icon: <IconSearch size={22} />,
    title: "Workspace memory",
    copy: "Keep threads organized with search, pins, and optional cloud sync when you sign in.",
  },
  {
    icon: <IconVolumeUp size={22} />,
    title: "Voice-native",
    copy: "Dictate prompts and listen to responses with built-in speech tools. No API key required.",
  },
  {
    icon: <IconUpload size={22} />,
    title: "Document context",
    copy: "Upload PDFs, DOCX, text, and images to ground the conversation in your own content.",
  },
  {
    icon: <IconCode size={22} />,
    title: "Code & math",
    copy: "Syntax-highlighted code blocks, Mermaid diagrams, and KaTeX math rendering out of the box.",
  },
  {
    icon: <IconZap size={22} />,
    title: "Streaming responses",
    copy: "Words appear as they're generated for a natural, real-time conversation experience.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Novara feels like a thinking partner, not another chatbot.",
    name: "Maya Chen",
    role: "Product Designer",
    initials: "MC",
  },
  {
    quote: "The workspace UI is calm and fast. Our team switched in a week.",
    name: "Jordan Blake",
    role: "Engineering Lead",
    initials: "JB",
  },
  {
    quote: "Guest mode meant we could try it instantly. Signed up after day one.",
    name: "Priya Nair",
    role: "Founder",
    initials: "PN",
  },
];

const FAQS = [
  {
    q: "Do I need an account to chat?",
    a: "No. You can start chatting immediately as a guest. Sign in only when you want cloud history sync across devices.",
  },
  {
    q: "Where is my chat history stored?",
    a: "Guest chats stay on your device via local storage. Signed-in chats sync to your private cloud workspace.",
  },
  {
    q: "Which AI models are supported?",
    a: "Groq is available today (Llama 3.1 and 3.3). The architecture is ready for OpenAI, Gemini, Claude, Mistral, and local Ollama models.",
  },
  {
    q: "Is Novara AI free?",
    a: "Yes — the core product is free. Premium plans with higher limits and team features are on the roadmap.",
  },
];

// Intersection Observer hook for scroll animations
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "" }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal-section ${className}`}>
      {children}
    </div>
  );
}

function LandingPage() {
  return (
    <div className="landing">
      {/* ── Navigation ──────────────────────────── */}
      <header className="landing-nav">
        <Link to="/" className="landing-brand" aria-label={`${APP_NAME} home`}>
          <div className="brand-mark">N</div>
          <span>{APP_NAME}</span>
        </Link>
        <nav className="landing-nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#testimonials">Reviews</a>
          <a href="#faq">FAQ</a>
          <Link to="/login">Sign in</Link>
          <Link to="/app" className="landing-cta-nav">
            Start free
          </Link>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="hero-orb hero-orb--1" />
          <div className="hero-orb hero-orb--2" />
          <div className="hero-orb hero-orb--3" />
        </div>

        <div className="landing-hero-copy">
          <div className="landing-eyebrow">
            <IconSparkle size={12} />
            Premium AI Workspace
          </div>
          <h1 className="landing-brand-hero">{APP_NAME}</h1>
          <p className="landing-tagline">{APP_TAGLINE}</p>
          <p className="landing-support">
            An elegant place to think, write, and build — without the noise of a generic chat clone.
            Start instantly, no account required.
          </p>
          <div className="landing-actions">
            <Link to="/app" className="btn-primary">
              <IconSparkle size={15} />
              Start chatting free
            </Link>
            <a href="#features" className="btn-ghost">
              See what's inside
            </a>
          </div>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="hero-glow" />
          <div className="hero-panel">
            <div className="hero-panel-top">
              <span className="hero-dot hero-dot--red" />
              <span className="hero-dot hero-dot--yellow" />
              <span className="hero-dot hero-dot--green" />
              <span className="hero-panel-title">Novara AI workspace</span>
            </div>
            <div className="hero-messages">
              <div className="hero-msg hero-msg--user">
                <div className="hero-msg-bubble">
                  Explain quantum entanglement simply
                </div>
              </div>
              <div className="hero-msg hero-msg--ai">
                <div className="hero-ai-avatar">N</div>
                <div className="hero-msg-bubble">
                  <div className="hero-line" style={{ width: "92%" }} />
                  <div className="hero-line" style={{ width: "78%" }} />
                  <div className="hero-line" style={{ width: "85%" }} />
                  <div className="hero-line" style={{ width: "55%" }} />
                </div>
              </div>
              <div className="hero-msg hero-msg--user">
                <div className="hero-msg-bubble" style={{ opacity: 0.7 }}>
                  Give me a Python example
                </div>
              </div>
              <div className="hero-msg hero-msg--ai hero-msg--typing">
                <div className="hero-ai-avatar">N</div>
                <div className="hero-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────── */}
      <div className="landing-stats">
        {[
          { value: "5", label: "AI Providers ready" },
          { value: "5", label: "Beautiful themes" },
          { value: "0", label: "Account required" },
          { value: "∞", label: "Conversations" },
        ].map((stat) => (
          <div key={stat.label} className="stat-item">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Features ────────────────────────────── */}
      <section id="features" className="landing-section">
        <RevealSection>
          <p className="landing-eyebrow" style={{ textAlign: "center" }}>
            <IconSparkle size={11} /> Capabilities
          </p>
          <h2 className="landing-section-title">Built for deep work</h2>
          <p className="section-lead">
            Everything you need in a modern AI workspace — nothing you don't.
          </p>
        </RevealSection>
        <div className="feature-grid">
          {FEATURES.map((feature, i) => (
            <RevealSection key={feature.title}>
              <article
                className="feature-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────── */}
      <section id="testimonials" className="landing-section">
        <RevealSection>
          <p className="landing-eyebrow" style={{ textAlign: "center" }}>
            <IconSparkle size={11} /> Reviews
          </p>
          <h2 className="landing-section-title">Loved by early teams</h2>
          <p className="section-lead">Placeholder testimonials — submit yours when you're in the beta.</p>
        </RevealSection>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((item) => (
            <RevealSection key={item.name}>
              <blockquote className="testimonial">
                <p>"{item.quote}"</p>
                <footer>
                  <div className="testimonial-avatar">{item.initials}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </footer>
              </blockquote>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section id="faq" className="landing-section">
        <RevealSection>
          <p className="landing-eyebrow" style={{ textAlign: "center" }}>
            <IconSparkle size={11} /> FAQ
          </p>
          <h2 className="landing-section-title">Common questions</h2>
        </RevealSection>
        <div className="faq-list">
          {FAQS.map((item) => (
            <RevealSection key={item.q}>
              <details className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────── */}
      <section className="landing-cta-banner">
        <RevealSection>
          <div className="cta-banner-glow" />
          <div className="brand-mark cta-banner-mark">N</div>
          <h2>Ready to think better?</h2>
          <p>Start for free — no account required. Upgrade when you're ready.</p>
          <Link to="/app" className="btn-primary cta-banner-btn">
            <IconSparkle size={15} />
            Open Novara AI
          </Link>
        </RevealSection>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="brand-mark" style={{ width: 32, height: 32, borderRadius: 10, fontSize: "0.9rem" }}>N</div>
          <div>
            <strong>{APP_NAME}</strong>
            <p>{APP_TAGLINE}</p>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/app">Workspace</Link>
          <Link to="/register">Create account</Link>
          <Link to="/login">Sign in</Link>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Novara AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;

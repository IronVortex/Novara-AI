import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "../../constants/index.js";
import "./landing.css";

const FEATURES = [
  {
    title: "Instant clarity",
    copy: "Ask anything and get structured answers with markdown, code, and tables.",
  },
  {
    title: "Workspace memory",
    copy: "Keep threads organized with search, pins, and cloud sync when you sign in.",
  },
  {
    title: "Voice-native",
    copy: "Dictate prompts and listen to responses with built-in speech tools.",
  },
  {
    title: "Document context",
    copy: "Upload PDFs, DOCX, text, and images to ground the conversation.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Novara feels like a thinking partner, not another chatbot.",
    name: "Maya Chen",
    role: "Product Designer",
  },
  {
    quote: "The workspace UI is calm and fast. Our team switched in a week.",
    name: "Jordan Blake",
    role: "Engineering Lead",
  },
  {
    quote: "Guest mode meant we could try it instantly. Signed up after day one.",
    name: "Priya Nair",
    role: "Founder",
  },
];

const FAQS = [
  {
    q: "Do I need an account to chat?",
    a: "No. You can start chatting immediately as a guest. Sign in only when you want cloud history.",
  },
  {
    q: "Where is my chat history stored?",
    a: "Guest chats stay on your device. Signed-in chats sync to your private cloud workspace.",
  },
  {
    q: "Which AI models are supported?",
    a: "Groq is available today. The architecture is ready for Gemini, OpenAI, Claude, and more.",
  },
];

function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" className="landing-brand" aria-label={`${APP_NAME} home`}>
          <span className="brand-mark">N</span>
          <span>{APP_NAME}</span>
        </Link>
        <nav className="landing-nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
          <Link to="/login">Login</Link>
          <Link to="/app" className="landing-cta-nav">
            Start Chatting
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Premium AI Workspace</p>
          <h1 className="landing-brand-hero">{APP_NAME}</h1>
          <p className="landing-tagline">{APP_TAGLINE}</p>
          <p className="landing-support">
            An elegant place to think, write, and build — without the noise of a generic chat clone.
          </p>
          <div className="landing-actions">
            <Link to="/app" className="btn-primary">
              Start Chatting
            </Link>
            <a href="#features" className="btn-ghost">
              Explore features
            </a>
          </div>
        </div>
        <div className="landing-hero-visual" aria-hidden="true">
          <div className="hero-glow" />
          <div className="hero-panel">
            <div className="hero-panel-top">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-lines">
              <div className="line user" />
              <div className="line ai" />
              <div className="line ai short" />
              <div className="line user mid" />
              <div className="line ai" />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <h2>Built for deep work</h2>
        <p className="section-lead">Everything you need in a modern AI workspace — nothing you don’t.</p>
        <div className="feature-grid">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="feature-item">
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2>Loved by early teams</h2>
        <p className="section-lead">Placeholder testimonials from people who tried the beta.</p>
        <div className="testimonial-grid">
          {TESTIMONIALS.map((item) => (
            <blockquote key={item.name} className="testimonial">
              <p>“{item.quote}”</p>
              <footer>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="faq" className="landing-section">
        <h2>FAQ</h2>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <strong>{APP_NAME}</strong>
          <p>{APP_TAGLINE}</p>
        </div>
        <div className="footer-links">
          <Link to="/app">Workspace</Link>
          <Link to="/register">Create account</Link>
          <Link to="/login">Sign in</Link>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Novara AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;

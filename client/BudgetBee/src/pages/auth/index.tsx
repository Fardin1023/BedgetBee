import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../contexts/auth-context";

const motivationalMessages = [
  "Small savings today can create big opportunities tomorrow.",
  "Know where your money goes, and decide where your future goes.",
  "Every smart financial decision starts with one simple record.",
  "Your money deserves a plan, not a guess.",
  "Spend with purpose. Save with confidence.",
  "A better financial future starts with today's choices.",
  "Track a little today. Worry a little less tomorrow.",
  "Make every taka count.",
  "Control your spending before your spending controls you.",
  "Financial freedom begins with financial awareness.",
  "Your income has a purpose. Give every part of it direction.",
  "Good habits grow wealth one transaction at a time.",
];

const TRANSITION_TIME = 450;
const MESSAGE_TIME = 4500;

export const Auth = () => {
  const { login, isSignedIn, logout } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const startingIndex = useMemo(() => {
    return Math.floor(Math.random() * motivationalMessages.length);
  }, []);

  const [messageIndex, setMessageIndex] = useState(startingIndex);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  const changeMessage = useCallback(
    (direction: "next" | "previous") => {
      setVisible(false);

      window.setTimeout(() => {
        setMessageIndex((currentIndex) => {
          if (direction === "next") {
            return (currentIndex + 1) % motivationalMessages.length;
          }
          return (
            (currentIndex - 1 + motivationalMessages.length) %
            motivationalMessages.length
          );
        });

        setVisible(true);
      }, TRANSITION_TIME);
    },
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (paused) {
      return;
    }

    const interval = window.setInterval(() => {
      changeMessage("next");
    }, MESSAGE_TIME);

    return () => {
      window.clearInterval(interval);
    };
  }, [paused, changeMessage]);

  const handlePrevious = () => changeMessage("previous");
  const handleNext = () => changeMessage("next");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");
    const endpoint = isLoginMode ? "/auth/login" : "/auth/register";

    try {
      const payload = isLoginMode ? { email, password } : { email, password, username };
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.message || "Authentication failed");
      } else {
        login(data.token, data.user);
      }
    } catch (err) {
      setAuthError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
        <div className="auth-honeycomb auth-honeycomb-one">⬡</div>
        <div className="auth-honeycomb auth-honeycomb-two">⬡</div>
        <div className="auth-honeycomb auth-honeycomb-three">⬡</div>
      </div>

      <header className="auth-header">
        <div className="auth-brand">
          <div className="auth-brand-bee">🐝</div>
          <div>
            <span className="auth-brand-name">BUDGET BEE</span>
            <span className="auth-brand-caption">Personal Finance Manager</span>
          </div>
        </div>
        {isSignedIn && (
          <button onClick={logout} className="auth-secondary-button" style={{ padding: '0.5rem 1rem' }}>
            Logout
          </button>
        )}
      </header>

      <section className="auth-content">
        <div className="auth-intro">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-dot" />
            YOUR MONEY. YOUR CONTROL.
          </div>
          <h1 className="auth-main-title">
            Build better<span> money habits.</span>
          </h1>
          <p className="auth-main-description">
            Track your income, understand your spending and stay within your monthly limit with Budget Bee.
          </p>

          <div
            className="motivation-card"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="motivation-top">
              <span className="motivation-label">DAILY BUZZ</span>
              <span className="motivation-bee">🐝</span>
            </div>

            <div className="motivation-message-container">
              <p className={`motivation-message ${visible ? "show" : "hide"}`}>
                “{motivationalMessages[messageIndex]}”
              </p>
            </div>

            <div className="motivation-controls">
              <div className="motivation-progress">
                {motivationalMessages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`motivation-dot ${index === messageIndex ? "active" : ""}`}
                    aria-label={`Show message ${index + 1}`}
                    onClick={() => {
                      if (index === messageIndex) return;
                      setVisible(false);
                      window.setTimeout(() => {
                        setMessageIndex(index);
                        setVisible(true);
                      }, TRANSITION_TIME);
                    }}
                  />
                ))}
              </div>

              <div className="motivation-arrows">
                <button type="button" className="motivation-arrow" onClick={handlePrevious}>←</button>
                <button type="button" className="motivation-arrow" onClick={handleNext}>→</button>
              </div>
            </div>
            <div className="motivation-pause-hint">
              {paused ? "Paused while you're reading" : "Hover to pause"}
            </div>
          </div>
        </div>

        <div className="auth-action-wrapper" style={{ overflow: 'hidden', position: 'relative' }}>
          {!isSignedIn ? (
            <div 
              style={{ 
                display: 'flex', 
                width: '200%', 
                transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                transform: isLoginMode ? 'translateX(0)' : 'translateX(-50%)',
                alignItems: 'flex-start'
              }}
            >
              {/* LOGIN PANEL */}
              <div style={{ width: '50%', flexShrink: 0, paddingRight: '1rem', boxSizing: 'border-box' }}>
                <div className="auth-action-card">
                  <div className="auth-action-icon">🐝</div>
                  <p className="section-label">WELCOME BACK</p>
                  <h2>Sign in to your account</h2>
                  
                  <form onSubmit={(e) => { setIsLoginMode(true); handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                    />
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '0.5rem', border: '1px solid #ccc', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#666', padding: 0 }}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    
                    {isLoginMode && authError && <p style={{ color: 'red', fontSize: '0.875rem' }}>{authError}</p>}
                    
                    <button type="submit" className="auth-primary-button" disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
                      {isLoading && isLoginMode ? "Please wait..." : "Sign In"}
                    </button>
                  </form>

                  <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Don't have an account? 
                    <button
                      type="button"
                      onClick={() => { setIsLoginMode(false); setAuthError(""); }}
                      style={{ background: 'none', border: 'none', color: '#ffb703', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                       Sign Up
                    </button>
                  </div>

                  <div className="auth-features" style={{ marginTop: '2rem' }}>
                    <div><span>✓</span> Income tracking</div>
                    <div><span>✓</span> Expense limits</div>
                    <div><span>✓</span> Monthly reports</div>
                  </div>
                </div>
              </div>

              {/* SIGN UP PANEL */}
              <div style={{ width: '50%', flexShrink: 0, paddingLeft: '1rem', boxSizing: 'border-box' }}>
                <div className="auth-action-card">
                  <div className="auth-action-icon">✨</div>
                  <p className="section-label">JOIN BUDGET BEE</p>
                  <h2>Create your free account</h2>
                  
                  <form onSubmit={(e) => { setIsLoginMode(false); handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                    />
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '0.5rem', border: '1px solid #ccc', boxSizing: 'border-box' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#666', padding: 0 }}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    
                    {!isLoginMode && authError && <p style={{ color: 'red', fontSize: '0.875rem' }}>{authError}</p>}
                    
                    <button type="submit" className="auth-primary-button" disabled={isLoading} style={{ width: '100%', justifyContent: 'center' }}>
                      {isLoading && !isLoginMode ? "Please wait..." : "Sign Up"}
                    </button>
                  </form>

                  <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Already have an account? 
                    <button
                      type="button"
                      onClick={() => { setIsLoginMode(true); setAuthError(""); }}
                      style={{ background: 'none', border: 'none', color: '#ffb703', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                       Sign In
                    </button>
                  </div>

                  <div className="auth-features" style={{ marginTop: '2rem' }}>
                    <div><span>✓</span> Income tracking</div>
                    <div><span>✓</span> Expense limits</div>
                    <div><span>✓</span> Monthly reports</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-action-card" style={{ width: '100%' }}>
              <div className="auth-action-icon">✓</div>
              <p className="section-label">YOU'RE SIGNED IN</p>
              <h2>Ready to manage your finances?</h2>
              <p className="auth-action-description">Your Budget Bee dashboard is ready for you.</p>
              <a href="/" className="auth-primary-button auth-dashboard-link">
                <span>Open Dashboard</span>
                <span>→</span>
              </a>
            </div>
          )}
        </div>
      </section>

      <footer className="auth-footer">
        <span>🐝 Budget Bee</span>
        <span>Track. Plan. Grow.</span>
      </footer>
    </main>
  );
};
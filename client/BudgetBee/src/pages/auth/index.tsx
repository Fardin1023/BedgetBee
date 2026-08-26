import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";

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
  /*
    Pick a random starting quote.

    Because this component mounts again
    after a browser reload, the first
    quote can be different every time.
  */
  const startingIndex = useMemo(() => {
    return Math.floor(
      Math.random() *
        motivationalMessages.length
    );
  }, []);

  const [
    messageIndex,
    setMessageIndex,
  ] = useState(startingIndex);

  const [
    visible,
    setVisible,
  ] = useState(false);

  const [
    paused,
    setPaused,
  ] = useState(false);

  const changeMessage = useCallback(
    (direction: "next" | "previous") => {
      setVisible(false);

      window.setTimeout(() => {
        setMessageIndex(
          (currentIndex) => {
            if (
              direction === "next"
            ) {
              return (
                currentIndex + 1
              ) %
                motivationalMessages.length;
            }

            return (
              currentIndex -
              1 +
              motivationalMessages.length
            ) %
              motivationalMessages.length;
          }
        );

        setVisible(true);
      }, TRANSITION_TIME);
    },
    []
  );

  /*
    Initial fade in
  */
  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setVisible(true);
      }, 150);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  /*
    Automatically change the quote.
  */
  useEffect(() => {
    if (paused) {
      return;
    }

    const interval =
      window.setInterval(() => {
        changeMessage(
          "next"
        );
      }, MESSAGE_TIME);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    paused,
    changeMessage,
  ]);

  const handlePrevious = () => {
    changeMessage(
      "previous"
    );
  };

  const handleNext = () => {
    changeMessage(
      "next"
    );
  };

  return (
    <main className="auth-page">
      {/* Background Decorations */}

      <div className="auth-background">
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />

        <div className="auth-honeycomb auth-honeycomb-one">
          ⬡
        </div>

        <div className="auth-honeycomb auth-honeycomb-two">
          ⬡
        </div>

        <div className="auth-honeycomb auth-honeycomb-three">
          ⬡
        </div>
      </div>

      {/* Top Navigation */}

      <header className="auth-header">
        <div className="auth-brand">
          <div className="auth-brand-bee">
            🐝
          </div>

          <div>
            <span className="auth-brand-name">
              BUDGET BEE
            </span>

            <span className="auth-brand-caption">
              Personal Finance Manager
            </span>
          </div>
        </div>

        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

      {/* Main Content */}

      <section className="auth-content">
        {/* LEFT SIDE */}

        <div className="auth-intro">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-dot" />

            YOUR MONEY. YOUR CONTROL.
          </div>

          <h1 className="auth-main-title">
            Build better
            <span>
              {" "}
              money habits.
            </span>
          </h1>

          <p className="auth-main-description">
            Track your income,
            understand your spending
            and stay within your
            monthly limit with Budget
            Bee.
          </p>

          {/* Motivational Quote Area */}

          <div
            className="motivation-card"
            onMouseEnter={() =>
              setPaused(true)
            }
            onMouseLeave={() =>
              setPaused(false)
            }
          >
            <div className="motivation-top">
              <span className="motivation-label">
                DAILY BUZZ
              </span>

              <span className="motivation-bee">
                🐝
              </span>
            </div>

            <div className="motivation-message-container">
              <p
                className={`motivation-message ${
                  visible
                    ? "show"
                    : "hide"
                }`}
              >
                “
                {
                  motivationalMessages[
                    messageIndex
                  ]
                }
                ”
              </p>
            </div>

            <div className="motivation-controls">
              <div className="motivation-progress">
                {motivationalMessages.map(
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`motivation-dot ${
                        index ===
                        messageIndex
                          ? "active"
                          : ""
                      }`}
                      aria-label={`Show message ${
                        index + 1
                      }`}
                      onClick={() => {
                        if (
                          index ===
                          messageIndex
                        ) {
                          return;
                        }

                        setVisible(
                          false
                        );

                        window.setTimeout(
                          () => {
                            setMessageIndex(
                              index
                            );

                            setVisible(
                              true
                            );
                          },
                          TRANSITION_TIME
                        );
                      }}
                    />
                  )
                )}
              </div>

              <div className="motivation-arrows">
                <button
                  type="button"
                  className="motivation-arrow"
                  onClick={
                    handlePrevious
                  }
                  aria-label="Previous message"
                >
                  ←
                </button>

                <button
                  type="button"
                  className="motivation-arrow"
                  onClick={
                    handleNext
                  }
                  aria-label="Next message"
                >
                  →
                </button>
              </div>
            </div>

            <div className="motivation-pause-hint">
              {paused
                ? "Paused while you're reading"
                : "Hover to pause"}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE AUTH CARD */}

        <div className="auth-action-wrapper">
          <Show when="signed-out">
            <div className="auth-action-card">
              <div className="auth-action-icon">
                🐝
              </div>

              <p className="section-label">
                WELCOME TO BUDGET BEE
              </p>

              <h2>
                Start taking control
                of your money.
              </h2>

              <p className="auth-action-description">
                Sign in to continue
                tracking your finances,
                or create your free
                account to get started.
              </p>

              <div className="auth-action-buttons">
                <SignInButton
                  mode="modal"
                >
                  <button
                    type="button"
                    className="auth-primary-button"
                  >
                    <span>
                      Sign In
                    </span>

                    <span>
                      →
                    </span>
                  </button>
                </SignInButton>

                <SignUpButton
                  mode="modal"
                >
                  <button
                    type="button"
                    className="auth-secondary-button"
                  >
                    Create Account
                  </button>
                </SignUpButton>
              </div>

              <div className="auth-features">
                <div>
                  <span>
                    ✓
                  </span>

                  Income tracking
                </div>

                <div>
                  <span>
                    ✓
                  </span>

                  Expense limits
                </div>

                <div>
                  <span>
                    ✓
                  </span>

                  Monthly reports
                </div>
              </div>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="auth-action-card">
              <div className="auth-action-icon">
                ✓
              </div>

              <p className="section-label">
                YOU'RE SIGNED IN
              </p>

              <h2>
                Ready to manage your
                finances?
              </h2>

              <p className="auth-action-description">
                Your Budget Bee
                dashboard is ready for
                you.
              </p>

              <a
                href="/"
                className="auth-primary-button auth-dashboard-link"
              >
                <span>
                  Open Dashboard
                </span>

                <span>
                  →
                </span>
              </a>
            </div>
          </Show>
        </div>
      </section>

      {/* Footer */}

      <footer className="auth-footer">
        <span>
          🐝 Budget Bee
        </span>

        <span>
          Track. Plan. Grow.
        </span>
      </footer>
    </main>
  );
};
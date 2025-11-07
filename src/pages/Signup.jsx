import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import BackgroundImage from "../components/BackgroundImage";
import Header from "../components/Header";
import { firebaseAuth } from "../utils/firebase-config";

function Signup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (currentUser) navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please login instead.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleGetStarted = (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setStep(2);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      setError(getErrorMessage(error.code));
      setLoading(false);
    }
  };

  return (
    <Container step={step}>
      <BackgroundImage />
      <div className="content">
        <Header login />
        <div className="hero-section">
          {step === 1 ? (
            <div className="hero-content">
              <h1>Unlimited movies, TV shows, and more</h1>
              <h2>Watch anywhere. Cancel anytime.</h2>
              <h3>Ready to watch? Enter your email to create or restart your membership.</h3>
              
              <form onSubmit={handleGetStarted} className="email-form">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="email-input"
                  />
                  <button type="submit" className="get-started-btn">
                    Get Started
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8.5 5L15.5 12L8.5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </form>
              
              <div className="login-link">
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            </div>
          ) : (
            <div className="signup-form-container">
              <div className="signup-form-box">
                <button className="back-btn" onClick={() => setStep(1)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15.5 19L8.5 12L15.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
                
                <h1>Create a password to start your membership</h1>
                <p className="subtitle">Just a few more steps and you're done!</p>
                <p className="subtitle">We hate paperwork, too.</p>

                <form onSubmit={handleSignup}>
                  {error && <div className="error-message">{error}</div>}
                  
                  <div className={`input-group ${emailFocused || email ? 'focused' : ''}`}>
                    <input
                      type="email"
                      id="email-signup"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      required
                    />
                    <label htmlFor="email-signup">Email</label>
                  </div>

                  <div className={`input-group ${passwordFocused || password ? 'focused' : ''}`}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password-signup"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required
                    />
                    <label htmlFor="password-signup">Add a password</label>
                    <button
                      type="button"
                      className="show-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>

                  <div className="password-requirements">
                    <p>Password must be at least 6 characters</p>
                  </div>

                  <button type="submit" className="signup-btn" disabled={loading}>
                    {loading ? (
                      <div className="loader"></div>
                    ) : (
                      "Sign Up"
                    )}
                  </button>

                  <div className="terms">
                    By clicking "Sign Up", you agree to our{" "}
                    <a href="#">Terms of Service</a> and{" "}
                    <a href="#">Privacy Policy</a>.
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  min-height: 100vh;

  .content {
    position: absolute;
    top: 0;
    left: 0;
    min-height: 100vh;
    width: 100vw;
    background: ${({ step }) =>
      step === 1
        ? `linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.6) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.6) 100%
          )`
        : `linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(0, 0, 0, 0.6) 50%,
            rgba(0, 0, 0, 0.8) 100%
          )`};
    display: flex;
    flex-direction: column;

    > header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
      padding-top: 20px;
      padding-bottom: 20px;
    }

    .hero-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 120px 20px 80px;

      .hero-content {
        max-width: 950px;
        text-align: center;
        animation: fadeIn 0.6s ease-in;

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        h1 {
          font-size: 3.125rem;
          font-weight: 900;
          margin-bottom: 1rem;
          line-height: 1.1;
          color: #fff;
        }

        h2 {
          font-size: 1.625rem;
          font-weight: 400;
          margin-bottom: 1.5rem;
          color: #fff;
        }

        h3 {
          font-size: 1.2rem;
          font-weight: 400;
          margin-bottom: 1.5rem;
          color: #fff;
        }

        .email-form {
          margin-top: 20px;

          .error-message {
            background-color: #e87c03;
            padding: 12px 20px;
            border-radius: 4px;
            color: #fff;
            font-size: 14px;
            margin-bottom: 20px;
            text-align: left;
          }

          .form-group {
            display: flex;
            gap: 8px;
            max-width: 600px;
            margin: 0 auto;
            flex-wrap: wrap;
            justify-content: center;

            .email-input {
              flex: 1;
              min-width: 250px;
              height: 56px;
              padding: 10px 20px;
              background: rgba(22, 22, 22, 0.7);
              border: 1px solid rgba(128, 128, 128, 0.7);
              border-radius: 4px;
              color: #fff;
              font-size: 16px;
              transition: all 0.2s;

              &:focus {
                outline: none;
                background: rgba(22, 22, 22, 0.9);
                border-color: #fff;
              }

              &::placeholder {
                color: rgba(255, 255, 255, 0.7);
              }
            }

            .get-started-btn {
              height: 56px;
              padding: 12px 24px;
              background: #e50914;
              border: none;
              border-radius: 4px;
              color: #fff;
              font-size: 1.5rem;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s;
              white-space: nowrap;

              &:hover {
                background: #f40612;
                transform: scale(1.02);
              }

              svg {
                width: 24px;
                height: 24px;
              }
            }
          }
        }

        .login-link {
          margin-top: 20px;
          font-size: 1.125rem;
          color: #fff;

          a {
            color: #fff;
            font-weight: 600;
            text-decoration: none;
            transition: text-decoration 0.2s;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }

      .signup-form-container {
        width: 100%;
        max-width: 450px;
        padding: 0 20px;

        .signup-form-box {
          background: rgba(0, 0, 0, 0.85);
          border-radius: 4px;
          padding: 60px 68px 40px;
          animation: slideIn 0.5s ease-out;

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .back-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 20px;
            padding: 8px 0;
            transition: color 0.2s;

            &:hover {
              color: #e50914;
            }

            svg {
              width: 20px;
              height: 20px;
            }
          }

          h1 {
            color: #fff;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            line-height: 1.2;
          }

          .subtitle {
            color: #737373;
            font-size: 18px;
            margin-bottom: 10px;
          }

          form {
            margin-top: 30px;
            display: flex;
            flex-direction: column;
            gap: 16px;

            .error-message {
              background-color: #e87c03;
              padding: 10px 20px;
              border-radius: 4px;
              color: #fff;
              font-size: 14px;
            }

            .input-group {
              position: relative;

              input {
                width: 100%;
                height: 50px;
                padding: 16px 20px 0;
                background: #333;
                border: none;
                border-radius: 4px;
                color: #fff;
                font-size: 16px;
                transition: background 0.2s;

                &:focus {
                  outline: none;
                  background: #454545;
                }
              }

              label {
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                color: #8c8c8c;
                font-size: 16px;
                transition: all 0.2s;
                pointer-events: none;
              }

              &.focused {
                label {
                  top: 8px;
                  font-size: 11px;
                  transform: translateY(0);
                }
              }

              .show-password {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #8c8c8c;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                padding: 5px 10px;
                transition: color 0.2s;

                &:hover {
                  color: #fff;
                }
              }
            }

            .password-requirements {
              color: #8c8c8c;
              font-size: 13px;
              margin-top: -8px;
            }

            .signup-btn {
              width: 100%;
              height: 48px;
              background: #e50914;
              border: none;
              border-radius: 4px;
              color: #fff;
              font-size: 16px;
              font-weight: 700;
              margin-top: 24px;
              cursor: pointer;
              transition: background 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;

              &:hover:not(:disabled) {
                background: #f40612;
              }

              &:disabled {
                background: #e50914;
                opacity: 0.7;
                cursor: not-allowed;
              }

              .loader {
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top-color: #fff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
              }

              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            }

            .terms {
              color: #737373;
              font-size: 13px;
              line-height: 1.5;
              margin-top: 10px;

              a {
                color: #0071eb;
                text-decoration: none;

                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 950px) {
    .content .hero-section .hero-content {
      h1 {
        font-size: 2rem;
      }

      h2 {
        font-size: 1.25rem;
      }

      h3 {
        font-size: 1rem;
      }
    }
  }

  @media (max-width: 768px) {
    .content .hero-section .signup-form-container .signup-form-box {
      padding: 40px 28px;
      background: rgba(0, 0, 0, 0.75);
    }
  }

  @media (max-width: 550px) {
    .content .hero-section .hero-content {
      h1 {
        font-size: 1.75rem;
      }

      .email-form .form-group {
        flex-direction: column;

        .email-input,
        .get-started-btn {
          width: 100%;
        }
      }
    }
  }
`;

export default Signup;
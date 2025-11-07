import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import BackgroundImage from "../components/BackgroundImage";
import Header from "../components/Header";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";

function Login() {
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
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      default:
        return "An error occurred. Please try again.";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      setError(getErrorMessage(error.code));
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundImage />
      <div className="content">
        <Header />
        <div className="form-container">
          <div className="form-wrapper">
            <div className="form-box">
              <h1>Sign In</h1>
              <form onSubmit={handleLogin}>
                {error && <div className="error-message">{error}</div>}
                
                <div className={`input-group ${emailFocused || email ? 'focused' : ''}`}>
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                  />
                  <label htmlFor="email">Email or phone number</label>
                </div>

                <div className={`input-group ${passwordFocused || password ? 'focused' : ''}`}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                  />
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>

                <button type="submit" className="signin-btn" disabled={loading}>
                  {loading ? (
                    <div className="loader"></div>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="form-help">
                  <div className="remember">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <a href="#" className="help-link">Need help?</a>
                </div>
              </form>

              <div className="form-footer">
                <div className="signup-link">
                  New to Streamify?{" "}
                  <Link to="/signup">Sign up now</Link>.
                </div>
              </div>
            </div>
          </div>
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
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.5) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
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

    .form-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 100px 0 60px;

      .form-wrapper {
        width: 100%;
        max-width: 450px;
        padding: 0 20px;
      }

      .form-box {
        background: rgba(0, 0, 0, 0.85);
        border-radius: 4px;
        padding: 60px 68px 40px;
        animation: fadeIn 0.5s ease-in;

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
          color: #fff;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 28px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 16px;

          .error-message {
            background-color: #e87c03;
            padding: 10px 20px;
            border-radius: 4px;
            color: #fff;
            font-size: 14px;
            margin-bottom: 10px;
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

          .signin-btn {
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

          .form-help {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            margin-top: 12px;

            .remember {
              display: flex;
              align-items: center;
              gap: 5px;

              input[type="checkbox"] {
                width: 16px;
                height: 16px;
                cursor: pointer;
              }

              label {
                color: #b3b3b3;
                cursor: pointer;
              }
            }

            .help-link {
              color: #b3b3b3;
              text-decoration: none;
              transition: color 0.2s;

              &:hover {
                color: #fff;
                text-decoration: underline;
              }
            }
          }
        }

        .form-footer {
          margin-top: 80px;

          .signup-link {
            color: #737373;
            font-size: 16px;

            a {
              color: #fff;
              text-decoration: none;
              transition: text-decoration 0.2s;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    .content .form-container .form-box {
      padding: 40px 28px;
      background: rgba(0, 0, 0, 0.75);
    }
  }

  @media (max-width: 450px) {
    .content .form-container .form-wrapper {
      max-width: 100%;
    }
  }
`;

export default Login;
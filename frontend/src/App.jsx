
import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";

const STORAGE_KEY = "careerOsUser";

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (!savedUser) return null;

    const user = JSON.parse(savedUser);

    if (!user || !user.id) return null;

    return user;

  } catch (error) {
    console.error("Unable to restore login:", error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Restore user after browser refresh
  const [loggedInUser, setLoggedInUser] = useState(getSavedUser);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin
          ? "http://localhost:8080/api/users/login"
          : "http://localhost:8080/api/users/register";

      const requestBody = isLogin
          ? { email, password }
          : { name, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            (isLogin
                ? "Invalid email or password."
                : "Registration failed. Please try again.")
        );
      }

      if (isLogin) {

        // Never store the password in localStorage
        const safeUser = {
          ...data,
          name: data.name || email.split("@")[0]
        };

        delete safeUser.password;
        delete safeUser.passwordHash;

        // Persist user details across page refresh
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(safeUser)
        );

        setLoggedInUser(safeUser);

      } else {

        setSuccess(
            "Account created successfully! Please sign in."
        );

        setIsLogin(true);
        setName("");
        setPassword("");
        setConfirmPassword("");
      }

    } catch (err) {
      setError(
          err.message === "Failed to fetch"
              ? "Backend connection failed. Check Spring Boot."
              : err.message
      );

    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  // Dashboard remains active after refresh
  if (loggedInUser) {
    return <Dashboard user={loggedInUser} />;
  }

  return (
      <div className="app-container">

        <nav className="navbar">
          <div className="brand">
            <span className="brand-icon">C</span>
            CAREER OS
          </div>

          <span className="nav-text">
                    Your career. Your future.
                </span>
        </nav>

        <main className="main-content">

          <section className="welcome-section">

            <div className="tag">
              ✦ YOUR CAREER COMPANION
            </div>

            <h1>
              Build your future.
              <br />
              <span>One step at a time.</span>
            </h1>

            <p>
              Organize your skills, discover opportunities
              and take control of your career journey.
            </p>

            <div className="feature-list">
              <div>✦ Track your career progress</div>
              <div>✦ Discover relevant job opportunities</div>
              <div>✦ Get smarter career recommendations</div>
            </div>

          </section>

          <section className="login-card">

            <div className="card-icon">↗</div>

            <h2>
              {isLogin ? "Welcome back" : "Create account"}
            </h2>

            <p className="subtitle">
              {isLogin
                  ? "Sign in to continue your journey."
                  : "Start building your career journey today."}
            </p>

            <form onSubmit={handleSubmit}>

              {!isLogin && (
                  <>
                    <label>Full Name</label>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                  </>
              )}

              <label>Email address</label>

              <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />

              <label>Password</label>

              <div className="password-box">

                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                />

                <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              {!isLogin && (
                  <>
                    <label>Confirm Password</label>

                    <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        minLength={8}
                        required
                    />
                  </>
              )}

              {error && (
                  <p style={{
                    color: "#E58B80",
                    fontSize: "13px",
                    marginTop: "14px"
                  }}>
                    {error}
                  </p>
              )}

              {success && (
                  <p style={{
                    color: "#D6B878",
                    fontSize: "13px",
                    marginTop: "14px"
                  }}>
                    {success}
                  </p>
              )}

              <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
              >
                {loading
                    ? "Please wait..."
                    : isLogin
                        ? "Sign in"
                        : "Create account"}

                {!loading && <span>→</span>}
              </button>

            </form>

            <p className="card-footer">
              {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}

              <button
                  type="button"
                  onClick={switchMode}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#D6B878",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
              >
                {isLogin
                    ? "Create an account"
                    : "Sign in"}
              </button>
            </p>

          </section>

        </main>

        <footer>
          © 2026 Career OS · Built for your next chapter.
        </footer>

      </div>
  );
}

export default App;

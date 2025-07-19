import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import myImage from "../../assets/laptop.jpg";
import Header from "../common/Header/Header";
import Footer from "../common/Header/Footer/Footer";
import authService from "../../services/authService";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    
    // Validate password in real-time during signup
    if (name === 'password' && isSignup) {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(valid => valid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      if (isSignup) {
        // Validate password strength
        if (!isPasswordValid()) {
          setError("Password does not meet the required criteria.");
          return;
        }
        
        // Validate password confirmation
        if (credentials.password !== credentials.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        
        // Only send username and password to the API
        const { username, password } = credentials;
        const response = await authService.register({ username, password });
        setSuccess("Account created successfully! You can now sign in.");
        setIsSignup(false);
        setCredentials({ username: "", password: "", confirmPassword: "" });
        setPasswordValidation({
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecialChar: false
        });
      } else {
        const token = await authService.login(credentials);
        console.log("Login successful, token:", token);
        navigate("/dashboard");
      }
    } catch (err) {
      if (isSignup) {
        setError("Registration failed. Username might already exist.");
      } else {
        setError("Invalid username or password");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-left">
          <div className="blue-shape" />
          <img
            src={myImage}
            alt="Laptop and documents"
            className="left-image circle-mask"
          />
        </div>
        <div className="login-right">
          <form className="login-box" onSubmit={handleSubmit}>
            <h2>{isSignup ? 'Create Account' : 'Smart Invoice Pro'}</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
            {isSignup && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={credentials.confirmPassword}
                onChange={handleChange}
                required
              />
            )}
            {isSignup && credentials.password && (
              <div className="password-requirements">
                <p className="requirements-title">Password must contain:</p>
                <ul className="requirements-list">
                  <li className={passwordValidation.minLength ? 'valid' : 'invalid'}>
                    ✓ At least 8 characters
                  </li>
                  <li className={passwordValidation.hasUppercase ? 'valid' : 'invalid'}>
                    ✓ One uppercase letter
                  </li>
                  <li className={passwordValidation.hasLowercase ? 'valid' : 'invalid'}>
                    ✓ One lowercase letter
                  </li>
                  <li className={passwordValidation.hasNumber ? 'valid' : 'invalid'}>
                    ✓ One number
                  </li>
                  <li className={passwordValidation.hasSpecialChar ? 'valid' : 'invalid'}>
                    ✓ One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                  </li>
                </ul>
              </div>
            )}
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            {!isSignup && (
              <div className="login-options">
                <label>
                  <input type="checkbox" />
                  Remember Me
                </label>
                <button type="button" className="link-button" onClick={() => console.log('Forgot password clicked')}>
                  Forgot Password
                </button>
              </div>
            )}
            <button type="submit" className="btn-signin">
              {isSignup ? 'Create Account' : 'Sign in'}
            </button>
            <span className="or">or</span>
            <button 
              type="button" 
              className="btn-create"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setSuccess("");
                setCredentials({ username: "", password: "", confirmPassword: "" });
                setPasswordValidation({
                  minLength: false,
                  hasUppercase: false,
                  hasLowercase: false,
                  hasNumber: false,
                  hasSpecialChar: false
                });
              }}
            >
              {isSignup ? 'Back to Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;

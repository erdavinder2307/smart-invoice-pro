import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import myImage from "../../assets/laptop-finance.png";
import Header from "../common/Header/Header";
import Footer from "../common/Header/Footer/Footer";
import authService from "../../services/authService";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await authService.login(credentials);
      console.log("Login successful, token:", token);
      navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      setError("Invalid username or password");
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
            <h2>Smart Invoice Pro</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
            />
            {error && <p className="error-message">{error}</p>}
            <div className="login-options">
              <label>
                <input type="checkbox" />
                Remember Me
              </label>
              <a href="#">Forgot Password</a>
            </div>
            <button type="submit" className="btn-signin">
              Sign in
            </button>
            <span className="or">or</span>
            <button type="button" className="btn-create">
              Create Account
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;

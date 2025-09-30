"use client";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Save user in localStorage
        localStorage.setItem("ai-user", data.userId);
        localStorage.setItem("ai-credits", data.credits);
        setMessage(`Welcome! You have ${data.credits} credits.`);
        // Redirect to dashboard after login
        setTimeout(() => window.location.href = "/dashboard", 1000);
      } else {
        setMessage(`Login failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error. Try again.");
    }
  };

  const handleSignup = async () => {
    setMessage("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("ai-user", data.userId);
        localStorage.setItem("ai-credits", data.credits);
        setMessage(`Account created! You have ${data.credits} credits.`);
        setTimeout(() => window.location.href = "/dashboard", 1000);
      } else {
        setMessage(`Signup failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error. Try again.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h1>Login / Sign Up</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: "100%", margin: "8px 0", padding: 8 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", margin: "8px 0", padding: 8 }}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleLogin} style={{ marginRight: 8 }}>Login</button>
        <button onClick={handleSignup}>Sign Up</button>
      </div>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [action, setAction] = useState("login");
  const router = useRouter();

  const handleSubmit = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action })
    });
    const data = await res.json();
    if (!data.error) {
      localStorage.setItem("ai-user", email);
      router.push("/dashboard");
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>{action === "login" ? "Login" : "Sign Up"}</h1>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={handleSubmit}>{action === "login" ? "Login" : "Sign Up"}</button>
      <p onClick={() => setAction(action === "login" ? "signup" : "login")} style={{ cursor: "pointer", color: "blue" }}>
        {action === "login" ? "Create account" : "Already have an account?"}
      </p>
    </div>
  );
}

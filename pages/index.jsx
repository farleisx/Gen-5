import Link from "next/link";

export default function Home() {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Welcome to AI Code Platform</h1>
      <p>Generate full projects with AI</p>
      <Link href="/login">
        <button style={{ padding: "10px 20px", marginTop: "20px" }}>Get Started</button>
      </Link>
    </div>
  );
}

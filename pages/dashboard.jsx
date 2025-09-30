import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? localStorage.getItem("ai-user") : null;

  const [credits, setCredits] = useState(0);
  const [projects, setProjects] = useState([]);
  const [codeData, setCodeData] = useState({});
  const [currentProject, setCurrentProject] = useState(null);
  const [aiInput, setAiInput] = useState("");

  useEffect(() => {
    if (!user) router.push("/login");
    else fetchCreditsAndProjects();
  }, []);

  // --- Fetch credits and user projects ---
  const fetchCreditsAndProjects = async () => {
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user, prompt: "", costCheckOnly: true })
      });
      const data = await res.json();
      setCredits(data.creditsLeft || 5);
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Generate new project ---
  const generateProject = async () => {
    if (credits < 0.5) return alert("Not enough credits");
    const prompt = window.prompt("Enter project description");
    if (!prompt) return;

    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user, prompt })
      });
      const data = await res.json();
      setCredits(data.creditsLeft);

      // Parse AI code blocks
      const regex = /```(\w+)[\s\S]*?```/gi;
      let match, codeBlocks = {};
      while ((match = regex.exec(data.output)) !== null) {
        let lang = match[1].trim();
        codeBlocks[lang] = match[0].replace(/```/g, "").trim();
      }

      const projectName = prompt.substring(0, 20);
      const project = { id: Date.now(), name: projectName, code: codeBlocks };
      setProjects([project, ...projects]);
      setCurrentProject(project);

      // Save project to Supabase
      await supabase.from("projects").insert({
        user_id: user,
        name: projectName,
        code: JSON.stringify(codeBlocks),
        created_at: new Date()
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate project");
    }
  };

  // --- Update project with AI input ---
  const updateProject = async () => {
    if (!currentProject) return;
    if (credits < 0.25) return alert("Not enough credits");

    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user,
          prompt: aiInput,
          previousCode: Object.values(currentProject.code).join("\n")
        })
      });
      const data = await res.json();
      setCredits(data.creditsLeft);

      // Parse AI code blocks
      const regex = /```(\w+)[\s\S]*?```/gi;
      let match, codeBlocks = {};
      while ((match = regex.exec(data.output)) !== null) {
        let lang = match[1].trim();
        codeBlocks[lang] = match[0].replace(/```/g, "").trim();
      }

      const updatedProject = { ...currentProject, code: codeBlocks };
      setCurrentProject(updatedProject);
      setProjects(projects.map(p => (p.id === currentProject.id ? updatedProject : p)));

      // Update Supabase
      await supabase
        .from("projects")
        .update({ code: JSON.stringify(codeBlocks) })
        .eq("id", currentProject.id);

      setAiInput("");
    } catch (err) {
      console.error(err);
      alert("Failed to update project");
    }
  };

  // --- Preview ---
  const showPreview = (project) => {
    if (!project.code.html) return alert("No HTML code to preview");
    const iframe = document.getElementById("preview");
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(project.code.html);
    doc.close();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ padding: "12px 20px", background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <span>Credits: {credits}/5</span>
        <button onClick={generateProject} style={{ marginLeft: 20 }}>+ New Project</button>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: "250px", borderRight: "1px solid #e5e7eb", overflowY: "auto" }}>
          <h3 style={{ padding: "10px" }}>Projects</h3>
          {projects.map(p => (
            <div key={p.id} style={{ padding: "8px", cursor: "pointer", background: currentProject?.id === p.id ? "#f3f4f6" : "" }}
                 onClick={() => { setCurrentProject(p); showPreview(p); }}>
              {p.name}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <iframe id="preview" style={{ flex: 1, border: "none", width: "100%" }} />

          <div style={{ padding: "10px", display: "flex", gap: "10px", borderTop: "1px solid #e5e7eb" }}>
            <input
              placeholder="Tell AI to change something..."
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
            />
            <button onClick={updateProject}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  about: string;
  status: "Not Started" | "In Progress" | "Completed";
  userStoryCount: number;
  completedStoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function InternalProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "status" | "updated">("updated");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setError(null);
      const response = await fetch("/api/internal-projects");
      const data = await response.json();
      if (data.success) {
        setProjects(data.data.projects);
      } else {
        setError(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("Unable to load projects. Please try again.");
    }
  };

  const createNewProject = async () => {
    try {
      setError(null);
      const response = await fetch("/api/internal-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Project",
          about: "Project description",
          status: "Not Started",
        }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchProjects(); // Refresh the list
      } else {
        setError(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      setError("Unable to create project. Please try again.");
    }
  };

  const filteredProjects = projects
    .filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !p.about.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return 0;
    });

  const exportData = () => {
    const exportFormat = {
      exported_at: new Date().toISOString(),
      projects: projects.map(p => ({
        ...p,
        progress: `${p.completedStoryCount}/${p.userStoryCount} stories completed`
      }))
    };
    const blob = new Blob([JSON.stringify(exportFormat, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `internal-projects-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Internal Projects</h1>
          <p className="text-neutral-400">Feature alignment and tracking tool</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/40 text-red-200 border border-red-800">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md flex-1 min-w-[200px]"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md"
          >
            <option value="updated">Sort by Updated</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>

          <button
            onClick={createNewProject}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium"
          >
            New Project
          </button>

          <Link
            href="/internal-projects/view"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-medium"
          >
            Unified View
          </Link>

          <button
            onClick={exportData}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
          >
            Export JSON
          </button>
        </div>

        {/* Projects Table */}
        <div className="bg-neutral-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left p-4">Project Name</th>
                <th className="text-left p-4">About</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Progress</th>
                <th className="text-left p-4">Updated</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                  <td className="p-4 font-medium">{project.name}</td>
                  <td className="p-4 text-neutral-400">{project.about}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      project.status === "Completed" ? "bg-green-900 text-green-200" :
                      project.status === "In Progress" ? "bg-yellow-900 text-yellow-200" :
                      "bg-neutral-700 text-neutral-300"
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {project.completedStoryCount}/{project.userStoryCount} stories
                  </td>
                  <td className="p-4 text-neutral-400">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/internal-projects/${project.id}`}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProjects.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No projects found. Create your first project to get started.
            </div>
          )}
        </div>

        {/* Data Preview for LLM */}
        <details className="mt-8 bg-neutral-900 rounded-lg p-4">
          <summary className="cursor-pointer text-neutral-400 hover:text-neutral-200">
            View Data (LLM-Readable Format)
          </summary>
          <pre className="mt-4 text-xs overflow-auto bg-black p-4 rounded">
{JSON.stringify(filteredProjects, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

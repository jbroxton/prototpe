"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
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
  const [starred, setStarred] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();
    // Load starred set from localStorage
    try {
      const raw = localStorage.getItem('internal-projects:starred');
      if (raw) setStarred(new Set(JSON.parse(raw)));
    } catch {}
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

  const persistStarred = (next: Set<string>) => {
    try { localStorage.setItem('internal-projects:starred', JSON.stringify(Array.from(next))); } catch {}
  };
  const toggleStar = (id: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persistStarred(next);
      return next;
    });
  };

  const filteredProjects = projects
    .filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !p.about.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Starred projects always on top
      const aStar = starred.has(a.id) ? 1 : 0;
      const bStar = starred.has(b.id) ? 1 : 0;
      if (aStar !== bStar) return bStar - aStar; // starred first
      // Then secondary sort by selected key
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return 0;
    });

  type Row = {
    id: string;
    name: string;
    about: string;
    status: Project["status"];
    progress: string;
    updatedAt: string;
  };

  const rows: Row[] = filteredProjects.map(p => ({
    id: p.id,
    name: p.name,
    about: p.about,
    status: p.status,
    progress: `${p.completedStoryCount}/${p.userStoryCount} stories`,
    updatedAt: p.updatedAt,
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Project Name', cell: ({ row }) => (
      <div className="font-medium flex items-center">
        <button
          aria-label={starred.has(row.original.id) ? 'Unstar project' : 'Star project'}
          title={starred.has(row.original.id) ? 'Unstar' : 'Star'}
          onClick={() => toggleStar(row.original.id)}
          className={`mr-2 text-yellow-400 hover:scale-110 transition-transform ${starred.has(row.original.id) ? '' : 'opacity-40'}`}
        >
          {starred.has(row.original.id) ? '★' : '☆'}
        </button>
        {row.original.name}
      </div>
    ) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === 'Completed' ? 'success' :
          row.original.status === 'In Progress' ? 'warning' :
          row.original.status === 'In Review' ? 'default' : 'secondary'
        }
      >
        {row.original.status}
      </Badge>
    ) },
    { accessorKey: 'progress', header: 'Progress' },
    { accessorKey: 'updatedAt', header: 'Updated', cell: ({ row }) => (
      <span className="text-neutral-400">{new Date(row.original.updatedAt).toLocaleDateString()}</span>
    ) },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <Link href={`/internal-projects/${row.original.id}`} className="text-indigo-400 hover:text-indigo-300">View →</Link>
    ) },
  ];

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
    <div className="h-screen overflow-auto bg-neutral-950 text-neutral-200">
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
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />

          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="Not Started">Not started</option>
            <option value="In Progress">In progress</option>
            <option value="In Review">In review</option>
            <option value="Completed">Completed</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="updated">Sort: Updated</option>
            <option value="name">Sort: Name</option>
            <option value="status">Sort: Status</option>
          </Select>

          <Button onClick={createNewProject} size="sm">
            New Project
          </Button>

          {/* Unified View removed per product decision: dense view is per-project */}

          <Button variant="outline" size="sm" onClick={exportData}>
            Export JSON
          </Button>
        </div>

        {/* Projects Table */}
        <DataTable<Row, unknown> columns={columns} data={rows} />

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

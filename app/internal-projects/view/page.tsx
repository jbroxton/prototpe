"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AcceptanceCriteria {
  id: string;
  criteriaNumber: number;
  description: string;
  status: string;
}

interface UserStory {
  id: string;
  storyNumber: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  acceptanceCriteria: AcceptanceCriteria[];
}

interface Project {
  id: string;
  name: string;
  about: string;
  status: string;
  userStories: UserStory[];
  createdAt: string;
  updatedAt: string;
}

interface TableRow {
  projectId: string;
  projectName: string;
  projectStatus: string;
  storyId?: string;
  storyTitle?: string;
  storyStatus?: string;
  storyPriority?: string;
  criteriaId?: string;
  criteriaDescription?: string;
  criteriaStatus?: string;
  level: "project" | "story" | "criteria";
}

export default function UnifiedProjectView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tableRows, setTableRows] = useState<TableRow[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    generateTableRows();
  }, [projects, expandedProjects, expandedStories, filter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/internal-projects");
      const data = await response.json();
      if (data.success) {
        // Fetch detailed data for each project
        const detailedProjects = await Promise.all(
          data.data.projects.map(async (p: any) => {
            const detailResponse = await fetch(`/api/internal-projects?projectId=${p.id}`);
            const detailData = await detailResponse.json();
            return detailData.success ? detailData.data : p;
          })
        );
        setProjects(detailedProjects);
        // Expand all by default for easy viewing
        setExpandedProjects(new Set(detailedProjects.map((p: Project) => p.id)));
        const allStoryIds = detailedProjects.flatMap((p: Project) => 
          p.userStories?.map(s => `${p.id}-${s.storyNumber}`) || []
        );
        setExpandedStories(new Set(allStoryIds));
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTableRows = () => {
    const rows: TableRow[] = [];
    
    projects.forEach(project => {
      // Add project row
      if (filter === "all" || project.status === filter) {
        rows.push({
          projectId: project.id,
          projectName: project.name,
          projectStatus: project.status,
          level: "project"
        });
        
        // Add story rows if project is expanded
        if (expandedProjects.has(project.id) && project.userStories) {
          project.userStories.forEach(story => {
            if (filter === "all" || story.status === filter) {
              rows.push({
                projectId: project.id,
                projectName: project.name,
                projectStatus: project.status,
                storyId: `US${story.storyNumber}`,
                storyTitle: story.title,
                storyStatus: story.status,
                storyPriority: story.priority,
                level: "story"
              });
              
              // Add criteria rows if story is expanded
              const storyKey = `${project.id}-${story.storyNumber}`;
              if (expandedStories.has(storyKey) && story.acceptanceCriteria) {
                story.acceptanceCriteria.forEach(criteria => {
                  if (filter === "all" || criteria.status === filter) {
                    rows.push({
                      projectId: project.id,
                      projectName: project.name,
                      projectStatus: project.status,
                      storyId: `US${story.storyNumber}`,
                      storyTitle: story.title,
                      storyStatus: story.status,
                      storyPriority: story.priority,
                      criteriaId: `AC${criteria.criteriaNumber}`,
                      criteriaDescription: criteria.description,
                      criteriaStatus: criteria.status,
                      level: "criteria"
                    });
                  }
                });
              }
            }
          });
        }
      }
    });
    
    setTableRows(rows);
  };

  const toggleProjectExpand = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleStoryExpand = (projectId: string, storyNumber: number) => {
    const key = `${projectId}-${storyNumber}`;
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedStories(newExpanded);
  };

  const handleEdit = (cellId: string, value: string) => {
    setEditingCell(cellId);
    setEditValue(value);
  };

  const saveEdit = async (row: TableRow, field: string) => {
    try {
      if (field === "projectName" || field === "projectStatus") {
        await fetch("/api/internal-projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: row.projectId,
            ...(field === "projectName" ? { name: editValue } : { status: editValue })
          })
        });
      } else if (field === "storyTitle" || field === "storyStatus" || field === "storyPriority") {
        await fetch("/api/internal-projects/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: row.projectId,
            action: "update",
            story: {
              id: row.storyId,
              ...(field === "storyTitle" ? { title: editValue } : 
                  field === "storyStatus" ? { status: editValue } : 
                  { priority: editValue })
            }
          })
        });
      } else if (field === "criteriaDescription" || field === "criteriaStatus") {
        await fetch("/api/internal-projects/stories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: row.projectId,
            storyId: row.storyId,
            action: "update",
            acceptanceCriteria: {
              id: row.criteriaId,
              ...(field === "criteriaDescription" ? { description: editValue } : { status: editValue })
            }
          })
        });
      }
      
      setEditingCell(null);
      await fetchProjects();
    } catch (error) {
      console.error("Failed to save edit:", error);
    }
  };

  const addUserStory = async (projectId: string) => {
    try {
      await fetch("/api/internal-projects/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "add",
          story: {
            title: "New User Story",
            description: "As a user, I want to...",
            status: "Not Started",
            priority: "Medium"
          }
        })
      });
      await fetchProjects();
    } catch (error) {
      console.error("Failed to add user story:", error);
    }
  };

  const addAcceptanceCriteria = async (projectId: string, storyId: string) => {
    try {
      await fetch("/api/internal-projects/stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          storyId,
          action: "add",
          acceptanceCriteria: {
            description: "Given..., When..., Then...",
            status: "Not Started"
          }
        })
      });
      await fetchProjects();
    } catch (error) {
      console.error("Failed to add acceptance criteria:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-900 text-green-200";
      case "In Progress": return "bg-yellow-900 text-yellow-200";
      default: return "bg-neutral-700 text-neutral-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-blue-400";
      default: return "text-neutral-400";
    }
  };

  const exportData = () => {
    const exportFormat = {
      exported_at: new Date().toISOString(),
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        about: p.about,
        status: p.status,
        userStories: p.userStories?.map(s => ({
          id: `US${s.storyNumber}`,
          title: s.title,
          description: s.description,
          status: s.status,
          priority: s.priority,
          acceptanceCriteria: s.acceptanceCriteria?.map(ac => ({
            id: `AC${ac.criteriaNumber}`,
            description: ac.description,
            status: ac.status
          }))
        }))
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportFormat, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `internal-projects-${Date.now()}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Projects Unified View</h1>
            <Link href="/internal-projects" className="text-indigo-400 hover:text-indigo-300">
              ← Back to List
            </Link>
          </div>
          <p className="text-neutral-400">Collaborative view for managing projects, stories, and acceptance criteria</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={() => {
              if (expandedProjects.size === projects.length) {
                setExpandedProjects(new Set());
                setExpandedStories(new Set());
              } else {
                setExpandedProjects(new Set(projects.map(p => p.id)));
                const allStoryIds = projects.flatMap(p => 
                  p.userStories?.map(s => `${p.id}-${s.storyNumber}`) || []
                );
                setExpandedStories(new Set(allStoryIds));
              }
            }}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
          >
            {expandedProjects.size === projects.length ? "Collapse All" : "Expand All"}
          </button>

          <button
            onClick={exportData}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
          >
            Export JSON
          </button>

          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md"
          >
            Refresh
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-neutral-900 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 text-left">
                <th className="p-3 text-sm">Type</th>
                <th className="p-3 text-sm">Project</th>
                <th className="p-3 text-sm">Story</th>
                <th className="p-3 text-sm">Acceptance Criteria</th>
                <th className="p-3 text-sm">Status</th>
                <th className="p-3 text-sm">Priority</th>
                <th className="p-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr 
                  key={index}
                  className={`border-b border-neutral-800 hover:bg-neutral-800/50 ${
                    row.level === "project" ? "font-semibold" : 
                    row.level === "story" ? "pl-8" : "pl-16"
                  }`}
                >
                  <td className="p-3 text-xs">
                    {row.level === "project" ? "📁" : row.level === "story" ? "📝" : "✓"}
                  </td>
                  
                  <td className="p-3">
                    {row.level === "project" ? (
                      editingCell === `${row.projectId}-name` ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(row, "projectName")}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(row, "projectName")}
                          className="bg-neutral-800 px-2 py-1 rounded w-full"
                          autoFocus
                        />
                      ) : (
                        <span 
                          onClick={() => handleEdit(`${row.projectId}-name`, row.projectName)}
                          className="cursor-pointer hover:text-indigo-400"
                        >
                          {row.projectName}
                        </span>
                      )
                    ) : (
                      <span className="text-neutral-500 text-sm">{row.projectName}</span>
                    )}
                  </td>
                  
                  <td className="p-3">
                    {row.storyId && row.level === "story" ? (
                      <div>
                        <span className="font-mono text-xs bg-neutral-800 px-1.5 py-0.5 rounded mr-2">
                          {row.storyId}
                        </span>
                        {editingCell === `${row.projectId}-${row.storyId}-title` ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(row, "storyTitle")}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(row, "storyTitle")}
                            className="bg-neutral-800 px-2 py-1 rounded"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => handleEdit(`${row.projectId}-${row.storyId}-title`, row.storyTitle || "")}
                            className="cursor-pointer hover:text-indigo-400"
                          >
                            {row.storyTitle}
                          </span>
                        )}
                      </div>
                    ) : row.level === "criteria" ? (
                      <span className="text-neutral-500 text-sm ml-4">{row.storyTitle}</span>
                    ) : null}
                  </td>
                  
                  <td className="p-3">
                    {row.criteriaId && (
                      <div>
                        <span className="font-mono text-xs bg-neutral-800 px-1.5 py-0.5 rounded mr-2">
                          {row.criteriaId}
                        </span>
                        {editingCell === `${row.projectId}-${row.storyId}-${row.criteriaId}-desc` ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(row, "criteriaDescription")}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(row, "criteriaDescription")}
                            className="bg-neutral-800 px-2 py-1 rounded w-full"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => handleEdit(`${row.projectId}-${row.storyId}-${row.criteriaId}-desc`, row.criteriaDescription || "")}
                            className="cursor-pointer hover:text-indigo-400 text-sm"
                          >
                            {row.criteriaDescription}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  
                  <td className="p-3">
                    {editingCell === `${row.projectId}-${row.storyId || "project"}-${row.criteriaId || "story"}-status` ? (
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveEdit(row, 
                          row.level === "project" ? "projectStatus" : 
                          row.level === "story" ? "storyStatus" : "criteriaStatus"
                        )}
                        className="bg-neutral-800 px-2 py-1 rounded text-sm"
                        autoFocus
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span 
                        onClick={() => handleEdit(
                          `${row.projectId}-${row.storyId || "project"}-${row.criteriaId || "story"}-status`,
                          row.level === "project" ? row.projectStatus : 
                          row.level === "story" ? row.storyStatus! : row.criteriaStatus!
                        )}
                        className={`px-2 py-1 rounded text-xs cursor-pointer ${getStatusColor(
                          row.level === "project" ? row.projectStatus : 
                          row.level === "story" ? row.storyStatus! : row.criteriaStatus!
                        )}`}
                      >
                        {row.level === "project" ? row.projectStatus : 
                         row.level === "story" ? row.storyStatus : row.criteriaStatus}
                      </span>
                    )}
                  </td>
                  
                  <td className="p-3">
                    {row.level === "story" && (
                      editingCell === `${row.projectId}-${row.storyId}-priority` ? (
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(row, "storyPriority")}
                          className="bg-neutral-800 px-2 py-1 rounded text-sm"
                          autoFocus
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      ) : (
                        <span 
                          onClick={() => handleEdit(`${row.projectId}-${row.storyId}-priority`, row.storyPriority!)}
                          className={`cursor-pointer ${getPriorityColor(row.storyPriority!)}`}
                        >
                          {row.storyPriority}
                        </span>
                      )
                    )}
                  </td>
                  
                  <td className="p-3">
                    {row.level === "project" && (
                      <button
                        onClick={() => addUserStory(row.projectId)}
                        className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded"
                      >
                        + Story
                      </button>
                    )}
                    {row.level === "story" && (
                      <button
                        onClick={() => addAcceptanceCriteria(row.projectId, row.storyId!)}
                        className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded"
                      >
                        + AC
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {tableRows.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No data found. Create a project to get started.
            </div>
          )}
        </div>

        {/* LLM Data View */}
        <details className="mt-8 bg-neutral-900 rounded-lg p-4">
          <summary className="cursor-pointer text-neutral-400 hover:text-neutral-200">
            View Data (LLM-Readable Format)
          </summary>
          <pre className="mt-4 text-xs overflow-auto bg-black p-4 rounded">
{JSON.stringify(projects, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
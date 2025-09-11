"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function ProjectUnifiedView() {
  const params = useParams();
  const projectId = params?.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTestLabel = (link?: string | null) => {
    if (!link) return '';
    try {
      if (link.startsWith('http')) {
        const u = new URL(link);
        const parts = u.pathname.split('/').filter(Boolean);
        return parts.pop() || u.host;
      }
    } catch {}
    const parts = link.split('/').filter(Boolean);
    return parts.pop() || link;
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/internal-projects?projectId=${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.data);
        // Expand all stories by default for dense view
        const storyNumbers = data.data.userStories?.map((s: UserStory) => s.storyNumber) || [];
        setExpandedStories(new Set(storyNumbers));
      } else {
        setError(data.error || 'Failed to load project');
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setError('Unable to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cellId: string, value: string) => {
    setEditingCell(cellId);
    setEditValue(value);
  };

  const saveEdit = async (field: string, storyId?: string, criteriaId?: string) => {
    try {
      if (field === "storyTitle" || field === "storyDescription" || field === "storyStatus" || field === "storyPriority" || field === "storyTestLink") {
        await fetch("/api/internal-projects/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            action: "update",
            story: {
              id: storyId,
              ...(field === "storyTitle" ? { title: editValue } :
                  field === "storyDescription" ? { description: editValue } :
                  field === "storyStatus" ? { status: editValue } :
                  field === "storyPriority" ? { priority: editValue } :
                  { testLink: editValue })
            }
          })
        });
      } else if (field === "criteriaDescription" || field === "criteriaStatus") {
        await fetch("/api/internal-projects/stories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            storyId,
            action: "update",
            acceptanceCriteria: {
              id: criteriaId,
              ...(field === "criteriaDescription" ? { description: editValue } : { status: editValue })
            }
          })
        });
      }
      
      setEditingCell(null);
      await fetchProject();
    } catch (error) {
      console.error("Failed to save edit:", error);
    }
  };

  const addUserStory = async () => {
    try {
      setError(null);
      const res = await fetch("/api/internal-projects/stories", {
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
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to add story');
      }
      await fetchProject();
    } catch (error) {
      console.error("Failed to add user story:", error);
      setError('Unable to add story. Please try again.');
    }
  };

  const addAcceptanceCriteria = async (storyId: string) => {
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
      await fetchProject();
    } catch (error) {
      console.error("Failed to add acceptance criteria:", error);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!confirm("Delete this user story and all its acceptance criteria?")) return;
    
    try {
      await fetch("/api/internal-projects/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          action: "delete",
          story: { id: storyId }
        })
      });
      await fetchProject();
    } catch (error) {
      console.error("Failed to delete story:", error);
    }
  };

  const deleteCriteria = async (storyId: string, criteriaId: string) => {
    try {
      await fetch("/api/internal-projects/stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          storyId,
          action: "delete",
          acceptanceCriteria: { id: criteriaId }
        })
      });
      await fetchProject();
    } catch (error) {
      console.error("Failed to delete criteria:", error);
    }
  };

  const toggleStoryExpand = (storyNumber: number) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(storyNumber)) {
      newExpanded.delete(storyNumber);
    } else {
      newExpanded.add(storyNumber);
    }
    setExpandedStories(newExpanded);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-900 text-green-200";
      case "In Review": return "bg-blue-900 text-blue-200";
      case "In Progress": return "bg-yellow-900 text-yellow-200";
      default: return "bg-neutral-800 text-neutral-300";
    }
  };

  const formatPriority = (priority: string) => priority;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div>Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  const filteredStories = project.userStories?.filter(story => {
    if (filter !== "all" && story.status !== filter) return false;
    if (priorityFilter !== "all" && story.priority !== priorityFilter) return false;
    return true;
  }) || [];

  const stats = {
    total: project.userStories?.length || 0,
    completed: project.userStories?.filter(s => s.status === "Completed").length || 0,
    inProgress: project.userStories?.filter(s => s.status === "In Progress").length || 0,
    notStarted: project.userStories?.filter(s => s.status === "Not Started").length || 0,
    totalACs: project.userStories?.reduce((sum, s) => sum + (s.acceptanceCriteria?.length || 0), 0) || 0,
    completedACs: project.userStories?.reduce((sum, s) => 
      sum + (s.acceptanceCriteria?.filter(ac => ac.status === "Completed").length || 0), 0) || 0,
  };

  return (
    <div className="h-screen overflow-y-auto bg-neutral-950 text-neutral-200">
      <div className="max-w-[1800px] mx-auto p-4 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">{project.name} - Dense View</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/internal-projects">Home</Link>
              </Button>
              <Button variant="default" size="sm" onClick={addUserStory}>Add Story</Button>
              <Button variant="ghost" size="sm" onClick={() => setExpandedStories(new Set())}>Collapse All</Button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
            <h2 className="text-sm font-medium text-neutral-400 mb-2">About</h2>
            <p className="text-neutral-200">{project.about}</p>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded bg-red-900/40 text-red-200 border border-red-800 text-sm">
              {error}
            </div>
          )}
          
          {/* Stats Bar */}
          <div className="flex gap-4 text-sm mt-4">
            <span>Stories: {stats.total}</span>
            <span className="text-green-400">Completed: {stats.completed}</span>
            <span className="text-yellow-400">In Progress: {stats.inProgress}</span>
            <span className="text-neutral-400">Not Started: {stats.notStarted}</span>
            <span className="ml-4">ACs: {stats.completedACs}/{stats.totalACs}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 flex gap-2 items-center">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1"
          >
            <option value="all">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </Select>

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2 py-1"
          >
            <option value="all">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>

          <button
            onClick={() => {
              if (expandedStories.size === filteredStories.length) {
                setExpandedStories(new Set());
              } else {
                setExpandedStories(new Set(filteredStories.map(s => s.storyNumber)));
              }
            }}
            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
          >
            {expandedStories.size === filteredStories.length ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {/* Dense Table */}
        <div className="bg-neutral-900 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/70">
                <th className="p-2 text-left w-16">#</th>
                <th className="p-2 text-left">Story / Acceptance Criteria</th>
                <th className="p-2 text-left w-28">Status</th>
                <th className="p-2 text-left w-56">Test</th>
                <th className="p-2 text-left w-24">Priority</th>
                <th className="p-2 text-left w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStories.map((story) => (
                <React.Fragment key={story.storyNumber}>
                  <tr className="border-b border-neutral-800 hover:bg-neutral-800/40" data-llm-id={`US${story.storyNumber}`}>
                    <td className="p-2 font-mono text-xs" data-llm-col="id">
                      <button
                        onClick={() => toggleStoryExpand(story.storyNumber)}
                        className="mr-1 text-neutral-500 hover:text-neutral-300"
                      >
                        {expandedStories.has(story.storyNumber) ? "-" : "+"}
                      </button>
                      US{story.storyNumber}
                    </td>
                    
                    <td className="p-2" data-llm-col="title">
                      {editingCell === `story-${story.storyNumber}-title` ? (
                        <Input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyTitle", `US${story.storyNumber}`)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit("storyTitle", `US${story.storyNumber}`)}
                          className="w-full"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <span 
                            onClick={() => handleEdit(`story-${story.storyNumber}-title`, story.title)}
                            className="cursor-pointer hover:text-indigo-400 font-medium"
                          >
                            {story.title}
                          </span>
                          {!expandedStories.has(story.storyNumber) && story.acceptanceCriteria?.length > 0 && (
                            <span className="ml-2 text-xs text-neutral-500">
                              ({story.acceptanceCriteria.length} ACs)
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    
                    <td className="p-2" data-llm-col="status">
                      {editingCell === `story-${story.storyNumber}-status` ? (
                        <Select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyStatus", `US${story.storyNumber}`)}
                          className="w-full"
                          autoFocus
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
                        </Select>
                      ) : (
                        <span
                          onClick={() => handleEdit(`story-${story.storyNumber}-status`, story.status)}
                          className={`cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClass(story.status)}`}
                        >
                          {story.status}
                        </span>
                      )}
                    </td>
                    {/* Test link column */}
                    <td className="p-2" data-llm-col="test">
                      {editingCell === `story-${story.storyNumber}-testlink` ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyTestLink", `US${story.storyNumber}`)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit("storyTestLink", `US${story.storyNumber}`)}
                          className="bg-neutral-800 px-1 py-0.5 rounded w-full text-xs"
                          placeholder="https://…"
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => handleEdit(`story-${story.storyNumber}-testlink`, (story as any).testLink || "")}
                          className="cursor-pointer text-xs text-neutral-300 hover:text-indigo-400"
                        >
                          {(story as any).testLink ? (
                            <a href={(story as any).testLink} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                              {getTestLabel((story as any).testLink)}
                            </a>
                          ) : (
                            <span className="italic text-neutral-500">Add link</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="p-2" data-llm-col="priority">
                      {editingCell === `story-${story.storyNumber}-priority` ? (
                        <Select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit("storyPriority", `US${story.storyNumber}`)}
                          className="w-full"
                          autoFocus
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </Select>
                      ) : (
                        <span onClick={() => handleEdit(`story-${story.storyNumber}-priority`, story.priority)} className="cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300">
                          {formatPriority(story.priority)}
                        </span>
                      )}
                    </td>
                    <td className="p-2" data-llm-col="actions">
                      <button
                        onClick={() => addAcceptanceCriteria(`US${story.storyNumber}`)}
                        className="text-xs px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded mr-1"
                      >
                        +AC
                      </button>
                      <button
                        onClick={() => deleteStory(`US${story.storyNumber}`)}
                        className="text-xs px-2 py-0.5 bg-red-900 hover:bg-red-800 rounded text-red-200"
                      >
                        Del
                      </button>
                    </td>
                  </tr>
                  
                  {/* Acceptance Criteria */}
                  {expandedStories.has(story.storyNumber) && story.acceptanceCriteria?.map((ac) => (
                    <tr key={ac.criteriaNumber} className="border-b border-neutral-800/50 hover:bg-neutral-800/20" data-llm-id={`AC${ac.criteriaNumber}`}>
                      <td className="p-2 pl-8 font-mono text-xs text-neutral-500" data-llm-col="id">
                        AC{ac.criteriaNumber}
                      </td>
                      <td className="p-2 pl-8" data-llm-col="description">
                        {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-desc` ? (
                          <Input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit("criteriaDescription", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit("criteriaDescription", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            className="w-full text-sm"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-desc`, ac.description)}
                            className="cursor-pointer hover:text-indigo-400 text-sm text-neutral-300"
                          >
                            {ac.description}
                          </span>
                        )}
                      </td>
                      <td className="p-2" data-llm-col="status">
                        {editingCell === `ac-${story.storyNumber}-${ac.criteriaNumber}-status` ? (
                          <Select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit("criteriaStatus", `US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                            className="w-full"
                            autoFocus
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="In Review">In Review</option>
                            <option value="Completed">Completed</option>
                          </Select>
                        ) : (
                          <span
                            onClick={() => handleEdit(`ac-${story.storyNumber}-${ac.criteriaNumber}-status`, ac.status)}
                            className={`cursor-pointer inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClass(ac.status)}`}
                          >
                            {ac.status}
                          </span>
                        )}
                      </td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                      <td className="p-2" data-llm-col="actions">
                        <button
                          onClick={() => deleteCriteria(`US${story.storyNumber}`, `AC${ac.criteriaNumber}`)}
                          className="text-xs px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {filteredStories.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              No user stories found. Click "Add Story" to create one.
            </div>
          )}
        </div>

        {/* Quick Add Section */}
        <div className="mt-4 text-xs text-neutral-500">
          Tip: Click on any text to edit inline. Press Enter to save, Escape to cancel.
        </div>
      </div>
    </div>
  );
}

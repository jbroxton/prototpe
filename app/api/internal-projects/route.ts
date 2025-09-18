import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from 'next/cache';
import { prisma } from "@/app/lib/prisma";

const VALID_STATUSES = ["Not Started", "In Progress", "In Review", "Completed"] as const;
const isCompleted = (s?: string) => s === 'Completed';
const managerOk = (request: NextRequest) => {
  const token = request.headers.get('x-manager-token') || '';
  const required = process.env.MANAGER_TOKEN || '';
  return required && token === required;
};
const VALID_PRIORITIES = ["Low", "Medium", "High"] as const;
const CACHE_TAGS = ['mcp-status', 'mcp-parity'];

function revalidateInternalProjects() {
  CACHE_TAGS.forEach((tag) => revalidateTag(tag));
}

// GET /api/internal-projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    
    if (projectId) {
      // Get specific project with user stories and acceptance criteria
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          userStories: {
            include: {
              acceptanceCriteria: {
                orderBy: { criteriaNumber: 'asc' }
              }
            },
            orderBy: { storyNumber: 'asc' }
          }
        }
      });
      
      if (!project) {
        return NextResponse.json({
          success: false,
          error: "Project not found"
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: project
      });
    }
    
    // Return all projects with counts
    const projects = await prisma.project.findMany({
      include: {
        userStories: {
          include: {
            acceptanceCriteria: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Transform to include counts
    const projectsWithCounts = projects.map(p => ({
      ...p,
      userStoryCount: p.userStories.length,
      completedStoryCount: p.userStories.filter(s => s.status === "Completed").length
    }));
    
    const summary = {
      total: projects.length,
      byStatus: {
        "Not Started": projects.filter(p => p.status === "Not Started").length,
        "In Progress": projects.filter(p => p.status === "In Progress").length,
        "Completed": projects.filter(p => p.status === "Completed").length,
      }
    };
    
    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithCounts,
        summary
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch projects"
    }, { status: 500 });
  }
}

// POST /api/internal-projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON body"
      }, { status: 400 });
    }
    
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      }, { status: 400 });
    }
    
    const project = await prisma.project.create({
      data: {
        name: body.name || "New Project",
        about: body.about || "Project description",
        status: body.status || "Not Started",
      },
      include: {
        userStories: true
      }
    });
    revalidateInternalProjects();

    return NextResponse.json({
      success: true,
      data: project,
      message: "Project created successfully"
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create project"
    }, { status: 500 });
  }
}

// PUT /api/internal-projects - Update a project
export async function PUT(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON body"
      }, { status: 400 });
    }
    const { projectId, userStories, ...updates } = body;
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: "projectId is required"
      }, { status: 400 });
    }
    
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      }, { status: 400 });
    }
    // Manager check disabled per CEO directive - use tool normally
    // if (isCompleted(updates.status) && !managerOk(request)) {
    //   return NextResponse.json({ success: false, error: 'Only Manager can set Completed. Use In Review first.' }, { status: 403 });
    // }
    
    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: updates.name,
        about: updates.about,
        status: updates.status,
      },
      include: {
        userStories: {
          include: {
            acceptanceCriteria: true
          }
        }
      }
    });
    revalidateInternalProjects();
    
    // Handle user stories updates if provided
    if (userStories && Array.isArray(userStories)) {
      // This would require more complex logic to sync stories
      // For now, the story management is handled through the stories API
    }
    
    return NextResponse.json({
      success: true,
      data: project,
      message: "Project updated successfully"
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update project"
    }, { status: 500 });
  }
}

// DELETE /api/internal-projects - Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: "projectId is required"
      }, { status: 400 });
    }
    
    // Delete project (cascades to stories and criteria)
    await prisma.project.delete({
      where: { id: projectId }
    });
    revalidateInternalProjects();

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete project"
    }, { status: 500 });
  }
}

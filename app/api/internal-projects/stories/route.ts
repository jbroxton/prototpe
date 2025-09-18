import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from 'next/cache';
import { prisma } from "@/app/lib/prisma";

const VALID_STATUSES = ["Not Started", "In Progress", "In Review", "Completed"] as const;
const VALID_PRIORITIES = ["Low", "Medium", "High"] as const;
const isCompleted = (s?: string) => s === 'Completed';
const managerOk = (request: NextRequest) => {
  const token = request.headers.get('x-manager-token') || '';
  const required = process.env.MANAGER_TOKEN || '';
  return required && token === required;
};
const CACHE_TAGS = ['mcp-status', 'mcp-parity'];

const revalidateInternalProjects = () => {
  CACHE_TAGS.forEach((tag) => revalidateTag(tag));
};

function normalizeTestLink(raw: unknown): { ok: true; value: string | null | undefined } | { ok: false; error: string } {
  if (typeof raw === 'undefined') return { ok: true, value: undefined };
  if (raw === null) return { ok: true, value: null };
  const str = String(raw).trim();
  if (str === '') return { ok: true, value: null };
  if (str.length > 2048) return { ok: false, error: 'Invalid testLink: exceeds 2048 characters' };
  try {
    const u = new URL(str);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return { ok: false, error: 'Invalid testLink: must use http or https' };
  } catch {
    return { ok: false, error: 'Invalid testLink: must be a valid URL' };
  }
  return { ok: true, value: str };
}

// POST /api/internal-projects/stories - Add or update a user story
export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { projectId, story, action } = body;
    
    if (!projectId || !story) {
      return NextResponse.json({
        success: false,
        error: "projectId and story are required"
      }, { status: 400 });
    }
    
    if (action === "add") {
      if (story.status && !VALID_STATUSES.includes(story.status)) {
        return NextResponse.json({
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        }, { status: 400 });
      }
      if (story.priority && !VALID_PRIORITIES.includes(story.priority)) {
        return NextResponse.json({
          success: false,
          error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
        }, { status: 400 });
      }
      // Get the next story number
      const existingStories = await prisma.userStory.findMany({
        where: { projectId },
        orderBy: { storyNumber: 'desc' },
        take: 1
      });
      
      const nextStoryNumber = existingStories.length > 0 
        ? existingStories[0].storyNumber + 1 
        : 1;
      
      const data: any = {
        projectId,
        storyNumber: nextStoryNumber,
        title: story.title || `User Story ${nextStoryNumber}`,
        description: story.description || "As a user, I want to...",
        status: story.status || "Not Started",
        priority: story.priority || "Medium",
      };
      // Optional: assign to a release
      if (typeof story.releaseId !== 'undefined' && story.releaseId !== null) {
        const rel = await prisma.release.findUnique({ where: { id: String(story.releaseId) } });
        if (!rel || rel.projectId !== projectId) {
          return NextResponse.json({ success: false, error: 'Invalid releaseId for this project' }, { status: 400 });
        }
        data.releaseId = rel.id;
      }
      if (typeof story.testLink !== 'undefined') {
        const link = normalizeTestLink(story.testLink);
        if (!link.ok) return NextResponse.json({ success: false, error: link.error }, { status: 400 });
        data.testLink = link.value ?? null;
      }

      const newStory = await prisma.userStory.create({
        data,
        include: { acceptanceCriteria: true }
      });
      
      // Update project's updatedAt
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      });
      revalidateInternalProjects();

      return NextResponse.json({
        success: true,
        data: {
          ...newStory,
          id: `US${newStory.storyNumber}` // Include formatted ID for compatibility
        },
        message: "User story added successfully"
      });
    } else if (action === "update") {
      // Find story by ID or story number
      let userStory;
      
      if (story.id && story.id.startsWith("US")) {
        // Extract story number from US1, US2, etc.
        const storyNumber = parseInt(story.id.substring(2));
        userStory = await prisma.userStory.findUnique({
          where: {
            projectId_storyNumber: {
              projectId,
              storyNumber
            }
          }
        });
      } else if (story.id) {
        userStory = await prisma.userStory.findUnique({
          where: { id: story.id }
        });
      }
      
      if (!userStory) {
        return NextResponse.json({
          success: false,
          error: "User story not found"
        }, { status: 404 });
      }
      
      if (story.status && !VALID_STATUSES.includes(story.status)) {
        return NextResponse.json({
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        }, { status: 400 });
      }
      // Manager check disabled per CEO directive - use tool normally
      // if (isCompleted(story.status) && !managerOk(request)) {
      //   return NextResponse.json({ success: false, error: 'Only Manager can set Completed. Use In Review first.' }, { status: 403 });
      // }
      if (story.priority && !VALID_PRIORITIES.includes(story.priority)) {
        return NextResponse.json({
          success: false,
          error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
        }, { status: 400 });
      }
      // Validate story testLink if provided
      if (typeof story.testLink !== 'undefined') {
        const link = normalizeTestLink(story.testLink);
        if (!link.ok) return NextResponse.json({ success: false, error: link.error }, { status: 400 });
      }

      // Handle release assignment updates
      let releaseUpdate: { releaseId?: string | null } = {};
      if (Object.prototype.hasOwnProperty.call(story, 'releaseId')) {
        if (story.releaseId === null) {
          releaseUpdate.releaseId = null; // move to backlog
        } else if (story.releaseId) {
          const rel = await prisma.release.findUnique({ where: { id: String(story.releaseId) } });
          if (!rel || rel.projectId !== projectId) {
            return NextResponse.json({ success: false, error: 'Invalid releaseId for this project' }, { status: 400 });
          }
          releaseUpdate.releaseId = rel.id;
        }
      }

      const updatedStory = await prisma.userStory.update({
        where: { id: userStory.id },
        data: {
          title: story.title || userStory.title,
          description: story.description || userStory.description,
          testLink: story.testLink !== undefined ? story.testLink : userStory.testLink,
          status: story.status || userStory.status,
          priority: story.priority || userStory.priority,
          ...releaseUpdate,
        },
        include: {
          acceptanceCriteria: true
        }
      });
      
      // Update project's updatedAt
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      });
      revalidateInternalProjects();

      return NextResponse.json({
        success: true,
        data: {
          ...updatedStory,
          id: `US${updatedStory.storyNumber}`
        },
        message: "User story updated successfully"
      });
    } else if (action === "delete") {
      let userStory;
      
      if (story.id && story.id.startsWith("US")) {
        const storyNumber = parseInt(story.id.substring(2));
        userStory = await prisma.userStory.findUnique({
          where: {
            projectId_storyNumber: {
              projectId,
              storyNumber
            }
          }
        });
      } else if (story.id) {
        userStory = await prisma.userStory.findUnique({
          where: { id: story.id }
        });
      }
      
      if (!userStory) {
        return NextResponse.json({
          success: false,
          error: "User story not found"
        }, { status: 404 });
      }
      
      await prisma.userStory.delete({
        where: { id: userStory.id }
      });
      
      // Update project's updatedAt
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      });
      revalidateInternalProjects();

      return NextResponse.json({
        success: true,
        message: "User story deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Invalid action. Use 'add', 'update', or 'delete'"
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing user story:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to manage user story"
    }, { status: 500 });
  }
}

// PUT /api/internal-projects/stories - Update acceptance criteria
export async function PUT(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { projectId, storyId, acceptanceCriteria, action } = body;
    
    if (!projectId || !storyId) {
      return NextResponse.json({
        success: false,
        error: "projectId and storyId are required"
      }, { status: 400 });
    }
    
    // Find story
    let userStory;
    
    if (storyId.startsWith("US")) {
      const storyNumber = parseInt(storyId.substring(2));
      userStory = await prisma.userStory.findUnique({
        where: {
          projectId_storyNumber: {
            projectId,
            storyNumber
          }
        }
      });
    } else {
      userStory = await prisma.userStory.findUnique({
        where: { id: storyId }
      });
    }
    
    if (!userStory) {
      return NextResponse.json({
        success: false,
        error: "User story not found"
      }, { status: 404 });
    }
    
    if (action === "add") {
      if (acceptanceCriteria?.status && !VALID_STATUSES.includes(acceptanceCriteria.status)) {
        return NextResponse.json({
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        }, { status: 400 });
      }
      // Validate AC testLink if provided
      if (typeof acceptanceCriteria?.testLink !== 'undefined') {
        const link = normalizeTestLink(acceptanceCriteria.testLink);
        if (!link.ok) return NextResponse.json({ success: false, error: link.error }, { status: 400 });
      }
      // Get the next criteria number
      const existingCriteria = await prisma.acceptanceCriteria.findMany({
        where: { userStoryId: userStory.id },
        orderBy: { criteriaNumber: 'desc' },
        take: 1
      });
      
      const nextCriteriaNumber = existingCriteria.length > 0 
        ? existingCriteria[0].criteriaNumber + 1 
        : 1;
      
      const newAC = await prisma.acceptanceCriteria.create({
        data: {
          userStoryId: userStory.id,
          criteriaNumber: nextCriteriaNumber,
          description: acceptanceCriteria?.description || "Given..., When..., Then...",
          status: acceptanceCriteria?.status || "Not Started",
          ...(typeof acceptanceCriteria?.testLink !== 'undefined' ? { testLink: acceptanceCriteria.testLink === '' ? null : String(acceptanceCriteria.testLink).trim() } : {}),
        }
      });
      
      // Update timestamps
      await prisma.userStory.update({
        where: { id: userStory.id },
        data: { updatedAt: new Date() }
      });
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      });
      revalidateInternalProjects();

      return NextResponse.json({
        success: true,
        data: {
          ...newAC,
          id: `AC${newAC.criteriaNumber}`
        },
        message: "Acceptance criteria added successfully"
      });
    } else if (action === "update") {
      let criteria;
      
      if (acceptanceCriteria.id && acceptanceCriteria.id.startsWith("AC")) {
        const criteriaNumber = parseInt(acceptanceCriteria.id.substring(2));
        criteria = await prisma.acceptanceCriteria.findUnique({
          where: {
            userStoryId_criteriaNumber: {
              userStoryId: userStory.id,
              criteriaNumber
            }
          }
        });
      } else if (acceptanceCriteria.id) {
        criteria = await prisma.acceptanceCriteria.findUnique({
          where: { id: acceptanceCriteria.id }
        });
      }
      
      if (!criteria) {
        return NextResponse.json({
          success: false,
          error: "Acceptance criteria not found"
        }, { status: 404 });
      }
      
      if (acceptanceCriteria.status && !VALID_STATUSES.includes(acceptanceCriteria.status)) {
        return NextResponse.json({
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        }, { status: 400 });
      }
      // Validate AC testLink if provided
      let acTestLink: string | null | undefined = undefined;
      if (typeof acceptanceCriteria.testLink !== 'undefined') {
        const link = normalizeTestLink(acceptanceCriteria.testLink);
        if (!link.ok) return NextResponse.json({ success: false, error: link.error }, { status: 400 });
        acTestLink = link.value ?? null;
      }
      // Manager check disabled per CEO directive - use tool normally
      // if (isCompleted(acceptanceCriteria.status) && !managerOk(request)) {
      //   return NextResponse.json({ success: false, error: 'Only Manager can set Completed. Use In Review first.' }, { status: 403 });
      // }

      const updatedAC = await prisma.acceptanceCriteria.update({
        where: { id: criteria.id },
        data: {
          description: acceptanceCriteria.description || criteria.description,
          status: acceptanceCriteria.status || criteria.status,
          ...(typeof acTestLink !== 'undefined' ? { testLink: acTestLink } : {}),
        }
      });
      
      // Update timestamps
      await prisma.userStory.update({
        where: { id: userStory.id },
        data: { updatedAt: new Date() }
      });
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      });
      revalidateInternalProjects();

      return NextResponse.json({
        success: true,
        data: {
          ...updatedAC,
          id: `AC${updatedAC.criteriaNumber}`
        },
        message: "Acceptance criteria updated successfully"
      });
    } else if (action === "delete") {
      let criteria;
      
      if (acceptanceCriteria.id && acceptanceCriteria.id.startsWith("AC")) {
        const criteriaNumber = parseInt(acceptanceCriteria.id.substring(2));
        criteria = await prisma.acceptanceCriteria.findUnique({
          where: {
            userStoryId_criteriaNumber: {
              userStoryId: userStory.id,
              criteriaNumber
            }
          }
        });
      } else if (acceptanceCriteria.id) {
        criteria = await prisma.acceptanceCriteria.findUnique({
          where: { id: acceptanceCriteria.id }
        });
      }
      
      if (!criteria) {
        return NextResponse.json({
          success: false,
          error: "Acceptance criteria not found"
        }, { status: 404 });
      }
      
      await prisma.acceptanceCriteria.delete({
        where: { id: criteria.id }
      });
      
      // Update timestamps
      await prisma.userStory.update({
        where: { id: userStory.id },
        data: { updatedAt: new Date() }
      });
      await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() }
      });
      revalidateInternalProjects();

      return NextResponse.json({
        success: true,
        message: "Acceptance criteria deleted successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Invalid action. Use 'add', 'update', or 'delete'"
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error managing acceptance criteria:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to manage acceptance criteria"
    }, { status: 500 });
  }
}

// GET /api/internal-projects/stories - Get all stories for a project
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    
    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: "projectId is required"
      }, { status: 400 });
    }
    
    const userStories = await prisma.userStory.findMany({
      where: { projectId },
      include: {
        acceptanceCriteria: {
          orderBy: { criteriaNumber: 'asc' }
        }
      },
      orderBy: { storyNumber: 'asc' }
    });
    
    // Transform to include formatted IDs
    const transformedStories = userStories.map(story => ({
      ...story,
      id: `US${story.storyNumber}`,
      acceptanceCriteria: story.acceptanceCriteria.map(ac => ({
        ...ac,
        id: `AC${ac.criteriaNumber}`
      }))
    }));
    
    const summary = {
      total: userStories.length,
      byStatus: {
        "Not Started": userStories.filter(s => s.status === "Not Started").length,
        "In Progress": userStories.filter(s => s.status === "In Progress").length,
        "Completed": userStories.filter(s => s.status === "Completed").length,
      },
      byPriority: {
        "High": userStories.filter(s => s.priority === "High").length,
        "Medium": userStories.filter(s => s.priority === "Medium").length,
        "Low": userStories.filter(s => s.priority === "Low").length,
      }
    };
    
    return NextResponse.json({
      success: true,
      data: {
        projectId,
        userStories: transformedStories,
        summary
      }
    });
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch user stories"
    }, { status: 500 });
  }
}

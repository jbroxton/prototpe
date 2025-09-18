import { prisma } from '../app/lib/prisma.ts';

async function main() {
  const name = 'Releases';
  const existing = await prisma.project.findFirst({ where: { name } });
  if (existing) {
    console.log('Project already exists:', existing.id, existing.name);
    await prisma.$disconnect();
    return;
  }

  const about = `# Releases Project — Overview (Stage 2)

## Objective
Establish a clear, PM‑friendly release management workflow in the Internal Projects tool so stories and ACs can be scoped into Releases (R1, R2, …) with an About description, status, and target date. Success is measured by PMs being able to plan and track scope per release with no project renaming.

## Introduction
This project delivers a release‑centric dense view for a single project. It adds a Release model (with name, about, status, target date) and a UI that groups Backlog + each Release. PMs can create releases, assign stories, and edit release About in place.

## Current State
We can create projects, stories, and ACs; stories have status/priority/test links. Stories now support assignment to releases, and releases are listed with simple metadata. We need a robust grouping view and per‑release About for planning context.

## Users
- PMs: define release scope and context, assign/move stories.
- Engineers: see per‑release scope; add AC test links; update statuses.
- Managers: review per‑release progress and ensure AC/test link completeness.

## Solution
- Model: Release with sequential number, name, about (Markdown), status, target date; stories link via releaseId or remain in Backlog.
- UI: Group by Release view with sections for Backlog, R1, R2… Each section shows About preview, progress (stories/ACs), and an Edit action for About.
- Operations: Per‑story release selector and batch move; export per release or whole project.
`;

  const project = await prisma.project.create({
    data: { name, about, status: 'Not Started' },
  });
  console.log('Created project:', project.id, project.name);
  await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });


-- Create remaining domain tables absent from initial migration
CREATE TABLE "public"."PrMergeMap" (
    "id" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "mergeSha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrMergeMap_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PrMergeMap_repo_prNumber_mergeSha_key" ON "public"."PrMergeMap"("repo", "prNumber", "mergeSha");
CREATE INDEX "PrMergeMap_repo_prNumber_idx" ON "public"."PrMergeMap"("repo", "prNumber");
CREATE INDEX "PrMergeMap_mergeSha_idx" ON "public"."PrMergeMap"("mergeSha");

CREATE TABLE "public"."JiraStory" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "jiraKey" TEXT NOT NULL,
    "lastStatus" TEXT,
    "labels" TEXT[] NOT NULL DEFAULT '{}'::text[],
    "lastSummary" TEXT,
    "lastDescription" TEXT,
    "epicKey" TEXT,
    "appUpdatedAt" TIMESTAMP(3),
    "jiraUpdatedAt" TIMESTAMP(3),
    "localUpdatedAt" TIMESTAMP(3),
    "jiraSnapshot" JSONB,
    "deleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JiraStory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JiraStory_storyId_key" ON "public"."JiraStory"("storyId");
CREATE UNIQUE INDEX "JiraStory_jiraKey_key" ON "public"."JiraStory"("jiraKey");

CREATE TABLE "public"."JiraEvent" (
    "id" TEXT NOT NULL,
    "jiraKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JiraEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."JiraEpic" (
    "id" TEXT NOT NULL,
    "appEpicId" TEXT NOT NULL,
    "jiraKey" TEXT NOT NULL,
    "lastStatus" TEXT,
    "labels" TEXT[] NOT NULL DEFAULT '{}'::text[],
    "lastSummary" TEXT,
    "lastDescription" TEXT,
    "appUpdatedAt" TIMESTAMP(3),
    "jiraUpdatedAt" TIMESTAMP(3),
    "deleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JiraEpic_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JiraEpic_appEpicId_key" ON "public"."JiraEpic"("appEpicId");
CREATE UNIQUE INDEX "JiraEpic_jiraKey_key" ON "public"."JiraEpic"("jiraKey");

CREATE TABLE "public"."JiraSyncAudit" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "jiraKey" TEXT NOT NULL,
    "appId" TEXT,
    "fieldsChanged" TEXT[] NOT NULL DEFAULT '{}'::text[],
    "diff" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JiraSyncAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Release" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "releaseNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "about" TEXT,
    "notes" TEXT,
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Release_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Release_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Release_projectId_releaseNumber_key" ON "public"."Release"("projectId", "releaseNumber");
CREATE INDEX "Release_projectId_idx" ON "public"."Release"("projectId");

CREATE TABLE "public"."UserStory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "releaseId" TEXT,
    "storyNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "testLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserStory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserStory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserStory_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "public"."Release"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserStory_projectId_storyNumber_key" ON "public"."UserStory"("projectId", "storyNumber");
CREATE INDEX "UserStory_projectId_idx" ON "public"."UserStory"("projectId");
CREATE INDEX "UserStory_releaseId_idx" ON "public"."UserStory"("releaseId");

CREATE TABLE "public"."AcceptanceCriteria" (
    "id" TEXT NOT NULL,
    "userStoryId" TEXT NOT NULL,
    "criteriaNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "testLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AcceptanceCriteria_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AcceptanceCriteria_userStoryId_fkey" FOREIGN KEY ("userStoryId") REFERENCES "public"."UserStory"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AcceptanceCriteria_userStoryId_criteriaNumber_key" ON "public"."AcceptanceCriteria"("userStoryId", "criteriaNumber");
CREATE INDEX "AcceptanceCriteria_userStoryId_idx" ON "public"."AcceptanceCriteria"("userStoryId");

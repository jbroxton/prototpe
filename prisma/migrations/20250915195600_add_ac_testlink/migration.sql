-- Add testLink column to AcceptanceCriteria
ALTER TABLE "public"."AcceptanceCriteria" ADD COLUMN IF NOT EXISTS "testLink" TEXT;

-- Enable pg_trgm for fast ILIKE searches (already available on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN trigram indexes for full-text-style ILIKE on search fields
CREATE INDEX IF NOT EXISTS "Employee_firstName_trgm_idx" ON "Employee" USING GIN ("firstName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Employee_lastName_trgm_idx"  ON "Employee" USING GIN ("lastName"  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Employee_email_trgm_idx"     ON "Employee" USING GIN ("email"     gin_trgm_ops);

-- B-tree index for default sort (lastName ASC)
CREATE INDEX IF NOT EXISTS "Employee_lastName_idx" ON "Employee"("lastName");

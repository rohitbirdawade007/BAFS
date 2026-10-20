-- BAFS PostgreSQL initialization
-- This script runs once when the PostgreSQL container is first created.
-- It enables the pgcrypto extension for UUID generation support.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search indexes

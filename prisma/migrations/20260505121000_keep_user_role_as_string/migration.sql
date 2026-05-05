-- Keep Better Auth roles as text values in PostgreSQL.
-- The current database already stores users.role as text, so this migration
-- reconciles Prisma history after the enum migration was marked as applied.
ALTER TABLE "users"
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT,
ALTER COLUMN "role" SET DEFAULT 'user';

DROP TYPE IF EXISTS "Role";

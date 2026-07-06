-- =============================================================
-- Миграция: add-format-enums
-- Дата: 2026-07-06
-- Описание: Новые enum-типы, поля Challenge, конвертация строк
--           в enum для OrganizerMember, UserProgress, StepProgress
-- =============================================================

-- 1. Новые enum-типы
CREATE TYPE "ChallengeFormat" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
CREATE TYPE "OrganizerMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "OrganizerMemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED');
CREATE TYPE "UserProgressStatus" AS ENUM ('JOINED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'WITHDRAWN');
CREATE TYPE "StepProgressStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- 2. Новые поля в Challenge
ALTER TABLE "Challenge" ADD COLUMN "format" "ChallengeFormat" NOT NULL DEFAULT 'ONLINE';
ALTER TABLE "Challenge" ADD COLUMN "address" TEXT;
ALTER TABLE "Challenge" ADD COLUMN "maxParticipants" INTEGER;

-- 3. Новые поля в StepProgress
ALTER TABLE "StepProgress" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "StepProgress" ADD COLUMN "reviewNote" TEXT;

-- 4. Индекс на StepProgress.status
CREATE INDEX "StepProgress_status_idx" ON "StepProgress"("status");

-- 5. Конвертация OrganizerMember.roleInOrganizer: String → enum
--    Приводим к верхнему регистру, неизвестные значения → MEMBER
ALTER TABLE "OrganizerMember" ADD COLUMN "roleInOrganizer_new" "OrganizerMemberRole" NOT NULL DEFAULT 'MEMBER';

UPDATE "OrganizerMember"
SET "roleInOrganizer_new" = CASE
  WHEN UPPER("roleInOrganizer") = 'OWNER' THEN 'OWNER'::"OrganizerMemberRole"
  WHEN UPPER("roleInOrganizer") = 'ADMIN' THEN 'ADMIN'::"OrganizerMemberRole"
  ELSE 'MEMBER'::"OrganizerMemberRole"
END;

ALTER TABLE "OrganizerMember" DROP COLUMN "roleInOrganizer";
ALTER TABLE "OrganizerMember" RENAME COLUMN "roleInOrganizer_new" TO "roleInOrganizer";

-- 6. Конвертация OrganizerMember.status: String → enum
ALTER TABLE "OrganizerMember" ADD COLUMN "status_new" "OrganizerMemberStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "OrganizerMember"
SET "status_new" = CASE
  WHEN UPPER("status") = 'ACTIVE' THEN 'ACTIVE'::"OrganizerMemberStatus"
  WHEN UPPER("status") = 'INVITED' THEN 'INVITED'::"OrganizerMemberStatus"
  WHEN UPPER("status") = 'SUSPENDED' THEN 'SUSPENDED'::"OrganizerMemberStatus"
  WHEN UPPER("status") = 'REMOVED' THEN 'REMOVED'::"OrganizerMemberStatus"
  ELSE 'ACTIVE'::"OrganizerMemberStatus"
END;

ALTER TABLE "OrganizerMember" DROP COLUMN "status";
ALTER TABLE "OrganizerMember" RENAME COLUMN "status_new" TO "status";

-- 7. Конвертация UserProgress.status: String → enum
ALTER TABLE "UserProgress" ADD COLUMN "status_new" "UserProgressStatus" NOT NULL DEFAULT 'JOINED';

UPDATE "UserProgress"
SET "status_new" = CASE
  WHEN UPPER("status") = 'JOINED' THEN 'JOINED'::"UserProgressStatus"
  WHEN UPPER("status") = 'IN_PROGRESS' THEN 'IN_PROGRESS'::"UserProgressStatus"
  WHEN UPPER("status") = 'COMPLETED' THEN 'COMPLETED'::"UserProgressStatus"
  WHEN UPPER("status") = 'FAILED' THEN 'FAILED'::"UserProgressStatus"
  WHEN UPPER("status") = 'WITHDRAWN' THEN 'WITHDRAWN'::"UserProgressStatus"
  ELSE 'JOINED'::"UserProgressStatus"
END;

ALTER TABLE "UserProgress" DROP COLUMN "status";
ALTER TABLE "UserProgress" RENAME COLUMN "status_new" TO "status";

-- 8. Конвертация StepProgress.status: String → enum
ALTER TABLE "StepProgress" ADD COLUMN "status_new" "StepProgressStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "StepProgress"
SET "status_new" = CASE
  WHEN UPPER("status") = 'PENDING' THEN 'PENDING'::"StepProgressStatus"
  WHEN UPPER("status") = 'SUBMITTED' THEN 'SUBMITTED'::"StepProgressStatus"
  WHEN UPPER("status") = 'APPROVED' THEN 'APPROVED'::"StepProgressStatus"
  WHEN UPPER("status") = 'REJECTED' THEN 'REJECTED'::"StepProgressStatus"
  WHEN UPPER("status") = 'COMPLETED' THEN 'APPROVED'::"StepProgressStatus"
  ELSE 'PENDING'::"StepProgressStatus"
END;

ALTER TABLE "StepProgress" DROP COLUMN "status";
ALTER TABLE "StepProgress" RENAME COLUMN "status_new" TO "status";

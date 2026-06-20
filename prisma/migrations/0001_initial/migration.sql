CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED');
CREATE TYPE "OrganizationType" AS ENUM ('AGENCY', 'DEVELOPER', 'CORPORATE');
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED');
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'ARCHIVED');
CREATE TYPE "OwnershipType" AS ENUM ('USER', 'ORGANIZATION', 'SYSTEM');
CREATE TYPE "SourceType" AS ENUM ('INTERNAL', 'IMPORTED', 'PARTNER');
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'WAITING_CLIENT', 'APPROVED', 'REJECTED', 'CLOSED');
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'FLOOR_PLAN', 'DOCUMENT');
CREATE TYPE "NotificationType" AS ENUM ('REQUEST_CREATED', 'REQUEST_UPDATED', 'BOOKING_CREATED', 'BOOKING_UPDATED', 'LISTING_UPDATED', 'SYSTEM');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

CREATE TABLE "Role" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

CREATE TABLE "Permission" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

CREATE TABLE "PermissionRole" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "roleId" UUID NOT NULL,
  "permissionId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PermissionRole_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PermissionRole_roleId_permissionId_key" ON "PermissionRole"("roleId", "permissionId");
CREATE INDEX "PermissionRole_roleId_idx" ON "PermissionRole"("roleId");
CREATE INDEX "PermissionRole_permissionId_idx" ON "PermissionRole"("permissionId");
ALTER TABLE "PermissionRole" ADD CONSTRAINT "PermissionRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PermissionRole" ADD CONSTRAINT "PermissionRole_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "UserRole" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "roleId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Organization" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "OrganizationType" NOT NULL,
  "name" TEXT NOT NULL,
  "legalName" TEXT,
  "taxId" TEXT,
  "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Organization_taxId_key" ON "Organization"("taxId");
CREATE INDEX "Organization_type_idx" ON "Organization"("type");
CREATE INDEX "Organization_status_idx" ON "Organization"("status");
CREATE INDEX "Organization_deletedAt_idx" ON "Organization"("deletedAt");

CREATE TABLE "OrganizationMember" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "roleInOrganization" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");
CREATE INDEX "OrganizationMember_status_idx" ON "OrganizationMember"("status");
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Property" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "propertyType" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "region" TEXT,
  "city" TEXT NOT NULL,
  "district" TEXT,
  "address" TEXT NOT NULL,
  "postalCode" TEXT,
  "geoLat" DECIMAL,
  "geoLng" DECIMAL,
  "area" DECIMAL,
  "rooms" INTEGER,
  "floor" INTEGER,
  "totalFloors" INTEGER,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Property_country_idx" ON "Property"("country");
CREATE INDEX "Property_city_idx" ON "Property"("city");
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");
CREATE INDEX "Property_deletedAt_idx" ON "Property"("deletedAt");

CREATE TABLE "Listing" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "propertyId" UUID NOT NULL,
  "ownerType" "OwnershipType" NOT NULL,
  "ownerId" UUID,
  "sourceType" "SourceType" NOT NULL,
  "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "price" DECIMAL NOT NULL,
  "currency" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Listing_propertyId_idx" ON "Listing"("propertyId");
CREATE INDEX "Listing_ownerType_ownerId_idx" ON "Listing"("ownerType", "ownerId");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE INDEX "Listing_publishedAt_idx" ON "Listing"("publishedAt");
CREATE INDEX "Listing_price_idx" ON "Listing"("price");
CREATE INDEX "Listing_deletedAt_idx" ON "Listing"("deletedAt");
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "PropertyMedia" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "propertyId" UUID,
  "listingId" UUID,
  "type" "MediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "altText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PropertyMedia_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PropertyMedia_propertyId_idx" ON "PropertyMedia"("propertyId");
CREATE INDEX "PropertyMedia_listingId_idx" ON "PropertyMedia"("listingId");
CREATE INDEX "PropertyMedia_type_idx" ON "PropertyMedia"("type");
ALTER TABLE "PropertyMedia" ADD CONSTRAINT "PropertyMedia_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyMedia" ADD CONSTRAINT "PropertyMedia_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ListingStatusHistory" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "listingId" UUID NOT NULL,
  "fromStatus" "ListingStatus",
  "toStatus" "ListingStatus" NOT NULL,
  "changedByUserId" UUID,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ListingStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ListingStatusHistory_listingId_idx" ON "ListingStatusHistory"("listingId");
CREATE INDEX "ListingStatusHistory_toStatus_idx" ON "ListingStatusHistory"("toStatus");
CREATE INDEX "ListingStatusHistory_createdAt_idx" ON "ListingStatusHistory"("createdAt");
ALTER TABLE "ListingStatusHistory" ADD CONSTRAINT "ListingStatusHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingStatusHistory" ADD CONSTRAINT "ListingStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "SearchSession" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID,
  "sessionKey" TEXT NOT NULL,
  "query" TEXT,
  "filters" JSONB NOT NULL,
  "sort" TEXT,
  "page" INTEGER,
  "scrollPosition" INTEGER,
  "lastListingId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "SearchSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SearchSession_sessionKey_key" ON "SearchSession"("sessionKey");
CREATE INDEX "SearchSession_userId_idx" ON "SearchSession"("userId");
CREATE INDEX "SearchSession_lastListingId_idx" ON "SearchSession"("lastListingId");
CREATE INDEX "SearchSession_deletedAt_idx" ON "SearchSession"("deletedAt");
ALTER TABLE "SearchSession" ADD CONSTRAINT "SearchSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "SavedSearch" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "query" TEXT,
  "filters" JSONB NOT NULL,
  "sort" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SavedSearch_userId_name_key" ON "SavedSearch"("userId", "name");
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");
CREATE INDEX "SavedSearch_deletedAt_idx" ON "SavedSearch"("deletedAt");
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Favorite" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "listingId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Request" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID,
  "organizationId" UUID,
  "listingId" UUID NOT NULL,
  "assignedToUserId" UUID,
  "source" TEXT NOT NULL,
  "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
  "message" TEXT,
  "contactName" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Request_listingId_idx" ON "Request"("listingId");
CREATE INDEX "Request_userId_idx" ON "Request"("userId");
CREATE INDEX "Request_organizationId_idx" ON "Request"("organizationId");
CREATE INDEX "Request_assignedToUserId_idx" ON "Request"("assignedToUserId");
CREATE INDEX "Request_status_idx" ON "Request"("status");
CREATE INDEX "Request_createdAt_idx" ON "Request"("createdAt");
CREATE INDEX "Request_deletedAt_idx" ON "Request"("deletedAt");
ALTER TABLE "Request" ADD CONSTRAINT "Request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Request" ADD CONSTRAINT "Request_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Request" ADD CONSTRAINT "Request_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Request" ADD CONSTRAINT "Request_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "RequestEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "requestId" UUID NOT NULL,
  "fromStatus" "RequestStatus",
  "toStatus" "RequestStatus" NOT NULL,
  "changedByUserId" UUID,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RequestEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RequestEvent_requestId_idx" ON "RequestEvent"("requestId");
CREATE INDEX "RequestEvent_toStatus_idx" ON "RequestEvent"("toStatus");
CREATE INDEX "RequestEvent_createdAt_idx" ON "RequestEvent"("createdAt");
ALTER TABLE "RequestEvent" ADD CONSTRAINT "RequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequestEvent" ADD CONSTRAINT "RequestEvent_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Booking" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "requestId" UUID,
  "userId" UUID,
  "listingId" UUID NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "confirmedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Booking_requestId_idx" ON "Booking"("requestId");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_listingId_idx" ON "Booking"("listingId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_scheduledAt_idx" ON "Booking"("scheduledAt");
CREATE INDEX "Booking_deletedAt_idx" ON "Booking"("deletedAt");
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "BookingEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "bookingId" UUID NOT NULL,
  "fromStatus" "BookingStatus",
  "toStatus" "BookingStatus" NOT NULL,
  "changedByUserId" UUID,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BookingEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BookingEvent_bookingId_idx" ON "BookingEvent"("bookingId");
CREATE INDEX "BookingEvent_toStatus_idx" ON "BookingEvent"("toStatus");
CREATE INDEX "BookingEvent_createdAt_idx" ON "BookingEvent"("createdAt");
ALTER TABLE "BookingEvent" ADD CONSTRAINT "BookingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingEvent" ADD CONSTRAINT "BookingEvent_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Developer" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL,
  "brandName" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Developer_organizationId_key" ON "Developer"("organizationId");
CREATE INDEX "Developer_status_idx" ON "Developer"("status");
CREATE INDEX "Developer_deletedAt_idx" ON "Developer"("deletedAt");
ALTER TABLE "Developer" ADD CONSTRAINT "Developer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Project" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "developerId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_developerId_idx" ON "Project"("developerId");
CREATE INDEX "Project_status_idx" ON "Project"("status");
CREATE INDEX "Project_country_idx" ON "Project"("country");
CREATE INDEX "Project_city_idx" ON "Project"("city");
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");
ALTER TABLE "Project" ADD CONSTRAINT "Project_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProjectUnit" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "propertyId" UUID,
  "unitCode" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "price" DECIMAL,
  "currency" TEXT,
  "area" DECIMAL,
  "floor" INTEGER,
  "rooms" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ProjectUnit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProjectUnit_projectId_unitCode_key" ON "ProjectUnit"("projectId", "unitCode");
CREATE INDEX "ProjectUnit_projectId_idx" ON "ProjectUnit"("projectId");
CREATE INDEX "ProjectUnit_status_idx" ON "ProjectUnit"("status");
CREATE INDEX "ProjectUnit_price_idx" ON "ProjectUnit"("price");
CREATE INDEX "ProjectUnit_rooms_idx" ON "ProjectUnit"("rooms");
CREATE INDEX "ProjectUnit_deletedAt_idx" ON "ProjectUnit"("deletedAt");
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectUnit" ADD CONSTRAINT "ProjectUnit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Agency" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Agency_organizationId_key" ON "Agency"("organizationId");
CREATE INDEX "Agency_status_idx" ON "Agency"("status");
CREATE INDEX "Agency_deletedAt_idx" ON "Agency"("deletedAt");
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Notification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");
CREATE INDEX "Notification_deletedAt_idx" ON "Notification"("deletedAt");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actorUserId" UUID,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" UUID,
  "beforeState" JSONB,
  "afterState" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- CreateEnum
CREATE TYPE "public"."YtCreatorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."AccountEditorMapStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'NO_MAP');

-- CreateEnum
CREATE TYPE "public"."CreatorEditorMapStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'NO_MAP');

-- CreateEnum
CREATE TYPE "public"."ContributeStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ContributionVersionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "phoneVerified" BOOLEAN,
    "profileCompleted" BOOLEAN,
    "subscriptionId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "planSlug" TEXT,
    "status" TEXT,
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "polarCheckoutId" TEXT,
    "polarSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "polarOrderId" TEXT NOT NULL,
    "checkoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Test" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LogEntry" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT,
    "message" TEXT,
    "correlationId" TEXT,
    "metadata" TEXT,
    "context" TEXT,
    "type" TEXT,
    "method" TEXT,
    "url" TEXT,
    "statusCode" INTEGER,
    "duration" TEXT,
    "error" TEXT,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."YtCreator" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "status" "public"."YtCreatorStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YtCreator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "integration_url" TEXT,
    "integration_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account_editor_map" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "editor_id" TEXT NOT NULL,
    "status" "public"."AccountEditorMapStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_editor_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creator_editor_map" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "editor_id" TEXT NOT NULL,
    "status" "public"."CreatorEditorMapStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_editor_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."folder" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."folder_item" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "folder_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contribute" (
    "id" TEXT NOT NULL,
    "status" "public"."ContributeStatus" NOT NULL DEFAULT 'PENDING',
    "account_id" TEXT NOT NULL,
    "editor_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "thumbnail_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contribution_version" (
    "id" TEXT NOT NULL,
    "contribute_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "status" "public"."ContributionVersionStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "video_id" TEXT NOT NULL,
    "thumbnail_id" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribution_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."version_comment" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "version_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_polarCheckoutId_key" ON "public"."subscription"("polarCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_userId_key" ON "public"."subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "YtCreator_accessToken_key" ON "public"."YtCreator"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "YtCreator_refreshToken_key" ON "public"."YtCreator"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "media_integration_url_key" ON "public"."media"("integration_url");

-- CreateIndex
CREATE UNIQUE INDEX "media_integration_key_key" ON "public"."media"("integration_key");

-- CreateIndex
CREATE UNIQUE INDEX "creator_editor_map_creator_id_editor_id_key" ON "public"."creator_editor_map"("creator_id", "editor_id");

-- CreateIndex
CREATE UNIQUE INDEX "folder_folderId_key" ON "public"."folder"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "folder_accountId_creatorId_editorId_name_folderId_key" ON "public"."folder"("accountId", "creatorId", "editorId", "name", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "folder_item_folderId_mediaId_key" ON "public"."folder_item"("folderId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "contribution_version_contribute_id_version_number_key" ON "public"."contribution_version"("contribute_id", "version_number");

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_editor_map" ADD CONSTRAINT "account_editor_map_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."YtCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_editor_map" ADD CONSTRAINT "account_editor_map_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creator_editor_map" ADD CONSTRAINT "creator_editor_map_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creator_editor_map" ADD CONSTRAINT "creator_editor_map_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."folder" ADD CONSTRAINT "folder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."folder" ADD CONSTRAINT "folder_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."folder" ADD CONSTRAINT "folder_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."YtCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."folder_item" ADD CONSTRAINT "folder_item_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribute" ADD CONSTRAINT "contribute_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."YtCreator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribute" ADD CONSTRAINT "contribute_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribute" ADD CONSTRAINT "contribute_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribute" ADD CONSTRAINT "contribute_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribution_version" ADD CONSTRAINT "contribution_version_contribute_id_fkey" FOREIGN KEY ("contribute_id") REFERENCES "public"."contribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribution_version" ADD CONSTRAINT "contribution_version_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribution_version" ADD CONSTRAINT "contribution_version_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."version_comment" ADD CONSTRAINT "version_comment_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."contribution_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."version_comment" ADD CONSTRAINT "version_comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

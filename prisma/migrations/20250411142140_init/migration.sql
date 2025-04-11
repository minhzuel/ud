-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "EcommerceProductStatus" AS ENUM ('PUBLISHED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EcommerceCategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "name" TEXT,
    "roleId" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSignInAt" TIMESTAMP(3),
    "emailVerifiedAt" TIMESTAMP(3),
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "invitedByUserId" TEXT,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "addressLine2" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityId" TEXT,
    "entityType" TEXT,
    "event" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "meta" TEXT,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Company',
    "logo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "address" TEXT,
    "websiteURL" TEXT,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currencyFormat" TEXT NOT NULL DEFAULT '$ {value}',
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialLinkedIn" TEXT,
    "socialPinterest" TEXT,
    "socialYoutube" TEXT,
    "notifyStockEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyStockWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "notifyStockRoleIds" TEXT[],
    "notifyNewOrderEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrderWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewOrderRoleIds" TEXT[],
    "notifyOrderStatusUpdateEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderStatusUpdateWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrderStatusUpdateRoleIds" TEXT[],
    "notifyPaymentFailureEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyPaymentFailureWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifyPaymentFailureRoleIds" TEXT[],
    "notifySystemErrorFailureEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemErrorWeb" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemErrorRoleIds" TEXT[],

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcommerceProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "beforeDiscount" DOUBLE PRECISION,
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,
    "status" "EcommerceProductStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,
    "stockValue" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "thumbnail" TEXT,

    CONSTRAINT "EcommerceProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcommerceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "isTrashed" BOOLEAN NOT NULL DEFAULT false,
    "status" "EcommerceCategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,

    CONSTRAINT "EcommerceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcommerceProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "EcommerceProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_invitedByUserId_idx" ON "User"("invitedByUserId");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_slug_key" ON "UserRole"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_slug_key" ON "UserPermission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserRolePermission_roleId_permissionId_key" ON "UserRolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserAddress_userId_idx" ON "UserAddress"("userId");

-- CreateIndex
CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EcommerceProduct_sku_key" ON "EcommerceProduct"("sku");

-- CreateIndex
CREATE INDEX "EcommerceProduct_categoryId_idx" ON "EcommerceProduct"("categoryId");

-- CreateIndex
CREATE INDEX "EcommerceProduct_createdByUserId_idx" ON "EcommerceProduct"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EcommerceCategory_slug_key" ON "EcommerceCategory"("slug");

-- CreateIndex
CREATE INDEX "EcommerceCategory_createdByUserId_idx" ON "EcommerceCategory"("createdByUserId");

-- CreateIndex
CREATE INDEX "EcommerceProductImage_productId_idx" ON "EcommerceProductImage"("productId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "UserPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceProduct" ADD CONSTRAINT "EcommerceProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EcommerceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceProduct" ADD CONSTRAINT "EcommerceProduct_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceCategory" ADD CONSTRAINT "EcommerceCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EcommerceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceCategory" ADD CONSTRAINT "EcommerceCategory_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceProductImage" ADD CONSTRAINT "EcommerceProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "EcommerceProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

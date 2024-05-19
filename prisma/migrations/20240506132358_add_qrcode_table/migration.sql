-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productHandle" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeUrl" TEXT NOT NULL,
    "displayPosition" TEXT NOT NULL,
    "displayPage" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "isHoverEnabled" BOOLEAN NOT NULL,
    "shop" TEXT NOT NULL,
    "productImageUrl" TEXT NOT NULL
);

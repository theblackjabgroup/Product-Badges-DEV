-- CreateTable
CREATE TABLE "Badge" (
    "productHandle" TEXT NOT NULL PRIMARY KEY,
    "badgeName" TEXT NOT NULL,
    "badgeUrl" TEXT NOT NULL,
    "displayPosition" TEXT NOT NULL,
    "displayPage" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "shop" TEXT NOT NULL
);

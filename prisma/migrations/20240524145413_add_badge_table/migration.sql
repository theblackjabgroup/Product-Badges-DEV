-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productHandle" TEXT NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeUrl" TEXT NOT NULL,
    "displayPosition" TEXT NOT NULL,
    "displayPage" TEXT,
    "isEnabled" BOOLEAN NOT NULL,
    "isHoverEnabled" BOOLEAN NOT NULL,
    "shop" TEXT NOT NULL,
    "productImageUrl" TEXT NOT NULL
);
INSERT INTO "new_Badge" ("badgeName", "badgeUrl", "displayPage", "displayPosition", "id", "isEnabled", "isHoverEnabled", "productHandle", "productImageUrl", "shop") SELECT "badgeName", "badgeUrl", "displayPage", "displayPosition", "id", "isEnabled", "isHoverEnabled", "productHandle", "productImageUrl", "shop" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

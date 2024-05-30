-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` VARCHAR(191) NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Badge` (
    `id` VARCHAR(191) NOT NULL,
    `productHandle` VARCHAR(191) NOT NULL,
    `badgeName` VARCHAR(191) NOT NULL,
    `badgeUrl` VARCHAR(191) NOT NULL,
    `displayPosition` VARCHAR(191) NOT NULL,
    `displayPage` VARCHAR(191) NULL,
    `isEnabled` BOOLEAN NOT NULL,
    `isHoverEnabled` BOOLEAN NOT NULL,
    `shop` VARCHAR(191) NOT NULL,
    `productImageUrl` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

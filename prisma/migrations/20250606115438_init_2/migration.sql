-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'livreur') NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_userName_key`(`userName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `position` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `imageUri` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `position` INTEGER NULL,
    `price` DOUBLE NOT NULL,
    `isPublish` BOOLEAN NOT NULL DEFAULT true,
    `categoryId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dailyNumber` INTEGER NOT NULL DEFAULT 0,
    `totalePrice` DOUBLE NOT NULL,
    `isPayed` BOOLEAN NOT NULL DEFAULT true,
    `delevryPrice` DOUBLE NULL,
    `clientPhoneNumber` VARCHAR(191) NULL,
    `delevryId` INTEGER NULL,
    `dayId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentProductDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `paymentProductId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `totalePrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `isPublish` BOOLEAN NOT NULL DEFAULT true,
    `imageUri` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments_offers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dailyNumber` INTEGER NOT NULL DEFAULT 0,
    `isPayed` BOOLEAN NOT NULL DEFAULT true,
    `totalePrice` DOUBLE NOT NULL,
    `delevryPrice` DOUBLE NULL,
    `clientPhoneNumber` VARCHAR(191) NULL,
    `delevryId` INTEGER NULL,
    `dayId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentOfferDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `offerId` INTEGER NOT NULL,
    `paymentOfferId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `totalePrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `days` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stopAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PaymentProductToProduct` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PaymentProductToProduct_AB_unique`(`A`, `B`),
    INDEX `_PaymentProductToProduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OfferToProduct` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OfferToProduct_AB_unique`(`A`, `B`),
    INDEX `_OfferToProduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OfferToPaymentOffer` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OfferToPaymentOffer_AB_unique`(`A`, `B`),
    INDEX `_OfferToPaymentOffer_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments_products` ADD CONSTRAINT `payments_products_delevryId_fkey` FOREIGN KEY (`delevryId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments_products` ADD CONSTRAINT `payments_products_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProductDetail` ADD CONSTRAINT `PaymentProductDetail_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentProductDetail` ADD CONSTRAINT `PaymentProductDetail_paymentProductId_fkey` FOREIGN KEY (`paymentProductId`) REFERENCES `payments_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments_offers` ADD CONSTRAINT `payments_offers_delevryId_fkey` FOREIGN KEY (`delevryId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments_offers` ADD CONSTRAINT `payments_offers_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentOfferDetail` ADD CONSTRAINT `PaymentOfferDetail_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentOfferDetail` ADD CONSTRAINT `PaymentOfferDetail_paymentOfferId_fkey` FOREIGN KEY (`paymentOfferId`) REFERENCES `payments_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PaymentProductToProduct` ADD CONSTRAINT `_PaymentProductToProduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `payments_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PaymentProductToProduct` ADD CONSTRAINT `_PaymentProductToProduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToProduct` ADD CONSTRAINT `_OfferToProduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToProduct` ADD CONSTRAINT `_OfferToProduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToPaymentOffer` ADD CONSTRAINT `_OfferToPaymentOffer_A_fkey` FOREIGN KEY (`A`) REFERENCES `offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToPaymentOffer` ADD CONSTRAINT `_OfferToPaymentOffer_B_fkey` FOREIGN KEY (`B`) REFERENCES `payments_offers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

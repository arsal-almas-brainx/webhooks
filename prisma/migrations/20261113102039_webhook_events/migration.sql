-- CreateTable
CREATE TABLE "WebhookEvent" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "topic" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

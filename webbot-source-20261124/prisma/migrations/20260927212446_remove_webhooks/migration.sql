-- Remove the webhook subsystem entirely.
--
-- The platform is bot-driven: features come from the Nano engine, so outbound
-- HTTP event delivery is gone. This drops the two webhook tables (Webhook,
-- WebhookLog) plus the `Plan.maxWebhooks` quota and `WhatsAppSession.webhookUrl`
-- column. SQLite cannot drop columns in place, so Plan and WhatsAppSession are
-- rebuilt using the standard table-rebuild pattern.

-- DropIndex
DROP INDEX "Webhook_userId_enabled_idx";

-- DropIndex
DROP INDEX "WebhookLog_status_createdAt_idx";

-- DropIndex
DROP INDEX "WebhookLog_userId_status_idx";

-- DropIndex
DROP INDEX "WebhookLog_webhookId_createdAt_idx";

-- DropIndex
DROP INDEX "WebhookLog_requestId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Webhook";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WebhookLog";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceMonthly" INTEGER NOT NULL DEFAULT 0,
    "priceYearly" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "maxWhatsappSessions" INTEGER NOT NULL DEFAULT 1,
    "maxMessagesPerDay" INTEGER NOT NULL DEFAULT 100,
    "maxApiRequestsDay" INTEGER NOT NULL DEFAULT 1000,
    "maxContacts" INTEGER NOT NULL DEFAULT 100,
    "maxAutomationRules" INTEGER NOT NULL DEFAULT 0,
    "maxTeamMembers" INTEGER NOT NULL DEFAULT 1,
    "features" TEXT NOT NULL DEFAULT '[]',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Plan" ("createdAt", "currency", "description", "features", "id", "isPublic", "maxApiRequestsDay", "maxAutomationRules", "maxContacts", "maxMessagesPerDay", "maxTeamMembers", "maxWhatsappSessions", "name", "priceMonthly", "priceYearly", "slug", "sortOrder", "updatedAt") SELECT "createdAt", "currency", "description", "features", "id", "isPublic", "maxApiRequestsDay", "maxAutomationRules", "maxContacts", "maxMessagesPerDay", "maxTeamMembers", "maxWhatsappSessions", "name", "priceMonthly", "priceYearly", "slug", "sortOrder", "updatedAt" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");
CREATE TABLE "new_WhatsAppSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "statusMessage" TEXT,
    "phoneNumber" TEXT,
    "profileName" TEXT,
    "profilePicUrl" TEXT,
    "platform" TEXT,
    "driver" TEXT NOT NULL DEFAULT 'local-baileys',
    "engineRef" TEXT,
    "authStateDir" TEXT NOT NULL,
    "autoReconnect" BOOLEAN NOT NULL DEFAULT true,
    "alwaysOnline" BOOLEAN NOT NULL DEFAULT false,
    "readReceipts" BOOLEAN NOT NULL DEFAULT true,
    "typingSimulation" BOOLEAN NOT NULL DEFAULT false,
    "defaultDelayMs" INTEGER NOT NULL DEFAULT 1200,
    "lastConnectedAt" DATETIME,
    "lastDisconnectedAt" DATETIME,
    "connectedSince" DATETIME,
    "lastQrAt" DATETIME,
    "lastError" TEXT,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhatsAppSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WhatsAppSession" ("alwaysOnline", "authStateDir", "autoReconnect", "connectedSince", "createdAt", "defaultDelayMs", "description", "driver", "engineRef", "id", "lastConnectedAt", "lastDisconnectedAt", "lastError", "lastQrAt", "messagesReceived", "messagesSent", "name", "phoneNumber", "platform", "profileName", "profilePicUrl", "readReceipts", "status", "statusMessage", "typingSimulation", "updatedAt", "userId") SELECT "alwaysOnline", "authStateDir", "autoReconnect", "connectedSince", "createdAt", "defaultDelayMs", "description", "driver", "engineRef", "id", "lastConnectedAt", "lastDisconnectedAt", "lastError", "lastQrAt", "messagesReceived", "messagesSent", "name", "phoneNumber", "platform", "profileName", "profilePicUrl", "readReceipts", "status", "statusMessage", "typingSimulation", "updatedAt", "userId" FROM "WhatsAppSession";
DROP TABLE "WhatsAppSession";
ALTER TABLE "new_WhatsAppSession" RENAME TO "WhatsAppSession";
CREATE INDEX "WhatsAppSession_userId_status_idx" ON "WhatsAppSession"("userId", "status");
CREATE INDEX "WhatsAppSession_status_idx" ON "WhatsAppSession"("status");
CREATE INDEX "WhatsAppSession_createdAt_idx" ON "WhatsAppSession"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

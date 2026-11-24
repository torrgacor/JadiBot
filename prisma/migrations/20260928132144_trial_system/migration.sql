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
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Plan" ("createdAt", "currency", "description", "features", "id", "isPublic", "maxApiRequestsDay", "maxAutomationRules", "maxContacts", "maxMessagesPerDay", "maxTeamMembers", "maxWhatsappSessions", "name", "priceMonthly", "priceYearly", "slug", "sortOrder", "updatedAt") SELECT "createdAt", "currency", "description", "features", "id", "isPublic", "maxApiRequestsDay", "maxAutomationRules", "maxContacts", "maxMessagesPerDay", "maxTeamMembers", "maxWhatsappSessions", "name", "priceMonthly", "priceYearly", "slug", "sortOrder", "updatedAt" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" DATETIME,
    "trialStartedAt" DATETIME,
    "trialExpiresAt" DATETIME,
    "trialStatus" TEXT NOT NULL DEFAULT 'NONE',
    "trialUsed" BOOLEAN NOT NULL DEFAULT false,
    "messagesUsedToday" INTEGER NOT NULL DEFAULT 0,
    "apiRequestsUsedDay" INTEGER NOT NULL DEFAULT 0,
    "usageResetAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("apiRequestsUsedDay", "cancelAtPeriodEnd", "canceledAt", "createdAt", "currentPeriodEnd", "currentPeriodStart", "id", "messagesUsedToday", "planId", "status", "updatedAt", "usageResetAt", "userId") SELECT "apiRequestsUsedDay", "cancelAtPeriodEnd", "canceledAt", "createdAt", "currentPeriodEnd", "currentPeriodStart", "id", "messagesUsedToday", "planId", "status", "updatedAt", "usageResetAt", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");
CREATE INDEX "Subscription_trialStatus_trialExpiresAt_idx" ON "Subscription"("trialStatus", "trialExpiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

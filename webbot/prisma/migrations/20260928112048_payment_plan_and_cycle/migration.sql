-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'manual',
    "description" TEXT NOT NULL,
    "providerRef" TEXT,
    "paidAt" DATETIME,
    "failureReason" TEXT,
    "planId" TEXT,
    "cycle" TEXT NOT NULL DEFAULT 'monthly',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "currency", "description", "failureReason", "id", "invoiceNumber", "method", "paidAt", "providerRef", "status", "subscriptionId", "updatedAt", "userId") SELECT "amount", "createdAt", "currency", "description", "failureReason", "id", "invoiceNumber", "method", "paidAt", "providerRef", "status", "subscriptionId", "updatedAt", "userId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");
CREATE INDEX "Payment_userId_status_idx" ON "Payment"("userId", "status");
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");
CREATE INDEX "Payment_providerRef_idx" ON "Payment"("providerRef");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

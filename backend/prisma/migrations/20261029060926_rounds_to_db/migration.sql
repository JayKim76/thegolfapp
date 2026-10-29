-- CreateTable
CREATE TABLE "RoundSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "courseName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Round" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "memberId" INTEGER,
    "guestName" TEXT,
    "sessionId" INTEGER,
    "date" TEXT NOT NULL,
    "courseName" TEXT,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Round_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Round_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RoundSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Round" ("courseName", "createdAt", "date", "id", "memberId", "score", "updatedAt") SELECT "courseName", "createdAt", "date", "id", "memberId", "score", "updatedAt" FROM "Round";
DROP TABLE "Round";
ALTER TABLE "new_Round" RENAME TO "Round";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

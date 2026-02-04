/*
  Warnings:

  - You are about to alter the column `handicap` on the `Member` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "handicap" REAL NOT NULL DEFAULT 0,
    "phone" TEXT,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "profileImage" TEXT,
    "badges" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Regular',
    "intro" TEXT,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Member" ("badges", "createdAt", "email", "gender", "handicap", "id", "intro", "joinDate", "name", "phone", "profileImage", "status", "type", "updatedAt") SELECT "badges", "createdAt", "email", "gender", "handicap", "id", "intro", "joinDate", "name", "phone", "profileImage", "status", "type", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

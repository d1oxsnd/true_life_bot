-- CreateTable
CREATE TABLE "WorkStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastWorkAt" TIMESTAMP(3),
    "totalEarned" BIGINT NOT NULL DEFAULT 0,
    "totalWorks" INTEGER NOT NULL DEFAULT 0,
    "critCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkStats_userId_key" ON "WorkStats"("userId");

-- AddForeignKey
ALTER TABLE "WorkStats" ADD CONSTRAINT "WorkStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

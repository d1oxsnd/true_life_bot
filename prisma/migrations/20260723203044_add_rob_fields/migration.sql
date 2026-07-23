-- CreateTable
CREATE TABLE "robbery_stats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "total_count" INTEGER NOT NULL DEFAULT 0,
    "last_robbed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "robbery_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "robbery_stats_user_id_key" ON "robbery_stats"("user_id");

-- AddForeignKey
ALTER TABLE "robbery_stats" ADD CONSTRAINT "robbery_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

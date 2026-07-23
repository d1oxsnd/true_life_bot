/*
  Warnings:

  - The primary key for the `robbery_stats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `robbery_stats` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "robbery_stats_user_id_key";

-- AlterTable
ALTER TABLE "robbery_stats" DROP CONSTRAINT "robbery_stats_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "robbery_stats_pkey" PRIMARY KEY ("user_id");

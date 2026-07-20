/*
  Warnings:

  - The primary key for the `bank_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `bank_accounts` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BOMZH', 'PLANKTON', 'BUSINESS_PLUS', 'MODERATOR', 'ADMIN');

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_user_id_fkey";

-- DropIndex
DROP INDEX "bank_accounts_user_id_key";

-- AlterTable
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_pkey",
DROP COLUMN "id",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BOMZH',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "CarritoItem" DROP CONSTRAINT "CarritoItem_userId_fkey";

-- AddForeignKey
ALTER TABLE "CarritoItem" ADD CONSTRAINT "CarritoItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

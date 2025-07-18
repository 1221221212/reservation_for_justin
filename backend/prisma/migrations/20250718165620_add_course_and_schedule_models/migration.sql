-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

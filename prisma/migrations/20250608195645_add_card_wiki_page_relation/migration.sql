-- CreateTable
CREATE TABLE "card_wiki_pages" (
    "cardId" TEXT NOT NULL,
    "wikiPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_wiki_pages_pkey" PRIMARY KEY ("cardId","wikiPageId")
);

-- AddForeignKey
ALTER TABLE "card_wiki_pages" ADD CONSTRAINT "card_wiki_pages_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_wiki_pages" ADD CONSTRAINT "card_wiki_pages_wikiPageId_fkey" FOREIGN KEY ("wikiPageId") REFERENCES "wiki_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

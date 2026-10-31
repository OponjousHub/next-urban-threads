-- CreateTable
CREATE TABLE "FXRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" "currencyEnum" NOT NULL,
    "quoteCurrency" "currencyEnum" NOT NULL,
    "rate" DECIMAL(20,10) NOT NULL,
    "source" TEXT NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FXRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FXRate_fetchedAt_idx" ON "FXRate"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FXRate_baseCurrency_quoteCurrency_key" ON "FXRate"("baseCurrency", "quoteCurrency");

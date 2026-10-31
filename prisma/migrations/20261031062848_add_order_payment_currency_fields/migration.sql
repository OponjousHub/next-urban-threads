-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "exchangeRate" DECIMAL(20,10),
ADD COLUMN     "paymentAmount" DECIMAL(12,2),
ADD COLUMN     "paymentCurrency" "currencyEnum";

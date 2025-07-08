-- CreateTable
CREATE TABLE "public"."organizer_gcash_accounts" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "organizer_gcash_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizer_gcash_transactions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "senderName" TEXT,
    "senderNumber" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "isMatched" BOOLEAN NOT NULL DEFAULT false,
    "matchedBookingId" TEXT,

    CONSTRAINT "organizer_gcash_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."manual_payment_details" (
    "bookingId" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "senderName" TEXT,
    "senderNumber" TEXT,
    "amountSent" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_payment_details_pkey" PRIMARY KEY ("bookingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizer_gcash_accounts_organizationId_accountNumber_key" ON "public"."organizer_gcash_accounts"("organizationId", "accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_gcash_transactions_matchedBookingId_key" ON "public"."organizer_gcash_transactions"("matchedBookingId");

-- CreateIndex
CREATE INDEX "organizer_gcash_transactions_organizationId_idx" ON "public"."organizer_gcash_transactions"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_gcash_transactions_organizationId_referenceNumber_key" ON "public"."organizer_gcash_transactions"("organizationId", "referenceNumber");

-- AddForeignKey
ALTER TABLE "public"."organizer_gcash_accounts" ADD CONSTRAINT "organizer_gcash_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizer_gcash_transactions" ADD CONSTRAINT "organizer_gcash_transactions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizer_gcash_transactions" ADD CONSTRAINT "organizer_gcash_transactions_matchedBookingId_fkey" FOREIGN KEY ("matchedBookingId") REFERENCES "public"."bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manual_payment_details" ADD CONSTRAINT "manual_payment_details_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
